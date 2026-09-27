import { gifts } from '../data/gifts.js';
import { STORAGE_KEY, STORAGE_VERSION, state } from './gameState.js';
import { DEV_TEST_MODE, getDevTestCoinTarget, getDevTestCompletedGameId } from './devMode.js';

export function safeReadSave() {
  return {
    version: STORAGE_VERSION,
    coins: DEV_TEST_MODE ? getDevTestCoinTarget() : 0,
    completedMiniGames: DEV_TEST_MODE ? [getDevTestCompletedGameId()] : [],
    purchasedGiftIds: [],
    endingUnlocked: false,
    endingDoorVisible: false,
    endingCompleted: false,
    worldTransformationTriggered: false
  };
}

export function saveProgress() {}

export function restoreProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}

  const saved = safeReadSave();
  const completedMiniGames = new Set(saved.completedMiniGames);

  if (DEV_TEST_MODE) {
    const firstGameId = getDevTestCompletedGameId();
    if (firstGameId) completedMiniGames.add(firstGameId);
    saved.coins = Math.max(Number.isFinite(saved.coins) ? saved.coins : 0, getDevTestCoinTarget());
    saved.endingUnlocked = false;
    saved.endingDoorVisible = false;
    saved.worldTransformationTriggered = false;
  }

  state.coins = saved.coins;
  state.completed = completedMiniGames;
  state.bought = new Set(saved.purchasedGiftIds);
  state.endingUnlocked = Boolean(saved.endingUnlocked || state.bought.size >= gifts.length);
  state.endingDoorVisible = Boolean(saved.endingDoorVisible && state.endingUnlocked);
  state.endingCompleted = Boolean(saved.endingCompleted);
  state.worldTransformationTriggered = Boolean(saved.worldTransformationTriggered && state.endingUnlocked);
}
