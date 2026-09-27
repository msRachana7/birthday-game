export const STORAGE_KEY = 'birthdayQuestSaveV1';
export const STORAGE_VERSION = 1;

export const state = {
  coins: 0,
  bought: new Set(),
  completed: new Set(),
  started: false,
  near: null,
  activeModalId: null,
  keys: {},
  facing: 'north',
  facingOrder: [],
  worldPos: { x: 50, y: 70 },
  endingUnlocked: false,
  endingDoorVisible: false,
  endingCompleted: false,
  endingSceneOpen: false,
  worldTransitioning: false,
  worldTransformationTriggered: false,
  introActive: false,
  tutorialActive: false,
  startTransitioning: false,
  introDone: false,
  birthdayLockedMessageOpen: false,
  birthdayButtonVisible: false
};

export function resetHeldMovement() {
  state.keys = {};
}

export function setStarted(value) {
  state.started = value;
}

export function setNearby(value) {
  state.near = value;
}

export function setActiveModalId(value) {
  state.activeModalId = value;
}
