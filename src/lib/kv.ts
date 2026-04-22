/**
 * Phase 1 Task 5 — Vercel KV 스키마 헬퍼.
 *
 * 역할: Hub 웹앱 ↔ generate-prototype Routine 사이 "메시지 버스".
 *   - Routine 은 fire-and-forget 으로 완료 신호를 주지 않는다 (부록 B 참조).
 *   - 따라서 Hub 는 KV 에 쓰인 status 를 폴링해서 완료를 감지한다.
 *   - 또한 Task 10 서버 액션은 requestId 를 선기록해 /fire 재호출 시 idempotent 하게 skip 한다.
 *
 * 키 스키마 (설계문서 §5 / §6):
 *   - req:<id>            → RequestRecord JSON
 *   - proto:<id>          → PrototypeRecord JSON (id === requestId 로 정렬)
 *   - fb:<id>             → FeedbackRecord JSON
 *   - idx:requests        → Set<requestId>  (listRequests 용)
 *   - idx:prototypes      → Set<prototypeId> (listPrototypes 용)
 *   - idx:fb:<protoId>    → Set<feedbackId>  (listFeedbacks 필터용)
 *
 * 승격 임계치 (설계문서 §2 / §11): 누적 사용 10회 OR 긍정 피드백 3건.
 *
 * 테스트 전략: 이 모듈은 최상단에서 `@vercel/kv` 를 import 한다. 테스트 파일은
 * `vi.mock('@vercel/kv', ...)` 를 파일 맨 위에 선언해 in-memory fake 로 치환한다
 * (vitest 가 import 이전에 hoist). 실제 KV 연결은 Phase 3 에서 E2E 로 검증.
 */
import { kv } from '@vercel/kv'
import { z } from 'zod'

import {
  MOCK_FEEDBACKS,
  MOCK_PROTOTYPES,
  MOCK_REQUESTS,
  isMockEnabled,
} from './kv-mock'

// --- Zod 스키마 (런타임 validation + 타입 추론) ---

export const RequestSchema = z.object({
  id: z.string().min(1),
  problem: z.string().min(1),
  currentWay: z.string().min(1),
  expectedOutcome: z.string().min(1),
  examples: z.string().min(1),
  status: z.enum(['pending', 'generating', 'ready', 'failed']),
  createdAt: z.string(),
  // Routine 실행 추적용 (부록 B): 선기록 시점엔 없음, Routine 이 쓰면 채워짐.
  sessionUrl: z.string().url().optional(),
  branch: z.string().optional(),
  // 요청자 추적 (optional, Level 2 자율 추가).
  requestedBy: z.string().optional(),
})
export type RequestRecord = z.infer<typeof RequestSchema>

export const PrototypeSchema = z.object({
  // 설계문서: id === requestId 로 1:1 매핑.
  id: z.string().min(1),
  requestId: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  url: z.string().url(),
  branch: z.string().min(1),
  tags: z.array(z.string()).default([]),
  // 승격 지표 (§11).
  useCount: z.number().int().nonnegative().default(0),
  positiveFeedbackCount: z.number().int().nonnegative().default(0),
  createdAt: z.string(),
})
export type PrototypeRecord = z.infer<typeof PrototypeSchema>

export const FeedbackSchema = z.object({
  id: z.string().min(1),
  prototypeId: z.string().min(1),
  // positive: boolean (지침) — 내부적으론 sentiment 를 계산 가능하게 저장.
  positive: z.boolean(),
  comment: z.string().optional(),
  // refine-prototype Routine 이 만든 PR 링크 (Phase 3).
  prUrl: z.string().url().optional(),
  createdAt: z.string(),
})
export type FeedbackRecord = z.infer<typeof FeedbackSchema>

// --- 키 빌더 ---

const reqKey = (id: string) => `req:${id}` as const
const protoKey = (id: string) => `proto:${id}` as const
const fbKey = (id: string) => `fb:${id}` as const
const fbIndexKey = (protoId: string) => `idx:fb:${protoId}` as const

const REQ_INDEX = 'idx:requests'
const PROTO_INDEX = 'idx:prototypes'

// --- Request 헬퍼 ---

