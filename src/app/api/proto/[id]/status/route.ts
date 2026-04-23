/**
 * Phase 2 Task 11 — 프로토타입 상태 폴링 endpoint (Option X: Vercel 배포 state 통합).
 *
 * 기존 문제: KV 의 proto.status=ready 는 Routine 이 push+KV쓰기 끝난 시점이지
 * 실제 Vercel 빌드 완료가 아니므로, UI 가 ready 감지 후 이동해도 도구 URL 이
 * '사이트 없음' 을 띄우는 경쟁 조건이 발생.
 *
 * 수정: Vercel API 로 branch 배포 state 를 확인해 아래 규칙으로 응답:
 *   - req 없음               → 404 {error:'not found'}
 *   - req.status=failed     → status=failed
 *   - proto 없음             → status=pending (Routine 진행 중)
 *   - proto 있고 Vercel READY → status=ready + url
 *   - proto 있고 Vercel BUILDING/QUEUED/INITIALIZING → status=deploying
 *   - proto 있고 Vercel NONE (아직 push 감지 전) → status=deploying
 *   - proto 있고 Vercel ERROR/CANCELED → status=failed
 *   - VERCEL_TOKEN 미설정 / API 실패 → proto 있으면 ready 로 간주 (fallback, UX 보수적)
 *
 * SubmissionProgress 측 호환:
 *   - 'ready' / 'failed' 만 terminal
 *   - 'pending' / 'deploying' / 'generating' 등은 계속 폴링
 *
 * Mock 모드 (USE_MOCK_KV=1): createdAt +10s 후 ready 흉내 (Vercel 체크 생략).
 */
import { NextResponse } from 'next/server'

import { getPrototype, getRequest } from '@/lib/kv'
import { isMockEnabled } from '@/lib/kv-mock'
import { getDeploymentState } from '@/lib/vercel'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const MOCK_READY_AFTER_MS = 10_000
const NO_CACHE_HEADERS = { 'Cache-Control': 'no-store, max-age=0' } as const

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const [proto, record] = await Promise.all([getPrototype(id), getRequest(id)])

  // 1. req 없음
  if (!record && !proto) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  // 2. req.status=failed 우선 처리
  if (record?.status === 'failed') {
    return NextResponse.json(
      { id, status: 'failed', updatedAt: new Date().toISOString() },
      { headers: NO_CACHE_HEADERS },
    )
  }

  // 3. proto 없음 → Routine 진행 중
  if (!proto) {
    // Mock 모드: 10s 경과 시 ready 흉내.
    let status = record!.status
    if (isMockEnabled() && status === 'pending') {
      const age = Date.now() - new Date(record!.createdAt).getTime()
      if (age >= MOCK_READY_AFTER_MS) status = 'ready'
    }
    return NextResponse.json(
      { id: record!.id, status, updatedAt: new Date().toISOString() },
      { headers: NO_CACHE_HEADERS },
    )
  }

  // 4. proto 있음 → Vercel 배포 state 확인
  const deployment = await getDeploymentState(proto.branch)
  const now = new Date().toISOString()

  if (deployment.state === 'READY') {
    const toolUrl = `${deployment.url}/tools/${proto.id}`
    return NextResponse.json(
      { id: proto.id, status: 'ready', url: toolUrl, title: proto.title, updatedAt: now },
      { headers: NO_CACHE_HEADERS },
    )
  }
  if (deployment.state === 'ERROR' || deployment.state === 'CANCELED') {
    return NextResponse.json(
      { id: proto.id, status: 'failed', updatedAt: now },
      { headers: NO_CACHE_HEADERS },
    )
  }
  if (deployment.state === 'UNKNOWN') {
    // TOKEN 미설정 / API 실패 → proto 있으면 ready 로 보수적 간주 (기존 동작 유지).
    const toolUrl = `${proto.url}/tools/${proto.id}`
    return NextResponse.json(
      { id: proto.id, status: 'ready', url: toolUrl, title: proto.title, updatedAt: now },
      { headers: NO_CACHE_HEADERS },
    )
  }
  // BUILDING / QUEUED / INITIALIZING / NONE
  return NextResponse.json(
    { id: proto.id, status: 'deploying', updatedAt: now },
    { headers: NO_CACHE_HEADERS },
  )
}
