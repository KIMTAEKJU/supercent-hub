export const dynamic = 'force-dynamic'

type Variant = {
  tone: string
  age: string
  title: string
  subtitle: string
  description: string
}

function clamp(s: string, max: number) {
  if (s.length <= max) return s
  return s.slice(0, Math.max(0, max - 1)).replace(/\s+$/, '') + '…'
}

function parseKeywords(input: string) {
  const parts = input
    .split(/[,，、\n/|]+/)
    .map((p) => p.trim())
    .filter(Boolean)
  return { genre: parts[0] ?? '', points: parts.slice(1), all: parts }
}

function buildVariants(input: string): Variant[] {
  const { genre, points, all } = parseKeywords(input)
  const joinedPoints = points.length ? points.join(' · ') : ''
  const joinedAll = all.join(', ')
  const firstPoint = points[0] ?? genre
  const secondPoint = points[1] ?? firstPoint

  return [
    {
      tone: '캐주얼 · 가족 친화',
      age: '전체 이용가 (4+)',
      title: clamp(`${genre || '신작 게임'} : ${firstPoint} 가득한 하루`, 80),
      subtitle: clamp(`${secondPoint} 한 스푼의 즐거움`, 30),
      description: clamp(
        `${genre || '게임'}의 재미를 누구나 쉽게! ${joinedPoints || '간단한 조작과 귀여운 연출'}로 부담 없이 즐기는 한 판. 잠깐의 틈에도 딱 맞는 캐주얼 경험을 선물합니다.`,
        200,
      ),
    },
    {
      tone: '감성 · 힐링',
      age: '9세 이상 (9+)',
      title: clamp(
        `${firstPoint || '감성'} 가득 ${genre || '힐링 게임'} — 오늘도 한 판`,
        80,
      ),
      subtitle: clamp(`${genre || '힐링'}으로 채우는 여유`, 30),
      description: clamp(
        `바쁜 하루를 달래주는 ${genre || '힐링'} ${joinedPoints ? '— ' + joinedPoints : ''}. 작은 성취와 따뜻한 이야기가 이어지며, 언제 어디서든 부드럽게 몰입할 수 있는 마음의 쉼표를 건넵니다.`,
        200,
      ),
    },
    {
      tone: '도전 · 몰입',
      age: '12세 이상 (12+)',
      title: clamp(
        `${genre || '전략 게임'} 마스터 도전! ${joinedPoints || '한계 돌파'}`,
        80,
      ),
      subtitle: clamp(`끝까지 가는 ${firstPoint || '승부'}`, 30),
      description: clamp(
        `${genre || '게임'} 본연의 재미를 극한까지 — ${joinedAll || '전략과 순발력의 결합'}. 점점 높아지는 난이도와 다채로운 콘텐츠가 당신의 손끝을 쉬지 못하게 만듭니다. 지금 도전을 시작하세요.`,
        200,
      ),
    },
  ]
}

const card: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 20,
  marginTop: 16,
  background: '#ffffff',
}
const label: React.CSSProperties = { fontSize: 12, color: '#6b7280' }

function VariantCard({ v, i }: { v: Variant; i: number }) {
  return (
    <section style={card}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <strong style={{ fontSize: 14, color: '#6b7280' }}>안 {i + 1}</strong>
        <span style={{ fontSize: 13, color: '#2563eb' }}>{v.tone}</span>
        <span style={{ fontSize: 13, color: '#16a34a' }}>대상: {v.age}</span>
      </header>
      <dl style={{ marginTop: 12, display: 'grid', rowGap: 10 }}>
        <div>
          <dt style={label}>타이틀 · {v.title.length}/80</dt>
          <dd style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{v.title}</dd>
        </div>
        <div>
          <dt style={label}>부제 · {v.subtitle.length}/30</dt>
          <dd style={{ margin: 0, fontSize: 15 }}>{v.subtitle}</dd>
        </div>
        <div>
          <dt style={label}>설명 · {v.description.length}/200</dt>
          <dd style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{v.description}</dd>
        </div>
      </dl>
    </section>
  )
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const variants = q ? buildVariants(q) : null

  return (
    <main
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: 24,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        color: '#111827',
      }}
    >
      <h1 style={{ fontSize: 24, margin: 0 }}>App Store 문구 생성기</h1>
      <p style={{ color: '#4b5563', marginTop: 6 }}>
        게임 장르와 핵심 재미 포인트를 입력하면 타겟 연령대가 다른 3안을 제안합니다. (룰 기반 휴리스틱)
      </p>

      <form method="get" style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="예: Match-3, 카페 운영 시뮬, 귀여운 캐릭터 수집"
          style={{ flex: '1 1 320px', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}
        />
        <button
          type="submit"
          style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#111827', color: '#fff', fontSize: 14, cursor: 'pointer' }}
        >
          생성
        </button>
      </form>

      <p style={{ marginTop: 10, fontSize: 12, color: '#6b7280' }}>
        쉼표·슬래시·줄바꿈으로 구분. 첫 항목은 장르, 나머지는 재미 포인트로 사용됩니다.
      </p>

      {variants && (
        <div style={{ marginTop: 8 }}>
          {variants.map((v, i) => (
            <VariantCard key={i} v={v} i={i} />
          ))}
          <p style={{ marginTop: 16, fontSize: 12, color: '#9ca3af' }}>
            ※ 이 도구는 룰 기반 휴리스틱입니다. 실제 출시 문구는 심사 가이드와 현지화 검토를 거치세요.
          </p>
        </div>
      )}
    </main>
  )
}
