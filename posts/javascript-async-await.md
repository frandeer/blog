# JavaScript Async/Await 완벽 가이드

비동기 프로그래밍은 현대 JavaScript 개발의 핵심입니다. 오늘은 `async/await`를 완벽하게 이해해봅시다.

## 비동기 프로그래밍이란?

JavaScript는 단일 스레드로 동작하지만, 비동기 작업을 통해 여러 작업을 효율적으로 처리할 수 있습니다.

### 예전 방식: Callback Hell

```javascript
// ❌ Callback Hell의 예
getUserData(userId, function(user) {
  getPosts(user.id, function(posts) {
    getComments(posts[0].id, function(comments) {
      console.log(comments);
      // 계속 중첩...
    });
  });
});
```

### Promise의 등장

```javascript
// ✅ Promise 체이닝
getUserData(userId)
  .then(user => getPosts(user.id))
  .then(posts => getComments(posts[0].id))
  .then(comments => console.log(comments))
  .catch(error => console.error(error));
```

## Async/Await: 더 나은 방법

`async/await`는 Promise를 더 읽기 쉽게 만들어줍니다.

### 기본 문법

```javascript
// 함수 앞에 async 키워드
async function fetchUserData(userId) {
  // await는 async 함수 내부에서만 사용 가능
  const user = await getUserData(userId);
  const posts = await getPosts(user.id);
  const comments = await getComments(posts[0].id);

  return comments;
}
```

### 에러 처리

```javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('데이터를 불러오는 중 오류 발생:', error);
    throw error;
  }
}
```

## 실전 예제

### 1. 병렬 처리

```javascript
// ❌ 순차 실행 (느림)
async function sequential() {
  const user1 = await getUser(1);  // 1초 대기
  const user2 = await getUser(2);  // 1초 대기
  // 총 2초
}

// ✅ 병렬 실행 (빠름)
async function parallel() {
  const [user1, user2] = await Promise.all([
    getUser(1),
    getUser(2)
  ]);
  // 총 1초
}
```

### 2. 실제 API 호출 예제

```javascript
async function fetchGitHubUser(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const userData = await response.json();

    return {
      name: userData.name,
      repos: userData.public_repos,
      followers: userData.followers
    };
  } catch (error) {
    console.error('사용자 정보를 가져올 수 없습니다:', error);
    return null;
  }
}

// 사용
const user = await fetchGitHubUser('octocat');
console.log(user);
```

### 3. 여러 비동기 작업 처리

```javascript
async function loadPageData() {
  try {
    // 병렬로 여러 데이터 불러오기
    const [user, posts, settings] = await Promise.all([
      fetchUser(),
      fetchPosts(),
      fetchSettings()
    ]);

    // 데이터를 모두 받은 후 페이지 렌더링
    renderPage({ user, posts, settings });
  } catch (error) {
    showErrorMessage('페이지를 불러올 수 없습니다');
  }
}
```

## 주의사항

### 1. await는 async 함수 안에서만

```javascript
// ❌ 에러!
function regularFunction() {
  const data = await fetchData(); // SyntaxError
}

// ✅ 올바름
async function asyncFunction() {
  const data = await fetchData();
}
```

### 2. Top-level await (최신 기능)

```javascript
// 모듈의 최상위에서 사용 가능 (ES2022+)
const data = await fetchData();
```

### 3. 에러 처리는 필수

```javascript
async function safeFunction() {
  try {
    const data = await riskyOperation();
    return data;
  } catch (error) {
    // 에러 처리 로직
    return defaultValue;
  }
}
```

## 성능 최적화 팁

### Promise.all vs 순차 실행

```javascript
// 상황에 맞게 선택
async function smartFetch() {
  // 독립적인 작업들 → 병렬 처리
  const [users, posts] = await Promise.all([
    fetchUsers(),
    fetchPosts()
  ]);

  // 의존적인 작업들 → 순차 처리
  const user = await fetchUser(userId);
  const userPosts = await fetchUserPosts(user.id);
}
```

## 마치며

`async/await`는 비동기 코드를 동기 코드처럼 읽기 쉽게 만들어주는 강력한 도구입니다. 하지만 언제 병렬로 처리하고 언제 순차로 처리할지 잘 판단하는 것이 중요합니다.

### 핵심 요약

- `async` 함수는 항상 Promise를 반환
- `await`는 Promise가 완료될 때까지 대기
- 에러 처리는 `try/catch` 사용
- 독립적인 작업은 `Promise.all`로 병렬 처리

다음 포스트에서는 CSS 레이아웃에 대해 알아보겠습니다!
