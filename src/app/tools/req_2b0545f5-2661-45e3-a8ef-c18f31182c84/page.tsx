export const dynamic = 'force-dynamic'

type KeywordGroup = { words: string[]; reason: string }
type Factor = { key: string; emoji: string; groups: KeywordGroup[] }

const FACTORS: Factor[] = [
  {
    key: '3초 훅', emoji: '⚡',
    groups: [
      { words: ['시간', '타이머', '초', '카운트', '제한시간'], reason: '시간 압박' },
      { words: ['빠른', '스피드', '급박', '즉시', '속도'], reason: '빠른 전개' },
      { words: ['추격', '피하', '회피', '경주', '달리'], reason: '긴급한 행동' },
      { words: ['충돌', '공격', '폭발', '전투', '대결'], reason: '즉각 충돌' },
    ],
  },
  {
    key: '즉시 보상', emoji: '💰',
    groups: [
      { words: ['돈', '코인', '골드', '머니', '캐시'], reason: '재화 획득' },
      { words: ['보상', '획득', '얻', '수집', '모으'], reason: '수집 루프' },
      { words: ['꾸미', '장식', '커스터마이', '인테리어'], reason: '꾸미기 피드백' },
      { words: ['아이템', '점수', '포인트', '별'], reason: '즉각 피드백' },
    ],
  },
  {
    key: '상승 곡선', emoji: '📈',
    groups: [
      { words: ['레벨', '업그레이드', '강화', '진화'], reason: '레벨업 구조' },
      { words: ['성장', '발전', '확장', '키우'], reason: '성장 루프' },
      { words: ['단계', '스테이지', '챕터', '월드'], reason: '단계 구성' },
      { words: ['해금', '언락', '잠금해제', '개방'], reason: '해금 루프' },
    ],
  },
  {
    key: 'FOMO', emoji: '🔥',
    groups: [
      { words: ['한정', '제한', '오늘만', '기간', '이벤트'], reason: '기간 한정' },
      { words: ['랭킹', '순위', '경쟁', '리더보드'], reason: '경쟁 요소' },
      { words: ['매일', '데일리', '출석'], reason: '데일리 훅' },
      { words: ['친구', '공유', '초대', '멀티'], reason: '소셜 훅' },
    ],
  },
  {
    key: '반복성', emoji: '🔄',
    groups: [
      { words: ['반복', '매일', '계속', '무한', '엔들리스'], reason: '반복 루프' },
      { words: ['수집', '모으', '채우', '퍼즐'], reason: '수집 구조' },
      { words: ['여러', '다수', '많은', '여러번'], reason: '다회차 플레이' },
      { words: ['재도전', '재시도', '갱신', '경신'], reason: '재도전 설계' },
    ],
  },
  {
    key: '단순성', emoji: '👆',
    groups: [
      { words: ['한번', '원터치', '탭', '누르'], reason: '원터치 조작' },
      { words: ['쉬운', '간단', '직관', '쉽게'], reason: '쉬운 조작' },
      { words: ['스와이프', '드래그', '슬라이드'], reason: '간단 제스처' },
      { words: ['캐주얼', '가벼운', '짧은', '미니'], reason: '캐주얼 설계' },
    ],
  },
]

type Score = { label: string; emoji: string; score: number; reasons: string[] }

function scoreConcept(text: string): Score[] {
  const lower = text.toLowerCase()
  const tooShort = text.trim().length < 10
  return FACTORS.map((f) => {
    const reasons: string[] = []
    for (const g of f.groups) {
      if (g.words.some((w) => lower.includes(w.toLowerCase()))) reasons.push(g.reason)
    }
    let score = 3 + reasons.length * 2
    if (tooShort) score = Math.max(0, score - 2)
    if (score > 10) score = 10
    return { label: f.key, emoji: f.emoji, score, reasons }
  })
}

function barColor(s: number) {
  if (s >= 7) return '#10b981'
  if (s >= 4) return '#f59e0b'
  return '#ef4444'
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const scores = q.trim() ? scoreConcept(q) : null
  const total = scores?.reduce((s, x) => s + x.score, 0) ?? 0
  const threshold = 36
  const viable = total >= threshold

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111' }}>
      <h1 style={{ fontSize: 28, margin: 0 }}>🎮 하이퍼캐주얼 훅 점수기</h1>
      <p style={{ color: '#555', marginTop: 6 }}>
        게임 컨셉 한두 문장을 입력하면 6개 훅 요소(3초 훅 · 즉시 보상 · 상승 곡선 · FOMO · 반복성 · 단순성)를 0~10점으로 채점합니다.
      </p>
      <p style={{ color: '#92400e', fontSize: 13, background: '#fef3c7', padding: '8px 12px', borderRadius: 6, margin: '12px 0 0' }}>
        ⚠️ 이 도구는 키워드 기반 룰 휴리스틱입니다. 실제 판단은 플레이 테스트로 검증하세요.
      </p>

      <form method="get" style={{ marginTop: 20 }}>
        <textarea
          name="q"
          defaultValue={q}
          placeholder="예: 손님 주문 맞추고 돈 벌어서 카페 꾸미는 게임. 단계마다 제한 시간."
          rows={4}
          style={{ width: '100%', padding: 12, fontSize: 15, border: '1px solid #d1d5db', borderRadius: 8, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
        <button
          type="submit"
          style={{ marginTop: 10, padding: '10px 18px', background: '#111', color: '#fff', border: 0, borderRadius: 8, fontSize: 15, cursor: 'pointer' }}
        >
          점수 계산
        </button>
      </form>

      {scores && (
        <section style={{ marginTop: 28 }}>
          <div
            style={{
              padding: 16, borderRadius: 10, marginBottom: 20,
              background: viable ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${viable ? '#86efac' : '#fca5a5'}`,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              총점 {total}/60 {viable ? '→ ✅ 프로토타입 가치 있음' : '→ ❌ 보강 필요'}
            </div>
            <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
              임계치 {threshold}점 이상이면 프로토타입 가치 있음으로 판정.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {scores.map((s) => (
              <div key={s.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontWeight: 600 }}>
                    {s.emoji} {s.label}
                    {s.reasons.length > 0 && (
                      <span style={{ fontSize: 12, color: '#666', marginLeft: 8, fontWeight: 400 }}>
                        ({s.reasons.join(', ')})
                      </span>
                    )}
                  </span>
                  <span style={{ fontWeight: 700 }}>{s.score}/10</span>
                </div>
                <div style={{ height: 10, background: '#e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${s.score * 10}%`,
                      height: '100%',
                      background: barColor(s.score),
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
