import { CatalogFilter } from '@/components/catalog-filter'
import { SiteHeader } from '@/components/site-header'
import { listPrototypes } from '@/lib/kv'

// 카탈로그는 제출 직후 반영이 필요하므로 캐시 우회 (Phase 1 단순화).
export const dynamic = 'force-dynamic'

export default async function CatalogPage() {
  // KV 미연결 대비 빈 배열 fallback. Mock 모드(USE_MOCK_KV=1)면 시드 데이터가 반환됨.
  const prototypes = await listPrototypes().catch(() => [])

  return (
    <div className="flex min-h-full flex-1 flex-col bg-black text-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="flex items-baseline justify-between pb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">카탈로그</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Routine 이 생성한 전체 프로토타입 목록. 검색·태그·정렬로 찾아보세요.
            </p>
          </div>
          <span className="text-sm text-zinc-500">
            총 <span className="font-mono text-white">{prototypes.length}</span>개
          </span>
        </div>

        <CatalogFilter initial={prototypes} />
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500">
        AI Tool Request Hub · 슈퍼센트 내부 프로토타입
      </footer>
    </div>
  )
}
