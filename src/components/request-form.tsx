'use client'

/**
 * Phase 1 Task 7 — 요청 폼 (4필드 + zod + React 19 useActionState).
 *
 * React best practices 적용:
 *   - useActionState (React 19 공식 폼 패턴) + 서버 액션 → client bundle 최소화
 *   - Uncontrolled Textarea (defaultValue) → 타이핑 시 re-render 없음 (rerender-*)
 *   - useFormStatus → 버튼 pending 상태는 form 구조에서 파생 (파생 state 직접 보관 X)
 *   - server/client 공유 zod (schemas.ts) → 검증 규칙 단일 소스
 *
 * 와이어프레임 3 대응:
 *   - 4필드 (problem / currentWay / expectedOutcome / examples)
 *   - 필드별 한국어 라벨 + placeholder 예시
 *   - 제출 버튼: "요청 제출 → 프로토타입 생성" + loading 상태
 *   - FormMessage 로 필드별 에러 표시
 */

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useId } from 'react'
import { useFormStatus } from 'react-dom'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitRequest, type SubmitRequestState } from '@/lib/actions'

type FieldProps = {
  name: 'problem' | 'currentWay' | 'expectedOutcome' | 'examples'
  label: string
  hint: string
  placeholder: string
  required: boolean
  defaultValue?: string
  error?: string
  minRows: number
}

function Field({
  name,
  label,
  hint,
  placeholder,
  required,
  defaultValue,
  error,
  minRows,
}: FieldProps) {
  const id = useId()
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id} className="text-white">
          {label}
          {required ? (
            <span className="ml-1 text-amber-400" aria-hidden>
              *
            </span>
          ) : (
            <span className="ml-2 text-xs font-normal text-zinc-500">선택</span>
          )}
        </Label>
        <span className="text-xs text-zinc-500">{hint}</span>
      </div>
      <Textarea
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        rows={minRows}
        className="border-white/10 bg-zinc-950 text-white placeholder:text-zinc-600"
      />
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function SubmitButton() {
  // useFormStatus 는 form action 이 진행 중인지 form 트리에서 파생 — 별도 state 불필요.
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className="bg-amber-500 text-black hover:bg-amber-500/90"
    >
      {pending ? '제출 중…' : '요청 제출 → 프로토타입 생성'}
    </Button>
  )
}

export function RequestForm() {
  const router = useRouter()
  const [state, formAction] = useActionState<SubmitRequestState, FormData>(
    submitRequest,
    null,
  )

  // 성공 시 대기 화면으로 이동 (Task 8 에서 /submitting/[id] 라우트가 대응).
  useEffect(() => {
    if (state && state.ok) {
      router.push(`/submitting/${state.requestId}`)
    }
  }, [state, router])

  const errors = state && !state.ok ? state.errors : {}
  const values = state && !state.ok ? state.values : {}

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <Field
        name="problem"
        label="해결하려는 문제는?"
        hint="최소 10자"
        placeholder="예: 광고 성과 데이터를 매주 수동 통합하는데 시간이 많이 듭니다"
        required
        defaultValue={values.problem}
        error={errors.problem}
        minRows={3}
      />
      <Field
        name="currentWay"
        label="현재 어떻게 하고 있나요?"
        hint="최소 10자"
        placeholder="예: Excel에 붙여넣고 vlookup으로 조인"
        required
        defaultValue={values.currentWay}
        error={errors.currentWay}
        minRows={3}
      />
      <Field
        name="expectedOutcome"
        label="기대하는 결과는?"
        hint="최소 10자"
        placeholder="예: URL만 넣으면 주간 리포트 자동 생성"
        required
        defaultValue={values.expectedOutcome}
        error={errors.expectedOutcome}
        minRows={3}
      />
      <Field
        name="examples"
        label="예시 입력 / 출력"
        hint="선택 · Routine 에 힌트로 전달"
        placeholder="예: 입력=https://...뉴스 URL, 출력=3문장 요약"
        required={false}
        defaultValue={values.examples}
        error={errors.examples}
        minRows={3}
      />

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-zinc-500">
          제출 후 1~2분 내에 프로토타입이 카탈로그에 등록됩니다.
        </p>
        <SubmitButton />
      </div>
    </form>
  )
}
