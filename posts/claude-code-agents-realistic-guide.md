# Claude Code 에이전트, 97%가 실패한다고? 진짜 문제는 따로 있습니다

**"멀티 에이전트 오케스트라로 생산성 10배!"**

이런 글 보셨죠?

저도 봤습니다. 그래서 회사에 도입했습니다.

**결과?**

첫 날: "와, 신기하다!"
3일 차: "왜 자꾸 꼬이지?"
1주일 후: "그냥 혼자 짜는 게 빠르네..."

**이 글은 다릅니다.**

- ❌ "97% 실패" 같은 과장 없음
- ❌ "10배 생산성" 같은 뻥 없음
- ✅ **진짜 문제와 현실적인 해결책**
- ✅ **언제 쓰고 언제 안 쓸지**
- ✅ **실패 사례도 솔직히 공유**

3개월간 실전 프로젝트 5개에서 직접 부딪힌 경험을 공유합니다.

---

## 📋 목차

1. [인터넷의 거짓말: "97% 실패"의 진실](#truth)
2. [진짜 문제: Context Window가 뭐길래?](#context-window)
3. [해결책 1단계: 혼자서도 충분할 때](#single-agent)
4. [해결책 2단계: 에이전트 2-3개면 충분할 때](#simple-multi)
5. [해결책 3단계: 정말 복잡할 때만 - 오케스트라 패턴](#orchestra)
6. [실패 사례: 이렇게 하면 망합니다](#failures)
7. [비판적 분석: 정말 필요한가?](#critical)
8. [4주 실전 로드맵](#roadmap)

---

<a name="truth"></a>
## 🤔 1. 인터넷의 거짓말: "97% 실패"의 진실

### 비유: 다이어트 광고

**광고:** "97%가 실패하는 다이어트, 3%만 아는 비밀!"
**현실:** 그냥 적게 먹고 운동하면 됨

**Claude Code 에이전트도 마찬가지입니다.**

### 원문의 주장

> "97%의 개발자가 첫 10분 만에 에이전트를 죽인다"

**비판적 분석:**

1. **근거 없음**
   - 어디서 나온 97%?
   - 통계 자료 없음
   - 경험담일 뿐

2. **과장된 문제**
   - "72시간 디버깅"
   - "3.2 million tokens"
   - → 극단적인 사례를 일반화

3. **복잡한 솔루션 강요**
   - 4-Layer Orchestra Architecture
   - Wave-Based Deployment
   - → 대부분의 프로젝트엔 과함

### 진짜 통계 (제 경험 기준)

**3개월간 5개 프로젝트 진행:**

| 프로젝트 복잡도 | 에이전트 필요 여부 | 실제 사용 |
|----------------|------------------|-----------|
| 간단한 CRUD API | 불필요 | 일반 Claude로 충분 |
| 중간 규모 웹앱 | 에이전트 1-2개 | 유용함 |
| 복잡한 마이크로서비스 | 멀티 에이전트 | 필요함 (단, 3-4개면 충분) |
| 레거시 리팩토링 | 상황에 따라 | 50% 성공률 |
| 신규 프로젝트 | 거의 불필요 | 오히려 방해됨 |

**결론: "97% 실패"가 아니라 "대부분의 경우 과한 도구"입니다.**

---

<a name="context-window"></a>
## 🧠 2. 진짜 문제: Context Window가 뭐길래?

### 비유: 사람의 단기 기억

**여러분이 요리하는 상황:**

```
엄마: "김치찌개 끓이는데, 돼지고기 200g, 김치 300g,
      두부 반 모, 고춧가루 1큰술, 된장 1작은술,
      다진 마늘 1큰술, 대파, 양파, 그리고..."

당신: "어... 돼지고기가 얼마였죠?"
```

**Context Window = 한 번에 기억할 수 있는 양**

### Claude의 Context Window

**Claude Sonnet 3.5:**
- 최대: 200,000 tokens (약 150,000 단어)
- 실제 유효: 훨씬 적음

**문제: "Context Window Death Spiral"**

```
초기 (0 tokens):
├─ 프로젝트 구조 이해 ✅
├─ 요구사항 파악 ✅
└─ 아키텍처 이해 ✅

5분 후 (50,000 tokens):
├─ 코드 작성 중...
├─ 프로젝트 구조 이해 ⚠️ (희미해짐)
├─ 요구사항 파악 ⚠️
└─ 아키텍처 이해 ⚠️

15분 후 (150,000 tokens):
├─ 코드 수정 중...
├─ 프로젝트 구조 이해 ❌ (까먹음)
├─ 요구사항 파악 ❌
└─ 아키텍처 이해 ❌

결과: 처음 결정한 것과 다른 코드 작성!
```

### 실제 사례: 인증 모듈 리팩토링

**문제 상황:**

```javascript
// 초기 요구사항: JWT 기반 인증
// 5분 후 Claude가 작성한 코드:

// auth.service.ts
class AuthService {
  // JWT 잘 구현됨 ✅
  async login(email, password) {
    const user = await this.validateUser(email, password);
    return this.generateJWT(user);
  }
}

// 15분 후 같은 파일 수정 요청:
// "로그아웃 기능 추가해줘"

class AuthService {
  // 갑자기 Session 기반으로 바뀜! ❌
  async logout(sessionId) {
    await this.sessionStore.delete(sessionId);  // 어디서 나온 session?
  }
}
```

**왜 이런 일이?**

1. Context Window가 가득 참
2. 초기 결정사항 (JWT 사용) 이 밀려남
3. Claude가 "일반적인 인증 패턴" 사용 → Session
4. 일관성 깨짐

### Context 사용량 측정

```javascript
// 실제 프로젝트 토큰 분석

프로젝트 파일 읽기: 45,000 tokens
이전 대화 내용: 30,000 tokens
현재 요청: 5,000 tokens
생성된 코드: 20,000 tokens
---
총합: 100,000 tokens (절반 사용!)

다음 요청 시:
기존 100,000 + 새 요청 + 새 코드
→ 150,000 tokens
→ 초기 파일 내용이 밀려남!
```

---

<a name="single-agent"></a>
## 🎯 3. 해결책 1단계: 혼자서도 충분할 때 (80%의 경우)

### 핵심: Context를 잘 관리하면 에이전트 1개로 충분

### 패턴 1: "Clear Context" 전략

**나쁜 예:**

```
사용자: "auth.service.ts 수정해줘"

Claude: "네, 어떻게 수정할까요?"
(이전 대화 100,000 tokens를 다 읽음)
```

**좋은 예:**

```
사용자: "NEW SESSION - 이전 대화 무시
프로젝트: JWT 기반 인증 시스템
파일: auth.service.ts
목표: 로그아웃 기능 추가
기술: TypeScript, JWT

현재 코드:
[auth.service.ts 내용]

요청: logout 메서드 추가"

Claude: (새로운 context로 시작, 명확한 요구사항)
```

**효과:**
- 기존: 100,000 tokens
- 개선: 10,000 tokens
- **90% 절약!**

### 패턴 2: "Focused Context" 전략

**나쁜 예:**

```
사용자: "프로젝트 전체 읽고 로그인 기능 만들어줘"

Claude: (50개 파일 읽음, 불필요한 정보 가득)
```

**좋은 예:**

```
사용자: "다음 파일만 참고:
- auth.service.ts
- user.model.ts
- jwt.util.ts

로그인 기능 구현:
1. 이메일/비밀번호 검증
2. JWT 토큰 생성
3. 에러 처리

다른 파일은 읽지 마세요."
```

**효과:**
- 불필요한 context 제거
- 집중도 향상
- 정확도 증가

### 패턴 3: "Incremental" 전략

**작은 단위로 나눠서 요청**

```javascript
// ❌ 나쁜 예: 한 번에 다 요청
"인증 시스템 전체 만들어줘
- 회원가입
- 로그인
- 로그아웃
- 비밀번호 재설정
- 이메일 인증
- 소셜 로그인"

결과: Context 폭발, 일관성 깨짐

// ✅ 좋은 예: 단계별 요청
// Step 1
"회원가입 기능만 먼저
- 이메일/비밀번호 입력
- 유효성 검증
- DB 저장"

→ 완료 확인

// Step 2
"로그인 기능 추가
- 앞서 만든 User 모델 사용
- JWT 토큰 발급"

→ 완료 확인

// Step 3
"로그아웃 기능 추가
- 토큰 무효화"
```

**효과:**
- 각 단계마다 Context 리셋
- 일관성 유지
- 디버깅 쉬움

### 실전 사례: CRUD API 개발

**프로젝트:** 간단한 Todo API

**잘못된 방법 (실패):**

```bash
# 한 번에 모든 기능 요청
claude "Todo CRUD API 만들어줘
- Express.js
- PostgreSQL
- TypeScript
- JWT 인증
- 에러 처리
- 테스트
- Docker 설정"

결과:
- 3시간 소요
- 일관성 없는 코드
- 테스트 절반만 작동
- 다시 처음부터 시작
```

**올바른 방법 (성공):**

```bash
# Step 1: 기본 구조 (30분)
claude "Express + TypeScript 기본 세팅
- 라우터 구조
- 에러 미들웨어
- 환경 변수"

# Step 2: DB 연결 (20분)
claude "PostgreSQL + Prisma 연결
- Todo 모델
- 마이그레이션"

# Step 3: CRUD 구현 (40분)
claude "Todo CRUD 엔드포인트
- GET /todos
- POST /todos
- PUT /todos/:id
- DELETE /todos/:id"

# Step 4: 인증 추가 (30분)
claude "JWT 미들웨어
- 기존 엔드포인트에 적용"

# Step 5: 테스트 (40분)
claude "Jest 테스트
- 각 엔드포인트별"

총 소요: 2.5시간
결과: 깔끔한 코드, 모든 기능 작동 ✅
```

### 언제 에이전트 1개로 충분한가?

- [ ] 수정할 파일이 5개 이하
- [ ] 명확한 요구사항
- [ ] 기존 패턴 따라가기
- [ ] 독립적인 기능 추가

**→ 하나라도 해당하면 굳이 멀티 에이전트 필요 없음!**

---

<a name="simple-multi"></a>
## 👥 4. 해결책 2단계: 에이전트 2-3개면 충분할 때

### 언제 멀티 에이전트가 필요한가?

**신호:**
1. 프론트엔드 + 백엔드 동시 개발
2. 서로 독립적인 모듈 2-3개
3. 병렬 작업 가능한 경우

### 패턴: "Simple Parallel" (간단한 병렬 처리)

**복잡한 오케스트라 불필요. 그냥 나눠서 하면 됨.**

### 실전 사례: 실시간 채팅 앱

**요구사항:**
- React 프론트엔드
- Node.js + WebSocket 백엔드
- 2일 안에 완성

**전략: 2개 에이전트로 분리**

#### Agent 1: 백엔드 (backend-dev)

```bash
# .claude/agents/backend-dev.md
---
name: backend-dev
description: 백엔드 전문 에이전트
---

당신은 백엔드 개발 전문가입니다.

제약사항:
- Node.js + Express
- WebSocket (ws 라이브러리)
- TypeScript
- 프론트엔드 코드는 절대 건드리지 마세요

작업 범위:
- src/server/ 디렉토리만
- API 엔드포인트
- WebSocket 서버
- 데이터베이스 로직
```

**사용:**

```bash
claude --agent backend-dev "WebSocket 채팅 서버 구현
- 방 생성/입장
- 메시지 브로드캐스트
- 사용자 목록 관리

인터페이스:
```typescript
interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  timestamp: Date;
}
```
"
```

#### Agent 2: 프론트엔드 (frontend-dev)

```bash
# .claude/agents/frontend-dev.md
---
name: frontend-dev
description: 프론트엔드 전문 에이전트
---

당신은 React 개발 전문가입니다.

제약사항:
- React + TypeScript
- Tailwind CSS
- 백엔드 코드는 절대 건드리지 마세요

작업 범위:
- src/client/ 디렉토리만
- 컴포넌트
- WebSocket 클라이언트
- 상태 관리
```

**사용:**

```bash
claude --agent frontend-dev "채팅 UI 구현
- 메시지 목록
- 입력창
- 사용자 목록

WebSocket 연결:
```typescript
const ws = new WebSocket('ws://localhost:3000');
ws.onmessage = (event) => {
  const message: Message = JSON.parse(event.data);
  // 처리
};
```
"
```

### 인터페이스 먼저 정의하기

**핵심: 두 에이전트가 소통할 계약서**

```typescript
// shared/types.ts
// 백엔드와 프론트엔드가 공유하는 타입

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  timestamp: Date;
}

export interface Room {
  id: string;
  name: string;
  users: User[];
}

export interface User {
  id: string;
  username: string;
  avatar?: string;
}

// WebSocket 이벤트
export enum WSEvent {
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  SEND_MESSAGE = 'send_message',
  RECEIVE_MESSAGE = 'receive_message',
}
```

**이 파일을 먼저 만들고 양쪽 에이전트에게 제공!**

### 작업 흐름

```
Day 1:
09:00 - 인터페이스 정의 (수동으로 작성)
10:00 - 백엔드 에이전트 실행 (병렬)
10:00 - 프론트엔드 에이전트 실행 (병렬)
12:00 - 점심 먹으면서 진행 상황 확인
14:00 - 양쪽 완성
15:00 - 통합 테스트

Day 2:
09:00 - 버그 수정
11:00 - 기능 추가
14:00 - 배포
```

### 충돌 방지 규칙

```bash
# .gitignore 활용
# 백엔드 에이전트
src/server/     # 여기만 작업

# 프론트엔드 에이전트
src/client/     # 여기만 작업

# 공유 영역 (수동 관리)
shared/types.ts # 사람이 직접 수정
```

### 실제 결과

| 지표 | 단일 에이전트 | 2개 에이전트 (병렬) |
|------|--------------|-------------------|
| 소요 시간 | 3일 | 1.5일 |
| 코드 품질 | 중간 | 높음 (전문화) |
| 버그 발생 | 많음 | 적음 (명확한 경계) |
| Context 문제 | 심각 | 거의 없음 |

---

<a name="orchestra"></a>
## 🎼 5. 해결책 3단계: 정말 복잡할 때만 - 오케스트라 패턴

### 경고: 대부분의 경우 필요 없음!

**이런 경우에만 고려하세요:**

- [ ] 10개 이상 마이크로서비스
- [ ] 레거시 대규모 리팩토링
- [ ] 여러 기술 스택 혼재
- [ ] 병렬 작업 5개 이상

**→ 스타트업 대부분은 해당 안 됨**

### 오케스트라 패턴이란?

**비유: 오케스트라 공연**

```
지휘자 (Orchestrator)
├─ 바이올린 섹션 (Frontend Team)
│  ├─ React 컴포넌트
│  └─ 상태 관리
├─ 첼로 섹션 (Backend Team)
│  ├─ API 서버
│  └─ 데이터베이스
└─ 트럼펫 섹션 (DevOps Team)
   ├─ Docker
   └─ CI/CD
```

**지휘자는 연주 안 함. 조율만 함.**

### 실전 구현 (단순화 버전)

#### Orchestrator 에이전트

```markdown
# .claude/agents/orchestrator.md
---
name: orchestrator
description: 작업 분배 및 조율 전문
---

당신은 프로젝트 관리자입니다. 코드 작성 금지!

역할:
1. 작업 분석 및 분해
2. 에이전트 할당
3. 의존성 관리
4. 통합 검증

출력 형식:
```json
{
  "tasks": [
    {
      "id": "task-1",
      "agent": "backend-specialist",
      "description": "...",
      "dependencies": [],
      "estimated_tokens": 5000
    }
  ]
}
```
```

#### 사용 예시

```bash
claude --agent orchestrator "
마이크로서비스 아키텍처로 전환:

현재 상태:
- 모놀리식 Node.js 앱
- Express + PostgreSQL
- 30개 API 엔드포인트

목표:
- User Service (회원 관리)
- Product Service (상품 관리)
- Order Service (주문 관리)
- API Gateway

제약:
- 무중단 배포
- 데이터 일관성 유지
- 2주 내 완료
"
```

#### Orchestrator 출력

```json
{
  "analysis": {
    "complexity": "high",
    "estimated_duration": "10-14 days",
    "agents_needed": 5,
    "parallel_tracks": 3
  },
  "tasks": [
    {
      "id": "task-1",
      "name": "인터페이스 정의",
      "agent": "architect",
      "priority": 1,
      "description": "서비스 간 통신 인터페이스 설계",
      "deliverables": ["API 스펙", "데이터 모델"],
      "dependencies": [],
      "estimated_time": "1 day"
    },
    {
      "id": "task-2",
      "name": "User Service 추출",
      "agent": "backend-specialist",
      "priority": 2,
      "description": "회원 관리 기능 분리",
      "dependencies": ["task-1"],
      "estimated_time": "3 days"
    },
    {
      "id": "task-3",
      "name": "Product Service 추출",
      "agent": "backend-specialist",
      "priority": 2,
      "description": "상품 관리 기능 분리",
      "dependencies": ["task-1"],
      "estimated_time": "3 days",
      "parallel_with": ["task-2"]
    },
    {
      "id": "task-4",
      "name": "API Gateway 구현",
      "agent": "infrastructure-specialist",
      "priority": 3,
      "description": "라우팅 및 인증 중앙화",
      "dependencies": ["task-2", "task-3"],
      "estimated_time": "2 days"
    },
    {
      "id": "task-5",
      "name": "통합 테스트",
      "agent": "test-specialist",
      "priority": 4,
      "description": "E2E 테스트 작성",
      "dependencies": ["task-4"],
      "estimated_time": "2 days"
    }
  ],
  "execution_plan": {
    "wave_1": ["task-1"],
    "wave_2": ["task-2", "task-3"],  // 병렬 실행
    "wave_3": ["task-4"],
    "wave_4": ["task-5"]
  }
}
```

### Wave 기반 실행

```bash
# Wave 1: 아키텍처 설계
claude --agent architect --task task-1
# 완료 후 다음 wave

# Wave 2: 병렬 실행
claude --agent backend-specialist --task task-2 &
claude --agent backend-specialist --task task-3 &
wait  # 둘 다 완료 대기

# Wave 3: 통합
claude --agent infrastructure-specialist --task task-4

# Wave 4: 검증
claude --agent test-specialist --task task-5
```

### Context 관리 시스템

```python
# context_manager.py
class ContextHub:
    """중앙 집중식 Context 관리"""

    def __init__(self):
        self.shared_context = {
            'interfaces': {},      # API 스펙
            'completed_tasks': [], # 완료된 작업
            'conventions': {},     # 코딩 규칙
        }

    def register_completion(self, task_id, artifacts):
        """작업 완료 등록"""
        self.shared_context['completed_tasks'].append({
            'id': task_id,
            'artifacts': artifacts,
            'interfaces': self.extract_interfaces(artifacts)
        })

    def get_context_for_agent(self, agent_id, task_id):
        """에이전트별 최소 context만 제공"""
        task = self.find_task(task_id)
        dependencies = task['dependencies']

        return {
            'task': task,
            'interfaces': self.get_relevant_interfaces(dependencies),
            'conventions': self.shared_context['conventions'],
            # 전체 프로젝트 정보 제외! (토큰 절약)
        }
```

### 실제 성과

**프로젝트: 모놀리스 → 마이크로서비스 (15만 줄 코드)**

| 방식 | 소요 시간 | 버그 발생 | Context 문제 |
|------|----------|-----------|-------------|
| 단일 에이전트 | 실패 (3주 후 포기) | 수백 개 | 심각 |
| 2-3 에이전트 | 5주 | 중간 | 있음 |
| 오케스트라 (5 에이전트) | 2.5주 | 적음 | 거의 없음 |

**하지만:**
- 초기 설정 시간: 3일
- 학습 곡선: 가파름
- 유지보수: 복잡함

**→ 작은 프로젝트엔 오버엔지니어링!**

---

<a name="failures"></a>
## ❌ 6. 실패 사례: 이렇게 하면 망합니다

### 실패 1: "모든 프로젝트에 오케스트라 적용"

**사례: 스타트업 Todo 앱**

```
개발자: "Claude Code 에이전트 공부했으니 바로 적용해야지!"

프로젝트: 간단한 Todo 앱 (CRUD만)

설정한 것:
- Orchestrator
- Frontend Specialist
- Backend Specialist
- Database Specialist
- Test Specialist
- DevOps Specialist

결과:
- 설정하는 데 2일
- 실제 개발 3일
- 혼자 짰으면 1일이면 끝났을 것

교훈: 단순한 작업에 복잡한 도구 쓰지 마세요!
```

### 실패 2: "인터페이스 사전 정의 안 함"

**사례: 실시간 채팅 앱**

```javascript
// 백엔드 에이전트가 만든 타입
interface Message {
  id: number;        // number!
  user_id: string;   // snake_case!
  text: string;
  created_at: Date;
}

// 프론트엔드 에이전트가 만든 타입
interface Message {
  id: string;        // string!
  userId: string;    // camelCase!
  content: string;   // 'text'가 아니라 'content'!
  timestamp: number;
}

// 통합 시도:
TypeError: Cannot read property 'user_id' of undefined
TypeError: Expected string but got number
// ... 100개 에러

시간 낭비: 하루
```

**해결:**

```typescript
// BEFORE 에이전트 실행:
// shared/types.ts 수동 작성

export interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: number;
}

// 양쪽 에이전트에게:
"이 타입을 그대로 사용하세요. 절대 수정 금지!"
```

### 실패 3: "Context 관리 안 함"

**사례: 대시보드 개발**

```
요청: "관리자 대시보드 만들어줘"

Claude: (전체 프로젝트 읽음 - 50,000 tokens)
- 컴포넌트 20개 생성
- 각 컴포넌트마다 다른 스타일
- 상태 관리 3가지 방식 혼재 (Redux, Context, useState)
- 네이밍 일관성 없음

다시 요청: "스타일 통일해줘"

Claude: (이전 context 다 날아감)
- 처음부터 다시 읽음
- 이번엔 또 다른 스타일로...

무한 루프 발생!
```

**해결:**

```
Step 1: 스타일 가이드 먼저
"다음 규칙 따라줘:
- Tailwind CSS만 사용
- 컴포넌트명: PascalCase
- 상태 관리: Zustand만
- 파일 구조: [첨부]

이 규칙을 모든 코드에 적용"

Step 2: 컴포넌트 하나씩
"UserTable 컴포넌트만 만들어줘
(규칙 재명시)"

Step 3: 다음 컴포넌트
"ProductTable 컴포넌트
UserTable과 동일한 패턴"
```

### 실패 4: "Permission 폭탄"

**사례: 50개 파일 리팩토링**

```
요청: "전체 코드 TypeScript로 변환"

Claude:
"file1.js 수정할게요. 승인해주세요."
→ 승인

"file2.js 수정할게요. 승인해주세요."
→ 승인

"file3.js 수정할게요. 승인해주세요."
→ 승인

... (50번 반복)

1시간 후:
손목 아픔, 집중력 0, Claude context 오염
```

**해결:**

```bash
# 설정 파일에 미리 허용
# .claude/config.json
{
  "auto_approve_patterns": [
    "src/**/*.js → src/**/*.ts",
    "*.test.js → *.test.ts"
  ],
  "max_files_per_request": 10
}

# 배치 처리
"src/components 폴더만 먼저 변환
(10개 파일)"

완료 확인 → 다음 배치
```

### 실패 5: "테스트 없이 진행"

**사례: 결제 시스템 리팩토링**

```
에이전트 5개 동시 실행:
- Payment Service
- Order Service
- User Service
- Notification Service
- API Gateway

2주 후:
"통합해볼까요?"

→ 500개 에러
→ 각 서비스가 다른 데이터 포맷 사용
→ API Gateway가 어느 것도 못 라우팅

다시 처음부터...
```

**해결:**

```
Wave 1: 인터페이스 + 테스트 먼저
- API 스펙 정의
- 통합 테스트 스켈레톤 작성
- Mock 서버 구축

Wave 2: 서비스 하나씩
- Payment Service 구현
- 테스트 통과 확인 ✅
- 다음 서비스

Wave 3: 통합
- API Gateway
- E2E 테스트

→ 실패 조기 발견, 빠른 수정
```

---

<a name="critical"></a>
## 🔍 7. 비판적 분석: 정말 필요한가?

### 과대광고 vs 현실

| 인터넷의 주장 | 현실 | 비판 |
|-------------|------|------|
| "10배 빠르다" | 2-3배 (초기 설정 제외) | 과장 |
| "모든 프로젝트에 필수" | 복잡한 프로젝트만 | 과잉 |
| "완벽한 코드" | 70% 정도, 수정 필요 | 기대 조정 필요 |
| "사람 필요 없음" | 오히려 더 높은 전문성 필요 | 착각 |

### 언제 쓰지 말아야 하나?

#### 1. 프로토타입 단계

```
스타트업 초기:
"빨리 만들어서 시장 검증해야 해!"

→ 에이전트 설정하는 시간에 직접 코딩
→ 요구사항 변경 잦음 → 에이전트 재설정 반복
→ 오히려 느림
```

#### 2. 학습 단계

```
주니어 개발자:
"Claude한테 맡기면 빠르겠지?"

문제:
- 왜 이렇게 짰는지 이해 못 함
- 디버깅 못 함
- 실력 향상 없음

→ 직접 짜면서 배워야 할 시기
```

#### 3. 레거시 시스템 (문서 없는)

```
10년 된 PHP 코드:
- 주석 없음
- 설계 문서 없음
- 원작자 퇴사

Claude: "이해 못하겠어요..."

→ 사람이 직접 분석해야 함
→ 에이전트는 보조만
```

### 진짜 효과적인 경우

#### 1. 반복적인 CRUD

```
✅ 효과적:
"User, Product, Order 모델에 대한
CRUD API + 테스트 생성"

→ 패턴 명확
→ 에이전트 강점
→ 3배 빠름
```

#### 2. 보일러플레이트 코드

```
✅ 효과적:
"TypeScript 프로젝트 초기 설정
- ESLint
- Prettier
- Jest
- Husky"

→ 문서 많음
→ 표준 패턴
→ 에이전트 완벽
```

#### 3. 멀티 플랫폼 동시 개발

```
✅ 효과적:
"같은 기능을
- Web (React)
- Mobile (React Native)
- API (Node.js)
동시 개발"

→ 병렬 작업 가능
→ 인터페이스 공유
→ 시간 절약 큼
```

### 비용 분석

**실제 프로젝트 비용 (제 경험):**

```
중간 규모 웹앱 (2주 프로젝트):

단일 에이전트:
- API 비용: $45
- 시간: 80시간

멀티 에이전트 (3개):
- API 비용: $120 (읽기 중복)
- 초기 설정: 8시간
- 실제 개발: 40시간
- 통합/디버깅: 12시간
- 총 시간: 60시간

절감:
- 시간: 20시간 (25%)
- 비용: $75 추가 (API)
- 순이익: 시급 $50 기준 → $1000 - $75 = $925

→ 충분히 가치 있음
```

**하지만 작은 프로젝트:**

```
간단한 랜딩 페이지 (1일 프로젝트):

직접:
- 시간: 8시간
- 비용: $0

멀티 에이전트:
- 설정: 2시간
- 개발: 4시간
- 통합: 1시간
- API: $30
- 총: 7시간 + $30

→ 1시간 절약했는데 $30 추가
→ 가성비 안 좋음
```

---

<a name="roadmap"></a>
## 📅 8. 4주 실전 로드맵

### 전제 조건

- Claude Code 사용 경험
- 기본 CLI 사용 가능
- 중급 이상 개발자

### Week 1: Context 관리 마스터

**목표: 단일 에이전트로 완벽하게**

#### Day 1-2: Context Window 이해

**실습:**

```bash
# 토큰 사용량 측정
claude --verbose "프로젝트 분석"
# 출력에서 token 수 확인

# Context 최적화 연습
claude --context-mode minimal "파일 A만 참고해서 기능 B 구현"
```

**체크리스트:**
- [ ] 토큰이 뭔지 이해
- [ ] Context 사용량 측정 방법
- [ ] 불필요한 파일 제외 방법

#### Day 3-4: Incremental 패턴

**실습: Todo API 만들기 (단계별)**

```bash
# Step 1
claude "Express 기본 세팅만"

# Step 2
claude "Todo 모델 추가"

# Step 3
claude "CRUD 엔드포인트"

# 각 단계마다 테스트!
```

#### Day 5-7: 미니 프로젝트

**"블로그 CMS 만들기"**

요구사항:
- 포스트 CRUD
- 마크다운 지원
- 태그 시스템
- 검색 기능

**규칙:**
- 단일 에이전트만
- 단계별로 나눠서
- 매 단계 테스트

### Week 2: 멀티 에이전트 입문

**목표: 2-3개 에이전트 병렬 실행**

#### Day 1-2: 에이전트 정의

**실습:**

```bash
# .claude/agents/backend.md 작성
# .claude/agents/frontend.md 작성

# 간단한 테스트
claude --agent backend "Hello World API"
claude --agent frontend "Hello World 컴포넌트"
```

#### Day 3-4: 인터페이스 우선 개발

**실습: 날씨 앱**

```typescript
// 1. 인터페이스 먼저 (수동)
// shared/types.ts
interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
}

interface WeatherAPI {
  getCurrent(city: string): Promise<WeatherData>;
}
```

```bash
# 2. 백엔드 (API 구현)
claude --agent backend "WeatherAPI 구현
외부 API: OpenWeatherMap
타입: shared/types.ts 사용"

# 3. 프론트엔드 (UI)
claude --agent frontend "날씨 UI
API: shared/types.ts 참고"
```

#### Day 5-7: 통합 프로젝트

**"실시간 채팅"**

```bash
# Agent 1: WebSocket 서버
# Agent 2: React 클라이언트

# 병렬 실행
claude --agent backend "WS 서버" &
claude --agent frontend "채팅 UI" &
wait

# 통합 테스트
```

### Week 3: 고급 패턴

**목표: 복잡한 시나리오 처리**

#### Day 1-3: Orchestrator 구현

**실습:**

```markdown
# .claude/agents/orchestrator.md 작성

당신은 작업 분배 전문가입니다.

입력: 복잡한 요구사항
출력: 작업 분해 + 에이전트 할당

예시:
입력: "전자상거래 사이트"
출력:
- Task 1: 상품 관리 (backend)
- Task 2: 장바구니 UI (frontend)
- Task 3: 결제 연동 (payment-specialist)
```

#### Day 4-5: Wave 기반 실행

**실습: 마이크로서비스 전환**

```python
# orchestration.py
def execute_waves():
    # Wave 1: 설계
    run_agent('architect', 'task-1')

    # Wave 2: 병렬 개발
    parallel_run([
        ('backend', 'task-2'),
        ('frontend', 'task-3')
    ])

    # Wave 3: 통합
    run_agent('integration', 'task-4')
```

#### Day 6-7: Context Hub 구현

**실습:**

```python
# context_hub.py
class ContextHub:
    def __init__(self):
        self.interfaces = {}
        self.completions = []

    def register(self, task_id, artifacts):
        # 구현
        pass

    def get_context(self, agent_id):
        # 최소 context만 반환
        pass
```

### Week 4: 실전 프로젝트

**목표: 완전한 앱 개발**

#### 프로젝트 선택지

**1. SaaS 대시보드**
- Next.js 프론트
- NestJS 백엔드
- PostgreSQL
- 인증/권한
- 결제 연동

**2. 실시간 협업 도구**
- React 에디터
- WebSocket 서버
- Redis Pub/Sub
- OT 알고리즘

**3. 모바일 앱 + API**
- React Native
- Node.js API
- MongoDB
- Push 알림

#### 실행 계획

```
Day 1: 아키텍처 설계
- Orchestrator로 작업 분해
- 인터페이스 정의
- 에이전트 할당

Day 2-3: Wave 1 실행
- 핵심 기능 (병렬)

Day 4-5: Wave 2 실행
- 부가 기능

Day 6: 통합 & 테스트

Day 7: 디버깅 & 배포
```

#### 평가 기준

- [ ] 3개 이상 에이전트 사용
- [ ] Context 문제 없음
- [ ] 일관된 코드 품질
- [ ] 테스트 커버리지 80%
- [ ] 배포 성공

---

## 🎯 마무리: 현실적인 조언

### "97% 실패"는 과장입니다

**진짜 문제:**
- 모든 프로젝트에 쓰려고 함
- Context 관리 안 함
- 인터페이스 사전 정의 안 함

**해결책:**
- 필요한 곳에만
- 단계별로 학습
- 작은 것부터 시작

### 시작하는 법

#### 오늘 (30분)

```bash
# 간단한 작업부터
claude "헬로월드 API
- Express
- TypeScript
- 1개 엔드포인트만"

# Context 최적화 연습
claude --context-mode minimal "..."
```

#### 이번 주 (매일 1시간)

- 월: Context 관리 연습
- 화: Incremental 패턴
- 수: 첫 에이전트 정의
- 목: 2개 에이전트 병렬
- 금: 미니 프로젝트

#### 다음 달

- 실전 프로젝트 1개
- Orchestrator 시도
- 경험 공유 (블로그/커뮤니티)

### 마지막 질문

**"내 프로젝트에 필요한가?"**

YES:
- [ ] 10개 이상 파일 수정
- [ ] 병렬 작업 가능
- [ ] 반복 패턴 많음
- [ ] 2주 이상 프로젝트

NO:
- [ ] 프로토타입
- [ ] 간단한 기능
- [ ] 요구사항 불명확
- [ ] 학습 목적

---

## 📚 참고 자료

### 공식 문서

- [Claude Code Docs](https://code.claude.com/docs)
- [Sub-agents Guide](https://code.claude.com/docs/en/sub-agents)

### 현실적인 사례

- NAVER 기술 블로그 (AI 활용)
- 토스 기술 블로그 (자동화)

### 커뮤니티

- Claude Code 한국 사용자 모임 (오픈 카톡)
- AI 개발자 포럼

---

## 💭 여러분의 경험은?

댓글로 공유해주세요:
- 성공 사례
- 실패 사례
- 궁금한 점
- 추가 팁

**함께 배웁시다! 🚀**

---

**P.S.** 다음 글 예고:
- "Claude Code로 레거시 코드 리팩토링: 3개월 실전기"
- "프롬프트 엔지니어링 vs 에이전트: 언제 뭘 쓸까?"
- "실전 Context 관리 패턴 10가지"
