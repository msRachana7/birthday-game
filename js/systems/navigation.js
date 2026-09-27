import { state, resetHeldMovement } from './gameState.js';
import { closeMemoryMatch } from '../minigames/memoryMatch.js';
import { closeYouKnowTheLine } from '../minigames/youKnowTheLine.js';
import { closeOurMemories } from '../minigames/ourMemories.js';

export function isAnyMenuOpen() {
  return Boolean(document.querySelector('.modal[style*="grid"]'))
    || Boolean(document.querySelector('#cottageShopHost.is-open'))
    || document.getElementById('ending').style.display === 'grid';
}

export function openModal(id) {
  if (!id) return;

  const modal = document.getElementById(id);
  if (!modal) return;

  const currentModalId = state.activeModalId;
  if (currentModalId && currentModalId !== id) {
    const currentModal = document.getElementById(currentModalId);
    if (currentModal) {
      currentModal.style.display = 'none';
    }
  }

  resetHeldMovement();
  state.activeModalId = id;
  modal.style.display = 'grid';
}

export function closeModal(id) {
  if (id === 'miniModal') {
    closeMemoryMatch();
    closeYouKnowTheLine();
    closeOurMemories();
  }

  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'none';
  }

  if (!isAnyMenuOpen()) {
    state.activeModalId = null;
  }

  resetHeldMovement();
}
