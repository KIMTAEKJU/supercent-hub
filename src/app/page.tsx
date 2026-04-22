import Link from 'next/link'

import { PrototypeCard } from '@/components/prototype-card'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { listPrototypes, listRequests } from '@/lib/kv'

// KV 가 stale cache 에 갇히지 않도록 매 요청 새로 조회 (Phase 1 단순화).
// Phase 3 이후엔 revalidateTag 로 대체 예정.
export const dynamic = 'force-dynamic'

export default async function Home() {
  // Promise.all 로 두 리스트를 병렬 조회 (async-parallel).
  // KV 미연결 / 네트워크 이슈 시에도 페이지가 렌더되도록 catch-fallback.
  const [prototypes, requests] = await Promise.all([
    listPrototypes().catch(() => []),
    listRequests().catch(() => []),
  ])

  const preview = prototypes
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6)

  return (
    <div className="flex min-h-full flex-1 flex-col bg-black text-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <section className="flex flex-col items-start gap-6 pb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            Claude Code Routines 기반
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            사내 AI 도구 요청을 받아 <br />
            즉시 프로토타입을 자동 생성하는 Hub
          </h1>
          <p className="max-w-2xl text-lg text-zinc-400">
            문제를 4필드로 적어 제출하면 Claude Code Routine 이 Next.js 프로토타입을 생성하고
            Vercel 에 배포한 뒤 카탈로그에 등록합니다.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link href="/request">
              <Button
                size="lg"
                className="bg-amber-500 text-black hover:bg-amber-500/90"
              >
                도구 요청하기
              </Button>
            </Link>
            <Link href="/catalog">
              <Button size="lg" variant="outline" className="border-white/20 text-white">
                전체 카탈로그 →
              </Button>
            </Link>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-6 text-sm md:grid-cols-3">
            <div>
              <dt className="text-zinc-500">총 요청 수</dt>
              <dd className="font-mono text-2xl font-semibold text-white">
                {requests.length}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">총 프로토타입</dt>
              <dd className="font-mono text-2xl font-semibold text-white">
                {prototypes.length}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">승격 후보</dt>
              <dd className="font-mono text-2xl font-semibold text-amber-400">
                {
                  prototypes.filter(
                    (p) => p.useCount >= 10 || p.positiveFeedbackCount >= 3,
                  ).length
                }
              </dd>
            </div>
          </dl>
        </section>

        <section className="space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-white">최근 프로토타입</h2>
            <Link
              href="/catalog"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              전체 보기 →
            </Link>
          </div>

          {preview.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-zinc-950/50 p-12 text-center">
              <p className="text-zinc-400">
                아직 생성된 프로토타입이 없습니다. 첫 번째 요청을 남겨 주세요.
              </p>
              <div className="mt-6">
                <Link href="/request">
                  <Button className="bg-amber-500 text-black hover:bg-amber-500/90">
                    도구 요청하기
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {preview.map((p) => (
                <PrototypeCard key={p.id} prototype={p} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500">
        AI Tool Request Hub · 슈퍼센트 내부 프로토타입
      </footer>
    </div>
  )
}
