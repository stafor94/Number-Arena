import { $$, onTouchTap, rand } from './utils.js';

const shuffle = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = rand(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const calculateExpression = (expression) => {
  let value = Number(expression[0].value);
  for (let i = 1; i < expression.length; i += 2) {
    const op = expression[i].value;
    const next = Number(expression[i + 1].value);
    if (op === '+') value += next;
    if (op === '-') value -= next;
    if (op === '×') value *= next;
    if (op === '÷') value /= next;
  }
  return value;
};

export const makeTargetGame = {
  id: 'make_target',
  name: 'Make Target',
  desc: '숫자와 연산자로 목표값을 만드세요.',
  baseTime: 35,
  generate(level) {
    const numbers = [rand(1, 9), rand(1, 9), rand(1, 9), rand(1, 9)];
    const operators = level > 8 ? ['+', '-', '×', '÷'] : ['+', '-'];
    const solutionNumbers = shuffle(numbers).slice(0, Math.min(numbers.length, operators.length + 1));
    const solutionOperators = shuffle(level > 8 ? ['+', '-', '×'] : operators).slice(0, solutionNumbers.length - 1);
    const solution = solutionNumbers.flatMap((number, index) => (
      index < solutionOperators.length
        ? [{ type: 'number', value: number }, { type: 'operator', value: solutionOperators[index] }]
        : [{ type: 'number', value: number }]
    ));
    const target = calculateExpression(solution);
    return { numbers, operators, target };
  },
  render({ puzzle, gameEl, clear, wrong }) {
    let expression = [];
    const isNumberTurn = () => expression.length % 2 === 0;
    const usedNumbers = () => new Set(expression.filter((token) => token.type === 'number').map((token) => token.index));
    const usedOperators = () => new Set(expression.filter((token) => token.type === 'operator').map((token) => token.index));
    const calculate = () => {
      return calculateExpression(expression);
    };
    const draw = () => {
      const selectedNumbers = usedNumbers();
      const selectedOperators = usedOperators();
      gameEl.innerHTML = `<div class="stack"><h2>목표: ${puzzle.target}</h2><div class="expr">${expression.map((token) => token.value).join(' ') || '식을 입력하세요'}</div><div class="tokens">${puzzle.numbers.map((n, i) => `<button class="token" data-n="${i}" ${selectedNumbers.has(i) ? 'disabled' : ''}>${n}</button>`).join('')}${puzzle.operators.map((op, i) => `<button class="token" data-o="${i}" ${selectedOperators.has(i) ? 'disabled' : ''}>${op}</button>`).join('')}</div><p class="small">각 숫자와 연산자는 한 번씩만 사용할 수 있습니다.</p><div class="row"><button class="btn secondary" id="del">지우기</button><button class="btn" id="ok">제출</button></div></div>`;
      $$('[data-n]', gameEl).forEach((button) => {
        onTouchTap(button, () => {
          const index = Number(button.dataset.n);
          if (!isNumberTurn() || usedNumbers().has(index)) return;
          expression.push({ type: 'number', index, value: puzzle.numbers[index] });
          draw();
        });
      });
      $$('[data-o]', gameEl).forEach((button) => {
        onTouchTap(button, () => {
          const index = Number(button.dataset.o);
          if (isNumberTurn() || usedOperators().has(index)) return;
          expression.push({ type: 'operator', index, value: puzzle.operators[index] });
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
