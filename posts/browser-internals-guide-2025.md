# 프론트엔드 개발자가 브라우저 내부를 알아야 하는 이유 (feat. 실전 학습 로드맵)

**"React 잘하면 되는 거 아니에요?"**

3년 차 프론트엔드 개발자 A씨의 이야기입니다.

```javascript
// A씨의 코드
function ProductList({ items }) {
  return (
    <div>
      {items.map(item => (
        <ProductCard key={item.id} data={item} />
      ))}
    </div>
  );
}
```

**문제:** 상품 1000개 렌더링 시 5초 걸림
**A씨의 해결법:** "React.memo 써봐야지", "useMemo 추가해봐야지"
**결과:** 여전히 느림

**왜?**

A씨는 React는 알았지만,
**브라우저가 어떻게 화면을 그리는지 몰랐습니다.**

반면, 같은 문제를 만난 B씨:

```javascript
// B씨의 해결법
function ProductList({ items }) {
  const observer = useRef(null);
  const [visibleItems, setVisibleItems] = useState([]);

  // Intersection Observer로 보이는 것만 렌더링
  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        // 화면에 보이는 것만 렌더링
      },
      { rootMargin: '100px' }
    );
  }, []);

  return <div>{/* 보이는 것만 렌더링 */}</div>;
}
```

**결과:** 0.3초

**차이점?**
- A씨: React만 알았음
- B씨: **브라우저의 Intersection Observer API**를 알았음

---

## 🤔 왜 2025년에 브라우저 내부가 중요한가?

### 비유: 자동차 운전자 vs 자동차 정비사

**일반 프론트엔드 개발자:**
- React = 자동차 운전
- "액셀 밟으면 가고, 브레이크 밟으면 멈춘다"

**브라우저 내부를 아는 개발자:**
- 엔진 구조를 이해
- "이 소리는 엔진 오일 부족이네"
- "연비를 높이려면 rpm을 낮춰야지"

**결과:**
- 문제 발생 시 해결 속도 10배 차이
- 성능 최적화 능력 천지차이

---

## 📊 통계로 보는 현실

### 2025년 프론트엔드 채용 공고 분석 (한국 기준)

| 회사 규모 | "브라우저 내부 이해" 우대사항 비율 |
|---------|------------------------------|
| 네이버, 카카오 등 대기업 | 78% |
| 중견 IT 기업 | 45% |
| 스타트업 | 23% |

**왜 대기업일수록 중요하게 볼까?**

→ 월간 사용자 1억명이면, 0.1초 느려지는 것 = 엄청난 이탈률
→ 브라우저 최적화가 매출과 직결

### 실제 사례: 네이버 메인 페이지

- 렌더링 시간 0.1초 개선 → 페이지뷰 1.2% 증가
- 매출 수십억 영향

**브라우저 최적화 = 돈입니다.**

---

## 🎯 이 글에서 배울 내용

### 목차

