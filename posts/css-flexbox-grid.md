# CSS Flexbox와 Grid 마스터하기

모던 웹 레이아웃의 핵심인 Flexbox와 Grid를 비교하고 실습해봅시다.

## Flexbox vs Grid: 언제 무엇을 쓸까?

### Flexbox: 1차원 레이아웃
- 한 방향(행 또는 열)의 레이아웃에 적합
- 콘텐츠 크기에 따라 유연하게 조정
- 네비게이션, 카드 정렬 등에 사용

### Grid: 2차원 레이아웃
- 행과 열을 동시에 제어
- 복잡한 레이아웃 구조
- 페이지 전체 레이아웃, 갤러리 등에 사용

## Flexbox 완벽 가이드

### 기본 설정

```css
.container {
  display: flex;
  /* 또는 display: inline-flex; */
}
```

### 주요 속성들

#### 1. flex-direction

```css
.container {
  display: flex;
  flex-direction: row; /* 기본값: 가로 */
  /* flex-direction: column; 세로 */
  /* flex-direction: row-reverse; 역순 가로 */
  /* flex-direction: column-reverse; 역순 세로 */
}
```

#### 2. justify-content (주축 정렬)

```css
.container {
  display: flex;
  justify-content: flex-start; /* 시작점 */
  /* justify-content: flex-end; 끝점 */
  /* justify-content: center; 중앙 */
  /* justify-content: space-between; 양끝 정렬, 균등 간격 */
  /* justify-content: space-around; 양옆 간격 포함 */
  /* justify-content: space-evenly; 완전 균등 간격 */
}
```

#### 3. align-items (교차축 정렬)

```css
.container {
  display: flex;
  align-items: stretch; /* 기본값: 늘림 */
  /* align-items: flex-start; 시작점 */
  /* align-items: flex-end; 끝점 */
  /* align-items: center; 중앙 */
}
```

### 실전 예제: 네비게이션 바

```css
/* HTML: <nav class="navbar">
  <div class="logo">Logo</div>
  <ul class="menu">
    <li>Home</li>
    <li>About</li>
    <li>Contact</li>
  </ul>
</nav> */

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #333;
  color: white;
}

.menu {
  display: flex;
  gap: 2rem;
  list-style: none;
}
```

### 실전 예제: 카드 레이아웃

```css
.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 2rem;
}

.card {
  flex: 1 1 300px; /* grow shrink basis */
  /* flex: 1; → 균등 분배 */
  /* flex: 0 0 300px; → 고정 크기 */

  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

## CSS Grid 완벽 가이드

### 기본 설정

```css
.container {
  display: grid;
  /* 또는 display: inline-grid; */
}
```

### Grid 템플릿 정의

#### 1. 명시적 그리드

```css
.container {
  display: grid;
  grid-template-columns: 200px 200px 200px;
  /* 또는 */
  grid-template-columns: 1fr 1fr 1fr; /* 균등 분할 */
  /* 또는 */
  grid-template-columns: repeat(3, 1fr); /* 반복 */

  grid-template-rows: 100px auto 100px;
  gap: 1rem; /* 간격 */
}
```

#### 2. 반응형 그리드

```css
.container {
  display: grid;
  /* 자동으로 최소 250px 크기의 컬럼 생성 */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}
```

### 그리드 영역 정의

```css
.container {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
  grid-template-columns: 200px 1fr 1fr;
  grid-template-rows: 80px 1fr 60px;
  gap: 1rem;
  height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

### 실전 예제: 페이지 레이아웃

```css
/* 전체 페이지 레이아웃 */
.page-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr 40px;
  min-height: 100vh;
}

.header {
  grid-column: 1 / -1; /* 전체 너비 */
  background: #333;
  color: white;
}

.sidebar {
  background: #f5f5f5;
  padding: 1rem;
}

.main {
  padding: 2rem;
}

.footer {
  grid-column: 1 / -1;
  background: #222;
  color: white;
  text-align: center;
}
```

### 실전 예제: 이미지 갤러리

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.gallery-item {
  aspect-ratio: 1; /* 정사각형 */
  overflow: hidden;
  border-radius: 8px;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 특정 아이템 크게 만들기 */
.gallery-item:first-child {
  grid-column: span 2;
  grid-row: span 2;
}
```

## 조합하여 사용하기

Flexbox와 Grid는 함께 사용할 수 있습니다!

```css
/* Grid로 전체 레이아웃 */
.page {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 2rem;
}

/* Flexbox로 카드 내부 정렬 */
.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}
```

## 반응형 디자인

```css
/* 모바일 우선 */
.container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* 태블릿 */
@media (min-width: 768px) {
  .container {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  .container {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 선택 가이드

### Flexbox를 사용하세요:
- ✅ 네비게이션 메뉴
- ✅ 버튼 그룹
- ✅ 카드 내부 요소 정렬
- ✅ 1차원 레이아웃

### Grid를 사용하세요:
- ✅ 페이지 전체 레이아웃
- ✅ 이미지 갤러리
- ✅ 대시보드
- ✅ 2차원 레이아웃

## 마치며

Flexbox와 Grid는 각각의 장점이 있으며, 상황에 맞게 사용하면 됩니다. 복잡한 레이아웃은 Grid로, 간단한 정렬은 Flexbox로!

### 학습 자료
- [CSS-Tricks: A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [CSS-Tricks: A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Froggy](https://flexboxfroggy.com/) - 게임으로 배우기
- [Grid Garden](https://cssgridgarden.com/) - 게임으로 배우기

다음 포스트에서는 Git 워크플로우에 대해 알아보겠습니다!
