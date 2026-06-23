import { $$, onTouchTap, rand } from './utils.js';

export const makeTargetGame = {
  id: 'make_target',
  name: 'Make Target',
  desc: '숫자와 연산자로 목표값을 만드세요.',
  baseTime: 35,
  generate(level) {
    const numbers = [rand(1, 9), rand(1, 9), rand(1, 9), rand(1, 9)];
    const operators = level > 8 ? ['+', '-', '×', '÷'] : ['+', '-'];
    const target = numbers[0] + numbers[1] - numbers[2] + numbers[3];
    return { numbers, operators, target };
  },
  render({ puzzle, gameEl, clear, wrong }) {
    let expression = [];
    const calculate = () => {
      let value = Number(expression[0]);
      for (let i = 1; i < expression.length; i += 2) {
        const op = expression[i];
        const next = Number(expression[i + 1]);
        if (op === '+') value += next;
        if (op === '-') value -= next;
        if (op === '×') value *= next;
        if (op === '÷') value /= next;
      }
      return value;
    };
    const draw = () => {
      gameEl.innerHTML = `<div class="stack"><h2>목표: ${puzzle.target}</h2><div class="expr">${expression.join(' ') || '식을 입력하세요'}</div><div class="tokens">${puzzle.numbers.map((n, i) => `<button class="token" data-n="${i}">${n}</button>`).join('')}${puzzle.operators.map((op) => `<button class="token" data-o="${op}">${op}</button>`).join('')}</div><div class="row"><button class="btn secondary" id="del">지우기</button><button class="btn" id="ok">제출</button></div></div>`;
      $$('[data-n]', gameEl).forEach((button) => {
        onTouchTap(button, () => {
          expression.push(button.textContent);
          draw();
        });
      });
      $$('[data-o]', gameEl).forEach((button) => {
        onTouchTap(button, () => {
          if (expression.length % 2) expression.push(button.textContent);
          draw();
        });
      });
      onTouchTap(gameEl.querySelector('#del'), () => {
        expression = [];
        draw();
      });
      onTouchTap(gameEl.querySelector('#ok'), () => {
        expression.length >= 3 && expression.length % 2 && Math.abs(calculate() - puzzle.target) < 1e-9 ? clear() : wrong();
      });
    };
    draw();
  },
};
