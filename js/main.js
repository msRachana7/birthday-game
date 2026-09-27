import { state, setStarted } from './systems/gameState.js';
import { bindInput } from './systems/input.js';
import { closeModal, isAnyMenuOpen } from './systems/navigation.js';
import { restoreProgress } from './systems/saveManager.js';
import { beginEndingTransition, initWorld, preloadPlayerSprites, syncEndingWorldState } from './world/world.js';
import { updateHUD } from './ui/hud.js';
import { purchaseGift } from './ui/giftStore.js';
import { createCottageShop } from './ui/cottage-shop.js';
import { renderGames } from './ui/earnMoney.js';
import { gifts } from './data/gifts.js';

const introState = {
  lines: [
    { text: "It’s my boyfriend’s birthday soon… and I don’t have any money…", expression: 'surprise' },
    { text: 'Will u help me earn some money to buy him his gifts?', expression: 'pleading', requiresYes: true },
    { text: 'Really? Awesome!', expression: 'happy' }
  ],
  currentLineIndex: 0,
  isTyping: false,
  typingTimer: null,
  muted: false,
  audioCtx: null,
  audioGain: null,
  musicAudio: null,
  introReady: false,
  lastToneAt: 0,
  awaitingOkay: false,
  introTriggerBound: false,
  introMovementHandler: null
};

const portraitConfig = {
  paths: {
    surprise: './surprise.png',
    pleading: './plead.png',
    happy: './happy.png',
    annoyed: './happy.png'
  },
  lineEmotion: ['surprise', 'pleading', 'happy'],
  tutorialEmotion: 'happy',
  lockedEmotion: 'surprise'
};

const giftArtwork = {
  'diet-coke': 'coke',
  gum: 'gum',
  'messi-jersey': 'jersey',
  beer: 'beer',
  'orange-lays': 'chips',
  'spider-man-socks': 'socks',
  tent: 'tent',
  'pilot-licence': 'licence',
  ferrari: 'ferrari'
};

const shopkeeperPortraits = {
  happy: './Happyshopkeeper.png',
  talking: './talkingshopkeeper.png',
  thankYou: './thankyoushopkeeper.png',
  surprised: './surprisedshopkeeper.png'
};

function ensureAudio() {
  if (!introState.audioCtx) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;
    introState.audioCtx = new AudioCtor();
    introState.audioGain = introState.audioCtx.createGain();
    introState.audioGain.gain.value = 0.9;
    introState.audioGain.connect(introState.audioCtx.destination);
  }

  if (introState.audioCtx && introState.audioCtx.state === 'suspended') {
    introState.audioCtx.resume();
  }
}

function stopTypingAudio() {
  if (introState.typingTimer) {
    clearTimeout(introState.typingTimer);
    introState.typingTimer = null;
  }
}

function playTypingTone() {
  if (!introState.audioCtx || introState.muted) return;

  const now = performance.now();
  if (now - introState.lastToneAt < 55) return;
  introState.lastToneAt = now;

  if (introState.audioCtx.state === 'suspended') {
    introState.audioCtx.resume();
  }

  const oscillator = introState.audioCtx.createOscillator();
  const gain = introState.audioCtx.createGain();
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(710, introState.audioCtx.currentTime);
  gain.gain.setValueAtTime(0.0001, introState.audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.018, introState.audioCtx.currentTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, introState.audioCtx.currentTime + 0.045);
  oscillator.connect(gain);
  gain.connect(introState.audioGain);
  oscillator.start();
  oscillator.stop(introState.audioCtx.currentTime + 0.045);
}

function startBackgroundMusic() {
  if (!introState.musicAudio) {
    introState.musicAudio = document.createElement('audio');
    introState.musicAudio.loop = true;
    introState.musicAudio.preload = 'auto';
    introState.musicAudio.volume =0.05;

    const m4aSource = document.createElement('source');
    m4aSource.src = './Game.m4a';
    m4aSource.type = 'audio/mp4; codecs="mp4a.40.2"';

    const fallbackSource = document.createElement('source');
    fallbackSource.src = './assets/sounds/Game.wav';
    fallbackSource.type = 'audio/wav';

    introState.musicAudio.append(m4aSource, fallbackSource);
  }

  introState.musicAudio.muted = introState.muted;
  introState.musicAudio.play().catch(() => {});
}

