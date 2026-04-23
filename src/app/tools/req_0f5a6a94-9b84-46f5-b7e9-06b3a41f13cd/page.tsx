export const dynamic = 'force-dynamic'

type FormatResult =
  | { ok: true; pretty: string; bytes: number; lines: number }
  | { ok: false; message: string; line: number; column: number; snippet: string; caret: string }

function locate(message: string, input: string): { line: number; column: number } {
  const posMatch = message.match(/position\s+(\d+)/i)
  if (posMatch) {
    const position = Math.min(parseInt(posMatch[1], 10), input.length)
    let line = 1
    let column = 1
    for (let i = 0; i < position; i += 1) {
      if (input.charCodeAt(i) === 10) {
        line += 1
        column = 1
      } else {
        column += 1
      }
    }
    return { line, column }
  }
  const lc = message.match(/line\s+(\d+)\s+column\s+(\d+)/i)
  if (lc) return { line: parseInt(lc[1], 10), column: parseInt(lc[2], 10) }
  return { line: 1, column: 1 }
}

function buildSnippet(input: string, line: number, column: number) {
  const rows = input.split('\n')
  const safeLine = Math.max(1, Math.min(line, rows.length))
  const target = rows[safeLine - 1] ?? ''
  const display = target.length > 80 ? target.slice(0, 80) + '…' : target
  const caretCol = Math.max(1, Math.min(column, display.length + 1))
  return { snippet: display, caret: ' '.repeat(caretCol - 1) + '^' }
}

function formatJson(input: string): FormatResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, message: '빈 입력입니다.', line: 1, column: 1, snippet: '', caret: '^' }
  }
  try {
    const parsed = JSON.parse(trimmed)
    const pretty = JSON.stringify(parsed, null, 2)
    return { ok: true, pretty, bytes: new TextEncoder().encode(pretty).length, lines: pretty.split('\n').length }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const { line, column } = locate(message, trimmed)
    const { snippet, caret } = buildSnippet(trimmed, line, column)
    return { ok: false, message, line, column, snippet, caret }
  }
}

const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const result = q ? formatJson(q) : null

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0b0b0d',
        color: '#f5f5f7',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>JSON 포매터</h1>
          <p style={{ margin: 0, color: '#a1a1aa', fontSize: 14 }}>
            한 줄 JSON 을 2-space 들여쓰기로 정렬하고, 파싱 에러는 행·열 위치를 표시합니다.
          </p>
        </header>

        <form method="get" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label htmlFor="q" style={{ fontSize: 13, color: '#d4d4d8' }}>
            JSON 입력
          </label>
          <textarea
            id="q"
            name="q"
            defaultValue={q}
            placeholder={'{"a":1,"b":[2,3]}'}
            rows={8}
            spellCheck={false}
            style={{
              width: '100%',
              padding: 12,
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 8,
              color: '#f4f4f5',
              fontFamily: mono,
              fontSize: 13,
              lineHeight: 1.5,
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="submit"
              style={{
                padding: '10px 18px',
                background: '#fafafa',
                color: '#09090b',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              포맷
            </button>
            <a
              href="?"
              style={{
                padding: '10px 18px',
                color: '#a1a1aa',
                border: '1px solid #27272a',
                borderRadius: 8,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              초기화
            </a>
          </div>
        </form>

        {result && result.ok && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#a1a1aa' }}>
              <span>유효한 JSON</span>
              <span>{result.lines} 줄</span>
              <span>{result.bytes} bytes</span>
            </div>
            <pre
              style={{
                margin: 0,
                padding: 16,
                background: '#09090b',
                border: '1px solid #1f5f3f',
                borderRadius: 8,
                color: '#d1fae5',
                fontFamily: mono,
                fontSize: 13,
                lineHeight: 1.5,
                overflow: 'auto',
                whiteSpace: 'pre',
              }}
            >
              {result.pretty}
            </pre>
          </section>
        )}

        {result && !result.ok && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 13, color: '#fca5a5' }}>
              파싱 에러 — line {result.line}, column {result.column}
            </div>
            <pre
              style={{
                margin: 0,
                padding: 16,
                background: '#09090b',
                border: '1px solid #7f1d1d',
                borderRadius: 8,
                color: '#fecaca',
                fontFamily: mono,
                fontSize: 13,
                lineHeight: 1.5,
                overflow: 'auto',
                whiteSpace: 'pre',
              }}
            >
              {result.snippet}
              {'\n'}
              {result.caret}
            </pre>
            <div style={{ fontSize: 12, color: '#a1a1aa' }}>{result.message}</div>
          </section>
        )}
      </div>
    </main>
  )
}