1. [브라우저가 화면을 그리는 5단계](#rendering-pipeline)
2. [이벤트 루프: 왜 setTimeout(fn, 0)이 즉시 실행 안 되나?](#event-loop)
3. [Reflow vs Repaint: 성능 살인마 잡기](#reflow-repaint)
4. [Chrome DevTools 200% 활용법](#devtools)
5. [실전 프로젝트: 느린 페이지 10배 빠르게 만들기](#project)
6. [4주 학습 로드맵](#roadmap)
7. [추가 학습 자료](#resources)

**예상 읽는 시간:** 25분
**실습 시간:** 4주 (하루 1시간)

---

<a name="rendering-pipeline"></a>
## 🎨 1. 브라우저가 화면을 그리는 5단계

### 비유: 집 짓기

웹페이지 렌더링 = 집 짓기

```
HTML     = 설계도 (DOM)
CSS      = 인테리어 계획 (CSSOM)
합치기   = 실제 도면 (Render Tree)
배치     = 가구 배치 (Layout)
그리기   = 페인트칠 (Paint)
```

### 5단계 상세 설명

#### Step 1: HTML 파싱 → DOM 생성

**HTML 파일:**
```html
<!DOCTYPE html>
<html>
  <head>
    <title>내 사이트</title>
  </head>
  <body>
    <div class="container">
      <h1>안녕하세요</h1>
      <p>환영합니다</p>
    </div>
  </body>
</html>
```

**브라우저가 만드는 DOM 트리:**
```
Document
  └─ html
      ├─ head
      │   └─ title ("내 사이트")
      └─ body
          └─ div.container
              ├─ h1 ("안녕하세요")
              └─ p ("환영합니다")
```

**중요:**
- HTML을 위에서 아래로 읽음
- `<script>` 태그 만나면 멈춤 ⚠️ (파싱 블로킹)

**실습:**

```html
<!-- 나쁜 예 -->
<head>
  <script src="huge-library.js"></script>  <!-- 여기서 멈춤! -->
</head>
<body>
  <!-- 사용자는 흰 화면만 봄 -->
</body>

<!-- 좋은 예 -->
<head>
  <script src="huge-library.js" defer></script>  <!-- 나중에 실행 -->
</head>
<body>
  <!-- 바로 렌더링 시작! -->
</body>
```

**DevTools에서 확인하기:**

1. F12 → Elements 탭
2. DOM 트리 확인
3. Console에서 실험:

```javascript
// DOM 직접 조작해보기
document.querySelector('h1').textContent = '바뀐 제목';
```

#### Step 2: CSS 파싱 → CSSOM 생성

**CSS 파일:**
```css
body { font-size: 16px; }
.container { max-width: 1200px; margin: 0 auto; }
h1 { color: blue; font-size: 2em; }
p { color: gray; }
```

**브라우저가 만드는 CSSOM:**
```
body
  └─ font-size: 16px
  └─ .container
      └─ max-width: 1200px
      └─ margin: 0 auto
      └─ h1
          └─ color: blue
          └─ font-size: 32px (2em = 2 × 16px)
```

**중요:**
- CSS는 **렌더링 블로킹 리소스** ⚠️
- CSSOM 완성될 때까지 화면 안 그림

**실습: CSS 블로킹 체험**

```html
<head>
  <!-- 3초 걸리는 CSS -->
  <link rel="stylesheet" href="https://slow-server.com/style.css">
</head>
<body>
  <h1>이 글자는 3초 후에야 보입니다</h1>
</body>
```

**해결책:**

```html
<!-- Critical CSS 인라인 -->
<head>
  <style>
    /* 첫 화면에 필요한 CSS만 */
    body { font-family: sans-serif; }
    h1 { color: black; }
  </style>

  <!-- 나머지 CSS는 나중에 -->
  <link rel="stylesheet" href="non-critical.css" media="print" onload="this.media='all'">
</head>
```

#### Step 3: DOM + CSSOM → Render Tree

**비유:** 설계도 + 인테리어 계획 = 최종 도면

**중요:**
- `display: none` 요소는 Render Tree에 없음!
- `visibility: hidden`은 있음 (공간 차지)

**실험:**

```html
<div style="display: none;">나는 렌더 트리에 없어요</div>
<div style="visibility: hidden;">나는 렌더 트리에 있어요 (투명하지만)</div>
```

**DevTools에서 확인:**

1. F12 → Performance 탭
2. 녹화 시작
3. 페이지 새로고침
4. "Parse HTML", "Parse Stylesheet" 확인

#### Step 4: Layout (Reflow)

**가장 비싼 연산!** ⚠️

브라우저가 각 요소의 정확한 위치와 크기 계산:

```
h1 요소:
- X좌표: 0px
- Y좌표: 0px
- 너비: 1200px
- 높이: 40px

p 요소:
- X좌표: 0px
- Y좌표: 40px
- 너비: 1200px
- 높이: 20px
```

**Layout을 발생시키는 속성들:**

```javascript
// 이거 건드리면 Layout 다시 계산! (느림)
element.style.width = '500px';
element.style.height = '300px';
element.style.margin = '20px';
element.style.padding = '10px';
element.style.display = 'flex';

// Layout 발생시키는 읽기도 있음!
const height = element.offsetHeight;  // Layout 강제 발생!
const width = element.clientWidth;     // Layout 강제 발생!
```

**성능 킬러 패턴:**

```javascript
// ❌ 나쁜 예: Layout Thrashing
for (let i = 0; i < 100; i++) {
  const height = element.offsetHeight;  // 읽기
  element.style.height = (height + 10) + 'px';  // 쓰기
  // 매번 Layout 재계산! (100번 발생)
}

// ✅ 좋은 예: 배치 처리
const height = element.offsetHeight;  // 한 번만 읽기
for (let i = 0; i < 100; i++) {
  element.style.height = (height + 10 * i) + 'px';
}
// Layout 1번만 발생!
```

#### Step 5: Paint & Composite

**Paint:** 픽셀 색칠하기
- 배경색, 텍스트, 그림자, 테두리 등

**Composite:** 레이어 합치기
- GPU 가속 사용
- `transform`, `opacity`는 composite만 발생 (빠름!)

**성능 차이 체감:**

```css
/* ❌ 느린 애니메이션: Layout + Paint 발생 */
.box {
  transition: left 0.3s;
}
.box:hover {
  left: 100px;  /* Layout 재계산! */
}

/* ✅ 빠른 애니메이션: Composite만 발생 */
.box {
  transition: transform 0.3s;
}
.box:hover {
  transform: translateX(100px);  /* GPU 가속! */
}
```

**실습: 성능 차이 측정**

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .slow { transition: margin-left 1s; }
    .fast { transition: transform 1s; }

    .slow:hover { margin-left: 300px; }
    .fast:hover { transform: translateX(300px); }

    div { width: 100px; height: 100px; background: blue; margin: 20px; }
  </style>
</head>
<body>
  <div class="slow">느린 박스 (margin)</div>
  <div class="fast">빠른 박스 (transform)</div>

  <script>
    // Performance API로 측정
    const slow = document.querySelector('.slow');
    const fast = document.querySelector('.fast');

    slow.addEventListener('mouseenter', () => {
      performance.mark('slow-start');
    });
    slow.addEventListener('transitionend', () => {
      performance.mark('slow-end');
      performance.measure('slow-animation', 'slow-start', 'slow-end');
      console.log(performance.getEntriesByName('slow-animation'));
    });

    // fast도 동일하게
  </script>
</body>
</html>
```

**Chrome DevTools로 확인:**

1. F12 → Performance 탭
2. "Rendering" 체크박스 켜기
3. "Paint flashing" 활성화
4. 마우스 올리기 → 녹색 깜빡임 = Repaint 발생

---

<a name="event-loop"></a>
## 🔄 2. 이벤트 루프: 싱글 스레드의 마법

### 비유: 혼자 일하는 식당 주방장

**주방장 = JavaScript 엔진 (싱글 스레드)**

```
손님1: "파스타 주세요!"
손님2: "피자 주세요!"
손님3: "샐러드 주세요!"
```

주방장은 1명인데 주문은 3개.

**어떻게 처리할까?**

#### Call Stack (콜 스택)

주문서를 쌓아두는 곳:

```
[샐러드]  ← 맨 위 (지금 요리 중)
[피자]
[파스타]
```

**규칙: 맨 위부터 하나씩 처리 (LIFO - Last In First Out)**

**코드로 보기:**

```javascript
function third() {
  console.log('3. 샐러드 완성!');
}

function second() {
  console.log('2. 피자 만드는 중...');
  third();
}

function first() {
  console.log('1. 파스타 만드는 중...');
  second();
}

first();

// Call Stack 변화:
// [first] → [first, second] → [first, second, third]
// → [first, second] → [first] → []
```

#### Web APIs: 다른 사람에게 맡기기

**문제:**
```javascript
// 피자가 오븐에서 30분 걸린다면?
function makePizza() {
  ovenBake(30분);  // 30분 동안 주방장이 멍 때림?
  console.log('피자 완성!');
}
```

**해결: Web API에게 위임**

```javascript
function makePizza() {
  console.log('1. 피자 오븐에 넣기');

  // 타이머를 브라우저에게 맡김!
  setTimeout(() => {
    console.log('3. 피자 완성!');
  }, 3000);  // 3초

  console.log('2. 다른 요리 계속하기');
}

makePizza();

// 출력 순서:
// 1. 피자 오븐에 넣기
// 2. 다른 요리 계속하기
// (3초 후)
// 3. 피자 완성!
```

**왜 이 순서일까?**

```
Call Stack          Web API           Task Queue
---------          --------          -----------
makePizza()
  console.log('1')
  setTimeout()  →   타이머 시작
  console.log('2')
(비었음)                              (3초 후)
                                  →   콜백 대기 중
(비었음)          ←                   콜백 이동
  console.log('3')
```

#### Task Queue vs Microtask Queue

**Task Queue (거시 작업):**
- `setTimeout`, `setInterval`
- DOM 이벤트

**Microtask Queue (미시 작업 - 우선순위 높음!):**
- `Promise.then()`
- `async/await`

**퀴즈: 출력 순서는?**

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
});

console.log('4');

// 정답은?
```

<details>
<summary>정답 보기</summary>

```
1
4
3
2
```

**이유:**
1. `console.log('1')` - 즉시 실행
2. `setTimeout` - Task Queue에 추가
3. `Promise.then` - Microtask Queue에 추가
4. `console.log('4')` - 즉시 실행
5. Call Stack 비었음 → **Microtask 먼저 실행** → `3` 출력
6. Microtask 끝 → Task 실행 → `2` 출력

</details>

**실전 활용: 렌더링 최적화**

```javascript
// ❌ 나쁜 예: UI가 멈춤
function processHugeData(data) {
  for (let i = 0; i < 1000000; i++) {
    // 복잡한 계산 (5초 걸림)
    heavyCalculation(data[i]);
  }
  console.log('완료!');
}

// 사용자는 5초 동안 화면이 멈춤 😱

// ✅ 좋은 예: 작은 단위로 쪼개기
async function processHugeData(data) {
  const chunkSize = 1000;

  for (let i = 0; i < data.length; i += chunkSize) {
    // 1000개씩 처리
    const chunk = data.slice(i, i + chunkSize);

    chunk.forEach(item => heavyCalculation(item));

    // 다른 작업 할 시간 주기 (렌더링 포함)
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  console.log('완료!');
}

// 사용자는 화면이 부드럽게 업데이트되는 것을 봄 ✨
```

#### requestAnimationFrame: 애니메이션 전용

**비유:** 영화 프레임 (초당 60프레임 = 16.67ms마다)

```javascript
// ❌ 나쁜 예: setTimeout 사용
function animate() {
  box.style.left = (parseInt(box.style.left) + 1) + 'px';
  setTimeout(animate, 16);  // 대략 60fps?
}
// 문제: 브라우저 리프레시와 안 맞을 수 있음

// ✅ 좋은 예: requestAnimationFrame
function animate() {
  box.style.left = (parseInt(box.style.left) + 1) + 'px';
  requestAnimationFrame(animate);  // 브라우저 리프레시에 맞춤!
}
requestAnimationFrame(animate);
```

**실습: 부드러운 스크롤**

```javascript
function smoothScrollTo(targetY, duration = 1000) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function scroll(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // easing 함수 (부드럽게)
    const easeProgress = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    window.scrollTo(0, startY + distance * easeProgress);

    if (progress < 1) {
      requestAnimationFrame(scroll);
    }
  }

  requestAnimationFrame(scroll);
}

// 사용
smoothScrollTo(1000);  // 1000px 위치로 부드럽게 스크롤
```

---

<a name="reflow-repaint"></a>
## ⚡ 3. Reflow vs Repaint: 성능 살인마 잡기

### 비유: 집 리모델링

**Reflow (리플로우) = 벽 허물고 다시 짓기**
- 매우 비쌈 💰💰💰
- 시간 오래 걸림

**Repaint (리페인트) = 벽지만 바꾸기**
- 비쌈 💰
- Reflow보다 빠름

**Composite (합성) = 가구 위치만 바꾸기**
- 싸고 빠름 ⚡

### Reflow를 발생시키는 속성들

```javascript
// ⚠️ 위험: Reflow 발생
element.style.width = '100px';
element.style.height = '200px';
element.style.margin = '10px';
element.style.padding = '5px';
element.style.border = '1px solid';
element.style.display = 'block';
element.style.position = 'absolute';
element.style.fontSize = '16px';

// ⚠️ 읽기만 해도 Reflow 강제 발생!
const h = element.offsetHeight;
const w = element.clientWidth;
const top = element.getBoundingClientRect().top;
const scrollTop = element.scrollTop;
```

### Repaint만 발생시키는 속성

```javascript
// 💰 Repaint만 발생 (Reflow 없음)
element.style.color = 'red';
element.style.backgroundColor = 'blue';
element.style.visibility = 'hidden';
element.style.outline = '1px solid red';
element.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
```

### Composite만 발생 (가장 빠름!)

```javascript
// ⚡ GPU 가속! 매우 빠름
element.style.transform = 'translateX(100px)';
element.style.opacity = '0.5';
```

### 실전 최적화 패턴

#### 패턴 1: 배치 처리

```javascript
// ❌ 나쁜 예: Reflow 3번 발생
element.style.width = '100px';   // Reflow #1
element.style.height = '200px';  // Reflow #2
element.style.margin = '10px';   // Reflow #3

// ✅ 좋은 예 1: cssText 사용 (Reflow 1번)
element.style.cssText = 'width:100px; height:200px; margin:10px;';

// ✅ 좋은 예 2: class 사용 (Reflow 1번)
element.className = 'new-style';
```

#### 패턴 2: 읽기/쓰기 분리

```javascript
// ❌ 나쁜 예: Layout Thrashing
boxes.forEach(box => {
  const height = box.offsetHeight;  // 읽기 → Reflow
  box.style.height = (height * 2) + 'px';  // 쓰기 → Reflow
  // N개 박스 → Reflow N×2번 발생!
});

// ✅ 좋은 예: 읽기 먼저, 쓰기는 나중에
const heights = boxes.map(box => box.offsetHeight);  // 읽기만 모아서
boxes.forEach((box, i) => {
  box.style.height = (heights[i] * 2) + 'px';  // 쓰기만 모아서
});
// Reflow 2번만 발생!
```

#### 패턴 3: DocumentFragment 사용

```javascript
// ❌ 나쁜 예: DOM에 100번 추가 (Reflow 100번)
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  div.textContent = i;
  container.appendChild(div);  // 매번 Reflow!
}

// ✅ 좋은 예: Fragment 사용 (Reflow 1번)
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  div.textContent = i;
  fragment.appendChild(div);  // 메모리에만 추가
}
container.appendChild(fragment);  // 한 번에 DOM 추가!
```

#### 패턴 4: display: none 트릭

```javascript
// ✅ 대량 수정 시: 잠깐 숨기기
element.style.display = 'none';  // Reflow 1번

// 100개 속성 수정
element.style.width = '...';
element.style.height = '...';
// ... (Reflow 발생 안 함! display:none이라)

element.style.display = 'block';  // Reflow 1번
// 총 Reflow: 2번만!
```

### 실습: 성능 측정

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .box { width: 100px; height: 100px; background: blue; }
  </style>
</head>
<body>
  <div id="container"></div>

  <button onclick="badWay()">나쁜 방법 (느림)</button>
  <button onclick="goodWay()">좋은 방법 (빠름)</button>

  <script>
    function badWay() {
      const start = performance.now();
      const container = document.getElementById('container');
      container.innerHTML = '';

      for (let i = 0; i < 1000; i++) {
        const div = document.createElement('div');
        div.className = 'box';
        container.appendChild(div);  // Reflow 1000번!
      }

      const end = performance.now();
      console.log(`나쁜 방법: ${end - start}ms`);
    }

    function goodWay() {
      const start = performance.now();
      const container = document.getElementById('container');
      container.innerHTML = '';

      const fragment = document.createDocumentFragment();
      for (let i = 0; i < 1000; i++) {
        const div = document.createElement('div');
        div.className = 'box';
        fragment.appendChild(div);
      }
      container.appendChild(fragment);  // Reflow 1번!

      const end = performance.now();
      console.log(`좋은 방법: ${end - start}ms`);
    }
  </script>
</body>
</html>
```

**결과 예상:**
- 나쁜 방법: ~200ms
- 좋은 방법: ~20ms
- **10배 차이!**

---

<a name="devtools"></a>
## 🛠️ 4. Chrome DevTools 200% 활용법

### Performance 탭 마스터하기

#### 1. 녹화 시작

```
F12 → Performance 탭 → 녹화 버튼 (⏺️) → 페이지 조작 → 정지
```

#### 2. 결과 분석

**Main 섹션 확인:**

```
Main Thread
├─ Parse HTML (파싱)
├─ Recalculate Style (스타일 계산)
├─ Layout (레이아웃)
├─ Update Layer Tree (레이어 업데이트)
├─ Paint (페인트)
└─ Composite Layers (합성)
```

**빨간색 경고 = 문제!**

- Long Task: 50ms 이상 걸리는 작업
- Layout Shift: 화면이 갑자기 움직임

#### 3. 병목 지점 찾기

```javascript
// 예시: 이 함수가 느리다고 나옴
function slowFunction() {
  const list = document.querySelectorAll('.item');  // 5ms
  list.forEach(item => {
    const height = item.offsetHeight;  // Layout! 30ms
    item.style.height = (height * 1.5) + 'px';  // Layout! 30ms
  });
  // 총 65ms → Long Task 경고!
}
```

**해결:**

```javascript
function fastFunction() {
  const list = document.querySelectorAll('.item');
  const heights = Array.from(list).map(item => item.offsetHeight);  // 읽기 모음
  list.forEach((item, i) => {
    item.style.height = (heights[i] * 1.5) + 'px';  // 쓰기 모음
  });
  // 총 10ms → 해결!
}
```

### Rendering 탭 활용

#### Paint Flashing

```
F12 → More tools → Rendering → Paint flashing 체크
```

- 녹색 깜빡임 = Repaint 발생
- 자주 깜빡이면 = 성능 문제

**실습:**

```html
<div id="box" style="width:100px; height:100px; background:red;"></div>

<script>
  // 마우스 움직일 때마다 색 변경
  document.addEventListener('mousemove', (e) => {
    box.style.backgroundColor = `rgb(${e.clientX % 255}, 0, 0)`;
    // Paint flashing에서 미친듯이 깜빡임!
  });
</script>
```

#### Layout Shift Regions

```
Rendering → Layout Shift Regions 체크
```

- 파란색 = 레이아웃이 이동한 영역
- CLS (Cumulative Layout Shift) 점수 확인

**나쁜 예:**

```html
<!-- 이미지 크기 없음 → 로드 후 레이아웃 이동! -->
<img src="large-image.jpg">

<!-- 좋은 예 -->
<img src="large-image.jpg" width="800" height="600">
```

### Network 탭: 렌더링 블로킹 찾기

```
F12 → Network → Disable cache 체크 → 새로고침
```

**확인할 것:**
1. **빨간 세로선** = DOM Content Loaded
2. **파란 세로선** = Load 완료
3. **Waterfall** = 리소스 로딩 순서

**문제 패턴:**

```
HTML 파싱 ----▶ (멈춤) CSS 다운로드 ----▶ 렌더링 시작
             ↑
         렌더링 블로킹!
```

**해결:**

```html
<!-- Critical CSS는 인라인 -->
<style>/* 첫 화면에 필요한 CSS */</style>

<!-- 나머지는 비동기 로드 -->
<link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
```

### Coverage 탭: 사용 안 하는 코드 찾기

```
F12 → More tools → Coverage → 녹화 → 페이지 조작
```

**결과:**
- 빨간색 = 사용 안 한 코드
- "1.2 MB 중 800 KB 사용 안 함!" → **33% 낭비**

**해결: 코드 스플리팅**

```javascript
// ❌ 전부 로드
import { hugeLibrary } from 'huge-lib';

// ✅ 필요할 때만 로드
button.addEventListener('click', async () => {
  const { hugeLibrary } = await import('huge-lib');
  hugeLibrary.doSomething();
});
```

---

<a name="project"></a>
## 🚀 5. 실전 프로젝트: 느린 페이지 10배 빠르게

### 문제 상황

**쇼핑몰 상품 목록 페이지:**
- 상품 1000개
- 로딩 시간: 8초
- Lighthouse 점수: 23점 (빨간불 🔴)

### 목표

- 로딩 시간: 0.8초 (10배 개선)
- Lighthouse 점수: 90점 이상

### Step 1: 문제 진단 (DevTools 활용)

#### Performance 탭 분석:

```
Main Thread (8초 중):
- Parse HTML: 100ms
- Parse CSS: 200ms
- JavaScript Execution: 5000ms ← 문제!
- Layout: 2000ms ← 문제!
- Paint: 700ms
```

#### 발견된 문제:

1. **모든 상품을 한 번에 렌더링** (1000개)
2. **이미지 최적화 안 됨** (각 5MB)
3. **JavaScript 번들 크기 3MB**
4. **Reflow 1000번 발생**

### Step 2: 해결 방법

#### 문제 1: 모든 상품 한 번에 렌더링

**해결: Intersection Observer로 가상 스크롤**

```javascript
// Before: 1000개 전부 렌더링
function ProductList({ products }) {
  return (
    <div>
      {products.map(p => <ProductCard key={p.id} data={p} />)}
    </div>
  );
}

// After: 보이는 것만 렌더링
function ProductList({ products }) {
  const [visibleProducts, setVisibleProducts] = useState([]);
  const observerRef = useRef();

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // 화면에 들어오면 로드
            const index = parseInt(entry.target.dataset.index);
            setVisibleProducts(prev => [...prev, products[index]]);
          }
        });
      },
      { rootMargin: '200px' }  // 200px 미리 로드
    );

    // Sentinel 요소들 관찰
    document.querySelectorAll('.product-sentinel').forEach(el => {
      observerRef.current.observe(el);
    });
  }, []);

  return (
    <div>
      {products.map((p, i) => (
        <div key={p.id} className="product-sentinel" data-index={i}>
          {visibleProducts.includes(p) ? (
            <ProductCard data={p} />
          ) : (
            <div style={{ height: '300px' }} /> // 플레이스홀더
          )}
        </div>
      ))}
    </div>
  );
}
```

**결과:**
- 렌더링 시간: 5000ms → 500ms (10배 개선)

#### 문제 2: 이미지 최적화

```html
<!-- Before: 5MB 원본 이미지 -->
<img src="product-001.jpg" alt="상품">

