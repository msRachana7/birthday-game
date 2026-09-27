import { memoryPairLabels } from '../data/memoryPairs.js';
import { state } from '../systems/gameState.js';
import { saveProgress } from '../systems/saveManager.js';
import { updateHUD } from '../ui/hud.js';

const memoryGame = {
  active: false,
  board: [],
  flipped: [],
  matched: new Set(),
  pairsFound: 0,
  moves: 0,
  lockBoard: false,
  mismatchTimer: null,
  previewMode: false
};

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildBoard() {
  const pairData = memoryPairLabels.map((label) => ({ label, key: label.toLowerCase().replace(/\s+/g, '-') }));
  const cards = shuffle([...pairData, ...pairData].map((pair, index) => ({
    ...pair,
    id: `${pair.key}-${index}`
  })));

  memoryGame.board = cards;
  memoryGame.flipped = [];
  memoryGame.matched = new Set();
  memoryGame.pairsFound = 0;
  memoryGame.moves = 0;
  memoryGame.lockBoard = false;
  memoryGame.active = true;
  renderMemoryBoard();
}

function renderMemoryBoard() {
  const miniContent = document.getElementById('miniContent');
  if (!miniContent) return;

  miniContent.innerHTML = `
    <div class="mini">
      <h2>♡ Same Same</h2>
      <div class="memory-toolbar">
        <span>Pairs found: ${memoryGame.pairsFound} / 8</span>
        <span>Moves: ${memoryGame.moves}</span>
      </div>
      <div class="memory-grid" id="memoryGrid"></div>
      <button id="memoryBackBtn">Back</button>
    </div>
  `;

  const grid = document.getElementById('memoryGrid');
  memoryGame.board.forEach((card, index) => {
    const isRevealed = memoryGame.flipped.includes(index) || memoryGame.matched.has(index);
    const isMatched = memoryGame.matched.has(index);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = `memory-card ${isRevealed ? 'revealed' : ''} ${isMatched ? 'matched' : ''}`;
    button.disabled = isMatched || memoryGame.lockBoard || isRevealed;
    button.textContent = isRevealed ? card.label : '✦';
    button.setAttribute('aria-label', isRevealed ? card.label : 'Hidden card');
    button.addEventListener('click', () => handleMemoryCardClick(index));
    grid.appendChild(button);
  });

  const backBtn = document.getElementById('memoryBackBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      const miniModal = document.getElementById('miniModal');
      closeMemoryMatch();
      if (miniModal) {
        miniModal.style.display = 'none';
      }
    });
  }
}

function handleMemoryCardClick(index) {
  if (!memoryGame.active || memoryGame.lockBoard) return;
  if (memoryGame.matched.has(index) || memoryGame.flipped.includes(index)) return;
  if (memoryGame.flipped.length >= 2) return;

  memoryGame.flipped.push(index);
  renderMemoryBoard();

  if (memoryGame.flipped.length < 2) return;

  memoryGame.moves += 1;
  const [firstIndex, secondIndex] = memoryGame.flipped;
  const firstCard = memoryGame.board[firstIndex];
  const secondCard = memoryGame.board[secondIndex];

  if (firstCard.label === secondCard.label) {
    memoryGame.matched.add(firstIndex);
    memoryGame.matched.add(secondIndex);
    memoryGame.pairsFound += 1;
    memoryGame.flipped = [];
    renderMemoryBoard();

    if (memoryGame.pairsFound === 8) {
      completeSameSameGame();
    }
    return;
  }

  memoryGame.lockBoard = true;
  memoryGame.mismatchTimer = setTimeout(() => {
    memoryGame.flipped = [];
    memoryGame.lockBoard = false;
    renderMemoryBoard();
    memoryGame.mismatchTimer = null;
  }, 800);
}

function completeSameSameGame() {
  if (!memoryGame.previewMode && state.completed.has('same-same')) return;

  if (!memoryGame.previewMode) {
    state.completed.add('same-same');
    state.coins += 450;
    saveProgress();
    updateHUD();

    const gamesGrid = document.getElementById('gamesGrid');
    if (gamesGrid) {
      const buttons = Array.from(gamesGrid.querySelectorAll('button'));
      const sameGameButton = buttons.find((button) => button.textContent.includes('PLAY MATCH'));
      if (sameGameButton) {
        sameGameButton.textContent = 'DONE';
        sameGameButton.disabled = true;
      }
    }
  }

  const miniContent = document.getElementById('miniContent');
  if (miniContent) {
    miniContent.innerHTML = `
      <div class="mini">
        <h2>${memoryGame.previewMode ? 'Same Same preview complete.' : 'Same Same complete! +450 coins.'}</h2>
        <p>${memoryGame.previewMode ? 'This preview did not modify your save data.' : 'Your balance is updated.'}</p>
        <button id="memoryDoneBtn">Back to world</button>
      </div>
    `;

    const doneBtn = document.getElementById('memoryDoneBtn');
    if (doneBtn) {
      doneBtn.addEventListener('click', () => {
        closeMemoryMatch();
        const miniModal = document.getElementById('miniModal');
        if (miniModal) miniModal.style.display = 'none';
      });
    }
  }
}

export function closeMemoryMatch() {
  if (memoryGame.mismatchTimer) {
    clearTimeout(memoryGame.mismatchTimer);
    memoryGame.mismatchTimer = null;
  }

  memoryGame.active = false;
  memoryGame.flipped = [];
  memoryGame.matched = new Set();
  memoryGame.board = [];
  memoryGame.pairsFound = 0;
  memoryGame.moves = 0;
  memoryGame.lockBoard = false;
  memoryGame.previewMode = false;
}

export function startMemoryMatch(previewMode = false) {
  closeMemoryMatch();
  memoryGame.previewMode = previewMode;
  buildBoard();
}

export function previewMemoryMatch() {
  startMemoryMatch(true);
}
