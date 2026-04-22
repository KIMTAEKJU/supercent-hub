/**
 * Phase 1 Task 7 — 요청 폼 공유 zod 스키마.
 *
 * 역할: client 와 server 가 동일한 validation 규칙을 공유한다 (shared validation).
 *   - Client: useActionState 의 previous state 비교 또는 react-hook-form resolver 로 사용 가능
 *   - Server: submitRequest 액션에서 FormData 재검증 (client validation 만 믿지 않는다)
 *
 * 설계문서 §5 / §6 / 와이어프레임 3 준수:
 *   - 필드 4개 (problem / currentWay / expectedOutcome / examples)
 *   - problem/currentWay/expectedOutcome: 최소 10자 (강제)
 *   - examples: optional (와이어프레임 3 표기: "예시 입력/출력 (선택)")
 *
 * Routine 이 이 필드명으로 파싱하므로 이름/의미 변경 금지 (설계 §5 부록 B 포함).
 */
import { z } from 'zod'

const TEN_CHARS = '10자 이상 입력해 주세요'

export const RequestInputSchema = z.object({
  problem: z.string().trim().min(10, TEN_CHARS).max(500, '500자 이내로 작성해 주세요'),
  currentWay: z.string().trim().min(10, TEN_CHARS).max(500, '500자 이내로 작성해 주세요'),
  expectedOutcome: z
    .string()
    .trim()
    .min(10, TEN_CHARS)
    .max(500, '500자 이내로 작성해 주세요'),
  // 와이어프레임 3: "예시 입력/출력 (선택)" — optional.
  // 빈 문자열도 undefined 로 치환해 "선택" 의미를 유지한다.
  examples: z
    .string()
    .trim()
    .max(1000, '1000자 이내로 작성해 주세요')
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
})

export type RequestInput = z.infer<typeof RequestInputSchema>
