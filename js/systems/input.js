import { state, resetHeldMovement } from './gameState.js';
import { isAnyMenuOpen, openModal } from './navigation.js';
import { openCottageShop } from '../ui/cottage-shop.js';
import { renderGames } from '../ui/earnMoney.js';
import { enterBirthdayDoor } from '../ending/ending.js';
import { detectNearbyInteraction, setPlayerFacing } from '../world/world.js';

const movementDirections = {
  arrowup: 'north',
  w: 'north',
  arrowdown: 'south',
  s: 'south',
  arrowright: 'east',
  d: 'east',
  arrowleft: 'west',
  a: 'west'
};
const directionAliases = {
  north: ['arrowup', 'w'],
  south: ['arrowdown', 's'],
  east: ['arrowright', 'd'],
  west: ['arrowleft', 'a']
};

function movementUnlocked() {
  return state.started && !state.startTransitioning && !state.introActive && !state.tutorialActive
    && !state.worldTransitioning && !state.endingSceneOpen && !isAnyMenuOpen();
}

function updateFacingForKey(key) {
  const facing = movementDirections[key];
  if (!facing || !movementUnlocked()) return;

  state.facingOrder = state.facingOrder.filter((direction) => direction !== facing);
  state.facingOrder.push(facing);
  setPlayerFacing(facing);
}

function isTypingTarget(target) {
  if (!target) return false;
  const tagName = target.tagName ? target.tagName.toLowerCase() : '';
  return tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
}

function handleInteraction() {
  const menuOpen = isAnyMenuOpen();
  if (state.activeModalId && !menuOpen) {
    state.activeModalId = null;
  }

  if (!state.started || menuOpen || state.endingSceneOpen || state.worldTransitioning || state.startTransitioning || state.introActive || state.tutorialActive) return;

  if (state.near === 'store') {
    openCottageShop();
    return;
  }

  if (state.near === 'earn') {
    renderGames();
    openModal('earnModal');
    return;
  }

  if (state.near === 'door') {
    enterBirthdayDoor();
  }
}

export function bindInput() {
  if (window.__birthdayQuestInputBound) return;
  window.__birthdayQuestInputBound = true;

  document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (isTypingTarget(event.target)) {
      return;
    }

    const key = event.key.toLowerCase();
    state.keys[key] = true;
    updateFacingForKey(key);

    if (key === 'e' && state.started) {
      detectNearbyInteraction();
      handleInteraction();
    }

    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
      event.preventDefault();
    }
  });

  document.addEventListener('keyup', (event) => {
    if (isTypingTarget(event.target)) {
      return;
    }

    state.keys[event.key.toLowerCase()] = false;

    if (movementDirections[event.key.toLowerCase()] && movementUnlocked()) {
      const nextFacing = [...state.facingOrder].reverse().find((direction) =>
        directionAliases[direction].some((alias) => state.keys[alias])
      );
      if (nextFacing) setPlayerFacing(nextFacing);
    }
  });

  window.addEventListener('blur', () => {
    resetHeldMovement();
    state.facingOrder = [];
  });
}

export { handleInteraction, resetHeldMovement };
