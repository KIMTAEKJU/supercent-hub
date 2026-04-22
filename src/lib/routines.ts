/**
 * Claude Code Routines 연동 클라이언트.
 *
 * 역할: Hub 서버 액션이 생성한 RequestRecord 를 `generate-prototype` Routine 에
 *       fire 호출로 전달. 완료 신호는 이 함수가 아닌 Routine 이 KV 에 기록하는
 *       `proto:<id>` upsert + `req:<id>.status=ready` 로 감지된다 (부록 B).
 *
 * 필수 env:
 *   ROUTINE_TRIGGER_URL   — full fire URL (`.../routines/trig_xxx/fire`, suffix 추가 금지)
 *   ROUTINE_API_TOKEN     — Bearer (sk-ant-oat01-*)
 */

import type { RequestRecord } from './kv'

/**
 * env 를 매 호출마다 읽는다. 테스트에서 `vi.stubEnv` 가 런타임에 적용되도록
 * 모듈 import 시점이 아닌 함수 실행 시점에 읽는 것이 포인트.
 */
function envOrNull() {
  const URL = process.env.ROUTINE_TRIGGER_URL
  const TOKEN = process.env.ROUTINE_API_TOKEN
  if (!URL || !TOKEN) return null
  return { URL, TOKEN }
}

export type TriggerResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; error: string }

/**
 * generate-prototype Routine 을 fire 한다.
 *
 * Idempotency: fire API 는 key 미지원이라 Hub 서버 액션이 KV 에 `req:<id>`
 * 를 `status=pending` 으로 선기록하고, 이 함수가 KV 를 조회해 중복을 감지한다.
 *
 * 실패 케이스 처리:
 *   - env 누락 → 즉시 `{ ok:false, error:"ROUTINE env missing" }`
 *   - HTTP 4xx/5xx → `{ ok:false, error:"HTTP <status>" }`
 *   - 상위 `submitRequest` 가 결과를 로깅만 하고 사용자에게는 `{ ok:true, requestId }`
 *     를 돌려주는 정책 (폴링 화면이 KV 상태로 판단).
 */
export async function triggerGeneratePrototype(req: RequestRecord): Promise<TriggerResult> {
  const env = envOrNull()
  if (!env) return { ok: false, error: 'ROUTINE env missing' }

  // Idempotency: 이미 pending 이외 상태면 skip (재제출·재시도 중복 fire 방지).
  const { getRequest } = await import('./kv')
  const existing = await getRequest(req.id)
  if (existing && existing.status !== 'pending') {
    return { ok: true, skipped: true }
  }

  // fire API body 는 `{text: string}` 형태 (freeform). JSON 을 문자열로 직렬화해 넣는다.
  const payload = {
    text: JSON.stringify({
      requestId: req.id,
      problem: req.problem,
      currentWay: req.currentWay,
      expectedOutcome: req.expectedOutcome,
      examples: req.examples,
    }),
  }

  const res = await fetch(env.URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.TOKEN}`,
      'anthropic-beta': 'experimental-cc-routine-2026-04-01',
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) return { ok: false, error: `HTTP ${res.status}` }
  return { ok: true }
}
