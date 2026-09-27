import { sentenceQuestions } from '../data/sentenceQuestions.js';
import { state } from '../systems/gameState.js';
import { renderGames } from '../ui/earnMoney.js';
import { openModal } from '../systems/navigation.js';
import { saveProgress } from '../systems/saveManager.js';
import { updateHUD } from '../ui/hud.js';

const lineGame = {
  active: false,
  currentIndex: 0,
  correctCount: 0,
  isAnswerLocked: false,
  isTransitioning: false,
  lastSubmittedAnswer: '',
  previewMode: false
};

function normalizeAnswer(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/[\u2018\u2019\u201B]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function setFeedback(message, tone = 'neutral') {
  const feedback = document.getElementById('sentenceFeedback');
  if (!feedback) return;

  feedback.textContent = message;
  feedback.classList.remove('success', 'error');
  if (tone) {
    feedback.classList.add(tone);
  }
}

function renderQuestion() {
  const miniContent = document.getElementById('miniContent');
  const currentQuestion = sentenceQuestions[lineGame.currentIndex];

  if (!miniContent || !currentQuestion) return;

  const hintMarkup = currentQuestion.hint ? `<p class="sentence-hint">Hint: ${currentQuestion.hint}</p>` : '';

  miniContent.innerHTML = `
    <div class="mini sentence-game-panel">
      <h2>💬 You Know The Line</h2>
      <div class="sentence-progress">Question ${lineGame.currentIndex + 1} / ${sentenceQuestions.length}</div>
      <p class="sentence-prompt">${currentQuestion.sentence}</p>
      ${hintMarkup}

      <div class="sentence-form-wrap">
        <label class="sentence-label" for="sentenceAnswerInput">Your answer</label>
        <input id="sentenceAnswerInput" class="sentence-input" type="text" autocomplete="off" spellcheck="false" />

        <div class="sentence-actions">
          <button id="sentenceSubmitBtn" type="button">Submit</button>
          <button id="sentenceBackBtn" type="button" class="secondary-button">Back</button>
        </div>

        <p id="sentenceFeedback" class="sentence-feedback"></p>
        <button id="sentenceNextBtn" type="button" class="sentence-next" hidden>Next</button>
      </div>
    </div>
  `;

  const input = document.getElementById('sentenceAnswerInput');
  const submitButton = document.getElementById('sentenceSubmitBtn');
  const backButton = document.getElementById('sentenceBackBtn');
  const nextButton = document.getElementById('sentenceNextBtn');

  if (input) {
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (!lineGame.isAnswerLocked && !lineGame.isTransitioning) {
          handleAnswerSubmit();
        }
      }
    });
    input.focus();
  }

  if (submitButton) {
    submitButton.addEventListener('click', handleAnswerSubmit);
  }

  if (backButton) {
    backButton.addEventListener('click', () => {
      closeYouKnowTheLine();
      const miniModal = document.getElementById('miniModal');
      if (miniModal) miniModal.style.display = 'none';
      renderGames();
      const earnModal = document.getElementById('earnModal');
      if (earnModal) {
        openModal('earnModal');
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', handleNextQuestion);
  }
}

function handleAnswerSubmit() {
  if (lineGame.isAnswerLocked || lineGame.isTransitioning) return;

  const input = document.getElementById('sentenceAnswerInput');
  if (!input) return;

  const answerText = input.value;
  const trimmed = answerText.trim();
  if (!trimmed) {
    setFeedback('Please type an answer first.', 'error');
    input.focus();
    return;
  }

  const currentQuestion = sentenceQuestions[lineGame.currentIndex];
  const normalizedAnswer = normalizeAnswer(answerText);
  const isCorrect = currentQuestion.acceptedAnswers.some((accepted) => normalizeAnswer(accepted) === normalizedAnswer);

  if (!isCorrect) {
    setFeedback('Not quite… try again ♡', 'error');
    lineGame.lastSubmittedAnswer = answerText;
    input.focus();
    return;
  }

  lineGame.correctCount += 1;
  lineGame.isAnswerLocked = true;
  setFeedback('Correct! ♡', 'success');

  const submitButton = document.getElementById('sentenceSubmitBtn');
  const nextButton = document.getElementById('sentenceNextBtn');
  if (submitButton) submitButton.hidden = true;
  if (nextButton) {
    nextButton.hidden = false;
    nextButton.disabled = false;
  }
  if (input) input.disabled = true;
}

function handleNextQuestion() {
  if (lineGame.isTransitioning) return;
  lineGame.isTransitioning = true;

  if (lineGame.currentIndex + 1 >= sentenceQuestions.length) {
    completeYouKnowTheLine();
    return;
  }

  lineGame.currentIndex += 1;
  lineGame.isAnswerLocked = false;
  lineGame.isTransitioning = false;
  renderQuestion();
}

function completeYouKnowTheLine() {
  if (!lineGame.previewMode && state.completed.has('you-know-the-line')) return;

  if (!lineGame.previewMode) {
    state.completed.add('you-know-the-line');
    state.coins += 300;
    saveProgress();
    updateHUD();
    renderGames();
  }

  const miniContent = document.getElementById('miniContent');
  if (!miniContent) return;

  miniContent.innerHTML = `
    <div class="mini sentence-game-panel">
      <h2>You Know The Line complete! +300 coins.</h2>
      <p>Your balance is updated.</p>
      <button id="lineCompletedBackBtn" type="button">Back to world</button>
    </div>
  `;

  const backButton = document.getElementById('lineCompletedBackBtn');
  if (backButton) {
    backButton.addEventListener('click', () => {
      closeYouKnowTheLine();
      const miniModal = document.getElementById('miniModal');
      if (miniModal) miniModal.style.display = 'none';
    });
  }

  lineGame.active = false;
  lineGame.isAnswerLocked = false;
  lineGame.isTransitioning = false;
}

export function closeYouKnowTheLine() {
  lineGame.active = false;
  lineGame.currentIndex = 0;
  lineGame.correctCount = 0;
  lineGame.isAnswerLocked = false;
  lineGame.isTransitioning = false;
  lineGame.lastSubmittedAnswer = '';
  lineGame.previewMode = false;
}

export function startYouKnowTheLine(previewMode = false) {
  closeYouKnowTheLine();
  lineGame.active = true;
  lineGame.previewMode = previewMode;
  lineGame.currentIndex = 0;
  lineGame.correctCount = 0;
  renderQuestion();
}

export function previewYouKnowTheLine() {
  startYouKnowTheLine(true);
}
