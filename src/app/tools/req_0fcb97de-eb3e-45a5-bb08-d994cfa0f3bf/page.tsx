import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Entry = { emoji: string; keywords: string[] }

const DICT: Entry[] = [
  { emoji: '🎉', keywords: ['축하', '파티', '끝', '완료', '종료', '성공', '완성', 'party', 'celebrate', 'done', 'finish', 'complete'] },
  { emoji: '👏', keywords: ['박수', '잘', '수고', '칭찬', '격려', '훌륭', 'clap', 'good', 'great', 'nice'] },
  { emoji: '✨', keywords: ['반짝', '새로', '멋', '깔끔', '특별', '마법', 'sparkle', 'new', 'shiny', 'magic'] },
  { emoji: '🙌', keywords: ['환호', '만세', '성공', '야호', '기쁨', 'yay', 'hooray'] },
  { emoji: '💪', keywords: ['힘', '화이팅', '파이팅', '강', '근육', '운동', '열심', 'strong', 'power', 'muscle', 'fighting'] },
  { emoji: '🔥', keywords: ['불', '대박', '핫', '뜨거', '열정', '인기', 'fire', 'hot', 'lit'] },
  { emoji: '🚀', keywords: ['런칭', '출시', '빠름', '속도', '로켓', '성장', 'launch', 'rocket', 'fast', 'ship'] },
  { emoji: '🎯', keywords: ['목표', '타겟', '정확', '달성', 'target', 'goal', 'bullseye'] },
  { emoji: '💡', keywords: ['아이디어', '생각', '제안', '영감', 'idea', 'think', 'insight', 'lightbulb'] },
  { emoji: '📈', keywords: ['성장', '상승', '증가', '그래프', '매출', 'growth', 'up', 'increase', 'chart'] },
  { emoji: '📉', keywords: ['하락', '감소', '떨어', 'down', 'decrease', 'drop'] },
  { emoji: '✅', keywords: ['완료', '확인', '체크', '오케이', 'done', 'check', 'ok', 'confirm'] },
  { emoji: '❌', keywords: ['안됨', '실패', '아니', '취소', 'no', 'fail', 'cancel', 'wrong'] },
  { emoji: '⚠️', keywords: ['경고', '주의', '조심', 'warning', 'caution', 'alert'] },
  { emoji: '🙏', keywords: ['감사', '고마', '부탁', '기도', 'thanks', 'thank', 'please', 'pray'] },
  { emoji: '😊', keywords: ['웃음', '기쁨', '행복', '좋', 'smile', 'happy', 'good'] },
  { emoji: '😂', keywords: ['웃김', '재밌', '폭소', 'lol', 'funny', 'haha'] },
  { emoji: '🤔', keywords: ['고민', '생각', '궁금', '의문', 'think', 'hmm', 'wonder'] },
  { emoji: '😭', keywords: ['슬픔', '울음', '속상', 'cry', 'sad', 'tears'] },
  { emoji: '😅', keywords: ['진땀', '민망', '당황', 'awkward', 'sweat'] },
  { emoji: '😴', keywords: ['졸림', '피곤', '잠', '자', 'sleep', 'tired', 'sleepy'] },
  { emoji: '🤯', keywords: ['충격', '놀람', '멘붕', 'mindblown', 'shock'] },
  { emoji: '🍕', keywords: ['피자', '배고', '점심', '저녁', '식사', 'pizza', 'hungry', 'food', 'lunch', 'dinner'] },
  { emoji: '🍔', keywords: ['버거', '햄버거', '배고', '식사', 'burger', 'hungry', 'food'] },
  { emoji: '🍜', keywords: ['라면', '국수', '배고', '점심', '식사', 'ramen', 'noodle', 'hungry'] },
  { emoji: '🍗', keywords: ['치킨', '닭', '배고', '식사', 'chicken', 'food'] },
  { emoji: '🍚', keywords: ['밥', '식사', '한식', 'rice', 'meal'] },
  { emoji: '🍣', keywords: ['초밥', '스시', '일식', 'sushi'] },
  { emoji: '😋', keywords: ['맛있', '배고', '먹', '식욕', 'yummy', 'tasty', 'delicious'] },
  { emoji: '🤤', keywords: ['군침', '먹고싶', '배고', 'drool', 'crave'] },
  { emoji: '☕', keywords: ['커피', '카페', '아아', '아메리카노', 'coffee', 'cafe'] },
  { emoji: '🍵', keywords: ['차', '티', 'tea'] },
  { emoji: '🍺', keywords: ['맥주', '술', '건배', '치맥', 'beer', 'drink'] },
  { emoji: '🍷', keywords: ['와인', '술', '건배', 'wine'] },
  { emoji: '🥂', keywords: ['건배', '축하', '파티', 'cheers', 'toast'] },
  { emoji: '🎂', keywords: ['생일', '케이크', '축하', 'birthday', 'cake'] },
  { emoji: '🍰', keywords: ['케이크', '디저트', '달달', 'cake', 'dessert'] },
  { emoji: '🍩', keywords: ['도넛', '간식', 'donut', 'snack'] },
  { emoji: '💼', keywords: ['업무', '회사', '일', '비즈니스', 'work', 'business', 'job'] },
  { emoji: '📝', keywords: ['메모', '기록', '필기', '작성', 'note', 'write', 'memo'] },
  { emoji: '📅', keywords: ['일정', '달력', '날짜', '스케줄', 'calendar', 'schedule', 'date'] },
  { emoji: '⏰', keywords: ['알람', '시간', '마감', '데드라인', 'alarm', 'time', 'deadline'] },
  { emoji: '📊', keywords: ['차트', '데이터', '분석', '통계', 'chart', 'data', 'stats'] },
  { emoji: '🖥️', keywords: ['컴퓨터', '개발', '코딩', 'computer', 'dev'] },
  { emoji: '💻', keywords: ['노트북', '개발', '코딩', 'laptop', 'code'] },
  { emoji: '🐛', keywords: ['버그', '오류', '에러', 'bug', 'error'] },
  { emoji: '🔧', keywords: ['수정', '고침', '도구', 'fix', 'tool', 'wrench'] },
  { emoji: '🚨', keywords: ['긴급', '비상', '알림', 'urgent', 'emergency', 'alert'] },
  { emoji: '📢', keywords: ['공지', '알림', '발표', 'announcement', 'notice'] },
  { emoji: '👀', keywords: ['확인', '본다', '검토', 'look', 'see', 'review', 'watching'] },
  { emoji: '🫡', keywords: ['알겠', '네', '경례', '확인', 'salute', 'yes', 'roger'] },
  { emoji: '🤝', keywords: ['협업', '악수', '동의', '합의', 'handshake', 'deal', 'agree'] },
  { emoji: '❤️', keywords: ['사랑', '좋아', '하트', 'love', 'heart'] },
  { emoji: '👍', keywords: ['좋', '굿', '찬성', '오케이', '엄지', 'good', 'thumbs', 'like', 'ok'] },
  { emoji: '👎', keywords: ['반대', '별로', 'bad', 'dislike'] },
  { emoji: '🫶', keywords: ['사랑', '감사', '하트', 'love', 'heart'] },
  { emoji: '☀️', keywords: ['해', '날씨', '맑음', '낮', 'sun', 'sunny'] },
  { emoji: '🌧️', keywords: ['비', '날씨', '우산', 'rain', 'weather'] },
  { emoji: '❄️', keywords: ['눈', '겨울', '추위', 'snow', 'cold', 'winter'] },
  { emoji: '🏖️', keywords: ['휴가', '여행', '바다', '해변', 'vacation', 'beach', 'travel'] },
  { emoji: '✈️', keywords: ['비행기', '여행', '출장', 'flight', 'travel', 'plane'] },
  { emoji: '🎁', keywords: ['선물', '이벤트', '보너스', 'gift', 'present'] },
  { emoji: '💰', keywords: ['돈', '매출', '수익', '비용', 'money', 'revenue', 'cost'] },
  { emoji: '📦', keywords: ['배송', '패키지', '택배', 'package', 'delivery'] },
  { emoji: '🔒', keywords: ['보안', '잠금', '비밀', 'security', 'lock', 'secret'] },
  { emoji: '🔑', keywords: ['열쇠', '키', '접근', 'key', 'access'] },
  { emoji: '⭐', keywords: ['별', '최고', '즐겨찾기', 'star', 'favorite'] },
  { emoji: '🎨', keywords: ['디자인', '예술', '색', '팔레트', 'design', 'art', 'color'] },
  { emoji: '📱', keywords: ['폰', '모바일', '앱', 'phone', 'mobile', 'app'] },
  { emoji: '🔍', keywords: ['검색', '찾기', '조사', 'search', 'find'] },
  { emoji: '🏃', keywords: ['빠르게', '달려', '급함', 'run', 'fast', 'hurry'] },
  { emoji: '☝️', keywords: ['참고', '포인트', '중요', 'note', 'point'] },
]

