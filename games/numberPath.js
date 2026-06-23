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
    gameEl.innerHTML = `<div class="stack"><h2>목표 합계: ${puzzle.target}</h2><div id="sum" class="badge">현재 0</div><div class="grid" style="grid-template-columns:repeat(${puzzle.size},1fr)">${puzzle.cells.map((n, i) => `<button class="cell" data-i="${i}">${n}</button>`).join('')}</div><button class="btn secondary" id="reset">선택 초기화</button></div>`;
    const grid = gameEl.querySelector('.grid');

    const choose = (button) => {
      if (!button || isFinished) return;
      const index = Number(button.dataset.i);
      if (used.has(index)) return;
      used.add(index);
      button.classList.add('active');
      sum += puzzle.cells[index];
      gameEl.querySelector('#sum').textContent = `현재 ${sum}`;
      if (sum === puzzle.target) {
        isFinished = true;
        clear();
      }
      if (sum > puzzle.target) {
        isFinished = true;
        wrong('목표 초과');
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
      isDragging = true;
      activePointerId = event.pointerId;
      grid.setPointerCapture?.(event.pointerId);
      chooseAtPoint(event.clientX, event.clientY);
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
