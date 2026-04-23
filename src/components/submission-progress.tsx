'use client'

/**
 * Phase 1 Task 8 — 제출 대기 진행률 UI.
 *
 * 와이어프레임 4:
 *   - 5단계 진행률 바: 해석(interpret) → 생성(generate) → 커밋(commit) → 배포(deploy) → 등록(register)
 *   - 예상 소요 시간 카운트다운 ("예상 1-2분 내 완료")
 *   - 실패 시 retry 버튼 (요청 폼으로 복귀)
 *
 * 폴링 전략 (부록 B):
 *   - KV 가 유일한 진행 상태 채널 → `/api/proto/[id]/status` 를 3 초마다 fetch.
 *   - 현재 KV status 는 pending/generating/ready/failed 4종만 정의됨.
 *   - 세부 phase (interpret/.../register) 는 Task 11 에서 확장 — 지금은 UI 로만 준비.
 *     현 단계 매핑:
 *       pending    → phase 1 활성 (요청 해석 대기 중)
 *       generating → phase 2 활성 (코드 생성 중)
 *       ready      → 5 단계 모두 완료 + router.push('/prototype/:id')
 *       failed     → 에러 카드
 *
 * React best practices 적용:
 *   - setInterval cleanup 필수 (rerender-* / 누수 방지) — useEffect return.
 *   - ready/failed 감지 시 즉시 clearInterval → 불필요한 fetch 중단.
 *   - AbortController 로 in-flight fetch 취소 (unmount 시).
 *   - STEPS 배열은 모듈 스코프 상수 — 렌더마다 재생성 안 함 (rendering-hoist-jsx 계열).
 *   - 파생 상태 (현재 phase index) 는 render 중 계산 (rerender-derived-state-no-effect).
 *   - lucide-react 아이콘은 named import (bundle-barrel-imports 는 lucide-react 는 tree-shake 우호적이라 OK).
 *
 * 404 (status endpoint 아직 없음): try/catch 로 graceful — 재시도 사이클에서 회복.
 * 타임아웃: 30 분 (1800s) 경과 시 경고 배너. (설계: 1-2 분 예상 + 여유)
 */

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { RequestRecord } from '@/lib/kv'

type KvStatus = RequestRecord['status']
// Phase 2 Task 11 (Option X): /api/proto/[id]/status 가 Vercel 배포 BUILDING 일 때
// 'deploying' 가상 상태를 반환. terminal 아님 (계속 폴링).
type PollStatus = KvStatus | 'deploying'

type Step = {
  key: 'interpret' | 'generate' | 'commit' | 'deploy' | 'register'
  label: string
  description: string
}

// 모듈 스코프 — 렌더마다 재생성 금지.
const STEPS: readonly Step[] = [
  { key: 'interpret', label: '요청 해석', description: '문제 정의를 정리하고 있어요' },
  { key: 'generate', label: '코드 생성', description: 'Next.js 페이지를 작성하고 있어요' },
  { key: 'commit', label: 'Git 커밋', description: '브랜치에 코드를 올리고 있어요' },
  { key: 'deploy', label: 'Vercel 배포', description: '미리보기 URL 을 활성화하고 있어요' },
  { key: 'register', label: 'Hub 등록', description: '카탈로그에 추가하고 있어요' },
] as const

const POLL_INTERVAL_MS = 3_000
const TIMEOUT_MS = 30 * 60 * 1_000 // 30 분

/**
 * KV status → 5 단계 중 현재까지 "완료된 단계 수" 로 매핑.
 *   pending    → 0 (첫 단계가 in-progress)
 *   generating → 1 (해석 완료, 생성 단계 in-progress)
 *   ready      → 5 (전 단계 완료)
 *   failed     → -1 (에러 모드)
 * Task 11 에서 세부 phase 가 KV 에 들어오면 이 함수를 phase 기반으로 교체.
 */
function statusToCompletedSteps(status: PollStatus): number {
  switch (status) {
    case 'pending':
      return 0
    case 'generating':
      return 1
    case 'deploying':
      return 3 // interpret+generate+commit 완료, deploy 진행 중
    case 'ready':
      return STEPS.length
    case 'failed':
      return -1
    default:
      return 0
  }
}

function StepIcon({
  state,
}: {
  state: 'done' | 'active' | 'pending' | 'failed'
}) {
  if (state === 'done')
    return <CheckCircle2 className="h-5 w-5 text-amber-400" aria-hidden />
  if (state === 'active')
    return (
      <Loader2 className="h-5 w-5 animate-spin text-amber-400" aria-hidden />
    )
  if (state === 'failed')
    return <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden />
  return <Circle className="h-5 w-5 text-zinc-700" aria-hidden />
}

