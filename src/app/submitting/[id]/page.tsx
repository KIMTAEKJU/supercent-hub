import { notFound } from 'next/navigation'

import { SubmissionProgress } from '@/components/submission-progress'
import { SiteHeader } from '@/components/site-header'
import { getRequest } from '@/lib/kv'

/**
 * Phase 1 Task 8 — 제출 대기 페이지 (Server Component).
 *
 * 와이어프레임 4 대응:
 *   - 5단계 진행률 바 (해석 → 생성 → 커밋 → 배포 → 등록) — `SubmissionProgress` 로 위임.
 *   - 예상 소요 시간 카운트다운 — 클라이언트에서 표시.
 *   - 실패 시 retry 버튼 — `SubmissionProgress` 내부.
 *
 * 구조:
 *   - 서버에서 `getRequest(id)` 한 번 조회 → 없으면 404, 있으면 initialStatus 를 전달.
 *   - 클라이언트 컴포넌트가 이후 `/api/proto/[id]/status` 를 3초 간격으로 폴링.
 *
 * Next 16: `params` 는 Promise — `await params` 로 구조분해.
 */
export default async function SubmittingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const record = await getRequest(id)
  if (!record) notFound()

  return (
    <div className="flex min-h-full flex-1 flex-col bg-black text-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <header className="mb-10 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            Step 2 — 생성 중
          </span>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            프로토타입을 만들고 있어요
          </h1>
          <p className="text-base text-zinc-400">
            Claude Code Routine 이 코드를 생성하고 Vercel 에 배포하는 중입니다.
            이 페이지는 자동으로 갱신됩니다.
          </p>
        </header>

        <SubmissionProgress
          requestId={id}
          initialStatus={record.status}
          createdAt={record.createdAt}
        />
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500">
        AI Tool Request Hub · 슈퍼센트 내부 프로토타입
      </footer>
    </div>
  )
}
