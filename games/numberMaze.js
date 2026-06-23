import { $$, onTouchTap } from './utils.js';

export const numberMazeGame = {
  id: 'number_maze',
  name: 'Step Number Maze',
  desc: '칸의 숫자만큼 이동해 출구에 도착하세요.',
  baseTime: 40,
  generate(level) {
    return level % 2
      ? { size: 4, map: [1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1, 0], start: 0, end: 15 }
      : { size: 5, map: [1, 2, 1, 3, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 3, 1, 1, 1, 1, 1, 2, 1, 0], start: 0, end: 24 };
  },
  render({ puzzle, gameEl, clear, wrong }) {
    let position = puzzle.start;
    const draw = () => {
      gameEl.innerHTML = `<div class="stack"><p class="small">현재 칸의 숫자만큼 상하좌우로 정확히 이동하세요.</p><div class="grid" style="grid-template-columns:repeat(${puzzle.size},1fr)">${puzzle.map.map((n, i) => `<button class="cell ${i === position ? 'active ' : ''}${i === puzzle.start ? 'start ' : ''}${i === puzzle.end ? 'end ' : ''}" data-i="${i}">${i === puzzle.start ? 'S' : i === puzzle.end ? 'E' : n}</button>`).join('')}</div></div>`;
      $$('.cell', gameEl).forEach((button) => {
        onTouchTap(button, () => move(Number(button.dataset.i)));
      });
    };
    const move = (next) => {
      const size = puzzle.size;
      const step = puzzle.map[position];
      const row = Math.floor(position / size);
      const col = position % size;
      const nextRow = Math.floor(next / size);
      const nextCol = next % size;
      if ((row === nextRow && Math.abs(col - nextCol) === step) || (col === nextCol && Math.abs(row - nextRow) === step)) {
        position = next;
        if (position === puzzle.end) clear();
        else draw();
      } else {
        wrong('그 칸으로는 이동할 수 없어요');
      }
    };
    draw();
  },
};
