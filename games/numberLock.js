import { $$, onTouchTap, rand } from './utils.js';

const digitSum = (numbers) => numbers.reduce((sum, n) => sum + n, 0);

const toDigits = (input) => [...input].map(Number);

const pickExcludedDigit = (code) => {
  const candidates = Array.from({ length: 10 }, (_, digit) => digit).filter((digit) => !code.includes(digit));
  return candidates[rand(0, candidates.length - 1)];
};

const createPuzzle = (digits) => {
  const code = Array.from({ length: digits }, () => rand(0, 9));
  const sum = digitSum(code);
  const firstParity = code[0] % 2;
  const last = code.at(-1);
  const lastComparison = last > 4 ? 'max' : 'min';
  const excludedDigit = pickExcludedDigit(code);

  return {
    digits,
    code,
    constraints: {
      sum,
      firstParity,
      last,
      lastComparison,
      excludedDigit,
    },
    hints: [
      `모든 숫자의 합은 ${sum}입니다.`,
      `첫 번째 숫자는 ${firstParity ? '홀수' : '짝수'}입니다.`,
      `마지막 숫자는 ${last}보다 ${lastComparison === 'max' ? '작거나 같습니다' : '크거나 같습니다'}.`,
      `${excludedDigit}은 포함되지 않습니다.`,
    ],
  };
};

const matchesHints = (input, { digits, constraints }) => {
  if (input.length !== digits || !/^\d+$/.test(input)) return false;

  const numbers = toDigits(input);
  const lastNumber = numbers.at(-1);

  return (
    digitSum(numbers) === constraints.sum &&
    numbers[0] % 2 === constraints.firstParity &&
    (constraints.lastComparison === 'max' ? lastNumber <= constraints.last : lastNumber >= constraints.last) &&
    !numbers.includes(constraints.excludedDigit)
  );
};

export const numberLockGame = {
  id: 'number_lock',
  name: 'Number Lock Rush',
  desc: '힌트를 보고 비밀번호를 빠르게 맞히세요.',
  baseTime: 45,
  generate(level) {
    const digits = level > 7 ? 4 : 3;
    return createPuzzle(digits);
  },
  render({ puzzle, gameEl, clear, wrong }) {
    let input = '';
    gameEl.innerHTML = `<div class="stack"><h2>${puzzle.digits}자리 비밀번호</h2>${puzzle.hints.map((hint) => `<div class="badge">${hint}</div>`).join('')}<div class="expr" id="lock">${'-'.repeat(puzzle.digits)}</div><div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '←', 0, 'OK'].map((key) => `<button class="key">${key}</button>`).join('')}</div></div>`;

    $$('.key', gameEl).forEach((button) => {
      onTouchTap(button, () => {
        const key = button.textContent;
        if (key === '←') input = input.slice(0, -1);
        else if (key === 'OK') matchesHints(input, puzzle) ? clear() : wrong();
        else if (input.length < puzzle.digits) input += key;
        gameEl.querySelector('#lock').textContent = input.padEnd(puzzle.digits, '-');
      });
    });
  },
};

export const numberLockInternals = {
  createPuzzle,
  matchesHints,
};
