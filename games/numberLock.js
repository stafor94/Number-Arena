import { $$, onTouchTap, rand } from './utils.js';

export const numberLockGame = {
  id: 'number_lock',
  name: 'Number Lock Rush',
  desc: '힌트를 보고 비밀번호를 빠르게 맞히세요.',
  baseTime: 45,
  generate(level) {
    const digits = level > 7 ? 4 : 3;
    const code = Array.from({ length: digits }, () => rand(0, 9));
    return {
      digits,
      code,
      hints: [
        `모든 숫자의 합은 ${code.reduce((sum, n) => sum + n, 0)}입니다.`,
        `첫 번째 숫자는 ${code[0] % 2 ? '홀수' : '짝수'}입니다.`,
        `마지막 숫자는 ${code.at(-1)}보다 ${code.at(-1) > 4 ? '작거나 같습니다' : '크거나 같습니다'}.`,
        `${(code[1] + 3) % 10}은 포함되지 않습니다.`,
      ],
    };
  },
  render({ puzzle, gameEl, clear, wrong }) {
    let input = '';
    gameEl.innerHTML = `<div class="stack"><h2>${puzzle.digits}자리 비밀번호</h2>${puzzle.hints.map((hint) => `<div class="badge">${hint}</div>`).join('')}<div class="expr" id="lock">${'-'.repeat(puzzle.digits)}</div><div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '←', 0, 'OK'].map((key) => `<button class="key">${key}</button>`).join('')}</div></div>`;

    $$('.key', gameEl).forEach((button) => {
      onTouchTap(button, () => {
        const key = button.textContent;
        if (key === '←') input = input.slice(0, -1);
        else if (key === 'OK') input === puzzle.code.join('') ? clear() : wrong();
        else if (input.length < puzzle.digits) input += key;
        gameEl.querySelector('#lock').textContent = input.padEnd(puzzle.digits, '-');
      });
    });
  },
};
