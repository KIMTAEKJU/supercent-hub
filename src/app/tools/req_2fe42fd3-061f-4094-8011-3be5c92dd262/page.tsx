export const dynamic = 'force-dynamic'

type Entry = { keys: string[]; emojis: string[] }

const DB: Entry[] = [
  { keys: ['회의', '미팅', 'meeting'], emojis: ['💼', '🗓️', '📊', '🤝', '📝'] },
  { keys: ['끝남', '완료', '종료', '끝', 'done', 'finish', 'complete'], emojis: ['🎉', '✅', '👏', '✨', '🙌'] },
  { keys: ['배고', '점심', '저녁', '밥', '식사', 'lunch', 'dinner', 'food', 'hungry'], emojis: ['🍕', '🍔', '🍜', '😋', '🤤', '🍱', '🍗'] },
  { keys: ['커피', 'coffee', '아침'], emojis: ['☕', '🥐', '🧋', '😊', '💼'] },
  { keys: ['행복', '기쁨', '좋아', 'happy', 'joy', 'good', 'great'], emojis: ['😊', '😁', '🥰', '💖', '🎉'] },
  { keys: ['슬픔', '울', '안타', 'sad', 'cry'], emojis: ['😢', '😭', '💔', '🥺', '😔'] },
  { keys: ['사랑', 'love'], emojis: ['❤️', '😍', '🥰', '💕', '💖'] },
  { keys: ['화남', '열받', '빡', 'angry', 'mad'], emojis: ['😠', '😤', '🔥', '💢', '😡'] },
  { keys: ['놀람', '깜짝', 'surprise', 'shock', 'wow'], emojis: ['😮', '😱', '🤯', '😳', '🤭'] },
  { keys: ['피곤', '졸', 'tired', 'sleep'], emojis: ['😴', '🥱', '💤', '😪', '☕'] },
  { keys: ['축하', '파티', 'celebration', 'party'], emojis: ['🎉', '🎊', '🥳', '🍾', '🎂'] },
  { keys: ['감사', '고마', 'thanks', 'thank'], emojis: ['🙏', '💖', '😊', '🤗', '✨'] },
  { keys: ['응원', '파이팅', '화이팅', 'cheer', 'fighting'], emojis: ['💪', '🙌', '🔥', '🏆', '🚀'] },
  { keys: ['성공', 'success', 'win', 'achieve'], emojis: ['✅', '🎯', '🏆', '🎉', '👏'] },
  { keys: ['실패', '에러', 'fail', 'error'], emojis: ['❌', '🚫', '😫', '💥', '🛠️'] },
  { keys: ['일', '업무', '회사', 'work', 'office'], emojis: ['💼', '📊', '📈', '💻', '🧑‍💼'] },
  { keys: ['코드', '코딩', '프로그래', 'code', 'dev'], emojis: ['💻', '⌨️', '🖥️', '🐛', '🚀'] },
  { keys: ['버그', '디버', 'debug', 'bug'], emojis: ['🐛', '🔧', '🛠️', '😫', '🚨'] },
  { keys: ['맑음', '날씨', 'sunny', 'weather'], emojis: ['☀️', '🌤️', '🌈', '😎', '🌻'] },
  { keys: ['비 ', '비옴', 'rain'], emojis: ['🌧️', '☔', '💧', '🌂', '⚡'] },
  { keys: ['눈옴', '눈 ', 'snow'], emojis: ['❄️', '⛄', '🌨️', '🎿', '🧊'] },
  { keys: ['여행', 'trip', 'travel', 'vacation'], emojis: ['✈️', '🌍', '🏖️', '🗺️', '🧳'] },
  { keys: ['생일', 'birthday'], emojis: ['🎂', '🎁', '🎉', '🥳', '🎊'] },
  { keys: ['아이디어', '생각', 'idea', 'think'], emojis: ['💡', '🧠', '✨', '💭', '🤔'] },
  { keys: ['공부', '집중', '학습', 'study', 'focus'], emojis: ['📚', '🎯', '💪', '✏️', '🧠'] },
  { keys: ['운동', '헬스', 'workout', 'exercise'], emojis: ['💪', '🏃', '🏋️', '🤸', '🔥'] },
  { keys: ['출근', '퇴근', 'commute'], emojis: ['🚇', '🚗', '🏢', '☕', '😮‍💨'] },
  { keys: ['휴가', '주말', 'weekend', 'holiday'], emojis: ['🏖️', '🌴', '😎', '🍹', '✨'] },
  { keys: ['질문', '문의', 'question', 'ask'], emojis: ['❓', '🤔', '💬', '🙋', '📝'] },
  { keys: ['확인', '체크', 'check', 'ok'], emojis: ['✅', '👍', '👀', '🔍', '🆗'] },
  { keys: ['동의', '찬성', 'agree'], emojis: ['👍', '💯', '🙆', '✅', '🤝'] },
  { keys: ['반대', '거절', 'disagree'], emojis: ['👎', '🙅', '❌', '😤', '🚫'] },
  { keys: ['아프', '병원', 'sick', 'ill'], emojis: ['🤒', '🤧', '🏥', '💊', '🤕'] },
  { keys: ['돈', '머니', '급여', 'money', 'salary'], emojis: ['💰', '💵', '💸', '🤑', '📈'] },
  { keys: ['급해', 'urgent', 'hurry', 'asap'], emojis: ['⚡', '🏃', '🚨', '⏰', '🔥'] },
  { keys: ['론칭', '출시', '배포', 'launch', 'release', 'deploy', 'ship'], emojis: ['🚀', '🎉', '📦', '✨', '🎯'] },
  { keys: ['회식', '술', '맥주', 'drink', 'beer'], emojis: ['🍻', '🍺', '🥂', '🍷', '🎉'] },
  { keys: ['미안', '죄송', 'sorry'], emojis: ['🙇', '😔', '🥺', '💦', '🙏'] },
  { keys: ['환영', 'welcome'], emojis: ['👋', '🤗', '🎉', '🙌', '✨'] },
]