function normalize(s: string): string {
  return s.toLowerCase().replace(/[.,!?~/()\[\]"']/g, ' ').replace(/\s+/g, ' ').trim()
}

function recommend(query: string): { emoji: string; score: number }[] {
  const q = normalize(query)
  if (!q) return []
  const tokens = q.split(' ').filter(Boolean)
  const scored = DICT.map(({ emoji, keywords }) => {
    let score = 0
    for (const kw of keywords) {
      const k = kw.toLowerCase()
      for (const t of tokens) {
        if (t === k) score += 5
        else if (t.includes(k) || k.includes(t)) score += 2
      }
      if (q.includes(k)) score += 3
    }
    return { emoji, score }
  })
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score)
}

async function suggest(formData: FormData) {
  'use server'
  const q = String(formData.get('q') ?? '').slice(0, 100)
  redirect(`/tools/req_0fcb97de-eb3e-45a5-bb08-d994cfa0f3bf?q=${encodeURIComponent(q)}`)
}

export default async function EmojiRecommenderPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const results = recommend(q).slice(0, 8)
  const fallback = ['💬', '✨', '👍', '🙌', '🫡', '🤝', '📝', '☝️']
  const shown = results.length >= 5 ? results.map((r) => r.emoji) : [...results.map((r) => r.emoji), ...fallback].slice(0, 8)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '48px 24px', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      <main style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>키워드 이모지 추천기</h1>
        <p style={{ color: '#a1a1aa', fontSize: 14, marginBottom: 32 }}>
          한 단어 또는 짧은 상황을 입력하면 어울리는 이모지 5~8개를 추천합니다.
        </p>

        <form action={suggest} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="예: 회의 끝남, 배고픔, 런칭"
            maxLength={100}
            style={{ flex: 1, padding: '12px 16px', borderRadius: 8, border: '1px solid #27272a', background: '#18181b', color: '#fff', fontSize: 16 }}
          />
          <button type="submit" style={{ padding: '12px 20px', borderRadius: 8, border: 'none', background: '#f59e0b', color: '#000', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            추천
          </button>
        </form>

        {q && (
          <section style={{ padding: 24, borderRadius: 12, border: '1px solid #27272a', background: '#111' }}>
            <div style={{ fontSize: 12, color: '#71717a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              입력: {q}
            </div>
            <div style={{ fontSize: 40, letterSpacing: 8, lineHeight: 1.4 }}>
              {shown.join(' ')}
            </div>
            <div style={{ fontSize: 12, color: '#71717a', marginTop: 12 }}>
              {results.length === 0 ? '정확히 매칭되는 키워드를 찾지 못해 범용 이모지를 추천합니다.' : `매칭 ${results.length}개 중 상위 ${shown.length}개 표시.`}
            </div>
          </section>
        )}

        <p style={{ fontSize: 11, color: '#52525b', marginTop: 32 }}>
          * 이 도구는 룰 기반 휴리스틱입니다. 내장 키워드 사전으로만 매칭합니다.
        </p>
      </main>
    </div>
  )
}
