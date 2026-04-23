export const dynamic = 'force-dynamic'

function parseNumber(raw: string): number | null {
  if (!raw) return null
  const cleaned = raw.replace(/[\s,_원₩]/g, '')
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null
  const n = Number(cleaned)
  if (!Number.isFinite(n)) return null
  return n
}

function formatKRW(n: number): string {
  const sign = n > 0 ? '+' : n < 0 ? '-' : ''
  const abs = Math.abs(Math.round(n))
  return `${sign}${abs.toLocaleString('ko-KR')}원`
}

type Computed = {
  ad: number
  revenue: number
  roas: number
  profit: number
  status: '흑자' | '적자' | '손익분기'
  statusColor: string
}

function compute(adRaw: string, revRaw: string): { ok: true; data: Computed } | { ok: false; error: string } {
  const ad = parseNumber(adRaw)
  const rev = parseNumber(revRaw)
  if (ad === null) return { ok: false, error: '광고비 값을 숫자로 입력해 주세요. (예: 1,000,000)' }
  if (rev === null) return { ok: false, error: '매출 값을 숫자로 입력해 주세요. (예: 1,800,000)' }
  if (ad <= 0) return { ok: false, error: '광고비는 0보다 큰 값이어야 합니다.' }
  if (rev < 0) return { ok: false, error: '매출은 0 이상이어야 합니다.' }

  const roas = (rev / ad) * 100
  const profit = rev - ad
  const status: Computed['status'] = profit > 0 ? '흑자' : profit < 0 ? '적자' : '손익분기'
  const statusColor = profit > 0 ? '#16a34a' : profit < 0 ? '#dc2626' : '#6b7280'
  return { ok: true, data: { ad, revenue: rev, roas, profit, status, statusColor } }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ ad?: string; rev?: string }>
}) {
  const { ad = '', rev = '' } = await searchParams
  const submitted = ad !== '' || rev !== ''
  const result = submitted ? compute(ad, rev) : null

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '2.5rem 1.25rem', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.55 }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>ROAS 계산기</h1>
      <p style={{ color: '#475569', marginTop: 0, marginBottom: '1.5rem' }}>
        광고비와 매출을 입력하면 ROAS %, 순이익, 손익 여부를 즉시 계산합니다.
      </p>

      <form method="get" style={{ display: 'grid', gap: '0.85rem', marginBottom: '1.5rem' }}>
        <label style={{ display: 'grid', gap: '0.3rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#334155' }}>광고비 (원)</span>
          <input
            name="ad"
            defaultValue={ad}
            placeholder="예: 1,000,000"
            inputMode="decimal"
            style={{ padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '1rem' }}
          />
        </label>
        <label style={{ display: 'grid', gap: '0.3rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#334155' }}>매출 (원)</span>
          <input
            name="rev"
            defaultValue={rev}
            placeholder="예: 1,800,000"
            inputMode="decimal"
            style={{ padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '1rem' }}
          />
        </label>
        <button
          type="submit"
          style={{
            padding: '0.65rem 1rem',
            borderRadius: 8,
            border: 'none',
            background: '#0f172a',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            justifySelf: 'start',
          }}
        >
          계산하기
        </button>
      </form>

      {result && !result.ok && (
        <div
          role="alert"
          style={{
            padding: '0.85rem 1rem',
            borderRadius: 8,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
          }}
        >
          {result.error}
        </div>
      )}

      {result && result.ok && (
        <section
          style={{
            display: 'grid',
            gap: '0.75rem',
            padding: '1.25rem',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
          }}
        >
          <Row label="광고비" value={`${Math.round(result.data.ad).toLocaleString('ko-KR')}원`} />
          <Row label="매출" value={`${Math.round(result.data.revenue).toLocaleString('ko-KR')}원`} />
          <Row
            label="ROAS"
            value={`${result.data.roas.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`}
            highlight
          />
          <Row label="순이익" value={formatKRW(result.data.profit)} />
          <Row
            label="손익"
            value={result.data.status}
            valueColor={result.data.statusColor}
            highlight
          />
        </section>
      )}

      <footer style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#94a3b8' }}>
        계산식: ROAS = 매출 ÷ 광고비 × 100 · 순이익 = 매출 − 광고비
      </footer>
    </main>
  )
}

function Row({
  label,
  value,
  highlight,
  valueColor,
}: {
  label: string
  value: string
  highlight?: boolean
  valueColor?: string
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ color: '#64748b', fontSize: '0.95rem' }}>{label}</span>
      <span
        style={{
          fontSize: highlight ? '1.25rem' : '1rem',
          fontWeight: highlight ? 700 : 500,
          color: valueColor ?? '#0f172a',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  )
}
