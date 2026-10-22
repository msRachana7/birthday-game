import { state, resetHeldMovement } from '../systems/gameState.js';
import { saveProgress } from '../systems/saveManager.js';
import { birthdayCardContent } from '../data/birthdayCard.js';
import { syncEndingWorldState } from '../world/world.js';

let controller;
let photoTimer = null;
let cardTimer = null;
let run = 0;
let cardReady = false;
let returnFocus = null;

const root = () => document.getElementById('ending');
const find = (selector) => root()?.querySelector(selector);

const photos = Array.from(
  { length: 7 },
  (_, i) => `./polaroids/${i + 1}.png?v=20261021`
);

const angles = [-8, 6, -5, 9, -7, 4, -3];

function listen(target, type, handler) {
  target.addEventListener(type, handler, {
    signal: controller.signal
  });
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

export function endBirthdayScene() {
  run++;

  clearTimeout(photoTimer);
  clearTimeout(cardTimer);
  photoTimer = cardTimer = null;

  controller?.abort();
  cardReady = false;

  state.endingSceneOpen = false;
  resetHeldMovement();

  if (root()) {
    root().style.display = 'none';
    root().replaceChildren();
  }

  if (returnFocus?.isConnected) returnFocus.focus();
  returnFocus = null;
}

function startEnding(skipPhotos = false) {
  if (!root()) return;

  endBirthdayScene();

  returnFocus = document.activeElement;
  state.endingSceneOpen = true;
  controller = new AbortController();
  root().style.display = 'grid';

  if (skipPhotos) buildCakeScene();
  else showPolaroids();
}

export function enterBirthdayDoor() {
  if (!state.endingUnlocked || state.endingSceneOpen) return;
  startEnding();
}

export function hideEnding() {
  endBirthdayScene();
}

function returnToField() {
  endBirthdayScene();
  state.worldTransformationTriggered = false;
  state.endingDoorVisible = false;
  state.worldTransitioning = false;
  state.near = null;
  state.worldPos = { x: 50, y: 63 };
  syncEndingWorldState();
  saveProgress();
}

export function showEnding() {
  if (root()) root().style.display = 'grid';
}

/* Keeps your existing cake-preview shortcut working. */
export function previewCakeScene() {
  state.endingUnlocked = true;
  state.endingDoorVisible = true;
  state.worldTransitioning = false;
  state.near = null;

  startEnding(true);
}

/* ─── Seven PNG polaroids, five seconds each ─── */

function showPolaroids() {
  const currentRun = run;
  let index = -1;
  let loading = false;

  // Remove any previous automatic photo timer.
  clearTimeout(photoTimer);
  photoTimer = null;

  photos.forEach(src => {
    const image = new Image();
    image.src = src;
  });

  root().innerHTML = `
    <section class="bq-memories">
      <p class="bq-memory-title">
        Before your wish… here's what happened between the two friends♡
      </p>

      <div class="bq-photo-slot"></div>

      <!-- <p class="bq-photo-count" aria-live="polite"></p> -->

      <button class="bq-photo-next" type="button">
        Next Picture ♡
      </button>

      <button class="bq-back" type="button">
        Back to field
      </button>
    </section>
  `;

  const slot = find('.bq-photo-slot');
  const nextButton = find('.bq-photo-next');
  // const counter = find('.bq-photo-count');

  listen(find('.bq-back'), 'click', returnToField);
  listen(nextButton, 'click', advance);

  // Clicking the photograph also advances.
  listen(slot, 'click', event => {
    if (event.target.closest('.bq-polaroid')) advance();
  });

  function advance() {
    if (
      loading ||
      run !== currentRun ||
      !state.endingSceneOpen
    ) return;

    // A click after the seventh photograph opens the cake.
    if (index === photos.length - 1) {
      buildCakeScene();
      return;
    }

    index++;
    loading = true;
    nextButton.disabled = true;
    // counter.textContent = 'Loading memory…';

    const figure = document.createElement('figure');
    figure.className = 'bq-polaroid';
    figure.style.setProperty('--tilt', `${angles[index]}deg`);
    figure.style.zIndex = String(index + 1);

    const image = new Image();
    image.alt = `Our memory ${index + 1}`;
    image.draggable = false;

    const caption = document.createElement('figcaption');
    caption.textContent = `${index + 1} / ${photos.length}  ♡`;

    figure.append(image, caption);

    // Keep all previous photographs underneath.
    slot.appendChild(figure);

    let settled = false;

    function ready(failed = false) {
      if (
        settled ||
        run !== currentRun ||
        !figure.isConnected
      ) return;

      settled = true;
      loading = false;
      nextButton.disabled = false;

      if (failed) {
        caption.textContent = `Could not load ${index + 1}.png`;
      }

      // counter.textContent =
      //   `Memory ${index + 1} of ${photos.length}`;

      nextButton.textContent =
        index === photos.length - 1
          ? 'Make a wish →'
          : 'Next memory ♡';

      nextButton.focus({ preventScroll: true });
    }

    image.onload = () => ready();
    image.onerror = () => ready(true);
    image.src = photos[index];
  }

  // Show the first photograph immediately.
  advance();
}

/* ─── Pink chocolate cake and wooden table ─── */

function cakeSVG() {
  return `
    <svg
      viewBox="0 0 540 340"
      aria-label="Birthday cake with five candles"
      role="img"
    >
      <defs>
        <g id="bq-berry">
          <path
            d="M-10 0H10V6H14V18H8V23H-7V18H-13V6H-10Z"
            fill="#cd5e59"
            stroke="#654631"
            stroke-width="3"
          />
          <path
            d="M-7 0V-7H0V-11H5V0"
            fill="#66844e"
          />
          <path
            d="M-6 7H-3M3 12H6M-4 17H-1"
            stroke="#f6c3a1"
            stroke-width="3"
          />
        </g>

        <g id="bq-cream">
          <path
            d="M-14 12V5H-9V-2H-4V-10H2V-3H8V4H14V12Z"
            fill="#fff0cf"
            stroke="#b99a74"
            stroke-width="3"
          />
          <path
            d="M-3 7V0M5 10V5"
            stroke="#e1c39c"
            stroke-width="3"
          />
        </g>
      </defs>

      <g
        stroke="#61452f"
        stroke-width="4"
        stroke-linejoin="miter"
      >
        <!-- Wooden table -->
        <path d="M45 259H495L526 292H14Z" fill="#a6744d"/>
        <path
          d="M30 276H510M100 259L82 290M382 259L400 291"
          stroke="#795034"
        />
        <path
          d="M30 310H65V337H30ZM475 310H510V337H475Z"
          fill="#835535"
        />
        <path d="M14 292H526V317H14Z" fill="#97633e"/>
        <path d="M18 295H522" stroke="#c08c5b"/>

        <!-- Cream plate -->
        <path
          d="M107 244H433L451 256V268L431 282H108L88 268V256Z"
          fill="#e8d4ad"
        />
        <path
          d="M110 244H430L447 257L429 269H111L93 257Z"
          fill="#fff1cf"
        />

        <!-- Bottom chocolate tier -->
        <path
          d="M126 188H414V253L402 261H138L126 253Z"
          fill="#95613f"
        />
        <path
          d="M126 188H414V211H404V223H394V208H375V216H365V230H354V208H334V219H323V210H301V226H289V209H267V216H254V208H233V223H219V209H198V218H184V233H172V209H152V222H140V210H126Z"
          fill="#eaa2aa"
        />
        <path
          d="M126 188L143 178H397L414 188L397 198H143Z"
          fill="#fff0d4"
        />

        <!-- Top chocolate tier -->
        <path
          d="M154 119H386V180L377 187H163L154 180Z"
          fill="#8f5d3f"
        />
        <path
          d="M154 119H386V139H377V152H366V135H350V146H338V137H320V154H308V137H289V146H276V135H257V150H245V137H229V144H216V159H204V137H186V148H174V137H154Z"
          fill="#eea5b0"
        />
        <path
          d="M154 119L167 111H373L386 119L374 127H167Z"
          fill="#fff0d6"
        />
      </g>

      ${[161, 229, 309, 381].map(x => `
        <use href="#bq-berry" x="${x}" y="175"/>
      `).join('')}

      ${[190, 269, 345].map(x => `
        <use href="#bq-cream" x="${x}" y="187"/>
      `).join('')}

      ${[177, 219, 319, 363].map(x => `
        <use href="#bq-cream" x="${x}" y="116"/>
      `).join('')}

      ${[180, 225, 270, 315, 360].map((x, i) => {
        const y = i === 2 ? 61 : 70;

        return `
          <g class="bq-candle">
            <path
              d="M${x} ${y - 9}V${y}"
              stroke="#624630"
              stroke-width="4"
            />

            <rect
              x="${x - 7}"
              y="${y}"
              width="14"
              height="${117 - y}"
              fill="#f4c9c5"
              stroke="#624630"
              stroke-width="4"
            />

            <path
              d="M${x - 5} ${y + 10}h10m-10 13h10m-10 13h10"
              stroke="#fff0db"
              stroke-width="5"
            />

            <g class="bq-flame" data-out="false">
              <path
                d="M${x} ${y - 39}l5 10 5 5v12l-5 6h-10l-5-6v-12l5-5Z"
                fill="#ffbf48"
                stroke="#e68c31"
                stroke-width="3"
              />
              <path
                d="M${x} ${y - 25}l4 7v8h-8v-8Z"
                fill="#fff4c2"
              />
            </g>
          </g>
        `;
      }).join('')}

      <use href="#bq-berry" x="259" y="102"/>
      <use href="#bq-berry" x="280" y="101"/>
    </svg>
  `;
}

/* ─── Cake screen and birthday card ─── */

function buildCakeScene() {
  if (!state.endingSceneOpen) return;

  clearTimeout(photoTimer);

  controller.abort();
  controller = new AbortController();

  root().innerHTML = `
    <section class="bq-scene">
      <div class="bq-cloud bq-cloud-left"></div>
      <div class="bq-cloud bq-cloud-right"></div>

      <h1 class="bq-title">HAPPY BIRTHDAY!</h1>
      <p class="bq-wish">Make a little wish.</p>

      <div class="bq-cake-area">
        ${cakeSVG()}
      </div>

      <div class="bq-controls">
        <p class="bq-prompt" aria-live="polite">
          Move your pointer over each candle to blow it out.
        </p>
      </div>

      <button class="bq-back" type="button">
        Back to field
      </button>

      <div class="bq-card-overlay" hidden>
        <section
          class="bq-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bq-card-title"
        >
          <header>
            <span>One more thing…</span>
            <button
              class="bq-card-close"
              type="button"
              aria-label="Close card"
            >×</button>
          </header>

          <div class="bq-card-paper">
            <div class="bq-heart" aria-hidden="true">♥</div>

            <p class="bq-card-label">JUST FOR YOU</p>

            <h2 id="bq-card-title">
              ${escapeHTML(birthdayCardContent.title)}
            </h2>

            <p class="bq-recipient">
              To ${escapeHTML(birthdayCardContent.recipient)}
            </p>

            <p class="bq-message">${escapeHTML(birthdayCardContent.message)}</p>

            <p class="bq-signature">
              ${escapeHTML(birthdayCardContent.signature)}
            </p>

            <div class="bq-heart" aria-hidden="true">♥</div>
          </div>
        </section>
      </div>
    </section>
  `;

  listen(find('.bq-back'), 'click', returnToField);
  listen(find('.bq-card-close'), 'click', closeCard);

  const area = find('.bq-cake-area');
  listen(area, 'pointermove', event => {
    const candle = event.target.closest?.('.bq-candle');
    if (!candle) return;

    extinguish(candle.querySelector('.bq-flame[data-out="false"]'));
  });

  listen(document, 'keydown', event => {
    if (!find('.bq-card-overlay').hidden) {
      if (event.key === 'Escape') closeCard();

      if (event.key === 'Tab') {
        event.preventDefault();
        find('.bq-card-close').focus();
      }

      return;
    }

    if (
      event.repeat ||
      event.target.closest?.(
        'input, textarea, [contenteditable="true"]'
      )
    ) return;

    if (['b', 'c'].includes(event.key.toLowerCase())) {
      event.preventDefault();

      if (!cardReady) {
        extinguish(find('.bq-flame[data-out="false"]'));
      }
    }
  });
}

function openCard() {
  const overlay = find('.bq-card-overlay');
  if (!overlay || !state.endingSceneOpen) return;

  overlay.hidden = false;
  find('.bq-card-close').focus({ preventScroll: true });
}

function closeCard() {
  const overlay = find('.bq-card-overlay');
  if (!overlay || overlay.hidden) return;

  overlay.hidden = true;
  find('.bq-back')?.focus({ preventScroll: true });
}

function extinguish(flame) {
  if (!flame || flame.dataset.out === 'true') return;

  flame.dataset.out = 'true';

  const remaining = root()
    .querySelectorAll('.bq-flame[data-out="false"]').length;

  if (remaining > 0) {
    find('.bq-prompt').textContent =
      `${remaining} candles left ♡`;
    return;
  }

  // Start only once, after the final candle goes out.
  if (cardTimer !== null || cardReady) return;

  find('.bq-prompt').textContent =
    'Your wish is on its way… ♡';

  const currentRun = run;

  cardTimer = setTimeout(() => {
    cardTimer = null;

    if (
      run !== currentRun ||
      !state.endingSceneOpen
    ) return;

    cardReady = true;
    openCard();
  }, 2000);
}