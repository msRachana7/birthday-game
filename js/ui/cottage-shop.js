/*
 * BIRTHDAY QUEST — COTTAGE SHOP
 * Plain JavaScript ES module. No dependencies.
 *
 * Integration:
 *
 * const shop = createCottageShop({
 *   gifts: [
 *     { id: "existing-id", name: "Diet Coke", price: 20, art: "coke" }
 *   ],
 *
 *   getState: () => ({
 *     coins: currentCoinBalance,
 *     purchasedIds: [...existingPurchasedGiftIds]
 *   }),
 *
 *   purchase: async (id) => {
 *     // Use the EXISTING purchase/save function.
 *     // Update shared state before returning success.
 *     return { ok: true };
 *     // Or: { ok: false, reason: "insufficient" }
 *   },
 *
 *   onOpen: () => { // Lock movement and clear held keys },
 *   onClose: () => { // Unlock movement and clear held keys }
 * });
 *
 * shop.open();
 * shop.close();
 * shop.refresh();
 * shop.destroy();
 *
 * This module never writes to localStorage or owns a separate balance.
 */

const SHOP_REMARKS = {
  coke: {
    hover: "For the boyfriend who runs on fizz.",
    bought: "One fizzy little present, coming right up!"
  },
  gum: {
    hover: "A tiny gift. A fresh start.",
    bought: "Fresh choice! He’s going to love it."
  },
  jersey: {
    hover: "You might have to compete with Messi for his attention.",
    bought: "GOOOAL! You’ve scored serious girlfriend points."
  },
  beer: {
    hover: "A little birthday cheers!",
    bought: "Cheers to the birthday boy! Lovely choice."
  },
  chips: {
    hover: "Sharing your chips? Now that’s commitment.",
    bought: "Crunchy, orange, perfect. Congratulations!"
  },
  socks: {
    hover: "With great socks comes great responsibility.",
    bought: "His superhero era starts at his ankles."
  },
  tent: {
    hover: "A portable house. Very serious relationship behaviour.",
    bought: "Happy camping! You’ve gifted him an adventure."
  },
  licence: {
    hover: "This relationship is taking flight.",
    bought: "Purchase cleared for takeoff!"
  },
  ferrari: {
    hover: "A small, humble birthday gift. Nothing dramatic.",
    bought: "A FERRARI?! Girlfriend of the century!"
  }
};

const SHOP_ART = {
  coke: `
    <path fill="#dcd9cf" d="M22 7h20v48H22z"/>
    <path fill="#b85965" d="M22 20h20v21H22z"/>
    <path stroke="#fff1d7" stroke-width="3" d="m25 34 13-8"/>
    <path stroke="#766553" stroke-width="2" d="M24 11h16M25 51h14"/>
  `,
  gum: `
    <path fill="#d197b2" d="M10 23h44v23H10z"/>
    <path fill="#fff0cb" d="M14 27h36v14H14z"/>
    <path stroke="#78a689" stroke-width="3"
      fill="none" d="m18 35 6-4 6 4 6-4 8 4"/>
  `,
  jersey: `
    <path fill="#a5d6df"
      d="m20 10-13 9 7 12 7-4v28h23V27l7 4 6-12-13-9-12 5z"/>
    <path stroke="#fff5dc" stroke-width="6"
      d="M26 20v31m12-31v31"/>
    <path fill="#66503e"
      d="M29 27h3v13h-3zm6 0h6v13h-6z"/>
  `,
  beer: `
    <path fill="#d8ac58" d="M20 24h25v30H20z"/>
    <path fill="none" stroke="#cda673" stroke-width="5"
      d="M45 29h9v18h-9"/>
    <path fill="#fff7df" d="M17 17h31v13H17z"/>
    <path stroke="#fff0b2" stroke-width="3"
      d="M26 34v14m9-14v14"/>
  `,
  chips: `
    <path fill="#e5994e" d="m18 10 29 2-3 42H20z"/>
    <path fill="#fff1c5" d="M24 25h17v17H24z"/>
    <path stroke="#c36d3f" stroke-width="3"
      d="M22 15h20M24 48h15"/>
  `,
  socks: `
    <path fill="#ce6b73"
      d="M12 9h15v28l-6 14H8V40l4-4zm28 0h15v28l-6 14H36V40l4-4z"/>
    <path stroke="#465879" stroke-width="5"
      d="M13 17h13m15 0h13M10 44h12m16 0h12"/>
  `,
  tent: `
    <path fill="#94aa7b" d="m32 10 26 43H6z"/>
    <path fill="#607b66" d="m32 10 7 43H6z"/>
    <path fill="#e9d6a2" d="m32 26 11 27H22z"/>
    <path stroke="#fff0cd" stroke-width="2"
      d="m32 10 26 43"/>
  `,
  licence: `
    <path fill="#fff0cd" d="M7 15h50v35H7z"/>
    <path fill="#d698ab" d="M12 22h12v16H12z"/>
    <path stroke="#8ba6a3" stroke-width="3"
      d="M29 25h21M29 32h17M12 43h38"/>
    <path fill="#c7a252"
      d="m44 36 3 3 4-1-1 4 2 3-5 1-3-3z"/>
  `,
  ferrari: `
    <path fill="#c75e64"
      d="m6 34 9-3 8-13h22l8 15 7 3v13H5z"/>
    <path fill="#badbda" d="m25 22-6 10h28l-5-10z"/>
    <path fill="#463d3c"    
      d="M12 42h11v12H12zm29 0h11v12H41z"/>
    <path fill="#fff0cc"
      d="M9 36h8v4H9zm43 0h5v4h-5z"/>
  `
};

