import { $, $$, clamp } from './games/utils.js';
import { storage } from './games/storage.js';
import { numberPathGame } from './games/numberPath.js';
import { numberLockGame } from './games/numberLock.js';
import { numberMazeGame } from './games/numberMaze.js';
import { makeTargetGame } from './games/makeTarget.js';
import { sumTowerGame } from './games/sumTower.js';

const app = $('#app');
const toastEl = $('#toast');
const games = [numberPathGame, numberLockGame, numberMazeGame, makeTargetGame, sumTowerGame];
const gameMap = Object.fromEntries(games.map((game) => [game.id, game]));

let state;
let timer;
let currentPuzzle;

const timeFor = (gameId, level) => clamp(gameMap[gameId].baseTime - Math.floor((level - 1) / 3) * 2, 15);
const showToast = (message) => {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 1400);
};
const topBar = (title = 'Number Arena') => `<div class="topbar"><div class="row between"><div><div class="title">${title}</div><div class="small">닉네임: ${storage.nickname || '미설정'}</div></div><button class="btn ghost" data-go="home">홈</button></div></div>`;

function boot() {
  storage.nickname ? renderHome() : renderStart();
}

function renderStart() {
  app.innerHTML = `<main class="screen hero"><div class="logo">Number<br>Arena</div><p class="subtitle">모바일 숫자 퍼즐 아케이드</p><section class="panel stack"><label class="small">플레이어 닉네임</label><input id="nick" class="input" maxlength="16" placeholder="Player" value="${storage.nickname}"><button id="start" class="btn">입장하기</button></section></main>`;
  $('#start').onclick = () => {
    storage.nickname = $('#nick').value;
    renderHome();
  };
}

function renderHome() {
  app.innerHTML = `${topBar()}<main class="screen stack"><section class="panel row between"><div><b>오늘의 아레나</b><div class="small">통합 최고 점수 ${storage.total(games.map((game) => game.id)).toLocaleString()}</div></div><button class="btn secondary" data-go="ranking">랭킹</button></section><section class="game-grid">${games.map((game) => `<button class="card" data-play="${game.id}"><h3>${game.name}</h3><p>${game.desc}</p><span class="badge">🏆 최고 ${storage.best(game.id).toLocaleString()}</span></button>`).join('')}</section></main>`;
  bindNavigation();
}

function startGame(gameId) {
  clearInterval(timer);
  state = { currentGame: gameId, level: 1, score: 0, combo: 0, timeLeft: timeFor(gameId, 1), isPlaying: true, isGameOver: false, maxCombo: 0 };
  nextLevel(false);
}

function nextLevel(scored = true) {
  if (scored) {
    state.combo += 1;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    state.score += state.level * 1000 + state.timeLeft * 50 + state.combo * 300;
    state.level += 1;
    showToast('CLEAR!');
  }
  state.timeLeft = timeFor(state.currentGame, state.level);
  currentPuzzle = gameMap[state.currentGame].generate(state.level);
  renderGame();
  startTimer();
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (!state?.isPlaying) return;
    state.timeLeft -= 1;
    updateHud();
    if (state.timeLeft <= 0) gameOver();
  }, 1000);
}

function updateHud() {
  ['level', 'score', 'combo', 'timeLeft'].forEach((key) => {
    const element = $(`#hud-${key}`);
    if (element) element.textContent = key === 'score' ? state[key].toLocaleString() : state[key];
  });
}

function renderGame() {
  const game = gameMap[state.currentGame];
  app.innerHTML = `${topBar(game.name)}<main class="screen"><div class="hud"><div>레벨<b id="hud-level">${state.level}</b></div><div>점수<b id="hud-score">${state.score.toLocaleString()}</b></div><div>콤보<b id="hud-combo">${state.combo}</b></div><div>시간<b id="hud-timeLeft">${state.timeLeft}</b></div></div><section id="game" class="panel game-area"></section></main>`;
  bindNavigation();
  game.render({ puzzle: currentPuzzle, gameEl: $('#game'), clear: clearStage, wrong });
}

function clearStage() {
  $('#game')?.classList.add('flash');
  setTimeout(() => nextLevel(), 450);
}

function wrong(message = '오답!') {
  state.combo = 0;
  state.score = clamp(state.score - 500, 0);
  updateHud();
  $('#game')?.classList.add('shake');
  setTimeout(() => $('#game')?.classList.remove('shake'), 360);
  showToast(message);
}

function gameOver() {
  clearInterval(timer);
  state.isPlaying = false;
  state.isGameOver = true;
  const game = gameMap[state.currentGame];
  const isBest = storage.record(state.currentGame, state.score, state.level, state.maxCombo);
  app.innerHTML = `${topBar('Game Over')}<main class="screen panel stack"><h2>${game.name}</h2><div class="badge">최종 점수 ${state.score.toLocaleString()}</div><div class="badge">도달 레벨 ${state.level}</div><div class="badge">${isBest ? '🎉 최고 점수 갱신' : `최고 ${storage.best(state.currentGame).toLocaleString()}`}</div><button class="btn" data-play="${state.currentGame}">다시하기</button><button class="btn secondary" data-go="ranking">랭킹 보기</button><button class="btn ghost" data-go="home">메인으로</button></main>`;
  bindNavigation();
}

function renderRanking(active = 'total') {
  const tabs = ['total', ...games.map((game) => game.id)];
  app.innerHTML = `${topBar('Ranking')}<main class="screen stack"><div class="tabs">${tabs.map((tab) => `<button class="tab ${tab === active ? 'active' : ''}" data-tab="${tab}">${tab === 'total' ? '통합' : gameMap[tab].name}</button>`).join('')}</div><section class="panel rank" id="rank"></section></main>`;
  const rank = $('#rank');
  if (active === 'total') {
    rank.innerHTML = `<div class="rank-item"><b>1</b><span>${storage.nickname || 'Player'}</span><b>${storage.total(games.map((game) => game.id)).toLocaleString()}</b></div>`;
  } else {
    const rows = storage.list(active);
    rank.innerHTML = rows.length
      ? rows.map((row, index) => `<div class="rank-item"><b>${index + 1}</b><span>${row.nickname}<br><small class="small">Lv.${row.maxLevel} Combo ${row.combo}</small></span><b>${row.score.toLocaleString()}</b></div>`).join('')
      : '<p class="small">아직 기록이 없습니다.</p>';
  }
  $$('.tab').forEach((button) => { button.onclick = () => renderRanking(button.dataset.tab); });
  bindNavigation();
}

function bindNavigation() {
  $$('[data-go="home"]').forEach((button) => { button.onclick = renderHome; });
  $$('[data-go="ranking"]').forEach((button) => { button.onclick = () => renderRanking(); });
  $$('[data-play]').forEach((button) => { button.onclick = () => startGame(button.dataset.play); });
}

boot();
