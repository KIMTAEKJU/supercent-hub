export const dynamic = 'force-dynamic'

type Scores = { fun: number; novelty: number; difficulty: number; comment: string[] }

const FUN_POS: Array<[string, number]> = [
  ['액션', 1], ['퍼즐', 1], ['협동', 1], ['보상', 1], ['타이머', 1],
  ['콤보', 1.5], ['수집', 0.5], ['모험', 1], ['대전', 1], ['레이싱', 1],
  ['파괴', 1], ['경쟁', 0.5], ['전략', 0.5], ['레벨업', 0.5], ['스릴', 1.5],
  ['미니게임', 1], ['챌린지', 1], ['스피드', 1], ['빠르', 1], ['러프', 0.5],
  ['판타지', 0.5], ['생존', 1], ['탈출', 1], ['어드벤처', 0.5],
]
const FUN_NEG: Array<[string, number]> = [
  ['텍스트만', 2], ['단순', 1], ['반복', 0.5], ['느린', 1],
]

const COMMON_GENRE: Array<[string, number]> = [
  ['매치3', 2.5], ['매치-3', 2.5], ['클리커', 2.5], ['방치형', 2],
  ['러너', 1.5], ['타이머', 1], ['레이싱', 0.5], ['슬롯', 2],
  ['운영', 0.5], ['주문', 0.5],
]
const NOVEL_BONUS: Array<[string, number]> = [
  ['생태계', 1.5], ['시뮬레이션', 1], ['요리', 0.5], ['환경', 1],
  ['역사', 1], ['실험', 1], ['혼합', 1], ['재해석', 2], ['해양', 1],
  ['우주', 0.5], ['시간여행', 2], ['감정', 1], ['철학', 1.5],
]

const HARD_WORDS: Array<[string, number]> = [
  ['멀티플레이어', 3], ['온라인', 2], ['3D', 3], ['오픈월드', 3],
  ['AI', 2], ['물리엔진', 2], ['물리', 1.5], ['RPG', 2], ['블록체인', 3],
  ['AR', 4], ['VR', 4], ['실시간', 2], ['서버', 2], ['랭킹', 1],
  ['네트워크', 2], ['매칭', 1.5], ['리플레이', 1],
]
const EASY_WORDS: Array<[string, number]> = [
  ['타이머', 1], ['탭', 1], ['클리커', 1], ['캐주얼', 1], ['2D', 1],
  ['매치3', 1], ['러너', 0.5], ['하이퍼캐주얼', 1.5],
]

function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)) }
function round1(n: number) { return Math.round(n * 10) / 10 }

function evaluate(text: string): Scores {
  const t = text.trim()

  let fun = 5
  for (const [k, w] of FUN_POS) if (t.includes(k)) fun += w
  for (const [k, w] of FUN_NEG) if (t.includes(k)) fun -= w
  if (t.length < 15) fun -= 1.5
  if (t.length > 80) fun += 0.5

  let novelty = 5
  for (const [k, w] of COMMON_GENRE) if (t.includes(k)) novelty -= w
  for (const [k, w] of NOVEL_BONUS) if (t.includes(k)) novelty += w
  const words = t.split(/\s+/).filter((w) => w.length > 1)
  const uniq = new Set(words).size
  if (uniq >= 10) novelty += 1
  if (uniq >= 14) novelty += 1

  let difficulty = 3
  for (const [k, w] of HARD_WORDS) if (t.includes(k)) difficulty += w
  for (const [k, w] of EASY_WORDS) if (t.includes(k)) difficulty -= w
  if (t.length > 120) difficulty += 1

  fun = round1(clamp(fun, 1, 10))
  novelty = round1(clamp(novelty, 1, 10))
  difficulty = round1(clamp(difficulty, 1, 10))

  const comment: string[] = []
  if (fun >= 8) comment.push('재미 루프가 탄탄합니다. 핵심 훅이 잘 잡혀 있어요.')
  else if (fun >= 5) comment.push('무난한 재미 수준입니다. 한 가지 훅(콤보/보상/긴장감)을 더 강화하면 체류 시간이 늘어납니다.')
  else comment.push('재미 요소가 약합니다. 플레이어에게 즉시 전달될 자극이나 보상을 보강하세요.')

  if (novelty >= 7) comment.push('장르적으로 신선합니다. 시장에서 눈에 띌 여지가 있어요.')
  else if (novelty >= 4) comment.push('검증된 장르를 활용하지만 차별화 요소가 부족합니다. 비주얼·테마·메커닉 중 한 가지 트위스트를 고민해 보세요.')
  else comment.push('이미 포화된 장르입니다. 차별점이 뚜렷하지 않으면 마케팅 난이도가 매우 높아집니다.')

  if (difficulty >= 8) comment.push('구현 난이도가 매우 높습니다. 프로토타입은 핵심 메커닉만 잘라 MVP로 축소하세요.')
  else if (difficulty >= 5) comment.push('중간 난이도입니다. 2~4주 규모의 프로토타입으로 검증 가능해 보입니다.')
  else comment.push('구현이 간단합니다. 며칠 내 프로토타입을 만들어 빠르게 테스트할 수 있습니다.')

  return { fun, novelty, difficulty, comment }
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const color = value >= 7 ? '#16a34a' : value >= 4 ? '#d97706' : '#dc2626'
  return (
    <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 16, textAlign: 'center', background: '#fff' }}>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 6, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>
        {value}
        <span style={{ fontSize: 14, color: '#aaa', fontWeight: 500 }}> /10</span>
      </div>
    </div>
  )
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const result = q ? evaluate(q) : null

  return (
    <main
      style={{
        maxWidth: 720,
        margin: '40px auto',
        padding: 24,
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        lineHeight: 1.55,
        color: '#111',
      }}
    >
      <h1 style={{ fontSize: 26, marginBottom: 6, fontWeight: 700 }}>게임 아이디어 3축 평가기</h1>
      <p style={{ color: '#555', fontSize: 14, marginBottom: 24 }}>
        아이디어를 한 문장으로 입력하면 <b>재미도·참신성·구현 난이도</b> 3축을 10점 만점으로 즉시 채점합니다.
        <br />
        <small style={{ color: '#888' }}>※ 이 도구는 LLM이 아닌 룰 기반 휴리스틱(키워드 가중치)으로 동작합니다.</small>
      </p>

      <form method="get" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        <label htmlFor="q" style={{ fontSize: 13, fontWeight: 600 }}>
          아이디어 한 문장
        </label>
        <textarea
          id="q"
          name="q"
          defaultValue={q}
          rows={3}
          placeholder='예) 커피숍을 운영하며 손님 주문을 빠르게 처리하는 타이머 게임'
          style={{
            padding: 10,
            border: '1px solid #ccc',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 16px',
            width: 'fit-content',
            background: '#111',
            color: '#fff',
            border: 0,
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          평가하기
        </button>
      </form>

      {result && (
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            <ScoreCard label="재미도" value={result.fun} />
            <ScoreCard label="참신성" value={result.novelty} />
            <ScoreCard label="구현 난이도" value={result.difficulty} />
          </div>
          <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 18, background: '#fafafa' }}>
            <h2 style={{ fontSize: 15, marginBottom: 10, fontWeight: 700 }}>코멘트</h2>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {result.comment.map((line, i) => (
                <li key={i} style={{ marginBottom: 6, fontSize: 14 }}>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  )
}
