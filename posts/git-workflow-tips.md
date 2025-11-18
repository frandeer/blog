# 실무에서 유용한 Git 워크플로우

팀 협업에 필수적인 Git 브랜치 전략과 실용적인 팁들을 알아봅니다.

## Git 브랜치 전략

### Git Flow

가장 널리 사용되는 브랜치 전략입니다.

```
main (production)
  └── develop (개발)
       ├── feature/user-auth (기능 개발)
       ├── feature/payment
       └── hotfix/critical-bug (긴급 수정)
```

#### 브랜치 종류

1. **main**: 프로덕션 배포용
2. **develop**: 개발 통합 브랜치
3. **feature/**: 새로운 기능 개발
4. **hotfix/**: 긴급 버그 수정
5. **release/**: 배포 준비

### GitHub Flow (간소화 버전)

작은 팀이나 빠른 배포가 필요할 때 사용합니다.

```
main
  ├── feature/add-login
  └── fix/header-bug
```

## 커밋 컨벤션

### Conventional Commits

일관된 커밋 메시지로 히스토리를 깔끔하게 유지합니다.

```bash
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 종류

```bash
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드 추가/수정
chore: 빌드 작업, 패키지 매니저 설정 등
```

#### 예시

```bash
# 좋은 커밋 메시지
feat(auth): 소셜 로그인 기능 추가

Google, Facebook OAuth 2.0을 이용한 소셜 로그인 구현
- Google OAuth 클라이언트 설정
- 사용자 정보 동기화 로직 추가

Closes #123
```

```bash
# 나쁜 커밋 메시지
fix bug
update code
asdf
```

## 실무 Git 명령어

### 1. 브랜치 관리

```bash
# 새 브랜치 생성 및 전환
git checkout -b feature/new-feature

# 브랜치 목록 확인
git branch -a

# 원격 브랜치 삭제
git push origin --delete feature/old-feature

# 로컬 브랜치 삭제
git branch -d feature/old-feature
```

### 2. 커밋 수정

```bash
# 마지막 커밋 메시지 수정
git commit --amend -m "새로운 커밋 메시지"

# 마지막 커밋에 파일 추가
git add forgotten-file.txt
git commit --amend --no-edit

# 여러 커밋 합치기 (인터랙티브 리베이스)
git rebase -i HEAD~3
```

### 3. 작업 임시 저장

```bash
# 현재 작업 임시 저장
git stash

# 저장된 작업 목록 보기
git stash list

# 가장 최근 stash 적용
git stash pop

# 특정 stash 적용
git stash apply stash@{1}

# stash에 이름 붙이기
git stash save "작업 중인 로그인 기능"
```

### 4. 변경사항 확인

```bash
# 스테이징되지 않은 변경사항
git diff

# 스테이징된 변경사항
git diff --staged

# 특정 커밋과 비교
git diff main..feature/new-feature

# 파일별 변경 통계
git diff --stat
```

### 5. 히스토리 확인

```bash
# 깔끔한 로그 보기
git log --oneline --graph --all

# 특정 파일의 히스토리
git log --follow -- path/to/file

# 특정 작성자의 커밋
git log --author="홍길동"

# 최근 5개 커밋
git log -5
```

## 협업 워크플로우

### Feature 개발 프로세스

```bash
# 1. 최신 코드 받기
git checkout develop
git pull origin develop

# 2. 새 브랜치 생성
git checkout -b feature/user-profile

# 3. 코드 작성 및 커밋
git add .
git commit -m "feat(profile): 사용자 프로필 페이지 추가"

# 4. 원격 저장소에 푸시
git push origin feature/user-profile

# 5. Pull Request 생성 (GitHub/GitLab에서)

# 6. 코드 리뷰 후 머지
# (웹 인터페이스에서 진행)

# 7. 로컬 브랜치 정리
git checkout develop
git pull origin develop
git branch -d feature/user-profile
```

### 충돌 해결

```bash
# 1. develop에서 최신 코드 받기
git checkout develop
git pull origin develop

# 2. feature 브랜치로 돌아가기
git checkout feature/my-feature

# 3. develop 변경사항 머지
git merge develop

# 4. 충돌 발생 시 파일 수정
# (충돌 마커 <<<<<<< ======= >>>>>>> 찾아서 수정)

# 5. 해결 후 커밋
git add .
git commit -m "merge: develop 브랜치 머지 및 충돌 해결"
```

## 유용한 Git 설정

### Alias 설정

```bash
# ~/.gitconfig에 추가

[alias]
  st = status
  co = checkout
  br = branch
  ci = commit
  unstage = reset HEAD --
  last = log -1 HEAD
  visual = log --oneline --graph --all --decorate
  amend = commit --amend --no-edit
```

사용 예시:
```bash
git st        # git status
git co main   # git checkout main
git visual    # 그래프로 히스토리 보기
```

### 글로벌 설정

```bash
# 사용자 정보 설정
git config --global user.name "홍길동"
git config --global user.email "hong@example.com"

# 기본 에디터 설정
git config --global core.editor "code --wait"

# 줄바꿈 처리 (Windows)
git config --global core.autocrlf true

# 줄바꿈 처리 (Mac/Linux)
git config --global core.autocrlf input

# 컬러 출력 활성화
git config --global color.ui auto
```

## 자주 하는 실수와 해결법

### 1. 잘못된 브랜치에 커밋

```bash
# 커밋을 다른 브랜치로 옮기기
git log  # 커밋 해시 확인
git checkout correct-branch
git cherry-pick <commit-hash>
git checkout wrong-branch
git reset --hard HEAD~1  # 잘못된 커밋 제거
```

### 2. Push한 커밋 되돌리기

```bash
# ⚠️ 주의: 협업 중인 브랜치에서는 사용 금지!
git revert <commit-hash>  # 안전한 방법

# 혼자 작업 중이라면
git reset --hard <commit-hash>
git push --force  # 위험!
```

### 3. .gitignore가 작동하지 않을 때

```bash
# 캐시 제거 후 다시 추가
git rm -r --cached .
git add .
git commit -m "chore: .gitignore 적용"
```

## Pull Request 체크리스트

PR을 올리기 전 확인사항:

- [ ] 코드가 정상적으로 동작하는가?
- [ ] 테스트를 추가했는가?
- [ ] 커밋 메시지가 규칙을 따르는가?
- [ ] 불필요한 파일이 포함되지 않았는가?
- [ ] 코드 스타일이 일관적인가?
- [ ] README나 문서를 업데이트했는가?

## 마치며

좋은 Git 워크플로우는 팀의 생산성을 크게 향상시킵니다. 처음에는 복잡해 보이지만, 꾸준히 사용하다 보면 자연스러워집니다.

### 추천 학습 자료

- [Learn Git Branching](https://learngitbranching.js.org/) - 인터랙티브 튜토리얼
- [Git 공식 문서](https://git-scm.com/doc)
- [Atlassian Git 튜토리얼](https://www.atlassian.com/git/tutorials)

Happy coding! 🚀
