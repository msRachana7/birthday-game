import { spotDifferenceStages } from '../data/spotDifference.js';
import { state } from '../systems/gameState.js';
import { renderGames } from '../ui/earnMoney.js';
import { saveProgress } from '../systems/saveManager.js';
import { updateHUD } from '../ui/hud.js';

const spotGame = {
  active: false,
  stageIndex: 0,
  found: new Set(),
  feedbackText: 'Find the differences ♡',
  isCompleting: false,
  pendingNext: false
};

function setFeedback(message) {
  spotGame.feedbackText = message;
  const feedback = document.getElementById('spotDifferenceFeedback');
  if (feedback) {
    feedback.textContent = message;
  }
}

function getCurrentStage() {
  return spotDifferenceStages[spotGame.stageIndex];
}

function getStageProgress() {
  const stage = getCurrentStage();
  if (!stage) return { found: 0, total: 0 };
  return { found: stage.differences.filter((difference) => spotGame.found.has(difference.id)).length, total: stage.differences.length };
}

function renderMarkers() {
  const stage = getCurrentStage();
  if (!stage) return;

  const markerGroups = document.querySelectorAll('.spot-marker-layer');
  markerGroups.forEach((layer) => {
    const layerId = layer.dataset.side;
    const markers = stage.differences.filter((difference) => spotGame.found.has(difference.id));
    layer.innerHTML = '';
    markers.forEach((difference) => {
      const marker = document.createElement('div');
      marker.className = 'spot-marker';
      marker.style.left = (difference.x * 100) + '%';
      marker.style.top = (difference.y * 100) + '%';
      marker.title = difference.id;
      if (layerId === 'original') {
        marker.dataset.markerSide = 'original';
      }
      if (layerId === 'edited') {
        marker.dataset.markerSide = 'edited';
      }
      layer.appendChild(marker);
    });
  });
}

function handleImageClick(event) {
  const stage = getCurrentStage();
  if (!stage || spotGame.isCompleting) return;

  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;

  const foundDifference = stage.differences.find((difference) => {
    const dx = Math.abs(difference.x - x);
    const dy = Math.abs(difference.y - y);
    return dx <= 0.06 && dy <= 0.06;
  });

  if (!foundDifference) {
    setFeedback('Nice try — keep looking ♡');
    return;
  }

  if (spotGame.found.has(foundDifference.id)) {
    setFeedback('Already found ♡');
    return;
  }

  spotGame.found.add(foundDifference.id);
  renderMarkers();
  const progress = getStageProgress();
  setFeedback('Difference found! ♡');
  const progressLabel = document.getElementById('spotDifferenceProgress');
  if (progressLabel) {
    progressLabel.textContent = `Differences found: ${progress.found} / ${progress.total}`;
  }

  const nextButton = document.getElementById('spotNextStageBtn');
  if (progress.found >= progress.total && nextButton) {
    nextButton.hidden = false;
    nextButton.disabled = false;
  }
}

function renderStage() {
  const stage = getCurrentStage();
  if (!stage) return;

  const progress = getStageProgress();
  const miniContent = document.getElementById('miniContent');
  if (!miniContent) return;

  miniContent.innerHTML = `
    <div class="mini spot-game-panel">
      <h2>📸 Our Memories</h2>
      <div class="spot-stage-header">
        <span>Stage ${spotGame.stageIndex + 1} / ${spotDifferenceStages.length}</span>
        <span id="spotDifferenceProgress">Differences found: ${progress.found} / ${progress.total}</span>
      </div>

      <div class="spot-image-grid">
        <div class="spot-image-panel">
          <div class="spot-label">Original</div>
          <div class="spot-image-wrap" data-side="original">
            <img class="spot-image" src="${stage.original}" alt="Original memory scene" />
            <div class="spot-marker-layer" data-side="original"></div>
          </div>
        </div>

        <div class="spot-image-panel">
          <div class="spot-label">Edited</div>
          <div class="spot-image-wrap" data-side="edited">
            <img class="spot-image" src="${stage.edited}" alt="Edited memory scene" />
            <div class="spot-marker-layer" data-side="edited"></div>
          </div>
        </div>
      </div>

      <div class="spot-utility-row">
        <p id="spotDifferenceFeedback" class="spot-feedback">${spotGame.feedbackText}</p>
        <button id="spotBackBtn" type="button" class="secondary-button">Back</button>
      </div>

      <button id="spotNextStageBtn" type="button" hidden>Next Stage</button>
    </div>
  `;

  const nextButton = document.getElementById('spotNextStageBtn');
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (spotGame.stageIndex + 1 < spotDifferenceStages.length) {
        spotGame.stageIndex += 1;
        spotGame.found.clear();
        setFeedback('Find the differences ♡');
        renderStage();
        return;
      }

      completeOurMemories();
    });
  }

  const backButton = document.getElementById('spotBackBtn');
  if (backButton) {
    backButton.addEventListener('click', () => {
      closeOurMemories();
      const miniModal = document.getElementById('miniModal');
      if (miniModal) miniModal.style.display = 'none';
      const earnModal = document.getElementById('earnModal');
      if (earnModal) {
        renderGames();
        const modal = document.getElementById('earnModal');
        if (modal) modal.style.display = 'grid';
      }
    });
  }

  const stageImages = document.querySelectorAll('.spot-image');
  stageImages.forEach((image) => {
    image.addEventListener('click', handleImageClick);
  });

  renderMarkers();

  if (progress.found >= progress.total) {
    const next = document.getElementById('spotNextStageBtn');
    if (next) {
      next.hidden = false;
      next.disabled = false;
    }
  }
}

function completeOurMemories() {
  if (state.completed.has('our-memories')) return;

  state.completed.add('our-memories');
  state.coins += 250;
  saveProgress();
  updateHUD();
  renderGames();

  const miniContent = document.getElementById('miniContent');
  if (!miniContent) return;

  miniContent.innerHTML = `
    <div class="mini spot-game-panel">
      <h2>Our Memories complete! +250 coins.</h2>
      <p>Your balance is updated.</p>
      <button id="spotCompleteBackBtn" type="button">Back to world</button>
    </div>
  `;

  const backButton = document.getElementById('spotCompleteBackBtn');
  if (backButton) {
    backButton.addEventListener('click', () => {
      closeOurMemories();
      const miniModal = document.getElementById('miniModal');
      if (miniModal) miniModal.style.display = 'none';
    });
  }
}

export function closeOurMemories() {
  spotGame.active = false;
  spotGame.stageIndex = 0;
  spotGame.found.clear();
  spotGame.feedbackText = 'Find the differences ♡';
  spotGame.isCompleting = false;
  spotGame.pendingNext = false;
}

export function startOurMemories() {
  closeOurMemories();
  spotGame.active = true;
  spotGame.stageIndex = 0;
  spotGame.found.clear();
  spotGame.feedbackText = 'Find the differences ♡';
  renderStage();
}
