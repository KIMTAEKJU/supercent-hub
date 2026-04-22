import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { RequestRecord } from './kv'
import { triggerGeneratePrototype } from './routines'

// getRequest 를 mock — fire idempotency 체크에서 이 함수를 쓰므로
// 테스트는 "없음" 을 기본값으로 돌린다 (fresh request).
vi.mock('./kv', () => ({
  getRequest: vi.fn(async () => null),
}))

const fakeReq: RequestRecord = {
  id: 'r1',
  problem: 'p',
  currentWay: 'c',
  expectedOutcome: 'e',
  examples: 'x',
  status: 'pending',
  createdAt: '2026-04-22T00:00:00Z',
}

beforeEach(() => {
  vi.stubEnv(
    'ROUTINE_TRIGGER_URL',
    'https://api.anthropic.com/v1/claude_code/routines/trig_test/fire',
  )
  vi.stubEnv('ROUTINE_API_TOKEN', 'sk-ant-oat01-test')
  vi.restoreAllMocks()
})

describe('triggerGeneratePrototype', () => {
  it('POSTs to full fire URL with required headers and text payload', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const r = await triggerGeneratePrototype(fakeReq)

    expect(r).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledOnce()

    const [url, init] = fetchMock.mock.calls[0]!
    // URL 은 그대로 fire endpoint — suffix 붙이지 않는다.
    expect(url).toBe('https://api.anthropic.com/v1/claude_code/routines/trig_test/fire')
    expect(init.method).toBe('POST')

    const headers = init.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer sk-ant-oat01-test')
    expect(headers['anthropic-beta']).toBe('experimental-cc-routine-2026-04-01')
    expect(headers['anthropic-version']).toBe('2023-06-01')
    expect(headers['Content-Type']).toBe('application/json')

    // body 는 {text: "<JSON string>"} 구조 — fire API 의 freeform text 필드에
    // 구조화 정보를 JSON 문자열로 실어 보낸다.
    const body = JSON.parse(init.body as string)
    expect(typeof body.text).toBe('string')
    const parsed = JSON.parse(body.text)
    expect(parsed.requestId).toBe('r1')
    expect(parsed.problem).toBe('p')
    expect(parsed.currentWay).toBe('c')
    expect(parsed.expectedOutcome).toBe('e')
    expect(parsed.examples).toBe('x')
  })

  it('propagates HTTP error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 500 })),
    )
    const r = await triggerGeneratePrototype(fakeReq)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/500/)
  })

  it('reports missing env', async () => {
    vi.stubEnv('ROUTINE_TRIGGER_URL', '')
    const r = await triggerGeneratePrototype(fakeReq)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/env missing/i)
  })
})
