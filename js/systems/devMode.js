import { games } from '../data/games.js';
import { gifts } from '../data/gifts.js';

export const DEV_TEST_MODE = false;
export const DEV_TEST_SAVE_KEY = 'birthdayQuestDevModeSaveV1';
export const DEV_TEST_TARGET_COINS = 1000;

export function getDevTestCompletedGameId() {
  return games[0]?.id || 'our-memories';
}

export function getDevTestCoinTarget() {
  return Math.max(DEV_TEST_TARGET_COINS, gifts.reduce((sum, gift) => sum + gift.price, 0));
}