function setSoundMuted(muted) {
  introState.muted = muted;
  if (!muted) ensureAudio();
  if (muted) stopTypingAudio();

  if (introState.musicAudio) introState.musicAudio.muted = muted;

  const introMuteBtn = document.getElementById('introMuteBtn');
  if (introMuteBtn) introMuteBtn.textContent = muted ? 'Sound: off' : 'Sound: on';

  const musicToggleBtn = document.getElementById('musicToggleBtn');
  if (musicToggleBtn) {
    musicToggleBtn.textContent = muted ? '🔇' : '🔊';
    musicToggleBtn.setAttribute('aria-label', muted ? 'Enable background music' : 'Mute background music');
    musicToggleBtn.setAttribute('title', muted ? 'Enable background music' : 'Mute background music');
    musicToggleBtn.setAttribute('aria-pressed', String(!muted));
  }
}

function setPortraitExpression(expression) {
  const portrait = document.getElementById('rachanaPortrait');
  if (!portrait) return;
  portrait.className = `rachana-portrait portrait-${expression}`;
  portrait.innerHTML = `<img src="${portraitConfig.paths[expression] || portraitConfig.paths.happy}" alt="Rachana" />`;
}

function preloadPortraits() {
  Object.values(portraitConfig.paths).forEach((path) => {
    const image = new Image();
    image.src = path;
  });
}

function showIntroPrompt() {
  const overlay = document.getElementById('rachanaIntroOverlay');
  const prompt = document.getElementById('introPrompt');
  const touch = document.getElementById('introTouchContinue');
  const yesBtn = document.getElementById('introYesBtn');
  const bubble = document.getElementById('rachanaDialogueBubble');

  if (overlay) overlay.classList.remove('hidden');
  if (prompt) prompt.classList.add('hidden');
  if (touch) touch.classList.add('visible');
  if (yesBtn) yesBtn.classList.add('hidden');
  document.getElementById('introOkayBtn')?.classList.add('hidden');
  if (bubble) bubble.textContent = '';
  setPortraitExpression('surprise');
}

function hideIntroPrompt() {
  const prompt = document.getElementById('introPrompt');
  const touch = document.getElementById('introTouchContinue');
  if (prompt) prompt.classList.add('hidden');
  if (touch) touch.classList.remove('visible');
}

function syncIntroButtons() {
  const yesBtn = document.getElementById('introYesBtn');
  const okayBtn = document.getElementById('introOkayBtn');
  if (yesBtn) {
    const line = introState.lines[introState.currentLineIndex];
    yesBtn.classList.toggle('hidden', !(line && line.requiresYes));
  }
  if (okayBtn) {
    const visible = introState.currentLineIndex === 2 && !introState.isTyping;
    okayBtn.classList.toggle('hidden', !visible);
    if (visible) okayBtn.focus();
  }
}

function finishCurrentIntroLine() {
  if (introState.isTyping) {
    stopTypingAudio();
    introState.isTyping = false;
  }
  const line = introState.lines[introState.currentLineIndex];
  const bubble = document.getElementById('rachanaDialogueBubble');
  if (bubble && line) bubble.textContent = line.text;
  if (line) setPortraitExpression(line.expression);
  syncIntroButtons();
}

function typeIntroLine(index) {
  const line = introState.lines[index];
  if (!line) return;
  introState.currentLineIndex = index;
  introState.isTyping = true;
  stopTypingAudio();
  ensureAudio();
  hideIntroPrompt();
  const bubble = document.getElementById('rachanaDialogueBubble');
  if (bubble) bubble.textContent = '';
  setPortraitExpression(line.expression);

  let charIndex = 0;
  const text = line.text;
  const tick = () => {
    if (!introState.isTyping) return;
    if (bubble) bubble.textContent = text.slice(0, charIndex + 1);
    if (text[charIndex] !== ' ') playTypingTone();
    charIndex += 1;
    if (charIndex < text.length) {
      introState.typingTimer = window.setTimeout(tick, 36);
      return;
    }
    introState.isTyping = false;
    stopTypingAudio();
    syncIntroButtons();
  };
  tick();
}