function makeShopSVG(body, viewBox = "0 0 64 64") {
  return `
    <svg
      aria-hidden="true"
      viewBox="${viewBox}"
      xmlns="http://www.w3.org/2000/svg"
      shape-rendering="crispEdges"
    >${body}</svg>
  `;
}

const DEFAULT_PORTRAITS = {
  happy: "./Happyshopkeeper.png",
  talking: "./talkingshopkeeper.png",
  thankYou: "./thankyoushopkeeper.png",
  surprised: "./surprisedshopkeeper.png"
};

const TALKING_HOVER_ART = new Set(["jersey", "beer", "socks", "tent", "ferrari"]);

let activeShop = null;

const SHOP_CSS = `
  :host {
    --ink: #493426;
    --cream: #efdfc2;
    --pink: #c98e95;
    color: var(--ink);
    font-family: "Courier New", monospace;
  }

  * { box-sizing: border-box; }

  dialog {
    padding: 0;
    border: 5px solid var(--ink);
    width: min(1060px, 95vw);
    max-width: 95vw;
    max-height: 94dvh;
    overflow: auto;
    background: #c8ac88;
    color: var(--ink);
    box-shadow:
      0 0 0 5px #dfc9a6,
      12px 15px 0 #33251d40;
  }

  dialog::backdrop { background: #30382bcc; }

  button {
    font: inherit;
    color: inherit;
    cursor: pointer;
    border: 3px solid var(--ink);
    background: var(--cream);
    font-weight: bold;
  }

  button:focus-visible {
    outline: 3px solid #356b69;
    outline-offset: 3px;
  }

  button:disabled {
    cursor: default;
    opacity: .65;
  }

  header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: #dfc9a6;
    border-bottom: 4px solid var(--ink);
  }

  h2 { margin: 0; font-size: 21px; }

  header small {
    display: block;
    font-size: 11px;
    letter-spacing: 2px;
    margin-top: 5px;
  }

  .wallet {
    margin-left: auto;
    white-space: nowrap;
    font-weight: bold;
    background: #dfc18a;
    padding: 8px 12px;
    border: 2px solid #927044;
  }

  .close {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .room {
    display: grid;
    grid-template-columns: 240px 1fr;
    min-height: 490px;
    background: repeating-linear-gradient(
      0deg,
      #c8ac88 0 67px,
      #b99b76 67px 69px
    );
    padding: 22px;
    gap: 28px;
  }

  .keeper-side {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    position: relative;
  }

  .window {
    height: 105px;
    width: 135px;
    border: 6px solid #805b42;
    background:
      linear-gradient(
        90deg,
        transparent 46%,
        #e7d5b2 46% 53%,
        transparent 53%
      ),
      linear-gradient(
        transparent 46%,
        #e7d5b2 46% 53%,
        transparent 53%
      ),
      #87a69b;
    box-shadow: -14px 0 #b77f89, 14px 0 #b77f89;
    margin: 0 0 15px;
  }

  .bubble {
    position: relative;
    width: 100%;
    min-height: 135px;
    padding: 15px;
    background: #efdfc2;
    border: 3px solid var(--ink);
    font-size: 14px;
    line-height: 1.5;
    box-shadow: 4px 4px #997653;
  }

  .bubble::after {
    content: "";
    position: absolute;
    bottom: -12px;
    left: 45%;
    width: 16px;
    height: 16px;
    transform: rotate(45deg);
    background: #efdfc2;
    border-right: 3px solid var(--ink);
    border-bottom: 3px solid var(--ink);
  }

  .speaker {
    display: block;
    letter-spacing: 2px;
    font-size: 10px;
    margin-bottom: 6px;
    color: #8b475a;
  }

  .keeper {
    width: 170px;
    height: 190px;
    margin-top: 12px;
    display: grid;
    place-items: center;
  }

  .keeper img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center bottom;
    display: block;
    image-rendering: auto;
  }
  .eyes { animation: blink 5s infinite; }
  .keeper.happy { animation: bounce .45s 2; }

  .counter {
    width: 100%;
    height: 60px;
    border: 4px solid #59402e;
    background: repeating-linear-gradient(
      90deg,
      #996c48 0 35px,
      #89603f 35px 38px
    );
    box-shadow: 0 -8px #bc915d;
    color: #f4e4c8;
    display: grid;
    place-items: center;
    font-weight: bold;
    letter-spacing: 2px;
    font-size: 12px;
    margin-top: -15px;
    z-index: 1;
  }

  .merch { min-width: 0; }

  .sign {
    text-align: center;
    font-size: 11px;
    letter-spacing: 3px;
    margin: 0 0 16px;
  }

  .shelves {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px 12px;
  }

  .slot {
    position: relative;
    min-width: 0;
    height: 130px;
    border-bottom: 8px solid #805638;
    box-shadow: 0 4px #59402e;
  }

  .item {
    width: 100%;
    height: 122px;
    border: 2px solid transparent;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4px;
  }

  .item:hover,
  .item.selected {
    background: #efdfc266;
    border-color: #9b5d6c;
  }

  .item svg {
    height: 65px;
    width: 70px;
    flex-shrink: 0;
    filter: drop-shadow(3px 4px 0 #72533320);
  }

  .item strong {
    font-size: 12px;
    margin: 5px 0 3px;
    text-align: center;
  }

  .price { font-size: 11px; color: #62452f; }

  .sold {
    height: 100%;
    display: grid;
    place-items: center;
    color: #68523d;
    font-size: 11px;
    letter-spacing: 2px;
  }

  .slot.spark::after {
    content: "✦  +  ✦";
    position: absolute;
    inset: 25px 0 auto;
    text-align: center;
    color: #873e5b;
    font-size: 24px;
    pointer-events: none;
    animation: sparkle .6s both;
  }

  .leaving {
    animation: leave .38s forwards;
    pointer-events: none;
  }

  .checkout {
    display: flex;
    align-items: center;
    gap: 14px;
    min-height: 70px;
    padding: 12px 18px;
    border-top: 4px solid #6f4d35;
    background: repeating-linear-gradient(
      90deg,
      #b9956f 0 80px,
      #aa855f 80px 82px
    );
  }

  .selection {
    flex: 1;
    font-size: 13px;
    line-height: 1.4;
  }

  .buy {
    background: #c98e95;
    padding: 10px 20px;
    box-shadow: 3px 3px #684732;
    white-space: nowrap;
  }

  .hint {
    padding: 9px;
    text-align: center;
    font-size: 10px;
    background: #dfc9a6;
    margin: 0;
  }

  .live {
    position: absolute;
    clip-path: inset(50%);
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  @keyframes blink {
    0%, 44%, 48%, 100% { opacity: 1; }
    46% { opacity: 0; }
  }

  @keyframes bounce {
    50% { transform: translateY(-9px); }
  }

  @keyframes sparkle {
    to { transform: translateY(-20px); opacity: 0; }
  }

  @keyframes leave {
    to {
      transform: translateY(-16px) scale(.7);
      opacity: 0;
    }
  }

  @media (max-width: 650px) {
    header { padding: 12px; gap: 8px; }
    h2 { font-size: 16px; }
    header small { font-size: 9px; }
    .wallet { font-size: 12px; padding: 6px; }

    .room {
      grid-template-columns: 1fr;
      padding: 14px;
      gap: 18px;
    }

    .keeper-side {
      display: grid;
      grid-template-columns: 76px 1fr;
      align-items: center;
      gap: 10px;
    }

    .window, .counter { display: none; }

    .keeper {
      grid-row: 1;
      grid-column: 1;
      width: 76px;
      height: 89px;
      margin: 0;
    }

    .bubble {
      grid-column: 2;
      grid-row: 1;
      min-height: 100px;
      font-size: 12px;
    }

    .bubble::after { display: none; }
    .shelves { gap: 14px 8px; }
    .slot { height: 122px; }
    .item { height: 114px; }
    .item strong { font-size: 11px; }
    .checkout { padding: 12px; }
    .buy { padding: 10px; }
    .sign { margin-bottom: 12px; }
  }

  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; }
  }
`;

