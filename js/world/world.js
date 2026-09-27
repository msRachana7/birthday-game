import { state, resetHeldMovement } from '../systems/gameState.js';
import { isAnyMenuOpen } from '../systems/navigation.js';
import { gifts } from '../data/gifts.js';

let worldTransitionSequence = 0;
const worldTransitionTimers = [];
const PLAYER_SPRITES = {
  north: './north.png',
  south: './south.png',
  east: './east.png',
  west: './west.png'
};

export function preloadPlayerSprites() {
  Object.values(PLAYER_SPRITES).forEach((path) => {
    const image = new Image();
    image.src = path;
  });
}

export function setPlayerFacing(facing) {
  if (!PLAYER_SPRITES[facing]) return;
  state.facing = facing;
  const player = document.getElementById('player');
  const sprite = document.getElementById('playerSprite');
  if (player) player.dataset.facing = facing;
  if (sprite && sprite.getAttribute('src') !== PLAYER_SPRITES[facing]) {
    sprite.src = PLAYER_SPRITES[facing];
  }
}

function clearWorldTransitionTimers() {
  worldTransitionTimers.forEach((timer) => clearTimeout(timer));
  worldTransitionTimers.length = 0;
}

function clearTransitionSparkles() {
  document.querySelectorAll('.transition-spark').forEach((sparkle) => sparkle.remove());
}

function createTransitionSparkles() {
  const world = document.querySelector('.world');
  if (!world) return;

  for (let i = 0; i < 16; i += 1) {
    const sparkle = document.createElement('div');
    sparkle.className = 'transition-spark';
    sparkle.style.left = (22 + Math.random() * 56) + '%';
    sparkle.style.top = (22 + Math.random() * 45) + '%';
    sparkle.style.setProperty('--spark-x', ((Math.random() * 120) - 60) + 'px');
    sparkle.style.setProperty('--spark-y', (-(40 + Math.random() * 110)) + 'px');
    sparkle.style.animationDuration = (0.8 + Math.random() * 0.8) + 's';
    world.appendChild(sparkle);
  }
}

function setCottageVisible(cottage, visible) {
  if (!cottage) return;

  const sign = cottage.querySelector('.sign');
  cottage.classList.toggle('ending-hidden', !visible);
  cottage.classList.remove('disappearing');
  cottage.style.opacity = visible ? '1' : '0';
  cottage.style.visibility = visible ? 'visible' : 'hidden';
  cottage.style.pointerEvents = visible ? 'auto' : 'none';
  cottage.style.transform = visible ? 'scale(1)' : 'scale(.82)';
  cottage.style.filter = visible ? 'none' : 'blur(2px)';

  if (sign) {
    sign.style.opacity = visible ? '1' : '0';
    sign.style.visibility = visible ? 'visible' : 'hidden';
  }
}

function ensureDoor() {
  const world = document.querySelector('.world');
  if (!world) return null;

  let door = document.getElementById('birthdayDoor');
  if (!door) {
    door = document.createElement('div');
    door.id = 'birthdayDoor';
    door.className = 'birthday-door';
    door.innerHTML = '<div class="door-panel"><div class="door-heart">♡</div><div class="door-knob"></div></div>';
    world.appendChild(door);
  }

  return door;
}