<!-- After: 반응형 이미지 + lazy loading -->
<img
  src="product-001-thumb.webp"
  srcset="
    product-001-300w.webp 300w,
    product-001-600w.webp 600w,
    product-001-1200w.webp 1200w
  "
  sizes="(max-width: 600px) 300px, 600px"
  loading="lazy"
  alt="상품"
>
```

**결과:**
- 이미지 크기: 5MB → 50KB (100배 개선)
- 로딩 시간: 2000ms → 200ms

#### 문제 3: JavaScript 번들 크기

```javascript
// Before: 모든 라이브러리 한 번에 로드
import React from 'react';
import moment from 'moment';  // 500KB!
import lodash from 'lodash';  // 300KB!
import Chart from 'chart.js';  // 400KB!

// After: 필요한 것만 import + 코드 스플리팅
import React from 'react';
import dayjs from 'dayjs';  // 7KB! (moment 대체)

// lodash → 필요한 함수만
import debounce from 'lodash/debounce';

// Chart는 필요할 때만 동적 로드
const ChartComponent = React.lazy(() => import('./Chart'));
```

**결과:**
- 번들 크기: 3MB → 300KB (10배 개선)

#### 문제 4: Reflow 1000번

```javascript
// Before: 각 상품 카드마다 Reflow
products.forEach(product => {
  const card = createProductCard(product);
  container.appendChild(card);  // Reflow!

  const price = card.querySelector('.price');
  price.style.color = product.onSale ? 'red' : 'black';  // Reflow!
});