function startIntroSequence() {
  if (state.introActive) return;

  state.introActive = true;
  state.introReady = false;
  state.birthdayLockedMessageOpen = false;
  clearIntroMovementTrigger();
  ensureAudio();
  const overlay = document.getElementById('rachanaIntroOverlay');
  if (overlay) overlay.classList.remove('hidden');
  const prompt = document.getElementById('introPrompt');
  if (prompt) prompt.classList.add('hidden');
  const touch = document.getElementById('introTouchContinue');
  if (touch) touch.classList.remove('visible');
  typeIntroLine(0);
}

function beginIntroFromUserAction() {
  if (!state.started || state.startTransitioning || state.tutorialActive || state.worldTransitioning || state.endingSceneOpen) return;
  if (state.introReady) {
    ensureAudio();
    startIntroSequence();
  }
}

function handleIntroAdvance() {
  if (!state.introActive) return;
  if (introState.awaitingOkay) return;
  if (introState.isTyping) {
    finishCurrentIntroLine();
    return;
  }
  if (introState.currentLineIndex === 1) return;
  if (introState.currentLineIndex < introState.lines.length - 1) {
    typeIntroLine(introState.currentLineIndex + 1);
    return;
  }
}

function closeIntroOverlay() {
  stopTypingAudio();
  state.introActive = false;
  state.introReady = false;
  state.birthdayLockedMessageOpen = false;
  introState.awaitingOkay = false;
  introState.isTyping = false;
  introState.currentLineIndex = 0;
  document.getElementById('rachanaIntroOverlay')?.classList.add('hidden');
  document.getElementById('introPrompt')?.classList.add('hidden');
  document.getElementById('introTouchContinue')?.classList.remove('visible');
  document.getElementById('introYesBtn')?.classList.add('hidden');
  const bubble = document.getElementById('rachanaDialogueBubble');
  if (bubble) bubble.textContent = '';
}

