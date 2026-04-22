/**
 * Phase 1 Task 8 — 프로토타입 생성 상태 폴링 endpoint (스텁).
 *
 * 역할:
 *   - 클라이언트 `SubmissionProgress` 가 3초마다 호출.
 *   - KV `req:<id>` 의 `status` 필드만 노출 (pending / generating / ready / failed).
 *   - Routine 은 부록 B 에 따라 완료 시 KV `status=ready` 를 쓴다 → 이 endpoint 가
 *     유일한 진행 상태 채널.
 *
 * Mock 모드 (USE_MOCK_KV=1):
 *   - 실제 Routine 이 연결되지 않은 개발 구간용.
 *   - 요청 생성 시각(`createdAt`) 기준 10 초가 지나면 `ready` 로 응답을 흉내낸다.
 *     (KV 자체는 수정하지 않음 — 다른 뷰와 일관성 유지 목적. 실제 status 는 기록 그대로)
 *   - Routine 연동이 붙는 Task 11-14 에서 이 mock 경로는 제거/재설계.
 *
 * 확장 (Task 11):
 *   - 세부 phase (interpret/generate/commit/deploy/register) 노출을 위해 KV 에
 *     `phase` 필드를 추가하는 안이 유력. 이 endpoint 가 그 필드를 함께 반환.
 *
 * 응답 포맷 (현재):
 *   200 { id, status, updatedAt }
 *   404 { error: 'not found' }
 */
import { NextResponse } from 'next/server'

import { getRequest } from '@/lib/kv'
import { isMockEnabled } from '@/lib/kv-mock'

// 캐시 방지 — 폴링 응답을 절대 캐싱하지 않는다.
export const dynamic = 'force-dynamic'
export const revalidate = 0

const MOCK_READY_AFTER_MS = 10_000

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const record = await getRequest(id)
  if (!record) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  // Mock 모드: 10 초 경과 후 'ready' 로 흉내낸다 (KV 실제 기록은 건드리지 않음).
  let status = record.status
  if (isMockEnabled() && status === 'pending') {
    const age = Date.now() - new Date(record.createdAt).getTime()
    if (age >= MOCK_READY_AFTER_MS) status = 'ready'
  }

  return NextResponse.json(
    {
      id: record.id,
      status,
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        // 추가 안전장치: Vercel/브라우저 캐싱 방지.
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  )
}