// After: DocumentFragment + CSS 클래스
const fragment = document.createDocumentFragment();
products.forEach(product => {
  const card = createProductCard(product);
  if (product.onSale) {
    card.classList.add('on-sale');  // CSS로 처리
  }
  fragment.appendChild(card);  // 메모리에만
});
container.appendChild(fragment);  // Reflow 1번!
```

**결과:**
- Layout 시간: 2000ms → 50ms (40배 개선)

### Step 3: 최종 결과

| 지표 | Before | After | 개선율 |
|------|--------|-------|--------|
| 로딩 시간 | 8초 | 0.7초 | **11.4배** |
| Lighthouse | 23점 | 94점 | **4.1배** |
| JavaScript | 3MB | 280KB | **10.7배** |
| 이미지 크기 | 5GB (전체) | 50MB | **100배** |
| Reflow 횟수 | 1000번 | 1번 | **1000배** |

### 완성 코드 (GitHub)

```
https://github.com/your-repo/fast-product-list
├─ before/  (느린 버전)
├─ after/   (빠른 버전)
└─ README.md  (상세 설명)
```

---

<a name="roadmap"></a>
## 📅 6. 4주 학습 로드맵

### 전제 조건

- JavaScript 기초 (변수, 함수, 배열)
- HTML/CSS 기본
- Chrome DevTools 사용 경험

### Week 1: 렌더링 파이프라인 이해

**Day 1-2: DOM & CSSOM**

학습 내용:
- DOM 트리 구조
- CSSOM 생성 과정
- Render Tree 생성

실습:
```javascript
// DOM 조작 연습
document.querySelector('h1').textContent = '변경';
document.createElement('div');
document.createDocumentFragment();

