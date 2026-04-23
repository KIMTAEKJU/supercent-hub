// Emoji Recommender — rule-based heuristic.
// Input: a single keyword or short situation in Korean/English.
// Output: 5–8 emojis ranked by overlap with a curated keyword→emoji dictionary.
// No external APIs. Pure dictionary lookup + token scoring.

import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Bucket = { keys: string[]; emojis: string[] }

const BUCKETS: Bucket[] = [
  { keys: ['회의', '미팅', '컨퍼런스', '메일', '업무', '일', 'work', 'meeting', 'office', '문서'], emojis: ['💼', '📊', '📝', '🤝', '📅', '🗂️'] },
  { keys: ['끝남', '완료', '마침', '종료', '마감', 'done', 'finish', 'finished', '끝', 'complete'], emojis: ['🎉', '👏', '✨', '🙌', '💪', '🥳'] },
  { keys: ['배고픔', '배고파', '먹다', '음식', '점심', '저녁', '밥', '식사', 'hungry', 'food', 'eat', 'lunch', 'dinner'], emojis: ['🍕', '🍔', '🍜', '😋', '🤤', '🍱', '🥟'] },
  { keys: ['커피', '카페', 'coffee', '아메리카노', '라떼', '에스프레소'], emojis: ['☕', '🥐', '🍪', '😌', '✨'] },
  { keys: ['행복', '기쁨', '좋아', '좋다', 'happy', 'joy', 'glad', '신남', '신난다'], emojis: ['😊', '😄', '🥰', '✨', '🌟', '😁'] },
  { keys: ['슬픔', '울다', '눈물', '슬퍼', '우울', 'sad', 'cry', 'tear', '서럽'], emojis: ['😢', '😭', '💔', '😞', '🥺', '🌧️'] },
  { keys: ['화남', '짜증', '분노', '빡침', 'angry', 'mad', 'rage', '열받'], emojis: ['😡', '😤', '💢', '🔥', '😠', '🤬'] },
  { keys: ['사랑', '연애', '좋아함', 'love', '러브', '하트', 'heart'], emojis: ['💕', '💖', '❤️', '😍', '🥰', '💘'] },
  { keys: ['피곤', '졸림', '잠', '잠옴', '잘래', 'tired', 'sleep', 'sleepy', '나른'], emojis: ['😴', '💤', '🛏️', '😪', '🥱', '🌙'] },
  { keys: ['운동', '헬스', '근육', '러닝', '달리기', 'gym', 'workout', 'run', 'exercise'], emojis: ['💪', '🏃', '🏋️', '🔥', '⚡', '🥇'] },
  { keys: ['감사', '고마움', '땡큐', 'thanks', 'thank you', 'thx', '고맙'], emojis: ['🙏', '💕', '✨', '🥰', '😊', '🤝'] },
  { keys: ['축하', '생일', '파티', 'congrats', 'birthday', 'party', 'celebrate', '축하해'], emojis: ['🎉', '🎊', '👏', '✨', '🥳', '🎂'] },
  { keys: ['동의', '맞음', '인정', 'ok', 'yes', 'agree', '굿', 'good', '오케이'], emojis: ['👍', '✅', '💯', '🙌', '👌', '🆗'] },
  { keys: ['거절', '안돼', '싫어', 'no', 'nope', 'reject', '아니'], emojis: ['🙅', '❌', '😅', '👎', '🚫', '🙆'] },
  { keys: ['놀람', '깜짝', '대박', 'wow', 'omg', 'surprise', 'amazing', '헐'], emojis: ['😮', '😱', '🤯', '😲', '‼️', '😳'] },
  { keys: ['생각', '고민', '궁금', 'think', 'thinking', 'hmm', 'wonder'], emojis: ['🤔', '💭', '🧠', '📝', '❓', '👀'] },
  { keys: ['응원', '화이팅', '파이팅', 'cheer', 'fighting', 'gogo', '힘내'], emojis: ['💪', '🔥', '✨', '🙌', '🫶', '📣'] },
  { keys: ['비', '날씨', '소나기', 'rain', 'rainy', 'weather'], emojis: ['🌧️', '☔', '💧', '☁️', '⛈️', '🌂'] },
  { keys: ['해', '햇빛', '맑음', '맑다', 'sun', 'sunny', 'shine'], emojis: ['☀️', '🌞', '✨', '🌅', '🔆', '😎'] },
  { keys: ['눈', '겨울', 'snow', 'winter', '눈오다', '추움'], emojis: ['❄️', '⛄', '🌨️', '🧣', '☃️', '🥶'] },
  { keys: ['코딩', '개발', '프로그래밍', 'code', 'coding', 'dev', 'programming'], emojis: ['💻', '⌨️', '👨‍💻', '✅', '🚀', '🧑‍💻'] },
  { keys: ['버그', 'bug', '에러', 'error', '오류', '장애', 'issue'], emojis: ['🐛', '🔥', '😱', '🛠️', '🔧', '🚨'] },
  { keys: ['배포', '릴리즈', '런칭', 'deploy', 'release', 'launch', 'ship'], emojis: ['🚀', '✅', '🎉', '⚡', '💯', '📦'] },
  { keys: ['휴가', '여행', '바다', '휴식', 'vacation', 'travel', 'beach', 'holiday'], emojis: ['🏖️', '✈️', '🌴', '☀️', '😎', '🧳'] },
  { keys: ['돈', '월급', '결제', '비싸', '부자', 'money', 'cash', 'rich', 'pay', 'salary'], emojis: ['💰', '💵', '💸', '🤑', '💎', '🏦'] },
  { keys: ['웃음', '재밌', '웃겨', 'lol', 'lmao', 'haha', 'funny', '깔깔'], emojis: ['😂', '🤣', '😆', '😹', '😜', '🥲'] },
  { keys: ['응급', '급함', '긴급', 'urgent', 'asap', 'help', '도와'], emojis: ['🚨', '⚠️', '🆘', '🔥', '⏰', '😵'] },
  { keys: ['시작', '출발', 'start', 'begin', 'kickoff', '런'], emojis: ['🚀', '🏁', '🌱', '✨', '👀', '🎬'] },
  { keys: ['책', '독서', '공부', 'book', 'read', 'study', 'learn'], emojis: ['📚', '📖', '✏️', '🤓', '🧠', '📝'] },
  { keys: ['음악', '노래', '듣다', 'music', 'song', 'listen', '플레이리스트'], emojis: ['🎵', '🎶', '🎧', '🎤', '🎸', '💿'] },
]

