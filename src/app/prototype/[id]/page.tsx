/**
 * Phase 2 임시 라우트 — /prototype/[id]
 *
 * 현재는 SubmissionProgress 가 ready 감지 후 router.push(/prototype/:id) 로 이동해 오지만
 * 정식 상세 페이지(Task 16, Phase 3)가 아직 구현 전이라 404 가 뜨던 것을 방지하는 임시 페이지.
 *
 * 동작:
 *   - KV 에서 `proto:<id>` 조회
 *   - 없으면 404 (Next.js notFound)
 *   - 있으면 title/description + "프로토타입 열기" 링크 (liveUrl 로 새 탭) + "카탈로그로" 링크
 *
 * Task 16 에서 이 파일을 풀기능 상세 페이지(iframe 임베드 + 피드백 폼)로 대체한다.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { getPrototype } from '@/lib/kv'
import { getLivePreviewUrl } from '@/lib/vercel'

export const dynamic = 'force-dynamic'

export default async function PrototypeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const proto = await getPrototype(id)
  if (!proto) notFound()

  // Vercel API 로 실제 배포 alias 조회. 실패/미설정 시 KV 의 proto.url (결정론 조립 — 부정확) 로 fallback.
  const liveUrl = (await getLivePreviewUrl(proto.branch)) ?? proto.url

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-6 flex items-center gap-2">
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            프로토타입 생성 완료
          </Badge>
        </div>

        <h1 className="mb-2 text-3xl font-semibold tracking-tight">{proto.title}</h1>
        <p className="mb-10 text-white/70">{proto.description}</p>

        <div className="mb-10 space-y-4 rounded-lg border border-white/10 bg-white/5 p-6">
          <div>
            <div className="mb-1 text-xs uppercase tracking-wider text-white/50">Preview URL</div>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm text-amber-500 underline-offset-4 hover:underline"
            >
              {liveUrl}
            </a>
          </div>
          <div>
            <div className="mb-1 text-xs uppercase tracking-wider text-white/50">Git Branch</div>
            <code className="text-sm text-white/80">{proto.branch}</code>
          </div>
          <div>
            <div className="mb-1 text-xs uppercase tracking-wider text-white/50">Created At</div>
            <time className="text-sm text-white/80">{proto.createdAt}</time>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-amber-400"
          >
            프로토타입 열기 →
          </a>
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            카탈로그로 돌아가기
          </Link>
        </div>

        <p className="mt-10 text-xs text-white/40">
          빌드가 아직 진행 중일 수 있습니다 (최대 1~2분). 링크를 열었을 때 Vercel 의 &quot;Building…&quot; 페이지가 뜨면 잠시 후 새로고침 하세요.
        </p>
      </main>
    </div>
  )
}