function startTutorial() {
  document.getElementById('tutorialOverlay')?.remove();
  state.tutorialActive = true;
  const tutorialSteps = [
    { text: 'That’s the Gift Store! Let’s get him some things he loves.', target: '.cottage.store' },
    { text: 'That’s where we earn money! Play our little games to earn coins.', target: '.cottage.earn' },
    { text: 'Use WASD or the arrow keys to walk. Stand near a cottage and press E to enter.', target: '.world' },
    { text: 'Once you’ve earned some coins, head back to the store and choose a gift to buy.', target: '.cottage.store' },
    { text: 'When we’ve bought everything, we can go wish him happy birthday!', target: '#birthdayButton' }
  ];

  let index = 0;
  const overlay = document.createElement('div');
  overlay.id = 'tutorialOverlay';
  overlay.className = 'tutorial-overlay';
  overlay.innerHTML = `
    <div id="tutorialFocus" class="tutorial-focus"></div>
    <div id="tutorialBubble" class="tutorial-bubble"></div>
    <div class="tutorial-actions">
      <button id="tutorialPrev" type="button" class="secondary-button">Back</button>
      <button id="tutorialNext" type="button">Next</button>
    </div>
  `;
  document.getElementById('game').appendChild(overlay);

  function updateStep() {
    document.querySelectorAll('.tutorial-highlight').forEach((element) => element.classList.remove('tutorial-highlight'));
    const target = document.querySelector(tutorialSteps[index].target);
    const focus = document.getElementById('tutorialFocus');
    const bubble = document.getElementById('tutorialBubble');
    const nextBtn = document.getElementById('tutorialNext');
    if (focus && target) {
      const rect = target.getBoundingClientRect();
      const frameRect = document.getElementById('game').getBoundingClientRect();
      focus.style.left = `${rect.left - frameRect.left}px`;
      focus.style.top = `${rect.top - frameRect.top}px`;
      focus.style.width = `${rect.width}px`;
      focus.style.height = `${rect.height}px`;
      focus.classList.add('visible');
      target.classList.add('tutorial-highlight');
    }
    if (bubble) bubble.textContent = tutorialSteps[index].text;
    if (nextBtn) nextBtn.textContent = index === tutorialSteps.length - 1 ? 'Let’s go!' : 'Next';
  }

  const prevBtn = document.getElementById('tutorialPrev');
  const nextBtn = document.getElementById('tutorialNext');
  const advance = () => {
    if (index < tutorialSteps.length - 1) {
      index += 1;
      updateStep();
      if (prevBtn) prevBtn.disabled = false;
      return;
    }
    state.tutorialActive = false;
    overlay.remove();
    document.querySelectorAll('.tutorial-highlight').forEach((element) => element.classList.remove('tutorial-highlight'));
    state.keys = {};
    syncBirthdayButtonState();
  };
  if (prevBtn) {
    prevBtn.disabled = index === 0;
    prevBtn.addEventListener('click', () => {
      if (index > 0) {
        index -= 1;
        updateStep();
        prevBtn.disabled = index === 0;
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', advance);
  }
  updateStep();
  nextBtn?.focus();
}

function showLockedBirthdayMessage() {
  if (state.birthdayLockedMessageOpen) return;
  state.birthdayLockedMessageOpen = true;
  state.introActive = true;
  const overlay = document.getElementById('rachanaIntroOverlay');
  if (overlay) overlay.classList.remove('hidden');
  document.getElementById('introPrompt')?.classList.add('hidden');
  document.getElementById('introTouchContinue')?.classList.remove('visible');
  document.getElementById('introYesBtn')?.classList.add('hidden');
  const bubble = document.getElementById('rachanaDialogueBubble');
  if (bubble) bubble.textContent = 'Meanie how dare you! My boyfriend deserves more gifts';
  setPortraitExpression(portraitConfig.lockedEmotion);
  document.getElementById('introOkayBtn')?.classList.remove('hidden');
}

function syncBirthdayButtonState() {
  const button = document.getElementById('birthdayButton');
  if (!button) return;
  const visible = state.started && !state.startTransitioning && !state.introReady && !state.introActive && !state.tutorialActive && !state.endingSceneOpen && !state.worldTransitioning && !isAnyMenuOpen() && document.getElementById('ending').style.display !== 'grid';
  button.classList.toggle('visible', visible);
}

function handleBirthdayButtonClick() {
  if (!state.started || state.startTransitioning || state.introReady || state.introActive || state.tutorialActive || state.endingSceneOpen) return;
  if (state.bought.size < gifts.length) {
    showLockedBirthdayMessage();
    return;
  }
  if (state.worldTransformationTriggered) return;
  beginEndingTransition();
}

function startGame() {
  if (state.startTransitioning || state.started) return;
  state.startTransitioning = true;
  state.started = true;
  setStarted(true);
  const titleScreen = document.getElementById('titleScreen');
  const whiteOverlay = document.getElementById('startWhiteOverlay');
  if (titleScreen) titleScreen.style.display = 'none';
  if (whiteOverlay) whiteOverlay.classList.add('visible');
  setTimeout(() => {
    if (whiteOverlay) whiteOverlay.classList.remove('visible');
    setTimeout(() => {
      state.startTransitioning = false;
      state.introReady = true;
      showIntroPrompt();
      bindIntroMovementTrigger();
    }, 650);
  }, 260);
}

document.getElementById('startBtn')?.addEventListener('click', () => {
  ensureAudio();
  startBackgroundMusic();
  startGame();
});

function bindIntroMovementTrigger() {
  if (introState.introTriggerBound) return;
  introState.introTriggerBound = true;
  const handleMovement = (event) => {
    if (!state.introReady || state.introActive || state.startTransitioning) return;
    ensureAudio();
    beginIntroFromUserAction();
  };
  introState.introMovementHandler = handleMovement;
  document.addEventListener('pointermove', handleMovement, { passive: true });
}

function clearIntroMovementTrigger() {
  if (introState.introMovementHandler) {
    document.removeEventListener('pointermove', introState.introMovementHandler);
    introState.introMovementHandler = null;
  }
  introState.introTriggerBound = false;
}

document.getElementById('birthdayButton')?.addEventListener('click', handleBirthdayButtonClick);

document.getElementById('introMuteBtn')?.addEventListener('click', () => {
  setSoundMuted(!introState.muted);
});

document.getElementById('musicToggleBtn')?.addEventListener('click', () => {
  setSoundMuted(!introState.muted);
});

document.getElementById('introSkipBtn')?.addEventListener('click', () => {
  if (state.birthdayLockedMessageOpen) {
    closeIntroOverlay();
    state.birthdayLockedMessageOpen = false;
    return;
  }
  if (state.introReady) {
    startIntroSequence();
    return;
  }
  if (state.introActive) {
    if (introState.awaitingOkay) return;
    if (introState.isTyping) {
      finishCurrentIntroLine();
      return;
    }
    if (introState.currentLineIndex < introState.lines.length - 1) {
      typeIntroLine(introState.currentLineIndex + 1);
      return;
    }
  }
});

document.getElementById('introYesBtn')?.addEventListener('click', () => {
  if (!state.introActive || introState.isTyping || introState.currentLineIndex !== 1) return;
  introState.awaitingOkay = true;
  typeIntroLine(2);
});

document.getElementById('introOkayBtn')?.addEventListener('click', () => {
  // Close the “My boyfriend deserves more gifts” message.
  if (state.birthdayLockedMessageOpen) {
    closeIntroOverlay();
    return;
  }

  // Keep the original introduction behaviour.
  if (
    !state.introActive ||
    !introState.awaitingOkay ||
    introState.isTyping
  ) return;

  introState.awaitingOkay = false;
  closeIntroOverlay();
  startTutorial();
});

document.getElementById('introTouchContinue')?.addEventListener('click', () => {
  if (state.introReady) {
    startIntroSequence();
    return;
  }
  if (state.introActive) {
    if (introState.awaitingOkay) return;
    if (introState.isTyping) {
      finishCurrentIntroLine();
      return;
    }
    handleIntroAdvance();
  }
});

document.getElementById('rachanaDialogueBubble')?.addEventListener('click', () => {
  if (state.introReady) {
    startIntroSequence();
    return;
  }
  if (state.introActive) {
    if (introState.isTyping) {
      finishCurrentIntroLine();
      return;
    }
    handleIntroAdvance();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  if (state.introReady || state.introActive) {
    ensureAudio();
  }
  if (isAnyMenuOpen()) return;

  if (state.birthdayLockedMessageOpen) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
      event.preventDefault();
      closeIntroOverlay();
      state.birthdayLockedMessageOpen = false;
    }
    return;
  }

  if (state.introReady) {
    event.preventDefault();
    beginIntroFromUserAction();
    return;
  }

  if (state.introActive) {
    event.preventDefault();
    if (introState.awaitingOkay) return;
    if (event.key === 'Enter' || event.key === ' ') {
      handleIntroAdvance();
    }
    return;
  }

  if (!state.started || state.startTransitioning || state.worldTransitioning || state.endingSceneOpen) return;
  if (state.tutorialActive) return;
});

window.addEventListener('blur', stopTypingAudio);

document.querySelectorAll('[data-close-target]').forEach((button) => {
  button.addEventListener('click', () => {
    closeModal(button.dataset.closeTarget);
  });
});

document.getElementById('endingCardBtn')?.addEventListener('click', () => {
  alert('This is where your vertical birthday card would slide in 💌');
});

restoreProgress();
preloadPortraits();
preloadPlayerSprites();
createCottageShop({
  gifts: gifts.map((gift) => ({ ...gift, art: giftArtwork[gift.id] })),
  getState: () => ({ coins: state.coins, purchasedIds: [...state.bought] }),
  purchase: purchaseGift,
  portraits: shopkeeperPortraits,
  playTypingSound: playTypingTone,
  stopTypingSound: stopTypingAudio,
  onOpen: () => { state.activeModalId = 'cottageShopModal'; state.keys = {}; },
  onClose: () => { state.activeModalId = null; state.keys = {}; }
});
renderGames();
updateHUD();
syncEndingWorldState();
bindInput();
initWorld();
syncBirthdayButtonState();

window.__birthdayQuestState = state;
