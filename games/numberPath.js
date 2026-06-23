import { $$, rand } from './utils.js';

export const numberPathGame = {
  id: 'number_path',
  name: 'Number Path Blitz',
  desc: '숫자 칸을 드래그해 목표 합계를 만드세요.',
  baseTime: 30,
  generate(level) {
    const size = level > 10 ? 5 : 4;
    const cells = Array.from({ length: size * size }, () => rand(1, 9));
    const start = rand(0, cells.length - 3);
    const length = rand(2, Math.min(4, size));
    const target = cells.slice(start, start + length).reduce((sum, n) => sum + n, 0);
    return { size, cells, target };
  },
  render({ puzzle, gameEl, clear, wrong }) {
    let sum = 0;
    const used = new Set();
    gameEl.innerHTML = `<div class="stack"><h2>목표 합계: ${puzzle.target}</h2><div id="sum" class="badge">현재 0</div><div class="grid" style="grid-template-columns:repeat(${puzzle.size},1fr)">${puzzle.cells.map((n, i) => `<button class="cell" data-i="${i}">${n}</button>`).join('')}</div><button class="btn secondary" id="reset">선택 초기화</button></div>`;

    const choose = (button) => {
      const index = Number(button.dataset.i);
      if (used.has(index)) return;
      used.add(index);
      button.classList.add('active');
      sum += puzzle.cells[index];
      gameEl.querySelector('#sum').textContent = `현재 ${sum}`;
      if (sum === puzzle.target) clear();
      if (sum > puzzle.target) wrong('목표 초과');
    };

    $$('.cell', gameEl).forEach((button) => {
      button.onpointerdown = () => choose(button);
      button.onpointerenter = (event) => { if (event.buttons) choose(button); };
    });
    gameEl.querySelector('#reset').onclick = () => this.render({ puzzle, gameEl, clear, wrong });
  },
};
