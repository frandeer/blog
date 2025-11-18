# GitHub Pages 배포 가이드

이 블로그를 GitHub Pages로 배포하는 방법을 안내합니다.

## 방법 1: GitHub 설정에서 직접 배포 (추천)

### 1단계: 저장소 설정

1. GitHub에서 저장소 페이지로 이동
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭

### 2단계: Source 설정

**Build and deployment** 섹션에서:

- **Source**: Deploy from a branch 선택
- **Branch**:
  - 메인 브랜치 선택 (main 또는 master)
  - 폴더는 `/ (root)` 선택
- **Save** 클릭

### 3단계: 배포 확인

- 몇 분 후 페이지가 배포됩니다
- 배포 완료 시 상단에 URL이 표시됩니다
- URL 형식: `https://yourusername.github.io/repository-name`

## 방법 2: GitHub Actions 사용 (자동 배포)

현재 `.github/workflows/deploy.yml` 파일이 포함되어 있습니다.

### 1단계: Actions 활성화

1. GitHub 저장소의 **Settings** > **Pages** 이동
2. **Source**를 **GitHub Actions**로 선택

### 2단계: 자동 배포

- `main` 또는 `master` 브랜치에 푸시할 때마다 자동 배포
- **Actions** 탭에서 배포 상태 확인 가능

## 방법 3: gh-pages 브랜치 사용

### 수동 배포 스크립트

```bash
# gh-pages 브랜치 생성 및 배포
git checkout -b gh-pages
git push -u origin gh-pages

# Settings > Pages에서 gh-pages 브랜치 선택
```

## 커스텀 도메인 설정 (선택사항)

### 1단계: CNAME 파일 생성

저장소 루트에 `CNAME` 파일 생성:

```
yourdomain.com
```

### 2단계: DNS 설정

도메인 제공업체에서 다음 DNS 레코드 추가:

**A 레코드** (apex 도메인용):
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**CNAME 레코드** (www 서브도메인용):
```
www  →  yourusername.github.io
```

### 3단계: GitHub에서 도메인 설정

1. Settings > Pages로 이동
2. Custom domain 섹션에 도메인 입력
3. Enforce HTTPS 체크박스 활성화

## HTTPS 설정

GitHub Pages는 자동으로 무료 SSL 인증서를 제공합니다:

1. Settings > Pages에서 **Enforce HTTPS** 체크
2. DNS 설정 후 24-48시간 대기
3. 인증서가 자동으로 발급됩니다

## 트러블슈팅

### 404 에러

- `index.html`이 루트 디렉토리에 있는지 확인
- 브랜치와 폴더 설정이 올바른지 확인
- `.nojekyll` 파일이 있는지 확인 (이미 포함됨)

### 스타일이 적용되지 않음

상대 경로 확인:
```html
<!-- ✅ 올바름 -->
<link rel="stylesheet" href="styles.css">

<!-- ❌ 잘못됨 -->
<link rel="stylesheet" href="/styles.css">
```

### JavaScript가 작동하지 않음

1. 브라우저 콘솔에서 에러 확인
2. CORS 문제인 경우 `.nojekyll` 파일 확인
3. 파일 경로가 올바른지 확인

### 업데이트가 반영되지 않음

1. 브라우저 캐시 삭제 (Ctrl + Shift + R)
2. GitHub Actions 탭에서 배포 상태 확인
3. 10-15분 정도 대기 후 재확인

## 배포 상태 확인

### GitHub Actions 사용 시

1. 저장소의 **Actions** 탭 클릭
2. 최근 워크플로우 실행 확인
3. 빌드 로그 확인

### 직접 배포 시

1. Settings > Pages에서 상태 확인
2. "Your site is live at..." 메시지 확인

## 로컬 테스트

배포 전 로컬에서 테스트:

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

브라우저에서 `http://localhost:8000` 접속

## 성능 최적화

### 1. 이미지 최적화

- 이미지를 WebP 형식으로 변환
- 적절한 크기로 리사이징
- CDN 사용 고려

### 2. 캐싱

GitHub Pages는 자동으로 캐싱을 지원합니다.

### 3. CDN 활용

외부 라이브러리는 CDN 사용 (이미 적용됨):
- Marked.js
- Highlight.js

## 추가 정보

- [GitHub Pages 공식 문서](https://docs.github.com/en/pages)
- [커스텀 도메인 설정](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [GitHub Actions 문서](https://docs.github.com/en/actions)

---

문제가 해결되지 않으면 GitHub Issues에 문의해주세요!