// 성능 측정
console.time('DOM-creation');
// ... DOM 조작 코드
console.timeEnd('DOM-creation');
```

**Day 3-4: Layout & Paint**

학습:
- Layout을 발생시키는 속성 암기
- Paint vs Composite 차이

실습:
- Paint flashing으로 Repaint 확인
- `transform` vs `left` 성능 비교

**Day 5-7: 프로젝트**

만들기: "렌더링 성능 비교 도구"

```html
<button onclick="slowAnimation()">느린 애니메이션 (left)</button>
<button onclick="fastAnimation()">빠른 애니메이션 (transform)</button>

<div id="results"></div>
```

### Week 2: 이벤트 루프 & 비동기

**Day 1-2: Call Stack & Task Queue**

퀴즈 풀기:
```javascript
// 출력 순서 맞히기
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');
```

**Day 3-4: Microtask vs Macrotask**

실습:
```javascript
// Promise 체인 연습
fetch('/api/data')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

// async/await로 변환
async function getData() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
```

**Day 5-7: 프로젝트**

만들기: "이벤트 루프 시각화 도구"

실시간으로 Call Stack, Task Queue, Microtask Queue 표시

### Week 3: 성능 최적화

**Day 1-3: Reflow/Repaint 최적화**

체크리스트:
- [ ] Layout Thrashing 제거
- [ ] DocumentFragment 사용
- [ ] CSS class 활용

**Day 4-5: 이미지 & 리소스 최적화**

실습:
```html
<!-- WebP 변환 -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="대체 이미지">
</picture>

