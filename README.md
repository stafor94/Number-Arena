# Number Arena

모바일 웹 브라우저에서 바로 실행 가능한 숫자 퍼즐 아케이드 MVP입니다. HTML, CSS, JavaScript ES Module만 사용하므로 별도 빌드 없이 GitHub Pages에 그대로 배포할 수 있습니다.

## 실행 방법

1. 저장소를 내려받습니다.
2. ES Module 경로 로딩을 위해 로컬 서버를 실행합니다.
   ```bash
   python3 -m http.server 8000
   ```
3. 브라우저에서 `http://localhost:8000`에 접속합니다.

## 포함 게임

- **Number Path Blitz**: 숫자판에서 칸을 연결해 목표 합계를 만듭니다.
- **Number Lock Rush**: 힌트를 보고 3~4자리 비밀번호를 맞힙니다.
- **Step Number Maze**: 현재 칸 숫자만큼 이동해 출구에 도착합니다.
- **Make Target**: 숫자와 연산자를 눌러 목표값을 만듭니다.
- **Sum Tower**: 위 칸이 아래 두 칸의 합이 되도록 피라미드를 채웁니다.

## 주요 기능

- 닉네임 저장
- 게임별 제한 시간, 점수, 레벨, 콤보, 게임오버
- 레벨 클리어 시 자동 다음 레벨 진행
- localStorage 기반 게임별 최고 점수 저장
- 게임별 랭킹 및 통합 랭킹 화면
- 모바일 세로 화면에 최적화된 네온 아케이드 UI
- 터치와 마우스 입력 지원

## 파일 구조

```text
index.html
styles.css
app.js
games/
  utils.js
  storage.js
  numberPath.js
  numberLock.js
  numberMaze.js
  makeTarget.js
  sumTower.js
```

## 파일 설명

- `index.html`: 앱 진입점과 ES Module 스크립트 로딩
- `styles.css`: 모바일 아케이드 스타일, 카드, HUD, 퍼즐 UI, 애니메이션
- `app.js`: 메인 컨트롤러. 화면 전환, 공통 게임 상태, 점수/타이머, 게임오버, 랭킹 화면을 종합 관리
- `games/storage.js`: 브라우저 localStorage 기반 닉네임, 게임별 랭킹, 통합 점수 저장소
- `games/utils.js`: DOM 헬퍼, 난수, 값 보정 같은 공통 유틸리티
- `games/numberPath.js`: Number Path Blitz 퍼즐 생성 및 렌더링
- `games/numberLock.js`: Number Lock Rush 퍼즐 생성 및 렌더링
- `games/numberMaze.js`: Step Number Maze 퍼즐 생성 및 렌더링
- `games/makeTarget.js`: Make Target 퍼즐 생성 및 렌더링
- `games/sumTower.js`: Sum Tower 퍼즐 생성 및 렌더링

## 게임 모듈 확장 방식

각 게임 파일은 다음 형태의 객체를 export합니다.

```js
export const myGame = {
  id: 'game_id',
  name: 'Game Name',
  desc: '게임 설명',
  baseTime: 30,
  generate(level) {
    return puzzle;
  },
  render({ puzzle, gameEl, clear, wrong }) {
    // puzzle UI 렌더링 및 입력 처리
  },
};
```

새 게임을 추가할 때는 `games/새게임.js`를 만들고 `app.js`에서 import 후 `games` 배열에 추가하면 됩니다.

## 랭킹 저장 구조

랭킹은 `localStorage`의 `na.rankings` 키에 저장됩니다. 게임별로 최대 20개의 기록 배열을 유지합니다.

```json
{
  "number_path": [
    {
      "nickname": "Player",
      "gameId": "number_path",
      "score": 48200,
      "maxLevel": 18,
      "combo": 9,
      "playedAt": "ISO_DATE_STRING"
    }
  ]
}
```

같은 닉네임이 같은 게임에서 더 높은 점수를 기록하면 해당 게임 기록만 갱신됩니다. 추후 Firebase 또는 Supabase로 확장할 때는 `games/storage.js`를 온라인 저장소 어댑터로 교체하면 됩니다.
