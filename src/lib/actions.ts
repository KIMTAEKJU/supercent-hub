/**
 * Phase 1 Task 7 — 요청 폼 Server Action.
 *
 * 역할:
 *   1) FormData 를 zod 로 서버사이드 재검증 (client 검증만 믿지 않음)
 *   2) requestId 생성 + KV 에 `status: pending` 선기록
 *      → 부록 B 의 "idempotency 선기록 패턴" 도입부. Task 10 에서 /fire 호출
 *        재시도 시 이 레코드를 보고 중복 트리거를 skip 하게 확장한다.
 *   3) 성공 시 { ok: true, requestId } 반환 → 폼 컴포넌트가 router.push 로
 *      `/submitting/[id]` 로 이동 (redirect 는 Task 8 라우트 확정 후 client 에서).
 *
 * 주의: Phase 1 에서는 Routine fire 호출 제외. Task 10 에서 triggerGeneratePrototype(id)
 *       을 이 함수 말미에 연결한다.
 *
 * 보안 메모 (MVP): CSRF 토큰 없음. 사내 제출용이므로 허용.
 */
'use server'

import { randomUUID } from 'node:crypto'

import { setRequest } from './kv'
import { triggerGeneratePrototype } from './routines'
import { RequestInputSchema } from './schemas'

export type SubmitRequestState =
  | { ok: true; requestId: string }
  | { ok: false; errors: Record<string, string>; values: Record<string, string> }
  | null

/** 필드명 → 첫 번째 에러 메시지 맵으로 축약 (form 표시에 쉽게 쓰기 위해). */
function flattenZodErrors(
  issues: readonly { path: ReadonlyArray<PropertyKey>; message: string }[],
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of issues) {
    const key = issue.path[0]
    if (typeof key !== 'string') continue
    if (!(key in out)) out[key] = issue.message
  }
  return out
}

/**
 * useActionState 호환 서버 액션. (prev, formData) 시그니처.
 * prev 는 재제출 UX 를 위해 쓸 수 있지만 현재는 참조 안 함.
 */
export async function submitRequest(
  _prev: SubmitRequestState,
  formData: FormData,
): Promise<SubmitRequestState> {
  const raw = {
    problem: String(formData.get('problem') ?? ''),
    currentWay: String(formData.get('currentWay') ?? ''),
    expectedOutcome: String(formData.get('expectedOutcome') ?? ''),
    examples: String(formData.get('examples') ?? ''),
  }

  const parsed = RequestInputSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      errors: flattenZodErrors(parsed.error.issues),
      // 사용자가 입력한 값을 다시 렌더해 잃지 않게 한다 (uncontrolled form 재렌더 시 사용).
      values: raw,
    }
  }

  const requestId = `req_${randomUUID()}`

  // 부록 B: "선기록" — Routine fire 전에 pending 으로 마크해 재호출 시 중복 감지 가능.
  const record = {
    id: requestId,
    problem: parsed.data.problem,
    currentWay: parsed.data.currentWay,
    expectedOutcome: parsed.data.expectedOutcome,
    // examples 는 optional — 빈 값이면 빈 문자열로 저장 (Routine 프롬프트 호환).
    examples: parsed.data.examples ?? '',
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  }

  await setRequest(record)

  // Task 10: generate-prototype Routine fire (fire-and-forget).
  // 실패해도 사용자는 이미 제출됐으므로 폴링 화면이 KV status 를 보고 처리한다.
  // env 미설정 시엔 로그만 남기고 삼킴 — 개발 환경(`USE_MOCK_KV=1`)에서 Routine 없이 UI 만 테스트 가능.
  const fire = await triggerGeneratePrototype(record)
  if (!fire.ok) {
    console.error(`[submitRequest] Routine fire failed for ${requestId}: ${fire.error}`)
  }

  return { ok: true, requestId }
}
