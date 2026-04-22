# supercent-hub

사내 AI 도구 요청 Hub — 요청 폼 → Claude Code Routine 자동 프로토타입 생성 → 카탈로그 등록 E2E 파이프라인.

## 배경

슈퍼센트 AI 과제 제출용 프로젝트입니다. 설계문서에 따라 Next.js 15 (App Router) + Tailwind + shadcn/ui + Vercel KV 스택으로 구현합니다.

## Getting Started

```bash
npm install
cp .env.example .env.local   # 환경변수 채우기
npm run dev
```

`http://localhost:3000` 접속.

## 환경변수

`.env.example` 참고. 주요 키:

- `ROUTINE_TRIGGER_URL` — Claude Code Routines fire 엔드포인트
- `ROUTINE_API_TOKEN` — Bearer 토큰 (`sk-ant-oat01-*`)
- `VERCEL_DEPLOY_HOOK` — 브랜치 프리뷰 배포 훅
- `GITHUB_OWNER`, `GITHUB_REPO` — 프로토타입 커밋 대상 레포

## 스택

- Next.js 15 (App Router, Server Actions)
- Tailwind CSS v4
- shadcn/ui
- Vercel KV (요청·프로토타입·피드백 3 스키마)
- Vitest + Testing Library

## 라이선스 / 이용 제한

본 저장소는 **슈퍼센트 AI 과제 제출용**으로 공개되어 있습니다. 저작자의 사전 서면 동의 없이 소스 코드의 무단 복제·재배포·2차 저작물 작성을 금합니다.