export function SubmissionProgress({
  requestId,
  initialStatus,
  createdAt,
}: {
  requestId: string
  initialStatus: KvStatus
  createdAt: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState<PollStatus>(initialStatus)
  const [pollError, setPollError] = useState<string | null>(null)
  const [elapsedSec, setElapsedSec] = useState(0)

  // createdAt 기준 경과 시간 — ref 로 시작 시각만 저장 (재렌더 영향 X).
  const startedAtRef = useRef<number>(new Date(createdAt).getTime())

  // --- 상태 폴링 ---
  useEffect(() => {
    // 이미 터미널 상태면 폴링 안 시작.
    if (initialStatus === 'ready' || initialStatus === 'failed') {
      if (initialStatus === 'ready') {
        router.push(`/prototype/${requestId}`)
      }
      return
    }

    let cancelled = false
    const controller = new AbortController()

    async function poll() {
      try {
        const res = await fetch(`/api/proto/${requestId}/status`, {
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!res.ok) {
          // 404 (endpoint 아직 배포 안 됨) 는 조용히 재시도.
          if (res.status === 404) return
          throw new Error(`status ${res.status}`)
        }
        const data: { status?: PollStatus } = await res.json()
        if (cancelled || !data.status) return
        setStatus(data.status)
        setPollError(null)
      } catch (err) {
        if (cancelled) return
        if (err instanceof Error && err.name === 'AbortError') return
        // 네트워크 일시 오류는 배너로만 표시하고 다음 틱에서 재시도.
        setPollError(err instanceof Error ? err.message : String(err))
      }
    }

    // 즉시 1회 실행 후 interval 시작 (페이지 진입 초기 지연 제거).
    void poll()
    const intervalId = window.setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      controller.abort()
      window.clearInterval(intervalId)
    }
  }, [requestId, initialStatus, router])

  // --- 터미널 상태 감지 후 라우팅 ---
  useEffect(() => {
    if (status === 'ready') {
      router.push(`/prototype/${requestId}`)
    }
  }, [status, requestId, router])

  // --- 경과 시간 카운터 (1초 tick) ---
  useEffect(() => {
    if (status === 'ready' || status === 'failed') return
    const tick = () => {
      const sec = Math.max(
        0,
        Math.floor((Date.now() - startedAtRef.current) / 1000),
      )
      setElapsedSec(sec)
    }
    tick()
    const timerId = window.setInterval(tick, 1_000)
    return () => window.clearInterval(timerId)
  }, [status])

  // --- 파생값 (render 중 계산, state 로 들고 다니지 않음) ---
  const completed = statusToCompletedSteps(status)
  const failed = status === 'failed'
  const done = status === 'ready'
  const progressValue = done
    ? 100
    : failed
      ? 0
      : Math.min(100, Math.round((Math.max(completed, 0) / STEPS.length) * 100))
  const timedOut =
    !done && !failed && elapsedSec * 1_000 >= TIMEOUT_MS
  const minutes = Math.floor(elapsedSec / 60)
  const seconds = elapsedSec % 60
  const elapsedLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <section className="space-y-8">
      {/* 진행률 바 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-300">
            {done
              ? '완료! 프로토타입 페이지로 이동합니다…'
              : failed
                ? '생성에 실패했어요'
                : '예상 1-2분 내 완료'}
          </span>
          <span className="font-mono tabular-nums text-xs text-zinc-500">
            경과 {elapsedLabel}
          </span>
        </div>
        <Progress
          value={progressValue}
          className="[&_[data-slot=progress-indicator]]:bg-amber-500"
        />
      </div>

      {/* 5 단계 리스트 */}
      <ol className="space-y-3">
        {STEPS.map((step, idx) => {
          let state: 'done' | 'active' | 'pending' | 'failed'
          if (failed && idx === Math.max(completed, 0)) state = 'failed'
          else if (idx < completed) state = 'done'
          else if (idx === completed && !done) state = 'active'
          else if (done) state = 'done'
          else state = 'pending'

          return (
            <li
              key={step.key}
              className="flex items-start gap-3 rounded-lg border border-white/5 bg-zinc-950/40 p-4"
            >
              <div className="mt-0.5">
                <StepIcon state={state} />
              </div>
              <div className="flex-1 space-y-0.5">
                <p
                  className={
                    state === 'pending'
                      ? 'text-sm font-medium text-zinc-500'
                      : 'text-sm font-medium text-white'
                  }
                >
                  {idx + 1}. {step.label}
                </p>
                <p className="text-xs text-zinc-500">{step.description}</p>
              </div>
              {state === 'active' ? (
                <span className="text-xs text-amber-400">진행 중</span>
              ) : null}
            </li>
          )
        })}
      </ol>

      {/* 타임아웃 경고 */}
      {timedOut ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-400" aria-hidden />
          <div className="flex-1 space-y-1 text-sm">
            <p className="font-medium text-amber-200">
              30 분 이상 진행되고 있어요
            </p>
            <p className="text-xs text-amber-100/70">
              Routine 이 멈춘 것일 수 있어요. 잠시 후 다시 시도하거나 카탈로그에서
              상태를 확인해 주세요.
            </p>
          </div>
        </div>
      ) : null}

      {/* 폴링 일시 오류 (네트워크) */}
      {pollError && !failed && !done ? (
        <p className="text-xs text-zinc-500">
          상태 갱신 재시도 중… ({pollError})
        </p>
      ) : null}

      {/* 실패 시 retry */}
      {failed ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 text-red-400"
              aria-hidden
            />
            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-200">
                  프로토타입 생성이 실패했습니다
                </p>
                <p className="text-xs text-red-100/70">
                  Routine 실행 중 문제가 발생했어요. 요청 내용을 조정해 다시
                  시도할 수 있습니다.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => router.push('/request')}
                  className="bg-amber-500 text-black hover:bg-amber-500/90"
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  다시 요청하기
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push('/catalog')}
                  className="border-white/10 bg-transparent text-white hover:bg-white/5"
                >
                  카탈로그로
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
