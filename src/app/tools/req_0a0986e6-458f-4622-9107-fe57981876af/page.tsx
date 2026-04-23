import Link from 'next/link'

export const dynamic = 'force-dynamic'

const TITLE = '핵심 3줄 요약기'
const DESC = '긴 텍스트를 붙여넣으면 3개 불릿 포인트로 핵심을 요약합니다.'

type SearchParams = Promise<{
  input?: string
  bullets?: string
  error?: string
}>

async function summarize(formData: FormData) {
  'use server'
  const { redirect } = await import('next/navigation')
  const input = String(formData.get('input') ?? '').trim()
  if (!input) redirect('/tools/req_0a0986e6-458f-4622-9107-fe57981876af?error=empty')
  if (input.length > 5000) redirect('/tools/req_0a0986e6-458f-4622-9107-fe57981876af?error=toolong')

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    redirect('/tools/req_0a0986e6-458f-4622-9107-fe57981876af?error=nokey')
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system:
          '너는 한국어 요약 도우미다. 사용자가 제공한 텍스트를 정확히 3개의 짧은 불릿 포인트로 요약한다. 각 불릿은 한 줄 (최대 60자). 출력 형식: 각 줄은 정확히 "• " 로 시작하고 총 3줄만 출력한다. 다른 텍스트, 서문, 결론, 번호 매기기는 금지.',
        messages: [{ role: 'user', content: input }],
      }),
      cache: 'no-store',
    })
    if (!res.ok) redirect('/tools/req_0a0986e6-458f-4622-9107-fe57981876af?error=api')
    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> }
    const text = (data.content ?? [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text ?? '')
      .join('\n')
      .trim()
    const bullets = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('•'))
      .slice(0, 3)
      .join('\n')
    const params = new URLSearchParams({ input, bullets: bullets || text })
    redirect(`/tools/req_0a0986e6-458f-4622-9107-fe57981876af?${params.toString()}`)
  } catch (e) {
    if ((e as { digest?: string })?.digest?.startsWith?.('NEXT_REDIRECT')) throw e
    redirect('/tools/req_0a0986e6-458f-4622-9107-fe57981876af?error=api')
  }
}

function errorMessage(code?: string) {
  if (!code) return null
  if (code === 'empty') return '텍스트를 입력해주세요.'
  if (code === 'toolong') return '텍스트가 너무 깁니다 (최대 5,000자).'
  if (code === 'nokey') return '서버에 ANTHROPIC_API_KEY 가 설정되지 않았습니다.'
  if (code === 'api') return 'Anthropic API 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  return '알 수 없는 오류.'
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { input = '', bullets = '', error } = await searchParams
  const errMsg = errorMessage(error)
  const bulletList = bullets.split('\n').filter(Boolean)

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/catalog" className="text-sm text-white/60 hover:text-white">
            ← 카탈로그
          </Link>
          <span className="text-xs text-white/40">AI Tool Prototype</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight">{TITLE}</h1>
        <p className="mb-8 text-white/60">{DESC}</p>

        <form action={summarize} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-white/80">요약할 텍스트</span>
            <textarea
              name="input"
              defaultValue={input}
              rows={10}
              maxLength={5000}
              required
              placeholder="여기에 긴 문장을 붙여넣으세요 (최대 5,000자)..."
              className="w-full rounded-md border border-white/20 bg-white/5 p-3 text-sm text-white placeholder:text-white/30 focus:border-amber-500 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-amber-400"
          >
            3줄로 요약하기
          </button>
        </form>

        {errMsg ? (
          <div className="mt-6 rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            {errMsg}
          </div>
        ) : null}

        {bulletList.length > 0 ? (
          <section className="mt-10">
            <h2 className="mb-3 text-sm uppercase tracking-wider text-white/50">요약 결과</h2>
            <ul className="space-y-2 rounded-md border border-white/10 bg-white/5 p-5">
              {bulletList.map((b, i) => (
                <li key={i} className="text-sm text-white/90">
                  {b}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mt-12 text-xs text-white/30">
          이 도구는 Anthropic Claude API 를 사용합니다. 입력 텍스트는 저장되지 않습니다.
        </p>
      </main>
    </div>
  )
}
