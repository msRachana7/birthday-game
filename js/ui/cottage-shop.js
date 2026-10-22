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
    hover: "For the friend who runs on fizz.",
    bought: "One fizzy little present, coming right up!"
  },
  gum: {
    hover: "A tiny gift. A fresh start.",
    bought: "Fresh choice! She's going to love it."
  },
  book: {
    hover: "A little escape between two covers.",
    bought: "A whole new world, just for her!"
  },
  jewellery: {
    hover: "A little sparkle for your favourite person.",
    bought: "Shiny things for someone who shines brighter!"
  },
  chips: {
    hover: "Sharing your chips? Now that's commitment.",
    bought: "Crunchy, orange, perfect. Congratulations!"
  },
  top: {
    hover: "A cute little outfit for a cute little human.",
    bought: "She's about to enter her fashion icon era!"
  },
  tent: {
    hover: "A portable house. Very serious friend behaviour.",
    bought: "Happy camping! You've gifted her an adventure."
  },
  licence: {
    hover: "This friendship is taking flight.",
    bought: "Purchase cleared for takeoff!"
  },
  scooter: {
    hover: "Two wheels, endless adventures.",
    bought: "VROOM VROOM! Best birthday ride ever!"
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

  book: `
    <path fill="#765b50" d="M5 15h25v39H5zM34 15h25v39H34z"/>
    <path fill="#b9788f" d="M7 10h23v39H7z"/>
    <path fill="#82a69b" d="M34 10h23v39H34z"/>
    <path fill="#fff0d2" d="M11 14h19v36H11zM34 14h19v36H34z"/>
    <path fill="#d5ba96" d="M30 14h4v38h-4z"/>
    <path stroke="#bb9b8c" stroke-width="2"
      d="M15 23h11M15 29h11M15 35h11M38 23h11M38 29h11M38 35h11"/>
    <path fill="#d99bab" d="M43 10h5v13l-2-3-3 3z"/>
  `,

  jewellery: `
    <path fill="none" stroke="#d7a84e" stroke-width="3"
      d="M16 12c1 16 8 27 16 30 8-3 15-14 16-30"/>
    <path fill="none" stroke="#f4d681" stroke-width="2"
      d="M20 15c2 12 6 19 12 22 6-3 10-10 12-22"/>
    <circle cx="16" cy="12" r="5" fill="#efc76a" stroke="#8e6336" stroke-width="2"/>
    <circle cx="48" cy="12" r="5" fill="#efc76a" stroke="#8e6336" stroke-width="2"/>
    <path fill="#d76c88" stroke="#8e4d63" stroke-width="2"
      d="m32 37 8 8-8 11-8-11z"/>
    <path fill="#f7d98a" d="m32 41 3 4-3 4-3-4z"/>
    <path fill="#b7d8d1" stroke="#527c79" stroke-width="2"
      d="m12 25 5-5 5 5-5 5z"/>
    <path fill="#b7d8d1" stroke="#527c79" stroke-width="2"
      d="m42 25 5-5 5 5-5 5z"/>
  `,

  chips: `
    <path fill="#e5994e" d="m18 10 29 2-3 42H20z"/>
    <path fill="#fff1c5" d="M24 25h17v17H24z"/>
    <path stroke="#c36d3f" stroke-width="3"
      d="M22 15h20M24 48h15"/>
  `,

  top:`
  <!-- Shirt outline and short sleeves -->
  <path fill="#75445e"
    d="M22 12H28L32 15L36 12H42L53 19L59 28L49 35L44 31V54H20V31L15 35L5 28L11 19Z"/>

  <!-- Main pink shirt -->
  <path fill="#e7a0b8"
    d="M22 15H28L32 20L36 15H42L51 21L55 28L49 32L42 27V51H22V27L15 32L9 28L13 21Z"/>

  <!-- Short sleeve details -->
  <path fill="#f5bfd0"
    d="M13 22L21 18L23 25L16 31L10 27Z
       M43 25L45 18L51 22L55 27L48 31Z"/>

  <!-- Sleeve hems -->
  <path fill="#fff0dd"
    d="M10 27L16 31L19 29L13 24Z
       M45 29L48 31L55 27L51 24Z"/>

  <!-- Cream collar -->
  <path fill="#fff0dd"
    d="M23 13H28L32 20L36 13H41L40 20L32 27L24 20Z"/>

  <!-- Collar shadows -->
  <path fill="#a95f84"
    d="M28 13L32 20L36 13L32 24Z"/>

  <!-- Small pink bow -->
  <path fill="#b66b90"
    d="M30 25L25 22V29L30 27L32 29L34 27L39 29V22L34 25L32 24Z"/>

  <!-- Bow center -->
  <path fill="#fff0dd"
    d="M30 25H34V28H30Z"/>

  <!-- Soft fabric highlights -->
  <path fill="#f8c5d5"
    d="M24 30H27V49H24Z
       M36 30H39V49H36Z"/>

  <!-- Chest stripe -->
  <path fill="#fbd5d6"
    d="M23 32H41V35H23Z"/>

  <!-- Cream star -->
  <path fill="#fff2ce"
    stroke="#a95f84"
    stroke-width="2"
    stroke-linejoin="miter"
    d="M32 36L35 42L41 43L37 47L38 52L32 49L26 52L27 47L23 43L29 42Z"/>

  <!-- Shirt hem -->
  <path fill="#b86f92"
    d="M20 51H44V54H20Z"/>
  <path fill="#f6bbca"
    d="M23 51H41V53H23Z"/>
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

  scooter: `
     <!-- Rear wheel -->
  <circle cx="16" cy="49" r="10" fill="#343039"/>
  <circle cx="16" cy="49" r="7" fill="#636b75"/>
  <circle cx="16" cy="49" r="4" fill="#a9c5c7"/>
  <circle cx="16" cy="49" r="2" fill="#e0e8df"/>

  <!-- Front wheel -->
  <circle cx="51" cy="49" r="10" fill="#343039"/>
  <circle cx="51" cy="49" r="7" fill="#636b75"/>
  <circle cx="51" cy="49" r="4" fill="#a9c5c7"/>
  <circle cx="51" cy="49" r="2" fill="#e0e8df"/>

  <!-- Rear body silhouette -->
  <path fill="#75445e"
    d="M8 37L15 31H32L37 36V47H31V53H7V45Z"/>

  <!-- Pink rear body -->
  <path fill="#d987a2"
    d="M10 39L16 34H30L34 38V48H28V51H9V45Z"/>

  <!-- Rear body highlights -->
  <path fill="#f5b0c5"
    d="M12 39L17 35H29V39H19L14 44H10Z"/>

  <!-- Decorative vents -->
  <path fill="#a85e80"
    d="M14 43H23V45H14Z
       M13 47H23V49H13Z"/>

  <!-- Brown seat -->
  <path fill="#5a4148"
    d="M18 28H35L39 31V35H17V31Z"/>
  <path fill="#8b6165"
    d="M20 29H34L37 31H19Z"/>
  <path fill="#bd8b88"
    d="M20 32H36V34H20Z"/>

  <!-- Footboard -->
  <path fill="#75445e"
    d="M29 44H45L49 48V52H28Z"/>
  <path fill="#d987a2"
    d="M29 46H44L46 49H30Z"/>
  <path fill="#f7c4c7"
    d="M31 48H44V50H31Z"/>

  <!-- Front steering column -->
  <path fill="#75445e"
    d="M45 16H50L55 38L59 44L55 48H47L43 42Z"/>

  <!-- Curved front body -->
  <path fill="#df91ab"
    d="M46 19H49L53 38L57 44L54 46H48L45 41Z"/>

  <!-- Light pink shine -->
  <path fill="#ffd0d2"
    d="M48 22H50L52 39L55 43H52L48 39Z"/>

  <!-- Front mudguard -->
  <path fill="#b96e8e"
    d="M46 43L53 40L60 44V49H43V46Z"/>
  <path fill="#f1aec0"
    d="M48 44L54 42L58 45V47H46Z"/>

  <!-- Handlebar -->
  <path fill="#443c43"
    d="M43 13H55V16H43Z"/>
  <path fill="#443c43"
    d="M43 15H39V19H43Z"/>

  <!-- Headlight housing -->
  <path fill="#996247"
    d="M49 17H57V26H49Z"/>
  <path fill="#fff0c9"
    d="M51 18H56V25H51Z"/>
  <path fill="#ffe08e"
    d="M54 19H56V24H54Z"/>

  <!-- Rear indicator -->
  <path fill="#9e5b50"
    d="M7 37H12V43H7Z"/>
  <path fill="#ffe08e"
    d="M8 38H11V42H8Z"/>
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

const TALKING_HOVER_ART = new Set(["book", "jewellery", "top", "tent"]);

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
          <small>SOMETHING JUST FOR HER</small>
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
  let pendingPurchaseDialogues = 0;
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
    let purchaseDialogueRunning = false;

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
      const boughtRemark =
        gift.purchaseRemark ||
        SHOP_REMARKS[gift.art]?.bought ||
        "Excellent choice!";
      selectedId = null;
      lastRemarkId = null;
      renderShelves();
      protectedUntil = 0;
      scheduleIdleCheck();

      const playPurchaseDialogue = async () => {
        if (!opened || destroyed || activeSession !== session) return;
        setPortrait("thankYou");
        if (!await speakAndHold(boughtRemark, 2000, purchaseSession)) return;

        // Allow the next purchase once the bought message has finished.
        dialogueBusy = false;
        updateCheckout();

        if (!await speakAndHold("Thank you and come again!", 2000, purchaseSession)) return;
        if (opened && !destroyed && activeSession === session) {
          setPortrait("happy");
        }
      };
      purchaseDialogueRunning = true;
      pendingPurchaseDialogues += 1;
      playPurchaseDialogue().then(() => {
        if (activeSession !== session) return;
        pendingPurchaseDialogues = Math.max(0, pendingPurchaseDialogues - 1);
        if (
          pendingPurchaseDialogues === 0 &&
          allPurchased() &&
          opened &&
          !destroyed &&
          activeSession === session
        ) {
          speak("You’ve bought everything! That’s one very lucky friend.", true);
          protectedUntil = Date.now() + 3000;
        }
      });
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
      if (!purchaseDialogueRunning) dialogueBusy = false;

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
    pendingPurchaseDialogues = 0;

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