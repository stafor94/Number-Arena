import { $$, rand } from './utils.js';

export const sumTowerGame = {
  id: 'sum_tower',
  name: 'Sum Tower',
  desc: '위 칸은 아래 두 칸의 합입니다.',
  baseTime: 40,
  generate(level) {
    const base = Array.from({ length: level > 8 ? 4 : 3 }, () => rand(1, 9));
    const rows = [base];
    while (rows[0].length > 1) rows.unshift(rows[0].slice(0, -1).map((value, index) => value + rows[0][index + 1]));
    const hidden = new Set([`${rows.length - 1},1`, `${rows.length - 2},0`, `${rows.length - 1},0`]);
    return { rows, hidden };
  },
  render({ puzzle, gameEl, clear, wrong }) {
    gameEl.innerHTML = `<div class="stack"><p class="small">위 칸 = 아래 두 칸의 합</p><div class="tower">${puzzle.rows.map((row, r) => `<div class="tower-row">${row.map((value, c) => puzzle.hidden.has(`${r},${c}`) ? `<input inputmode="numeric" data-k="${r},${c}">` : `<div class="tower-box">${value}</div>`).join('')}</div>`).join('')}</div><button class="btn" id="ok">제출</button></div>`;
    gameEl.querySelector('#ok').onclick = () => {
      let ok = true;
      $$('input', gameEl).forEach((input) => {
        const [row, col] = input.dataset.k.split(',').map(Number);
        if (Number(input.value) !== puzzle.rows[row][col]) ok = false;
      });
      ok ? clear() : wrong();
    };
  },
};