const FALLBACK = ['🤔', '👀', '✨', '👍', '😊', '💬']

function recommend(input: string): string[] {
  const norm = input.trim().toLowerCase()
  if (!norm) return []
  const tokens = norm.split(/[\s,./!?·]+/).filter(Boolean)

  const score = new Map<string, number>()
  const order: string[] = []
  const add = (e: string, w: number) => {
    if (!score.has(e)) order.push(e)
    score.set(e, (score.get(e) ?? 0) + w)
  }

  for (const b of BUCKETS) {
    let hit = 0
    for (const k of b.keys) {
      const kl = k.toLowerCase()
      if (norm.includes(kl)) hit += 2
      for (const t of tokens) if (t === kl) hit += 3
      else if (t && (t.includes(kl) || kl.includes(t))) hit += 1
    }
    if (hit > 0) {
      b.emojis.forEach((e, i) => add(e, hit * 4 - i))
    }
  }

  if (score.size === 0) return FALLBACK
  const ranked = order.sort((a, b) => (score.get(b) ?? 0) - (score.get(a) ?? 0))
  const count = Math.min(8, Math.max(5, ranked.length))
  return ranked.slice(0, count)
}

async function suggest(formData: FormData) {
  'use server'
  const q = String(formData.get('q') ?? '').slice(0, 80)
  redirect(`?q=${encodeURIComponent(q)}`)
}

export default async function EmojiRecommenderPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const query = q.trim()
  const results = query ? recommend(query) : []

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#111' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>이모지 추천기</h1>
      <p style={{ color: '#555', marginBottom: 24, fontSize: 14 }}>
        키워드나 짧은 상황을 입력하면 어울리는 이모지 5~8개를 추천합니다.
      </p>

      <form action={suggest} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          name="q"
          defaultValue={query}
          placeholder="예: 회의 끝남, 배고픔, 버그 잡음"
          maxLength={80}
          required
          style={{
            flex: 1,
            padding: '10px 12px',
            border: '1px solid #d4d4d8',
            borderRadius: 8,
            fontSize: 15,
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 18px',
            background: '#111',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          추천
        </button>
      </form>

      {query && (
        <section
          style={{
            border: '1px solid #e4e4e7',
            background: '#fafafa',
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 12, color: '#71717a', marginBottom: 10, letterSpacing: 0.4 }}>
            입력: <span style={{ color: '#111', fontWeight: 600 }}>{query}</span>
          </div>
          <div style={{ fontSize: 38, letterSpacing: 8, lineHeight: 1.4 }}>{results.join(' ')}</div>
          <div style={{ fontSize: 12, color: '#71717a', marginTop: 12 }}>
            클릭/탭으로 복사하려면 위 이모지를 길게 누르거나 드래그하여 복사하세요.
          </div>
        </section>
      )}

      <p style={{ fontSize: 12, color: '#a1a1aa', marginTop: 32 }}>
        ※ 이 도구는 외부 AI 호출 없이 동작하는 룰 기반 휴리스틱입니다. 사전에 등록된 키워드 사전과 매칭되는 단어가 없으면 일반적인 반응 이모지를 반환합니다.
      </p>
    </main>
  )
}
