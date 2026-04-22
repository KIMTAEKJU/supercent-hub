import Link from 'next/link'

import { Button } from '@/components/ui/button'

/**
 * 전역 상단 헤더 — 랜딩/카탈로그/요청 페이지에서 공유.
 * Server Component (상호작용 없음).
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500" aria-hidden />
          <span className="text-sm font-semibold tracking-tight text-white">
            AI Tool Request Hub
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/catalog"
            className="px-2 py-1 text-zinc-300 transition-colors hover:text-white"
          >
            카탈로그
          </Link>
          <Link href="/request">
            <Button
              size="sm"
              className="bg-amber-500 text-black hover:bg-amber-500/90"
            >
              도구 요청하기
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
