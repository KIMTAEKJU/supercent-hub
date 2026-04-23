export const dynamic = 'force-dynamic'

type Rgb = { r: number; g: number; b: number }

function normalizeHex(input: string): string | null {
  const trimmed = input.trim().replace(/^#/, '').toLowerCase()
  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/.test(trimmed)) return null
  return trimmed.length === 3
    ? trimmed.split('').map((c) => c + c).join('')
    : trimmed
}

function hexToRgb(hex: string): Rgb {
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  }
}

function rgbToHex({ r, g, b }: Rgb): string {
  const h = (n: number) => n.toString(16).padStart(2, '0')
  return `${h(r)}${h(g)}${h(b)}`
}

function rgbToHsl({ r, g, b }: Rgb) {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0)
    else if (max === gn) h = (bn - rn) / d + 2
    else h = (rn - gn) / d + 4
    h *= 60
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function invert({ r, g, b }: Rgb): Rgb {
  return { r: 255 - r, g: 255 - g, b: 255 - b }
}

function luminance({ r, g, b }: Rgb) {
  return (r * 299 + g * 587 + b * 114) / 1000
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: '#f7f7f8',
        borderRadius: 8,
      }}
    >
      <span style={{ fontSize: 13, color: '#666' }}>{label}</span>
      <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: '#111' }}>
        {value}
      </code>
    </div>
  )
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const hex = q ? normalizeHex(q) : null
  const rgb = hex ? hexToRgb(hex) : null
  const hsl = rgb ? rgbToHsl(rgb) : null
  const inv = rgb ? invert(rgb) : null
  const invHex = inv ? rgbToHex(inv) : null

  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '40px 24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#111',
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>HEX 색상 변환기</h1>
      <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>
        HEX 코드를 입력하면 RGB · HSL · 반대색과 색상 샘플을 즉시 보여줍니다.
      </p>

      <form method="get" style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="#FF5733"
          autoComplete="off"
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 16,
            border: '1px solid #ccc',
            borderRadius: 8,
            fontFamily: 'ui-monospace, monospace',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 24px',
            fontSize: 15,
            fontWeight: 500,
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          변환
        </button>
      </form>

      {q && !hex && (
        <div
          style={{
            padding: 16,
            background: '#fef2f2',
            color: '#991b1b',
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          올바른 HEX 형식이 아닙니다. 예: <code>#FF5733</code> 또는 <code>#F53</code>
        </div>
      )}

      {hex && rgb && hsl && invHex && inv && (
        <div style={{ display: 'grid', gap: 12 }}>
          <div
            style={{
              height: 180,
              background: `#${hex}`,
              borderRadius: 12,
              border: '1px solid #e5e5e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: luminance(rgb) > 140 ? '#111' : '#fff',
              fontSize: 24,
              fontFamily: 'ui-monospace, monospace',
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            #{hex.toUpperCase()}
          </div>

          <Row label="HEX" value={`#${hex.toUpperCase()}`} />
          <Row label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
          <Row label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8, letterSpacing: 0.5 }}>
              반대색 (INVERTED)
            </div>
            <div
              style={{
                height: 96,
                background: `#${invHex}`,
                borderRadius: 12,
                border: '1px solid #e5e5e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: luminance(inv) > 140 ? '#111' : '#fff',
                fontSize: 18,
                fontFamily: 'ui-monospace, monospace',
                fontWeight: 600,
              }}
            >
              #{invHex.toUpperCase()}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