const FALLBACK = ['🙂', '👍', '✨', '💬', '🤔', '🫡', '😊', '👀']

function recommend(query: string): string[] {
  const lower = ' ' + query.toLowerCase() + ' '
  const scored: { e: string; w: number }[] = []
  const seen = new Set<string>()
  DB.forEach((entry, entryIdx) => {
    let hits = 0
    for (const k of entry.keys) {
      if (lower.includes(k.toLowerCase())) hits += 1
    }
    if (hits === 0) return
    entry.emojis.forEach((e, emojiIdx) => {
      if (seen.has(e)) return
      seen.add(e)
      scored.push({ e, w: hits * 100 - emojiIdx - entryIdx * 0.001 })
    })
  })
  scored.sort((a, b) => b.w - a.w)
  const top = scored.slice(0, 8).map((s) => s.e)
  for (const e of FALLBACK) {
    if (top.length >= 5) break
    if (!seen.has(e)) {
      seen.add(e)
      top.push(e)
    }
  }
  return top
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const sp = await searchParams
  const query = (sp.q ?? '').trim()
  const results = query ? recommend(query) : []

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <main className="mx-auto max-w-2xl px-6 py-12">
        <header className="mb-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            룰 기반 휴리스틱
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">키워드 이모지 추천기</h1>
          <p className="mt-2 text-sm text-zinc-400">
            상황 키워드를 입력하면 어울리는 이모지 5~8개를 추천합니다. 외부 AI 호출 없이 내장 사전으로 동작합니다.
          </p>
        </header>

        <form method="get" className="mb-8 flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="예: 회의 끝남, 배고프, 론칭, 커피"
            className="flex-1 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-base text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-amber-400"
          >
            추천
          </button>
        </form>

        {query && (
          <section className="rounded-lg border border-white/10 bg-white/5 p-6">
            <div className="mb-2 text-xs uppercase tracking-wider text-white/50">
              &quot;{query}&quot; 추천 이모지
            </div>
            <div className="flex flex-wrap gap-3 text-4xl leading-none">
              {results.map((e, i) => (
                <span key={`${e}-${i}`} title={e} className="select-all">
                  {e}
                </span>
              ))}
            </div>
            <div className="mt-4 break-all text-xs text-zinc-400">
              복사용: <code className="text-zinc-200">{results.join(' ')}</code>
            </div>
          </section>
        )}

        {!query && (
          <section className="rounded-lg border border-dashed border-white/10 p-6 text-sm text-zinc-400">
            <div className="mb-3 font-medium text-white/80">예시 입력</div>
            <ul className="space-y-2">
              <li>&quot;회의 끝남&quot; → 🎉 ✅ 👏 ✨ 🙌</li>
              <li>&quot;배고프&quot; → 🍕 🍔 🍜 😋 🤤</li>
              <li>&quot;론칭 성공&quot; → 🚀 ✅ 🎯 🏆 🎉</li>
              <li>&quot;커피 한잔&quot; → ☕ 🥐 🧋 😊 💼</li>
            </ul>
          </section>
        )}

        <footer className="mt-12 text-xs text-zinc-500">
          매칭되는 키워드가 없으면 범용 이모지로 대체됩니다. 사전에 없는 단어는
          추천 품질이 낮을 수 있습니다.
        </footer>
      </main>
    </div>
  )
}
