import { games } from '../data/games.js';
import { state } from '../systems/gameState.js';
import { openModal } from '../systems/navigation.js';
import { startMemoryMatch } from '../minigames/memoryMatch.js';
import { startYouKnowTheLine } from '../minigames/youKnowTheLine.js';
import { startOurMemories } from '../minigames/ourMemories.js';

export function renderGames() {
  const grid = document.getElementById('gamesGrid');
  if (!grid) return;

  const svg = (drawing) => `
    <svg
      viewBox="0 0 100 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      shape-rendering="crispEdges"
    >
      ${drawing}
    </svg>
  `;

  const heart = `
    <path
      d="M0 4H4V0H10V4H14V0H20V4H24V12H20V16H16V20H12V24H8V20H4V16H0Z"
      fill="#bd6378"
    />
  `;

  const icons = {
    'our-memories': svg(`
      <g transform="translate(8 16) rotate(-8 20 25)">
        <path d="M0 0H40V52H0Z"
          fill="#fff1d4" stroke="#65472f" stroke-width="4"/>
        <path d="M6 7H34V40H6Z" fill="#91c4df"/>
        <path d="M6 32L16 22L24 32L29 27L34 33V40H6Z"
          fill="#789c60"/>
        <path d="M12 13H17V18H12Z" fill="#fff7df"/>
      </g>
      <g transform="translate(48 9) rotate(9 20 26)">
        <path d="M0 0H40V52H0Z"
          fill="#fff1d4" stroke="#65472f" stroke-width="4"/>
        <path d="M6 7H34V40H6Z" fill="#91c4df"/>
        <path d="M6 32L16 22L24 31L29 25L34 32V40H6Z"
          fill="#789c60"/>
        <path d="M21 12H29V20H21Z" fill="#f6d56a"/>
      </g>
    `),

    'you-know-the-line': svg(`
      <path d="M15 8H64V68H15Z"
        fill="#ffedc8" stroke="#65472f" stroke-width="4"/>
      <path d="M23 20H54M23 30H54M23 40H49"
        fill="none" stroke="#b3976e" stroke-width="4"/>
      <g transform="translate(31 49) scale(.55)">
        ${heart}
      </g>
      <g transform="translate(75 23) rotate(35)">
        <path d="M0 0H12V39H0Z"
          fill="#eaa1b3" stroke="#65472f" stroke-width="3"/>
        <path d="M0 8H12M0 31H12"
          fill="none" stroke="#a75e73" stroke-width="3"/>
        <path d="M0 39L6 51L12 39Z"
          fill="#eed09a" stroke="#65472f" stroke-width="3"/>
        <path d="M4 46L6 51L8 46Z" fill="#65472f"/>
      </g>
    `),

    'same-same': svg(`
      <g transform="translate(10 14) rotate(-10 18 27)">
        <path d="M0 0H36V53H0Z"
          fill="#f1b5c2" stroke="#65472f" stroke-width="4"/>
        <g transform="translate(9 18) scale(.75)">
          ${heart}
        </g>
      </g>
      <g transform="translate(52 14) rotate(10 18 27)">
        <path d="M0 0H36V53H0Z"
          fill="#f1b5c2" stroke="#65472f" stroke-width="4"/>
        <g transform="translate(9 18) scale(.75)">
          ${heart}
        </g>
      </g>
    `)
  };

  const presentation = {
    'our-memories': {
      title: 'Spot the Difference',
      subtitle: 'Find the changes.',
      start: startOurMemories
    },
    'you-know-the-line': {
      title: 'Finish the Line',
      subtitle: 'Complete the sentence.',
      start: startYouKnowTheLine
    },
    'same-same': {
      title: 'Perfect Pairs',
      subtitle: 'Match the cards.',
      start: startMemoryMatch
    }
  };

  const order = [
    'our-memories',
    'you-know-the-line',
    'same-same'
  ];

  const sortedGames = [...games].sort((a, b) => {
    const aIndex = order.indexOf(a.id);
    const bIndex = order.indexOf(b.id);

    return (aIndex < 0 ? 99 : aIndex)
      - (bIndex < 0 ? 99 : bIndex);
  });

  grid.replaceChildren();

  sortedGames.forEach((game) => {
    const info = presentation[game.id];
    const done = state.completed.has(game.id);

    const card = document.createElement('div');
    card.className = 'card';
    card.classList.toggle('is-complete', done);

    const icon = document.createElement('div');
    icon.className = 'emoji challenge-icon';

    if (icons[game.id]) {
      icon.innerHTML = icons[game.id];
    } else {
      icon.textContent = game.emoji || '✦';
    }

    const title = document.createElement('b');
    title.textContent = info?.title || game.title;

    const subtitle = document.createElement('p');
    subtitle.textContent = info?.subtitle || game.subtitle;

    const reward = document.createElement('p');
    reward.className = 'challenge-reward';

    if (done) {
      reward.textContent = '✓ Completed';
    } else if (info) {
      const coin = document.createElement('span');
      coin.className = 'challenge-coin';
      coin.setAttribute('aria-hidden', 'true');

      reward.append(
        coin,
        document.createTextNode(`${game.reward} coins`)
      );
    } else {
      reward.textContent = 'Coming soon';
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.disabled = done || !info;
    button.textContent = done ? 'DONE' : info ? 'PLAY' : 'COMING SOON';

    button.addEventListener('click', () => {
      if (!info || state.completed.has(game.id)) return;

      info.start();
      openModal('miniModal');
    });

    card.append(icon, title, subtitle, reward, button);
    grid.appendChild(card);
  });
}

export function openMiniGame(gameId) {
  const targetGame = games.find((game) => game.id === gameId);
  if (!targetGame) return;

  if (targetGame.id === 'same-same') {
    startMemoryMatch();
    openModal('miniModal');
    return;
  }

  if (targetGame.id === 'you-know-the-line') {
    startYouKnowTheLine();
    openModal('miniModal');
    return;
  }

  if (targetGame.id === 'our-memories') {
    startOurMemories();
    openModal('miniModal');
    return;
  }

  const miniContent = document.getElementById('miniContent');
  if (!miniContent) return;

  miniContent.innerHTML = `
    <div class="mini">
      <h2>${targetGame.emoji} ${targetGame.title}</h2>
      <p>Unfinished placeholder.</p>
      <p>This mini-game is still being built.</p>
      <button id="placeholderBackBtn">Back</button>
    </div>
  `;

  document.getElementById('placeholderBackBtn').addEventListener('click', () => {
    closePlaceholderGame();
  });

  openModal('miniModal');
}

function closePlaceholderGame() {
  const miniModal = document.getElementById('miniModal');
  if (miniModal) miniModal.style.display = 'none';
}
