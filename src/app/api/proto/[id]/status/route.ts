/**
 * Phase 2 Task 11 — 프로토타입 생성 상태 폴링 endpoint (확장).
 *
 * Phase 1 Task 8 의 req-only 스텁을 proto 조회까지 포함하게 확장.
 *
 * 역할:
 *   - 클라이언트 `SubmissionProgress` 가 3초마다 호출.
 *   - 응답 `status` 필드가 UI 상태 전이의 소스 오브 트루스.
 *   - KV 우선순위: proto 존재 > req.status = failed > req.status (그대로) > 없음(404).
 *
 * 응답 스키마:
 *   200 { id, status, url?, title?, updatedAt }
 *     - status='ready' + url+title 은 proto:<id> 가 존재할 때만.
 *     - 그 외에는 req.status 를 그대로 노출 (pending|generating|ready|failed).
 *   404 { error: 'not found' }
 *
 * Mock 모드 (USE_MOCK_KV=1):
 *   - 실제 Routine 없이 UI 만 테스트할 때 `createdAt` 기준 10초 후 ready 흉내.
 *   - KV 실제 기록은 건드리지 않음.
 */
import { NextResponse } from 'next/server'

import { getPrototype, getRequest } from '@/lib/kv'
import { isMockEnabled } from '@/lib/kv-mock'

// 캐시 방지 — 폴링 응답은 절대 캐싱하지 않는다.
export const dynamic = 'force-dynamic'
export const revalidate = 0

const MOCK_READY_AFTER_MS = 10_000

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  // proto 와 req 를 병렬 조회 — Routine 이 proto 를 upsert 하고 req.status=ready 를 PATCH 하지만
  // 둘 사이 경합 구간이 있을 수 있으므로 어느 한 쪽으로만 판단하지 않는다.
  const [proto, record] = await Promise.all([getPrototype(id), getRequest(id)])

  // 1. proto 있으면 최우선으로 ready (URL 반환).
  if (proto) {
    return NextResponse.json(
      {
        id: proto.id,
        status: 'ready',
        url: proto.url,
        title: proto.title,
        updatedAt: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  }

  // 2. req 없으면 404.
  if (!record) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  // 3. req 있음 → status 그대로 노출. Mock 모드에서만 10 초 경과 시 ready 흉내.
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
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  )
}
