# 개발자 블로그

간단하고 깔끔한 정적 개발자 블로그입니다. HTML, CSS, JavaScript만으로 구현되었으며, GitHub Pages에서 호스팅할 수 있습니다.

## 주요 기능

- 깔끔하고 모던한 디자인
- 다크모드 지원
- 마크다운 기반 블로그 포스트
- 코드 하이라이팅 (Highlight.js)
- 완전한 반응형 디자인
- 빠른 로딩 속도
- 검색 엔진 최적화 (SEO)

## 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox, Grid, CSS Variables
- **JavaScript (ES6+)**: Async/Await, Fetch API
- **Marked.js**: 마크다운 파싱
- **Highlight.js**: 코드 신택스 하이라이팅

## 프로젝트 구조

```
blog/
├── index.html          # 메인 HTML 파일
├── styles.css          # 스타일시트
├── script.js           # JavaScript 로직
├── posts/              # 블로그 포스트 디렉토리
│   ├── posts.json      # 포스트 메타데이터
│   ├── welcome-to-my-blog.md
│   ├── javascript-async-await.md
│   ├── css-flexbox-grid.md
│   └── git-workflow-tips.md
└── README.md           # 프로젝트 문서
```

## 시작하기

### 1. 저장소 클론

```bash
git clone <repository-url>
cd blog
```

### 2. 로컬에서 실행

간단한 HTTP 서버를 사용하여 실행:

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server 패키지 필요)
npx http-server

# VS Code Live Server 확장 사용
# 또는 브라우저에서 index.html 직접 열기
```

브라우저에서 `http://localhost:8000` 접속

### 3. GitHub Pages로 배포

1. GitHub에 저장소 생성
2. 코드 푸시:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
3. Settings > Pages에서 배포 설정
4. `https://yourusername.github.io/repository-name`에서 확인

## 새 포스트 추가하기

### 1. 마크다운 파일 작성

`posts/` 디렉토리에 새 `.md` 파일 생성:

```markdown
# 포스트 제목

포스트 내용을 마크다운으로 작성...

## 소제목

코드 예시:

\`\`\`javascript
console.log('Hello World!');
\`\`\`
```

### 2. posts.json 업데이트

`posts/posts.json`에 포스트 정보 추가:

```json
{
  "posts": [
    {
      "slug": "new-post",
      "title": "새로운 포스트",
      "date": "2024-11-18",
      "author": "Your Name",
      "excerpt": "포스트 요약...",
      "tags": ["JavaScript", "Tutorial"],
      "readTime": "5분",
      "file": "new-post.md"
    }
  ]
}
```

### 필드 설명

- `slug`: URL에 사용될 고유 식별자
- `title`: 포스트 제목
- `date`: 작성일 (YYYY-MM-DD)
- `author`: 작성자 이름
- `excerpt`: 포스트 요약 (카드에 표시)
- `tags`: 태그 배열
- `readTime`: 예상 읽기 시간
- `file`: 마크다운 파일명

## 커스터마이징

### 색상 테마 변경

`styles.css`의 CSS 변수를 수정:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #24292f;
  --text-link: #0969da;
  --accent: #2da44e;
  /* ... */
}
```

### About 페이지 수정

`index.html`의 `#about-page` 섹션 수정:

```html
<section id="about-page" class="page">
  <article class="about-content">
    <h2>About Me</h2>
    <p>자신의 소개를 작성하세요...</p>
  </article>
</section>
```

### 블로그 제목 변경

`index.html`의 다음 부분 수정:

```html
<title>개발자 블로그</title>
<!-- ... -->
<h1>💻 Dev Blog</h1>
```

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)

## 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 문의

질문이나 제안사항이 있으시면 이슈를 생성해주세요.

---

Made with ❤️ by Developer