export function beginEndingTransition() {
  if (!state.endingUnlocked || state.bought.size < gifts.length || state.worldTransformationTriggered) {
    return;
  }

  const sequenceId = ++worldTransitionSequence;
  clearWorldTransitionTimers();
  clearTransitionSparkles();

  state.worldTransformationTriggered = true;
  state.endingUnlocked = true;
  state.endingDoorVisible = false;
  state.worldTransitioning = true;
  state.near = null;
  state.started = true;
  resetHeldMovement();

  const door = ensureDoor();
  if (door) {
    door.style.display = 'none';
    door.classList.remove('door-visible');
  }

  const promptEl = document.getElementById('prompt');
  if (promptEl) {
    promptEl.style.display = 'none';
    promptEl.textContent = '';
  }

  const store = document.querySelector('.cottage.store');
  const earn = document.querySelector('.cottage.earn');
  const player = document.getElementById('player');

  state.worldPos = { x: 50, y: 63 };
  if (player) {
    player.style.left = '50%';
    player.style.top = '63%';
  }

  setCottageVisible(store, true);
  setCottageVisible(earn, true);

  const revealDoor = () => {
    if (sequenceId !== worldTransitionSequence) return;

    const door = ensureDoor();
    if (door) {
      door.style.display = 'block';
      door.classList.remove('door-visible');
      requestAnimationFrame(() => {
        if (sequenceId !== worldTransitionSequence) return;
        door.classList.add('door-visible');
      });
    }

    if (promptEl) {
      promptEl.textContent = 'A little surprise is waiting…';
      promptEl.style.display = 'block';
    }

    state.endingDoorVisible = true;
    state.near = null;
    state.worldTransitioning = false;
    syncEndingWorldState();
  };

  const fadeCottages = () => {
    if (sequenceId !== worldTransitionSequence) return;

    [store, earn].forEach((cottage) => {
      if (!cottage) return;
      cottage.classList.add('disappearing');
      cottage.style.opacity = '0';
      cottage.style.visibility = 'visible';
      cottage.style.pointerEvents = 'none';
      cottage.style.transform = 'scale(.86) translateY(8px)';
      cottage.style.filter = 'blur(2px)';
      const sign = cottage.querySelector('.sign');
      if (sign) {
        sign.style.opacity = '0';
        sign.style.visibility = 'hidden';
      }
    });

    createTransitionSparkles();
  };

  const finishSequence = () => {
    if (sequenceId !== worldTransitionSequence) return;

    clearTransitionSparkles();
    setCottageVisible(store, false);
    setCottageVisible(earn, false);
    state.near = null;
    state.started = true;
    state.worldTransitioning = false;
    revealDoor();
  };

  const afterHold = setTimeout(fadeCottages, 700);
  worldTransitionTimers.push(afterHold);

  const afterFade = setTimeout(finishSequence, 2200);
  worldTransitionTimers.push(afterFade);
}

export function previewWorldTransformation() {
  state.started = true;
  state.endingUnlocked = true;
  state.endingDoorVisible = false;
  state.worldTransitioning = false;
  state.near = null;
  resetHeldMovement();
  beginEndingTransition();
}

export function syncEndingWorldState() {
  const store = document.querySelector('.cottage.store');
  const earn = document.querySelector('.cottage.earn');
  const door = ensureDoor();
  const showFinalDoor = Boolean(state.worldTransformationTriggered && state.endingUnlocked && state.endingDoorVisible);
  const cottagesVisible = !state.worldTransformationTriggered;

  [store, earn].forEach((cottage) => {
    if (!cottage) return;

    const visible = cottagesVisible || !showFinalDoor;
    setCottageVisible(cottage, visible);

    if (showFinalDoor) {
      cottage.style.pointerEvents = 'none';
    }
  });

  if (door) {
    door.style.display = showFinalDoor ? 'block' : 'none';
    door.classList.toggle('door-visible', showFinalDoor);
  }
}

function updatePrompt() {
  const promptEl = document.getElementById('prompt');
  if (!promptEl) return;

  const blocked =
    !state.started ||
    state.startTransitioning ||
    state.introReady ||
    state.introActive ||
    state.tutorialActive ||
    state.worldTransitioning ||
    state.endingSceneOpen ||
    isAnyMenuOpen();

  const messages = {
    store: 'E — Enter Gift Store',
    earn: 'E — Earn Money',
    door: 'E — A birthday surprise'
  };

  const message = blocked ? '' : (messages[state.near] || '');

  promptEl.textContent = message;
  promptEl.style.display = message ? 'block' : 'none';
}

