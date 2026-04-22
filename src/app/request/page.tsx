import Link from 'next/link'

import { RequestForm } from '@/components/request-form'
import { SiteHeader } from '@/components/site-header'

/**
 * Phase 1 Task 7 — 요청 폼 페이지 (Server Component).
 *
 * 구조 (와이어프레임 3):
 *   - SiteHeader (공통)
 *   - 페이지 제목 + 1줄 안내
 *   - <RequestForm /> (Client Component, 상호작용 경계)
 *   - 하단 "카탈로그로 돌아가기" 링크
 *
 * 서버/클라이언트 분리 이유 (RSC best practice):
 *   - 폼 자체만 Client → 헤더/설명/레이아웃은 모두 서버에서 정적 렌더
 *   - submitRequest 서버 액션은 lib/actions.ts 의 'use server' 모듈에서 import
 */
export default function RequestPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-black text-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <header className="mb-10 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            Step 1 — 요청
          </span>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            AI 도구 요청하기
          </h1>
          <p className="text-base text-zinc-400">
            4개 필드에 답하면 Claude Code Routine 이 Next.js 프로토타입을 자동 생성해
            카탈로그에 등록합니다. 2~3분이면 충분합니다.
          </p>
        </header>

        <RequestForm />

        <div className="mt-10 border-t border-white/10 pt-6 text-sm">
          <Link
            href="/catalog"
            className="text-zinc-400 transition-colors hover:text-white"
          >
            ← 카탈로그로 돌아가기
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500">
        AI Tool Request Hub · 슈퍼센트 내부 프로토타입
      </footer>
    </div>
  )
}
