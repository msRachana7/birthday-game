import { gifts } from '../data/gifts.js';
import { state } from '../systems/gameState.js';
import { closeModal } from '../systems/navigation.js';
import { saveProgress } from '../systems/saveManager.js';
import { updateHUD } from './hud.js';
import { beginEndingTransition, syncEndingWorldState } from '../world/world.js';

export function renderShop() {
  const grid = document.getElementById('shopGrid');
  if (!grid) return;

  grid.innerHTML = '';

  const allBought = state.bought.size === gifts.length;
  const existingBanner = grid.parentElement.querySelector('.store-celebration');
  if (allBought) {
    if (!existingBanner) {
      const banner = document.createElement('div');
      banner.className = 'store-celebration';
      banner.innerHTML = '<p>All nine gifts collected! ♡</p><button type="button" class="return-to-field-btn">Return to the field</button>';
      const button = banner.querySelector('button');
      if (button) {
        button.addEventListener('click', () => {
          closeModal('storeModal');
          beginEndingTransition();
        });
      }
      grid.parentElement.insertBefore(banner, grid);
    }
  } else if (existingBanner) {
    existingBanner.remove();
  }

  gifts.forEach((gift) => {
    const div = document.createElement('div');
    div.className = 'card';
    const done = state.bought.has(gift.id);
    div.innerHTML = `<div class="emoji">${gift.emoji}</div><b>${gift.name}</b><p>${done ? '✓ Bought' : gift.price + ' 🪙'}</p>
      <button ${done ? 'disabled' : ''} data-gift-id="${gift.id}">${done ? 'OWNED' : 'BUY'}</button>`;

    const btn = div.querySelector('button');
    btn.onclick = () => buyGift(gift.id);
    grid.appendChild(div);
  });
}

export function purchaseGift(giftId) {
  const gift = gifts.find((item) => item.id === giftId);
  if (!gift || state.bought.has(giftId)) return { ok: false, reason: 'unavailable' };

  if (state.coins < gift.price) {
    return { ok: false, reason: 'insufficient' };
  }

  state.coins -= gift.price;
  state.bought.add(giftId);
  const allBought = state.bought.size >= gifts.length;
  state.endingUnlocked = allBought;
  state.endingDoorVisible = false;
  saveProgress();
  updateHUD();
  renderShop();
  syncEndingWorldState();

  if (state.bought.size === gifts.length) {
    const storeModal = document.getElementById('storeModal');
    if (storeModal) {
      storeModal.classList.add('all-gifts-owned');
    }
  }

  return { ok: true };
}

export function buyGift(giftId) {
  const result = purchaseGift(giftId);
  if (result.reason === 'insufficient') alert('Not enough coins yet 😭');
  return result;
}