export function detectNearbyInteraction() {
  state.near = null;

  const blocked =
    !state.started ||
    state.startTransitioning ||
    state.introReady ||
    state.introActive ||
    state.tutorialActive ||
    state.endingSceneOpen ||
    state.worldTransitioning ||
    isAnyMenuOpen();

  const world = document.querySelector('.world');

  if (blocked || !world) {
    updatePrompt();
    return;
  }

  const worldRect = world.getBoundingClientRect();

  if (!worldRect.width || !worldRect.height) {
    updatePrompt();
    return;
  }

  // worldPos identifies the character's feet.
  // Convert it to the same coordinates as the cottage rectangles.
  const playerX =
    worldRect.left + (state.worldPos.x / 100) * worldRect.width;

  const playerY =
    worldRect.top + (state.worldPos.y / 100) * worldRect.height;

  function isVisible(element) {
    if (!element) return false;

    const style = getComputedStyle(element);

    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      Number(style.opacity) > 0.1 &&
      !element.classList.contains('ending-hidden') &&
      !element.classList.contains('disappearing')
    );
  }

  // Once the final door appears, it becomes the interaction target.
  if (state.endingUnlocked && state.endingDoorVisible) {
    const door = document.getElementById('birthdayDoor');

    if (isVisible(door)) {
      const doorRect = door.getBoundingClientRect();

      const dx = Math.max(
        doorRect.left - playerX,
        0,
        playerX - doorRect.right
      );

      const dy = Math.max(
        doorRect.top - playerY,
        0,
        playerY - doorRect.bottom
      );

      const distance = Math.hypot(
        dx / worldRect.width,
        dy / worldRect.height
      );

      if (distance < 0.09) {
        state.near = 'door';
      }
    }

    updatePrompt();
    return;
  }

  // Stop cottage interactions only after the transformation starts.
  // Unlocking the ending alone must not disable the shops.
  if (state.worldTransformationTriggered) {
    updatePrompt();
    return;
  }

  const candidates = [
    { id: 'store', selector: '.cottage.store' },
    { id: 'earn', selector: '.cottage.earn' }
  ];

  let nearestDistance = Infinity;

  for (const candidate of candidates) {
    const cottage = world.querySelector(candidate.selector);
    if (!isVisible(cottage)) continue;

    const cottageRect = cottage.getBoundingClientRect();

    // Allow entry along the front and near either front corner.
    const horizontalGap = Math.max(
      cottageRect.left - playerX,
      0,
      playerX - cottageRect.right
    );

    const verticalGap = Math.abs(playerY - cottageRect.bottom);

    const distance = Math.hypot(
      horizontalGap / (worldRect.width * 0.07),
      verticalGap / (worldRect.height * 0.12)
    );

    if (distance <= 1 && distance < nearestDistance) {
      nearestDistance = distance;
      state.near = candidate.id;
    }
  }

  updatePrompt();
}

export function updatePlayerPosition() {
  const player = document.getElementById('player');
  if (!player) return;

  player.style.left = state.worldPos.x + '%';
  player.style.top = state.worldPos.y + '%';
}

export function initWorld() {
  const world = document.querySelector('.world');
  if (!world) return;

  if (window.__birthdayQuestWorldLoop) return;
  window.__birthdayQuestWorldLoop = true;

  for (let i = 0; i < 26; i += 1) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.style.left = (Math.random() * 100) + '%';
    petal.style.top = (-Math.random() * 100) + 'px';
    petal.style.animationDuration = (6 + Math.random() * 7) + 's';
    petal.style.animationDelay = (-Math.random() * 8) + 's';
    world.appendChild(petal);
  }

  syncEndingWorldState();
  setPlayerFacing(state.facing || 'north');

  function tick() {
    if (state.started && !state.startTransitioning && !state.worldTransitioning && !state.introActive && !state.tutorialActive && !isAnyMenuOpen() && !state.endingSceneOpen && document.getElementById('ending').style.display !== 'grid') {
      const speed = 0.38;
      if (state.keys['arrowleft'] || state.keys['a']) state.worldPos.x -= speed;
      if (state.keys['arrowright'] || state.keys['d']) state.worldPos.x += speed;
      if (state.keys['arrowup'] || state.keys['w']) state.worldPos.y -= speed;
      if (state.keys['arrowdown'] || state.keys['s']) state.worldPos.y += speed;

      state.worldPos.x = Math.max(3, Math.min(97, state.worldPos.x));
      state.worldPos.y = Math.max(33, Math.min(92, state.worldPos.y));

      if (!state.worldTransformationTriggered) {
        const blockedStore = state.worldPos.x < 29 && state.worldPos.y < 61;
        const blockedEarn = state.worldPos.x > 71 && state.worldPos.y < 61;
        if (blockedStore) state.worldPos.y = 61;
        if (blockedEarn) state.worldPos.y = 61;
      }

      updatePlayerPosition();
      detectNearbyInteraction();
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

export { resetHeldMovement };