export function createCottageShop({
  gifts,
  getState,
  purchase,
  onOpen = () => {},
  onClose = () => {},
  portraits = DEFAULT_PORTRAITS,
  playTypingSound = () => {},
  stopTypingSound = () => {}
} = {}) {
  if (
    !Array.isArray(gifts) ||
    !gifts.length ||
    typeof getState !== "function" ||
    typeof purchase !== "function"
  ) {
    throw new Error(
      "Cottage shop requires gifts, getState and purchase."
    );
  }

  const uniqueIds = new Set(gifts.map(gift => gift.id));

  if (
    uniqueIds.size !== gifts.length ||
    gifts.some(gift =>
      typeof gift.id !== "string" ||
      !gift.id ||
      typeof gift.name !== "string" ||
      !Number.isFinite(gift.price) ||
      gift.price < 0
    )
  ) {
    throw new Error(
      "Each gift needs a unique string id, name and valid price."
    );
  }

  const host = document.createElement("div");
  host.id = "cottageShopHost";
  const root = host.attachShadow({ mode: "open" });

  Object.values({ ...DEFAULT_PORTRAITS, ...portraits }).forEach(path => {
    const image = new Image();
    image.src = path;
  });

  root.innerHTML = `
    <style>${SHOP_CSS}</style>

    <dialog aria-labelledby="shop-title">
      <header>
        <div>
          <h2 id="shop-title">The Little Gift Cottage</h2>
          <small>SOMETHING JUST FOR HIM</small>
        </div>

        <div class="wallet"></div>

        <button type="button" class="close" aria-label="Close shop">
          ×
        </button>
      </header>

      <section class="room">
        <aside class="keeper-side">
          <div class="window" aria-hidden="true"></div>

          <div class="bubble">
            <b class="speaker">ShopKeeper</b>
            <span class="speech"></span>
          </div>

          <div class="keeper"><img alt="ShopKeeper" /></div>
          <div class="counter">GIFTS & GOOD WISHES</div>
        </aside>

        <section class="merch" aria-label="Gifts">
          <p class="sign">PICK A LITTLE HAPPINESS</p>
          <div class="shelves"></div>
        </section>
      </section>

      <section class="checkout">
        <span class="selection">
          Select a gift to take a closer look.
        </span>
        <button type="button" class="buy" disabled>Buy gift</button>
      </section>

      <p class="hint">
        Hover or select a gift · Enter/Space to select · Esc to leave
      </p>

      <div class="live" role="status" aria-live="polite"></div>
    </dialog>
  `;

  document.body.append(host);

  const find = selector => root.querySelector(selector);
  const dialog = find("dialog");
  const cards = new Map();
  const timers = new Map();

  let selectedId = null;
  let busy = false;
  let destroyed = false;
  let opened = false;
  let typingTimer = null;
  let protectedUntil = 0;
  let lastRemarkId = null;
  let previousFocus = null;
  let session = 0;
  let dialogueBusy = false;
  let idleTimer = null;
  let idleShown = false;
  let lastActivityAt = 0;
  const activityListeners = [];

  function schedule(callback, milliseconds) {
    const timer = setTimeout(() => {
      timers.delete(timer);
      callback();
    }, milliseconds);

    timers.set(timer, null);
    return timer;
  }

  function wait(milliseconds) {
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        resolve();
      }, milliseconds);

      timers.set(timer, resolve);
    });
  }

  function clearTimers() {
    clearInterval(typingTimer);
    typingTimer = null;
    stopTypingSound();

    for (const [timer, resolve] of timers) {
      clearTimeout(timer);
      if (resolve) resolve();
    }

    timers.clear();
  }

  function clearIdleTimer() {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  }

  function showIdle() {
    if (!opened || destroyed || busy || dialogueBusy || Date.now() < protectedUntil) return;
    const speech = find(".speech");
    setPortrait("happy");
    if (speech) speech.textContent = "......";
    find(".live").textContent = "......";
    idleShown = true;
  }

  function scheduleIdleCheck() {
    clearIdleTimer();
    if (!opened || destroyed || idleShown) return;
    const idleAt = lastActivityAt + 7000;
    const waitMilliseconds = Math.max(50, idleAt - Date.now());
    idleTimer = setTimeout(() => {
      idleTimer = null;
      if (Date.now() < idleAt || busy || dialogueBusy || Date.now() < protectedUntil) {
        scheduleIdleCheck();
        return;
      }
      showIdle();
    }, waitMilliseconds);
  }

  function giftForTarget(target) {
    if (!target?.closest) return null;
    const item = target.closest(".item");
    if (!item) return null;
    for (const [id, card] of cards) {
      if (card.button === item) return gifts.find(gift => gift.id === id) || null;
    }
    return null;
  }

  function recordActivity(event) {
    if (!opened) return;
    lastActivityAt = Date.now();
    const gift = giftForTarget(event.target);
    if (gift && !busy && !dialogueBusy && Date.now() >= protectedUntil) {
      showRemark(gift);
    }
    scheduleIdleCheck();
  }

  function bindActivityListeners() {
    const events = ["pointermove", "pointerdown", "click", "wheel", "keydown", "keyup"];
    events.forEach(type => {
      dialog.addEventListener(type, recordActivity, { passive: type !== "wheel" });
      activityListeners.push(type);
    });
  }

  function unbindActivityListeners() {
    activityListeners.splice(0).forEach(type => {
      dialog.removeEventListener(type, recordActivity);
    });
    clearIdleTimer();
  }

  function readState() {
    const state = getState();

    if (
      !state ||
      !Number.isFinite(state.coins) ||
      !Array.isArray(state.purchasedIds)
    ) {
      throw new Error(
        "getState must return { coins, purchasedIds: [...] }."
      );
    }

    return {
      coins: state.coins,
      owned: new Set(state.purchasedIds)
    };
  }

  function allPurchased() {
    const state = readState();
    return gifts.every(gift => state.owned.has(gift.id));
  }

  function speak(text, force = false) {
    if (!opened || destroyed) return;

    if (!force && Date.now() < protectedUntil) return;

    clearInterval(typingTimer);

    find(".live").textContent = text;
    find(".speech").textContent = "";

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      find(".speech").textContent = text;
      return;
    }

    let position = 0;

    typingTimer = setInterval(() => {
      position += 1;
      find(".speech").textContent = text.slice(0, position);
      if (text[position - 1] !== " ") playTypingSound();

      if (position >= text.length) {
        clearInterval(typingTimer);
        typingTimer = null;
      }
    }, 22);
  }

  function setPortrait(kind) {
    const image = find(".keeper img");
    if (image) {
      image.src = portraits[kind] || DEFAULT_PORTRAITS[kind] || portraits.happy || DEFAULT_PORTRAITS.happy;
    }
  }

  async function speakAndHold(text, holdMilliseconds, activeSession, force = true) {
    if (!opened || destroyed || activeSession !== session) return false;
    speak(text, force);
    await wait(text.length * 22 + holdMilliseconds);
    return opened && !destroyed && activeSession === session;
  }

  async function showGreeting(activeSession) {
    dialogueBusy = true;
    updateCheckout();
    setPortrait("happy");
    protectedUntil = Date.now() + 1200;
    const finished = await speakAndHold("Hello, welcome to my shop!", 650, activeSession);
    if (!finished) return;
    dialogueBusy = false;
    protectedUntil = 0;
    if (allPurchased()) {
      speak("You’ve bought everything! That’s one very lucky boyfriend.", true);
      protectedUntil = Date.now() + 3000;
    }
    updateCheckout();
    scheduleIdleCheck();
  }

  function showRemark(gift) {
    if (
      busy ||
      Date.now() < protectedUntil
    ) {
      return;
    }

    if (lastRemarkId === gift.id && !idleShown) return;

    lastRemarkId = gift.id;
    idleShown = false;
    setPortrait(TALKING_HOVER_ART.has(gift.art) ? "talking" : "happy");

    speak(
      gift.hoverRemark ||
      SHOP_REMARKS[gift.art]?.hover ||
      "A lovely little birthday surprise!"
    );
  }

  function updateCheckout() {
    const state = readState();
    const gift = gifts.find(item => item.id === selectedId);

    find(".wallet").textContent = `Coins: ${state.coins}`;

    find(".selection").textContent = gift
      ? `${gift.name} · ${gift.price} coins`
      : "Select a gift to take a closer look.";

    find(".buy").disabled =
      busy || dialogueBusy || !gift || state.owned.has(gift.id);

    find(".buy").textContent = busy
      ? "Wrapping…"
      : gift
        ? `Buy · ${gift.price}`
        : "Buy gift";

    find(".close").disabled = busy;
  }

  function renderShelves() {
    const state = readState();

    find(".shelves").replaceChildren();
    cards.clear();

    for (const gift of gifts) {
      const slot = document.createElement("div");
      slot.className = "slot";

      if (state.owned.has(gift.id)) {
        const sold = document.createElement("div");
        sold.className = "sold";
        sold.textContent = "SOLD";
        slot.append(sold);
      } else {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "item";

        button.classList.toggle(
          "selected",
          selectedId === gift.id
        );

        button.setAttribute(
          "aria-label",
          `${gift.name}, ${gift.price} coins`
        );

        const fallbackArt = `
          <path fill="#dc98ab" d="M12 23h40v32H12z"/>
          <path fill="#fff0ca"
            d="M28 15h8v40H28zM8 19h48v9H8z"/>
        `;

        button.innerHTML = makeShopSVG(
          SHOP_ART[gift.art] || fallbackArt
        );

        const name = document.createElement("strong");
        name.textContent = gift.name;

        const price = document.createElement("span");
        price.className = "price";
        price.textContent = `${gift.price} coins`;

        button.append(name, price);

        button.addEventListener("pointerenter", () => {
          showRemark(gift);
        });

        button.addEventListener("focus", () => {
          recordActivity({ target: button });
          showRemark(gift);
        });

        button.addEventListener("click", () => {
          if (busy) return;

          selectedId = gift.id;

          for (const [id, card] of cards) {
            card.button.classList.toggle(
              "selected",
              id === selectedId
            );
          }

          updateCheckout();
          showRemark(gift);
        });

        cards.set(gift.id, { button, slot });
        slot.append(button);
      }

      find(".shelves").append(slot);
    }

    updateCheckout();
  }

  async function buySelectedGift() {
    if (busy || !selectedId || !opened) return;

    const gift = gifts.find(item => item.id === selectedId);
    if (!gift) return;

    const state = readState();

    if (state.owned.has(gift.id)) {
      renderShelves();
      return;
    }

    if (state.coins < gift.price) {
      speak(
        "Your taste is excellent. Your wallet needs a little adventure first!",
        true
      );

      protectedUntil = Date.now() + 3000;
      return;
    }

    busy = true;
    updateCheckout();

    const activeSession = session;

    try {
      const result = await purchase(gift.id);

      if (destroyed || activeSession !== session) return;

      if (!result?.ok) {
        speak(
          result?.message ||
          (
            result?.reason === "insufficient"
              ? "Your wallet needs a little adventure first!"
              : "That purchase did not go through. Please try again."
          ),
          true
        );

        protectedUntil = Date.now() + 3000;
        return;
      }

      if (!readState().owned.has(gift.id)) {
        throw new Error(
          "Purchase returned success before shared ownership was updated."
        );
      }

      busy = false;
      dialogueBusy = true;
      updateCheckout();
      const purchaseSession = activeSession;

      const keeper = find(".keeper");

      keeper.classList.remove("happy");
      void keeper.offsetWidth;
      keeper.classList.add("happy");

      const card = cards.get(gift.id);

      card?.button.classList.add("leaving");
      card?.slot.classList.add("spark");

      find(".wallet").textContent =
        `Coins: ${readState().coins}`;

      await wait(400);

      if (destroyed || activeSession !== session) return;

      if (gift.price > 180) {
        setPortrait("surprised");
        if (!await speakAndHold("Woah… I wasn’t expecting u to actually buy that!", 2000, purchaseSession)) return;
      }
      setPortrait("thankYou");
      const boughtRemark =
        gift.purchaseRemark ||
        SHOP_REMARKS[gift.art]?.bought ||
        "Excellent choice!";
      if (!await speakAndHold(boughtRemark, 2000, purchaseSession)) return;
      if (!await speakAndHold("Thank you and come again!", 2000, purchaseSession)) return;
      setPortrait("happy");
      dialogueBusy = false;
      protectedUntil = 0;
      scheduleIdleCheck();

      selectedId = null;
      lastRemarkId = null;

      renderShelves();

      if (allPurchased()) {
        speak("You’ve bought everything! That’s one very lucky boyfriend.", true);
        protectedUntil = Date.now() + 3000;
      }
    } catch (error) {
      console.error("[Cottage shop]", error);

      if (!destroyed && activeSession === session) {
        speak(
          "Something went wrong. Please check the purchase connection.",
          true
        );
      }
    } finally {
      busy = false;
      dialogueBusy = false;

      if (!destroyed && opened) {
        updateCheckout();
        find(".close").focus();
      }
    }
  }

  function finishClosing() {
    if (!opened) return;

    opened = false;
    session += 1;

    clearTimers();
    unbindActivityListeners();
    dialogueBusy = false;

    protectedUntil = 0;
    lastRemarkId = null;

    find(".keeper").classList.remove("happy");

    try {
      onClose();
    } finally {
      if (previousFocus?.isConnected) {
        previousFocus.focus();
      }
    }
  }

  function close() {
    if (!opened || busy) return false;

    dialog.close();
    host.classList.remove("is-open");
    finishClosing();

    return true;
  }

  function open() {
    if (destroyed) {
      throw new Error("This cottage shop was destroyed.");
    }

    if (opened || busy) return;

    session += 1;

    previousFocus = document.activeElement;
    selectedId = null;
    protectedUntil = 0;
    lastRemarkId = null;
    idleShown = false;
    lastActivityAt = Date.now();
    setPortrait("happy");

    renderShelves();

    opened = true;
    setPortrait("happy");

    try {
      onOpen();
      host.classList.add("is-open");
      dialog.showModal();
      bindActivityListeners();
    } catch (error) {
      finishClosing();
      throw error;
    }

    find(".close").focus();

    void showGreeting(session);
  }

  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    close();
  });

  dialog.addEventListener("close", () => {
    // Ignore an old queued close event if the shop reopened meanwhile.
    if (!dialog.open) finishClosing();
  });

  // Global capture-phase input handlers must also respect onOpen's lock.
  dialog.addEventListener("keydown", event => {
    event.stopPropagation();

    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  });

  dialog.addEventListener("keyup", event => {
    event.stopPropagation();
  });

  find(".close").addEventListener("click", close);
  find(".buy").addEventListener("click", buySelectedGift);

  const shop = {
    open,
    close,

    refresh() {
      if (opened && !busy && !destroyed) {
        renderShelves();
      }
    },

    destroy() {
      if (busy) {
        throw new Error(
          "Wait for the current purchase before destroying the shop."
        );
      }

      close();
      clearTimers();

      destroyed = true;
      session += 1;

      host.remove();
      if (activeShop === shop) activeShop = null;
    }
  };

  activeShop = shop;
  return shop;
}

export function openCottageShop() {
  activeShop?.open();
}