/** Request 레코드 upsert + 인덱스 등록. */
export async function setRequest(r: RequestRecord): Promise<void> {
  RequestSchema.parse(r)
  await kv.set(reqKey(r.id), r)
  await kv.sadd(REQ_INDEX, r.id)
}

export async function getRequest(id: string): Promise<RequestRecord | null> {
  const raw = await kv.get<RequestRecord>(reqKey(id))
  return raw ?? null
}

/** 모든 Request 반환 (인덱스 세트 → 개별 get 병렬). */
export async function listRequests(): Promise<RequestRecord[]> {
  if (isMockEnabled()) return MOCK_REQUESTS
  const ids = (await kv.smembers(REQ_INDEX)) ?? []
  if (ids.length === 0) return []
  const rows = await Promise.all(ids.map((id) => kv.get<RequestRecord>(reqKey(id))))
  return rows.filter((x): x is RequestRecord => !!x)
}

// --- Prototype 헬퍼 ---

export async function setPrototype(p: PrototypeRecord): Promise<void> {
  PrototypeSchema.parse(p)
  await kv.set(protoKey(p.id), p)
  await kv.sadd(PROTO_INDEX, p.id)
}

export async function getPrototype(id: string): Promise<PrototypeRecord | null> {
  const raw = await kv.get<PrototypeRecord>(protoKey(id))
  return raw ?? null
}

export async function listPrototypes(): Promise<PrototypeRecord[]> {
  if (isMockEnabled()) return MOCK_PROTOTYPES
  const ids = (await kv.smembers(PROTO_INDEX)) ?? []
  if (ids.length === 0) return []
  const rows = await Promise.all(ids.map((id) => kv.get<PrototypeRecord>(protoKey(id))))
  return rows.filter((x): x is PrototypeRecord => !!x)
}

// --- Feedback 헬퍼 ---

export async function setFeedback(f: FeedbackRecord): Promise<void> {
  FeedbackSchema.parse(f)
  await kv.set(fbKey(f.id), f)
  await kv.sadd(fbIndexKey(f.prototypeId), f.id)
}

/** 특정 프로토타입에 달린 피드백만 반환. */
export async function listFeedbacks(prototypeId: string): Promise<FeedbackRecord[]> {
  if (isMockEnabled()) return MOCK_FEEDBACKS.filter((f) => f.prototypeId === prototypeId)
  const ids = (await kv.smembers(fbIndexKey(prototypeId))) ?? []
  if (ids.length === 0) return []
  const rows = await Promise.all(ids.map((id) => kv.get<FeedbackRecord>(fbKey(id))))
  return rows.filter((x): x is FeedbackRecord => !!x)
}

// --- 승격 판정 ---

/**
 * 동기 승격 후보 판정 — prototype 레코드만으로 즉시 결정 (§11).
 *   - 누적 사용 10회 이상 OR
 *   - 긍정 피드백 3건 이상
 * RSC 카드 렌더 시 per-card await 를 피하려고 이 경로를 사용한다.
 * stale 카운터 fallback 이 필요하면 비동기 `isPromotionCandidate(id)` 를 쓸 것.
 */
export function isPromotionCandidateSync(p: PrototypeRecord): boolean {
  return p.useCount >= 10 || p.positiveFeedbackCount >= 3
}

/**
 * 승격 후보 판정 (§11).
 *   - 누적 사용 10회 이상 OR
 *   - 긍정 피드백 3건 이상
 * prototype 레코드의 positiveFeedbackCount 가 authoritative 하지만,
 * 혹시 레코드가 갱신 안 돼 있어도 fb 인덱스 기반으로 직접 세어 OR 한다.
 */
export async function isPromotionCandidate(prototypeId: string): Promise<boolean> {
  const proto = await getPrototype(prototypeId)
  if (!proto) return false
  if (proto.useCount >= 10) return true
  if (proto.positiveFeedbackCount >= 3) return true
  // 카운터가 stale 할 수 있어 feedback 인덱스로 재계산 (fallback).
  const fbs = await listFeedbacks(prototypeId)
  const positives = fbs.filter((f) => f.positive).length
  return positives >= 3
}
