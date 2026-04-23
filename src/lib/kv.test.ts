/**
 * Phase 1 Task 5 — KV 헬퍼 단위 테스트.
 *
 * 전략: `@vercel/kv` 를 in-memory fake 로 치환 (실제 Redis 불필요).
 *   - vi.mock 은 vitest 가 import 전에 hoist 하므로 kv.ts 의 최상단 import 도
 *     자동으로 fake 로 바인딩된다.
 *   - store / sets 두 Map 으로 Redis 의 string/set 자료구조를 흉내낸다.
 *
 * 검증 항목 (사용자 지침 최소 6개):
 *   1) setRequest + getRequest round-trip
 *   2) listRequests 가 모든 저장 요청 반환
 *   3) setPrototype + getPrototype round-trip
 *   4) listFeedbacks 가 prototypeId 별로만 필터
 *   5) isPromotionCandidate: useCount >= 10 → true
 *   6) isPromotionCandidate: positiveFeedbackCount >= 3 → true
 *   7) isPromotionCandidate: 기준 미달 → false
 *   8) isPromotionCandidate: 카운터는 낮아도 실제 positive fb 3건이면 true (fallback 검증)
 *   9) setPrototype invalid URL → zod validation throw
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// In-memory fakes. 테스트 간 beforeEach 에서 초기화.
const store = new Map<string, unknown>()
const sets = new Map<string, Set<string>>()

vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(async (k: string) => store.get(k) ?? null),
    set: vi.fn(async (k: string, v: unknown) => {
      store.set(k, v)
    }),
    sadd: vi.fn(async (k: string, m: string) => {
      const s = sets.get(k) ?? new Set<string>()
      s.add(m)
      sets.set(k, s)
      return 1
    }),
    smembers: vi.fn(async (k: string) => Array.from(sets.get(k) ?? [])),
  },
}))

// mock 선언 후 import (vi.mock 이 hoist 되지만 가독성 위해 아래로).
import {
  setRequest,
  getRequest,
  listRequests,
  setPrototype,
  getPrototype,
  listPrototypes,
  setFeedback,
  listFeedbacks,
  isPromotionCandidate,
  RequestSchema,
  type RequestRecord,
  type PrototypeRecord,
  type FeedbackRecord,
} from './kv'

beforeEach(() => {
  store.clear()
  sets.clear()
})

// --- Factories ---

function makeRequest(overrides: Partial<RequestRecord> = {}): RequestRecord {
  return {
    id: 'req-1',
    problem: '반복 업무를 줄이고 싶다',
    currentWay: '매일 수동으로 처리',
    expectedOutcome: '자동화된 결과 표시',
    examples: '입력: 매출 CSV / 출력: 요약 리포트',
    status: 'pending',
    createdAt: '2026-04-22T10:00:00Z',
    ...overrides,
  }
}

function makePrototype(overrides: Partial<PrototypeRecord> = {}): PrototypeRecord {
  return {
    id: 'req-1',
    requestId: 'req-1',
    title: '매출 요약 도구',
    description: 'CSV 업로드 → 요약',
    url: 'https://supercent-hub-git-claude-prototype-req-1.vercel.app',
    branch: 'claude/prototype-req-1',
    tags: ['sales'],
    useCount: 0,
    positiveFeedbackCount: 0,
    createdAt: '2026-04-22T10:05:00Z',
    ...overrides,
  }
}

function makeFeedback(overrides: Partial<FeedbackRecord> = {}): FeedbackRecord {
  return {
    id: 'fb-1',
    prototypeId: 'req-1',
    positive: true,
    comment: '유용합니다',
    createdAt: '2026-04-22T11:00:00Z',
    ...overrides,
  }
}

// --- Tests ---

describe('kv: Request', () => {
  it('setRequest + getRequest round-trip', async () => {
    const r = makeRequest()
    await setRequest(r)
    const loaded = await getRequest('req-1')
    expect(loaded).toEqual(r)
  })

  it('getRequest 없는 id → null', async () => {
    const loaded = await getRequest('missing')
    expect(loaded).toBeNull()
  })

  it('listRequests 가 모든 요청 반환', async () => {
    await setRequest(makeRequest({ id: 'r1' }))
    await setRequest(makeRequest({ id: 'r2', status: 'generating' }))
    const all = await listRequests()
    expect(all).toHaveLength(2)
    expect(all.map((x) => x.id).sort()).toEqual(['r1', 'r2'])
  })
})

describe('kv: Prototype', () => {
  it('setPrototype + getPrototype round-trip', async () => {
    const p = makePrototype()
    await setPrototype(p)
    const loaded = await getPrototype('req-1')
    expect(loaded).toEqual(p)
  })

  it('listPrototypes 가 모든 프로토타입 반환', async () => {
    await setPrototype(makePrototype({ id: 'p1', requestId: 'p1' }))
    await setPrototype(makePrototype({ id: 'p2', requestId: 'p2' }))
    const all = await listPrototypes()
    expect(all).toHaveLength(2)
  })

  it('setPrototype: invalid URL → zod 에러', async () => {
    await expect(
      setPrototype(makePrototype({ url: 'not-a-url' as unknown as string })),
    ).rejects.toThrow()
  })
})

describe('kv: Feedback', () => {
  it('listFeedbacks 는 prototypeId 별로만 필터', async () => {
    await setFeedback(makeFeedback({ id: 'fb-a', prototypeId: 'p1' }))
    await setFeedback(makeFeedback({ id: 'fb-b', prototypeId: 'p1', positive: false }))
    await setFeedback(makeFeedback({ id: 'fb-c', prototypeId: 'p2' }))

    const p1 = await listFeedbacks('p1')
    const p2 = await listFeedbacks('p2')
    const none = await listFeedbacks('missing')

    expect(p1.map((f) => f.id).sort()).toEqual(['fb-a', 'fb-b'])
    expect(p2.map((f) => f.id)).toEqual(['fb-c'])
    expect(none).toEqual([])
  })
})

describe('kv: isPromotionCandidate', () => {
  it('useCount 10 → true', async () => {
    await setPrototype(makePrototype({ useCount: 10, positiveFeedbackCount: 0 }))
    expect(await isPromotionCandidate('req-1')).toBe(true)
  })

  it('positiveFeedbackCount 3 → true', async () => {
    await setPrototype(makePrototype({ useCount: 0, positiveFeedbackCount: 3 }))
    expect(await isPromotionCandidate('req-1')).toBe(true)
  })

  it('기준 미달 (use 9 + positive 2) → false', async () => {
    await setPrototype(makePrototype({ useCount: 9, positiveFeedbackCount: 2 }))
    expect(await isPromotionCandidate('req-1')).toBe(false)
  })

  it('카운터 stale 이어도 실제 positive fb 3건이면 fallback 으로 true', async () => {
    await setPrototype(makePrototype({ useCount: 0, positiveFeedbackCount: 0 }))
    await setFeedback(makeFeedback({ id: 'f1', prototypeId: 'req-1', positive: true }))
    await setFeedback(makeFeedback({ id: 'f2', prototypeId: 'req-1', positive: true }))
    await setFeedback(makeFeedback({ id: 'f3', prototypeId: 'req-1', positive: true }))
    await setFeedback(makeFeedback({ id: 'f4', prototypeId: 'req-1', positive: false }))
    expect(await isPromotionCandidate('req-1')).toBe(true)
  })

  it('prototype 자체가 없으면 false', async () => {
    expect(await isPromotionCandidate('ghost')).toBe(false)
  })
})

describe('RequestSchema status enum extension', () => {
  it('accepts interpreting status', () => {
    const parsed = RequestSchema.parse({
      id: 'r1',
      problem: 'p',
      currentWay: 'c',
      expectedOutcome: 'e',
      examples: '',
      status: 'interpreting',
      createdAt: '2026-04-23T00:00:00Z',
    })
    expect(parsed.status).toBe('interpreting')
  })

  it('accepts committing status', () => {
    const parsed = RequestSchema.parse({
      id: 'r1',
      problem: 'p',
      currentWay: 'c',
      expectedOutcome: 'e',
      examples: '',
      status: 'committing',
      createdAt: '2026-04-23T00:00:00Z',
    })
    expect(parsed.status).toBe('committing')
  })

  it('accepts optional lastStatus for failed records', () => {
    const parsed = RequestSchema.parse({
      id: 'r1',
      problem: 'p',
      currentWay: 'c',
      expectedOutcome: 'e',
      examples: '',
      status: 'failed',
      createdAt: '2026-04-23T00:00:00Z',
      lastStatus: 'generating',
    })
    expect(parsed.lastStatus).toBe('generating')
  })

  it.each(['ready', 'failed'] as const)(
    'rejects lastStatus with reserved value "%s"',
    (reserved) => {
      expect(() =>
        RequestSchema.parse({
          id: 'r1',
          problem: 'p',
          currentWay: 'c',
          expectedOutcome: 'e',
          examples: '',
          status: 'failed',
          createdAt: '2026-04-23T00:00:00Z',
          lastStatus: reserved,
        }),
      ).toThrow()
    },
  )

  it('allows lastStatus to be omitted', () => {
    const parsed = RequestSchema.parse({
      id: 'r1',
      problem: 'p',
      currentWay: 'c',
      expectedOutcome: 'e',
      examples: '',
      status: 'pending',
      createdAt: '2026-04-23T00:00:00Z',
    })
    expect(parsed.lastStatus).toBeUndefined()
  })
})
