import { onTouchTap, rand } from './utils.js';

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
    let isDragging = false;
    let activePointerId = null;
    let isFinished = false;
    const used = new Set();
    gameEl.innerHTML = `<div class="stack"><h2>목표 합계: ${puzzle.target}</h2><div id="sum" class="badge">현재 0</div><p class="small">처음 고른 숫자는 다시 탭하면 취소할 수 있어요.</p><div class="grid" style="grid-template-columns:repeat(${puzzle.size},1fr)">${puzzle.cells.map((n, i) => `<button class="cell" data-i="${i}">${n}</button>`).join('')}</div><button class="btn secondary" id="reset">선택 초기화</button></div>`;
    const grid = gameEl.querySelector('.grid');
    const sumEl = gameEl.querySelector('#sum');
    const path = [];

    const isAdjacent = (from, to) => {
      const fromRow = Math.floor(from / puzzle.size);
      const fromCol = from % puzzle.size;
      const toRow = Math.floor(to / puzzle.size);
      const toCol = to % puzzle.size;
      return Math.abs(fromRow - toRow) + Math.abs(fromCol - toCol) === 1;
    };

    const updateSum = () => {
      sumEl.textContent = `현재 ${sum}`;
    };

    const removeLast = () => {
      const index = path.pop();
      if (index === undefined) return;
      used.delete(index);
      grid.querySelector(`[data-i="${index}"]`)?.classList.remove('active');
      sum -= puzzle.cells[index];
      updateSum();
    };

    const choose = (button) => {
      if (!button || isFinished) return;
      const index = Number(button.dataset.i);
      const previousIndex = path[path.length - 1];
      const beforePreviousIndex = path[path.length - 2];

      if (index === beforePreviousIndex) {
        removeLast();
        return;
      }
      if (used.has(index)) return;
      if (previousIndex !== undefined && !isAdjacent(previousIndex, index)) {
        wrong('연속으로 붙은 블럭만 선택하세요');
        stopDrag();
        return;
      }

      used.add(index);
      path.push(index);
      button.classList.add('active');
      sum += puzzle.cells[index];
      updateSum();

      if (sum === puzzle.target) {
        isFinished = true;
        clear();
        return;
      }
      if (sum > puzzle.target) {
        removeLast();
        wrong('목표 초과: 마지막 선택을 되돌렸어요');
        stopDrag();
      }
    };

    const chooseAtPoint = (clientX, clientY) => {
      const element = document.elementFromPoint(clientX, clientY);
      choose(element?.closest('.cell'));
    };

    const stopDrag = () => {
      isDragging = false;
      activePointerId = null;
    };

    grid.onpointerdown = (event) => {
      if (event.pointerType !== 'touch') return;
      event.preventDefault();
      const button = document.elementFromPoint(event.clientX, event.clientY)?.closest('.cell');
      const index = button ? Number(button.dataset.i) : undefined;
      if (path.length === 1 && index === path[0]) {
        removeLast();
        stopDrag();
        return;
      }
      isDragging = true;
      activePointerId = event.pointerId;
      grid.setPointerCapture?.(event.pointerId);
      choose(button);
    };
    grid.onpointermove = (event) => {
      if (!isDragging || event.pointerId !== activePointerId) return;
      event.preventDefault();
      chooseAtPoint(event.clientX, event.clientY);
    };
    grid.onpointerup = stopDrag;
    grid.onpointercancel = stopDrag;
    grid.onlostpointercapture = stopDrag;
    onTouchTap(gameEl.querySelector('#reset'), () => this.render({ puzzle, gameEl, clear, wrong }));
  },
};
