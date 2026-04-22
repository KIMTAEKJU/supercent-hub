/**
 * Dev-only KV mock — `USE_MOCK_KV=1` 환경변수가 켜진 경우 `lib/kv.ts` 의
 * list 함수들이 실제 `@vercel/kv` 호출 대신 여기서 반환하는 시드 데이터를 사용한다.
 *
 * 목적:
 *   - Phase 1 UI 개발 중 실제 Vercel KV 연결 없이도 랜딩/카탈로그가 채워진 상태로 렌더되도록 지원.
 *   - Phase 3 E2E 시에는 env 를 빼 실 KV 경로로 자동 복귀.
 *
 * 주의: prod 에서 실수로 켜지지 않도록 kv.ts 에서 `process.env.USE_MOCK_KV === '1'` 한 가지 조건만 체크.
 */
import type { FeedbackRecord, PrototypeRecord, RequestRecord } from './kv'

export const MOCK_REQUESTS: RequestRecord[] = [
  {
    id: 'req-mock-1',
    problem: '광고 카피 변형 10개를 매번 수동 복붙',
    currentWay: '노션 템플릿 → Claude.ai 질문 → 수동 복사',
    expectedOutcome: '한 번에 카피 10개 + CSV 다운로드',
    examples: '입력: "초가성비 로션" → 출력: 톤별 카피 10개',
    status: 'ready',
    createdAt: '2026-04-21T09:00:00.000Z',
    requestedBy: 'marketing@supercent.io',
  },
  {
    id: 'req-mock-2',
    problem: '주간 리텐션 리포트 수작업 집계',
    currentWay: 'BigQuery 쿼리 복붙 + Google Sheets 수동 피벗',
    expectedOutcome: '코호트 주차별 리텐션 자동 시각화',
    examples: '입력: 게임ID 일자 → 출력: D1/D7/D30 리텐션 표',
    status: 'ready',
    createdAt: '2026-04-21T12:00:00.000Z',
    requestedBy: 'data@supercent.io',
  },
  {
    id: 'req-mock-3',
    problem: '캐릭터 아트 레퍼런스 일괄 태깅',
    currentWay: '이미지 열어보고 노션에 수기 입력',
    expectedOutcome: '이미지 업로드 → 자동 태그 3-5개',
    examples: '입력: 파일 PNG → 출력: ["chibi", "pastel", "cute"]',
    status: 'ready',
    createdAt: '2026-04-22T02:00:00.000Z',
    requestedBy: 'art@supercent.io',
  },
]

export const MOCK_PROTOTYPES: PrototypeRecord[] = [
  {
    id: 'req-mock-1',
    requestId: 'req-mock-1',
    title: '광고 카피 변형 생성기',
    description: '제품명을 넣으면 톤별 광고 카피 10개를 한 번에 생성하고 CSV로 내려준다.',
    url: 'https://example.vercel.app/tools/req-mock-1',
    branch: 'prototype/req-mock-1',
    tags: ['마케팅', '카피', 'CSV'],
    useCount: 14,
    positiveFeedbackCount: 4,
    createdAt: '2026-04-21T09:03:00.000Z',
  },
  {
    id: 'req-mock-2',
    requestId: 'req-mock-2',
    title: '주간 리텐션 리포트',
    description: '게임 ID 와 기간만 입력하면 D1/D7/D30 코호트 리텐션을 그려준다.',
    url: 'https://example.vercel.app/tools/req-mock-2',
    branch: 'prototype/req-mock-2',
    tags: ['데이터', '리포트'],
    useCount: 3,
    positiveFeedbackCount: 1,
    createdAt: '2026-04-21T12:03:00.000Z',
  },
  {
    id: 'req-mock-3',
    requestId: 'req-mock-3',
    title: '아트 레퍼런스 자동 태거',
    description: '이미지를 업로드하면 스타일/톤/소재 태그 3-5개를 자동 분류한다.',
    url: 'https://example.vercel.app/tools/req-mock-3',
    branch: 'prototype/req-mock-3',
    tags: ['아트', '태깅', '이미지'],
    useCount: 1,
    positiveFeedbackCount: 0,
    createdAt: '2026-04-22T02:03:00.000Z',
  },
]

export const MOCK_FEEDBACKS: FeedbackRecord[] = []

export function isMockEnabled(): boolean {
  return process.env.USE_MOCK_KV === '1'
}
