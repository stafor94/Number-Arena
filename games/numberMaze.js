import { $$, onTouchTap, rand } from './utils.js';

const shuffle = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = rand(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const distance = (from, to, size) => {
  const fromRow = Math.floor(from / size);
  const fromCol = from % size;
  const toRow = Math.floor(to / size);
  const toCol = to % size;
  return fromRow === toRow ? Math.abs(fromCol - toCol) : Math.abs(fromRow - toRow);
};

const findPath = (size, maxStep, minMoves) => {
  const start = 0;
  const end = size * size - 1;

  for (let attempt = 0; attempt < 300; attempt += 1) {
    const path = [start];
    const visited = new Set(path);

    while (path.length < size * size) {
      const position = path.at(-1);
      const row = Math.floor(position / size);
      const col = position % size;
      const endDistance = distance(position, end, size);

      if (path.length - 1 >= minMoves && endDistance > 0 && endDistance <= maxStep) {
        const sameLineAsEnd = row === size - 1 || col === size - 1;
        if (sameLineAsEnd) return [...path, end];
      }

      const moves = [];
      for (let step = 1; step <= maxStep; step += 1) {
        [
          [row - step, col],
          [row + step, col],
          [row, col - step],
          [row, col + step],
        ].forEach(([nextRow, nextCol]) => {
          if (nextRow < 0 || nextRow >= size || nextCol < 0 || nextCol >= size) return;
          const next = nextRow * size + nextCol;
          if (visited.has(next) || next === end) return;
          moves.push(next);
        });
      }

      if (!moves.length) break;

      const next = shuffle(moves).sort((a, b) => distance(a, end, size) - distance(b, end, size) + rand(-1, 1))[0];
      visited.add(next);
      path.push(next);
    }
  }

  return null;
};

const buildMaze = (level) => {
  const size = level > 10 ? 6 : level > 4 ? 5 : 4;
  const maxStep = Math.min(4, Math.max(2, Math.floor(level / 4) + 2));
  const minMoves = Math.min(size * 2, 5 + Math.floor(level / 2));
  const fallback = [
    ...Array.from({ length: size }, (_, col) => col),
    ...Array.from({ length: size - 1 }, (_, row) => (row + 2) * size - 1),
  ];
  const path = findPath(size, maxStep, minMoves) ?? fallback;
  const map = Array.from({ length: size * size }, () => rand(1, maxStep));

  path.slice(0, -1).forEach((position, index) => {
    map[position] = distance(position, path[index + 1], size);
  });
  map[size * size - 1] = 0;

  return {
    size,
    map,
    start: 0,
    end: size * size - 1,
  };
};

export const numberMazeGame = {
  id: 'number_maze',
  name: 'Step Number Maze',
  desc: '칸의 숫자만큼 이동해 출구에 도착하세요.',
  baseTime: 40,
  generate(level) {
    return buildMaze(level);
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
