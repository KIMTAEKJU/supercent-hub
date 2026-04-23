# AI Tool Request Hub — User Flow

요청 제출부터 자동 생성·배포된 프로토타입 실행까지의 사용자 여정.

```mermaid
flowchart TD
    A[랜딩 페이지<br/>/] -->|'도구 요청하기' CTA| B[요청 폼<br/>/request]
    B -->|4필드 입력<br/>problem / currentWay / expectedOutcome / examples| C[Server Action<br/>submitRequest]
    C -->|KV 선기록| D["req:&lt;id&gt; status=pending"]
    C -->|Routine fire| E[generate-prototype<br/>fire-and-forget]
    D --> F[대기 화면<br/>/submitting/&lt;id&gt;]
    F -->|3초 간격 polling| G{상태 확인<br/>/api/proto/&lt;id&gt;/status}
    E -->|1 해석 → 2 생성 → 3 Git 커밋| H[GitHub<br/>claude/prototype-&lt;id&gt;]
    H -->|자동 트리거| I[Vercel Preview Build]
    I -->|빌드 완료| J[Vercel deployment.state=READY]
    E -->|KV upsert| K["proto:&lt;id&gt; + idx:prototypes<br/>req.status=ready"]
    K --> G
    J --> G
    G -->|ready + Vercel READY| L[카탈로그 자동 갱신<br/>/catalog]
    G -->|failed| M[에러 배너 + 재시도 CTA]
    L --> N[프로토타입 상세<br/>/prototype/&lt;id&gt;]
    N -->|'프로토타입 열기'| O[실제 배포된 Next.js 도구 실행<br/>/tools/&lt;id&gt;]
    O -->|피드백 제출| P["fb:&lt;id&gt; 수집"]
    P -.-> Q[승격 후보 배지<br/>useCount ≥ 10 또는<br/>positiveFeedback ≥ 3]
    Q -.-> L

    classDef user fill:#fef3c7,stroke:#f59e0b,color:#000
    classDef server fill:#e0e7ff,stroke:#6366f1,color:#000
    classDef external fill:#d1fae5,stroke:#10b981,color:#000
    classDef terminal fill:#fee2e2,stroke:#ef4444,color:#000

    class A,B,F,L,N,O user
    class C,D,G,K server
    class E,H,I,J external
    class M terminal
```

## 범례

- 🟡 **사용자 여정** — 브라우저에서 실제로 방문하는 화면
- 🟣 **Hub 서버 로직** — Next.js Server Action + API Route + KV 조작
- 🟢 **외부 인프라** — Claude Code Routine · GitHub REST · Vercel Deployment
- 🔴 **실패 경로** — 터미널 상태

## 핵심 결정 포인트

1. **KV 선기록 → fire-and-forget**: Routine 응답을 기다리지 않고 즉시 대기 화면 렌더
2. **이중 완료 조건**: KV `ready` + Vercel `deployment.state=READY` 둘 다 확인해야 "열기" 가능 (30-60초 빌드 갭 커버)
3. **점선 루프**: 피드백 누적이 임계 넘으면 카탈로그의 카드에 "승격 후보" 배지로 반영 (비동기 집계)