<!-- lazy loading -->
<img loading="lazy" src="image.jpg">
```

**Day 6-7: 프로젝트**

"느린 페이지 최적화"
- Lighthouse 점수 50점 → 90점 만들기

### Week 4: DevTools 마스터

**Day 1-2: Performance 탭**

연습:
1. 페이지 녹화
2. Long Task 찾기
3. 병목 지점 수정
4. 다시 측정 → 개선 확인

**Day 3-4: Memory 탭**

메모리 누수 찾기:
```javascript
// 메모리 누수 예제
let leakyArray = [];
setInterval(() => {
  leakyArray.push(new Array(1000000));  // 계속 쌓임!
}, 1000);

// Memory 탭에서 Heap Snapshot 찍기
// leakyArray가 계속 커지는 것 확인
```

**Day 5-7: 최종 프로젝트**

**"나만의 성능 모니터링 대시보드"**

기능:
- 페이지 로딩 시간
- FCP, LCP, CLS 측정
- Long Task 감지
- 메모리 사용량

```javascript
// Performance API 활용
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});

observer.observe({ entryTypes: ['measure', 'navigation'] });
```

---

<a name="resources"></a>
## 📚 7. 학습 자료 모음

### 무료 자료 (필수)

#### 공식 문서

1. **MDN Web Docs**
   - [Critical Rendering Path](https://developer.mozilla.org/ko/docs/Web/Performance/Critical_rendering_path)
   - [Event Loop](https://developer.mozilla.org/ko/docs/Web/JavaScript/EventLoop)
   - 한국어 번역 양질

2. **Web.dev by Google** ⭐⭐⭐⭐⭐
   - [https://web.dev/learn-web-vitals/](https://web.dev/learn-web-vitals/)
   - Lighthouse 개발팀이 직접 작성
   - 실전 최적화 팁

3. **Chrome DevTools 공식 가이드**
   - [https://developer.chrome.com/docs/devtools/](https://developer.chrome.com/docs/devtools/)
   - 영상 튜토리얼 포함

#### 한국어 블로그

1. **NAVER D2**
   - "브라우저 렌더링 과정" 시리즈
   - 카카오, 네이버 개발자들의 실전 경험

2. **토스 기술 블로그**
   - 성능 최적화 사례
   - 실제 지표 개선 경험

#### 영상 강의

1. **YouTube - Jake Archibald "In The Loop"**
   - 이벤트 루프 최고의 설명
   - 시각화 애니메이션
   - 30분, 영어 (한글 자막 자동 생성)

2. **"What the heck is the event loop anyway?"**
   - Philip Roberts (JSConf)
   - 2000만 뷰, 전설적인 강의

### 유료 자료 (선택)

#### 책

1. **"High Performance Browser Networking"**
   - 저자: Ilya Grigorik (Google)
   - 무료 온라인: [https://hpbn.co/](https://hpbn.co/)

2. **"웹 성능 최적화 기법"** (한국어)
   - 실전 중심
   - 25,000원

#### 강의

1. **Frontend Masters - "Web Performance"**
   - 강사: Steve Kinney
   - $39/월
   - 실습 프로젝트 포함

2. **Udemy - "JavaScript: Understanding the Weird Parts"**
   - 이벤트 루프 깊이 있게
   - 세일 시 15,000원

### 도구

#### 성능 측정

1. **Lighthouse CI**
   ```bash
   npm install -g @lhci/cli
   lhci autorun
   ```

2. **WebPageTest**
   - [https://www.webpagetest.org/](https://www.webpagetest.org/)
   - 전 세계 다양한 환경에서 테스트

3. **Chrome User Experience Report**
   - 실제 사용자 데이터
   - [https://developers.google.com/web/tools/chrome-user-experience-report](https://developers.google.com/web/tools/chrome-user-experience-report)

#### 이미지 최적화

1. **Squoosh**
   - [https://squoosh.app/](https://squoosh.app/)
   - WebP, AVIF 변환

2. **ImageOptim (Mac)**, **FileOptimizer (Windows)**
   - 무손실 압축

### 커뮤니티

1. **프론트엔드 개발 그룹** (페이스북)
   - 질문 & 답변 활발

2. **Reddit - r/webdev**
   - 영어, 최신 트렌드

3. **Stack Overflow**
   - 특정 문제 해결

---

## 🎯 마무리: 지금 바로 시작하세요

### 첫 걸음 (오늘 30분)

1. **F12 눌러서 DevTools 열기**
2. **Performance 탭 → 녹화 → 아무 사이트나 방문**
3. **Main 섹션 보기 → Layout, Paint 찾기**

**이게 끝입니다. 시작했습니다! 🎉**

### 1주일 후 당신의 모습

- "아, 이 사이트 Reflow가 100번 일어나네"
- "여기 CSS가 렌더링 블로킹하고 있어"
- "이 이미지 lazy loading 안 되어 있잖아"

**보이기 시작합니다.**

### 1개월 후

- 면접에서: "브라우저 렌더링 과정 설명해주세요"
  - 자신 있게 답변 ✅

- 코드 리뷰에서: "이 코드 Reflow 발생시켜요"
  - 동료들: "오... 고수네요" ✨

### 1년 후

- **시니어 개발자 승진**
- **성능 최적화 전문가**
- **팀 내 기술 리더**

---

## 💬 댓글로 알려주세요!

- 어떤 부분이 가장 도움됐나요?
- 추가로 궁금한 내용은?
- 여러분의 성능 최적화 경험은?

**함께 성장합시다! 🚀**

---

**P.S.** 다음 글 예고:
- **"React 성능 최적화: useMemo는 언제 써야 할까?"**
- **"Next.js SSR vs SSG vs ISR 완전 정복"**
- **"프론트엔드 면접 단골 질문 50개 (브라우저 편)"**

관심 있는 주제에 댓글 남겨주세요! 📝
