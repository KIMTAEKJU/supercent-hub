import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const REQUEST_ID = 'req_b2287b95-8068-43c6-bd93-3ea0f3042641'

type AnalysisResult = {
  charCount: number
  charCountNoSpaces: number
  wordCount: number
  lineCount: number
  sentenceCount: number
  longestWord: string
  reversed: string
  upperCase: string
}

function analyze(text: string): AnalysisResult {
  const trimmed = text.trim()
  const words = trimmed.length ? trimmed.split(/\s+/) : []
  const longestWord = words.reduce(
    (acc, w) => (w.length > acc.length ? w : acc),
    '',
  )
  const sentences = trimmed
    .split(/[.!?。！？\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  return {
    charCount: text.length,
    charCountNoSpaces: text.replace(/\s/g, '').length,
    wordCount: words.length,
    lineCount: text.length ? text.split(/\r?\n/).length : 0,
    sentenceCount: sentences.length,
    longestWord,
    reversed: Array.from(text).reverse().join(''),
    upperCase: text.toUpperCase(),
  }
}

async function analyzeAction(formData: FormData) {
  'use server'
  const text = String(formData.get('text') ?? '').slice(0, 5000)
  redirect(`/tools/${REQUEST_ID}?q=${encodeURIComponent(text)}`)
}

async function clearAction() {
  'use server'
  redirect(`/tools/${REQUEST_ID}`)
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const input = typeof q === 'string' ? q : ''
  const result = input ? analyze(input) : null

  return (
    <div className="flex min-h-full flex-1 flex-col bg-black text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
          <Link href="/catalog" className="text-sm text-zinc-400 hover:text-white">
            ← 카탈로그
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            프로토타입 · 테스트
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <section className="mb-10 space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            테스트 프로토타입
          </h1>
          <p className="text-base text-zinc-400">
            입력한 텍스트의 길이 · 단어 · 문장 등을 즉시 분석합니다.
          </p>
        </section>

        <form action={analyzeAction} className="space-y-4">
          <label htmlFor="text" className="block text-sm font-medium text-white">
            분석할 텍스트
          </label>
          <textarea
            id="text"
            name="text"
            required
            rows={6}
            defaultValue={input}
            maxLength={5000}
            placeholder="여기에 문장을 입력하세요…"
            className="block w-full rounded-lg border border-white/10 bg-zinc-950 p-4 text-white placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">최대 5000자</p>
            <div className="flex gap-2">
              {input ? (
                <button
                  type="submit"
                  formAction={clearAction}
                  className="rounded-md border border-white/15 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"
                >
                  초기화
                </button>
              ) : null}
              <button
                type="submit"
                className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-500/90"
              >
                분석하기
              </button>
            </div>
          </div>
        </form>

        {result ? (
          <section className="mt-10 space-y-6">
            <h2 className="text-xl font-semibold text-white">분석 결과</h2>
            <dl className="grid grid-cols-2 gap-4 rounded-xl border border-white/10 bg-zinc-950/60 p-6 md:grid-cols-3">
              <Stat label="글자 수" value={result.charCount} />
              <Stat label="공백 제외" value={result.charCountNoSpaces} />
              <Stat label="단어 수" value={result.wordCount} />
              <Stat label="줄 수" value={result.lineCount} />
              <Stat label="문장 수" value={result.sentenceCount} />
              <Stat
                label="가장 긴 단어"
                value={result.longestWord || '—'}
                mono
              />
            </dl>

            <details className="rounded-xl border border-white/10 bg-zinc-950/60 p-6">
              <summary className="cursor-pointer text-sm font-medium text-zinc-200">
                변형 보기 (대문자 / 뒤집기)
              </summary>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">
                    UPPERCASE
                  </p>
                  <p className="whitespace-pre-wrap break-words font-mono text-zinc-100">
                    {result.upperCase}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">
                    REVERSED
                  </p>
                  <p className="whitespace-pre-wrap break-words font-mono text-zinc-100">
                    {result.reversed}
                  </p>
                </div>
              </div>
            </details>
          </section>
        ) : (
          <p className="mt-10 rounded-xl border border-dashed border-white/10 bg-zinc-950/40 p-8 text-center text-sm text-zinc-500">
            텍스트를 입력하고 “분석하기”를 누르면 결과가 표시됩니다.
          </p>
        )}
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500">
        AI Tool Request Hub · 슈퍼센트 내부 프로토타입
      </footer>
    </div>
  )
}

function Stat({
  label,
  value,
  mono,
}: {
  label: string
  value: number | string
  mono?: boolean
}) {
  return (
    <div>
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd
        className={`mt-1 text-2xl font-semibold text-white ${mono ? 'font-mono text-lg' : ''}`}
      >
        {value}
      </dd>
    </div>
  )
}
