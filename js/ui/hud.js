import { state } from '../systems/gameState.js';

export function updateHUD() {
  const coinsEl = document.getElementById('coins');
  if (coinsEl) coinsEl.textContent = state.coins;

  const giftStatusEl = document.getElementById('giftStatus');
  if (giftStatusEl) {
    giftStatusEl.textContent = '';
    giftStatusEl.setAttribute('aria-label', 'Gift shopping status');
  }
}
