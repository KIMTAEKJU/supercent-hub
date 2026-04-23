import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const REQ_ID = 'req_1aa8e5d7-8a91-4b6a-9179-ba6895cb70e2'

const EMOJI_MAP: Record<string, string[]> = {
  회의: ['🎉', '👏', '✨', '🙌', '💪'],
  끝: ['🎉', '🙌', '✨', '👏', '🎊'],
  완료: ['✅', '🎉', '💯', '👏', '🙌'],
  성공: ['🎉', '🏆', '💪', '✨', '🙌'],
  축하: ['🎉', '🎊', '🥳', '👏', '🍾'],
  기쁨: ['😊', '😄', '🥰', '🌟', '✨'],
  슬픔: ['😢', '😭', '💔', '🥺', '😔'],
  화남: ['😠', '😡', '🤬', '💢', '🔥'],
  놀람: ['😲', '😮', '🤯', '😱', '⚡'],
  피곤: ['😴', '😫', '🥱', '☕', '💤'],
  배고: ['🍕', '🍔', '🍜', '😋', '🤤'],
  음식: ['🍕', '🍱', '🍜', '🍔', '🥗'],
  커피: ['☕', '🥐', '🍩', '😌', '✨'],
  맛있: ['😋', '🤤', '👌', '💯', '✨'],
  업무: ['💼', '💻', '📊', '📝', '⚡'],
  마감: ['⏰', '🔥', '💪', '😤', '⚡'],
  퇴근: ['🙌', '🎉', '🍻', '✨', '🏠'],
  출근: ['☕', '💼', '🚀', '💪', '😤'],
  감사: ['🙏', '🥰', '✨', '💛', '👏'],
  최고: ['🔥', '💯', '👑', '🏆', '✨'],
  응원: ['💪', '🔥', '🙌', '✨', '👊'],
  대박: ['🔥', '🎉', '💯', '🤩', '✨'],
  굿: ['👍', '👌', '✨', '💯', '🙌'],
  사랑: ['❤️', '💕', '🥰', '💖', '😘'],
  좋아: ['❤️', '👍', '🥰', '✨', '🙌'],
  안녕: ['👋', '😊', '✨', '🌟', '🙌'],
  미안: ['🙏', '😅', '💦', '😔', '🥺'],
  행운: ['🍀', '🌟', '✨', '🎰', '🧿'],
  아이디어: ['💡', '✨', '🧠', '🤔', '⚡'],
  생각: ['🤔', '💭', '💡', '🧠', '✨'],
  질문: ['❓', '🤔', '🙋', '💭', '❔'],
  공부: ['📚', '✏️', '🤓', '💪', '☕'],
  여행: ['✈️', '🌴', '🗺️', '🎒', '📸'],
  운동: ['💪', '🏃', '🔥', '😤', '🥵'],
  생일: ['🎂', '🎉', '🎁', '🥳', '🎊'],
  파티: ['🎉', '🥳', '🎊', '🍾', '💃'],
  비: ['🌧️', '☔', '💧', '😔', '🌫️'],
  날씨: ['☀️', '🌤️', '🌧️', '❄️', '🌈'],
  아침: ['☀️', '☕', '🌅', '🍳', '✨'],
  밤: ['🌙', '⭐', '😴', '🌃', '💤'],
  돈: ['💰', '💵', '🤑', '💸', '💳'],
  게임: ['🎮', '🕹️', '🎯', '🏆', '🔥'],
  음악: ['🎵', '🎶', '🎧', '🎤', '✨'],
  책: ['📚', '📖', '✏️', '🤓', '💭'],
  영화: ['🎬', '🍿', '🎥', '🎞️', '⭐'],
  ok: ['👌', '👍', '✅', '✨', '🙌'],
  good: ['👍', '✨', '💯', '🙌', '🔥'],
  happy: ['😊', '😄', '🥰', '🎉', '✨'],
  sad: ['😢', '😭', '💔', '🥺', '😔'],
  love: ['❤️', '💕', '🥰', '💖', '😘'],
  fire: ['🔥', '💯', '✨', '🚀', '⚡'],
  bug: ['🐛', '🔧', '😵', '💦', '🔨'],
  deploy: ['🚀', '✨', '🎉', '✅', '🔥'],
}

function recommend(input: string): string[] {
  const text = input.toLowerCase().trim()
  if (!text) return []
  const scores = new Map<string, number>()
  for (const [kw, emojis] of Object.entries(EMOJI_MAP)) {
    if (text.includes(kw.toLowerCase())) {
      emojis.forEach((e, i) => {
        scores.set(e, (scores.get(e) ?? 0) + (5 - i))
      })
    }
  }
  if (scores.size === 0) {
    return ['✨', '😊', '🙌', '💬', '👀', '💡']
  }
  const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1])
  return sorted.slice(0, 8).map(([e]) => e)
}

async function suggest(formData: FormData) {
  'use server'
  const keyword = String(formData.get('q') ?? '').slice(0, 100)
  redirect(`/tools/${REQ_ID}?q=${encodeURIComponent(keyword)}`)
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const results = recommend(q)

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-2xl px-6 py-16">
        <header className="mb-8">
          <h1 className="mb-2 text-3xl font-semibold tracking-tight">이모지 추천기</h1>
          <p className="text-sm text-white/60">
            키워드나 상황을 입력하면 어울리는 이모지 5~8개를 추천합니다.
          </p>
          <p className="mt-1 text-xs text-amber-400/70">
            ※ 이 도구는 룰 기반 휴리스틱입니다. 키워드 사전 매칭 방식으로 작동합니다.
          </p>
        </header>

        <form action={suggest} className="mb-8 flex gap-2">
          <input
            name="q"
            defaultValue={q}
            maxLength={100}
            placeholder="예: 회의 끝남, 배고픔, 축하, deploy"
            className="flex-1 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm placeholder:text-white/30 focus:border-amber-500/60 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-amber-400"
          >
            추천
          </button>
        </form>

        {q && (
          <section className="rounded-lg border border-white/10 bg-white/5 p-6">
            <div className="mb-4 text-xs uppercase tracking-wider text-white/50">
              &ldquo;{q}&rdquo; 에 어울리는 이모지
            </div>
            {results.length > 0 ? (
              <div className="flex flex-wrap gap-3 text-4xl leading-none">
                {results.map((e, i) => (
                  <span
                    key={`${e}-${i}`}
                    className="rounded-md bg-white/5 px-3 py-2 transition-transform hover:scale-110"
                    title={e}
                  >
                    {e}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-white/60">결과 없음</div>
            )}
            <div className="mt-4 text-xs text-white/40">
              이모지를 클릭하여 복사는 지원되지 않습니다. 드래그로 선택해 복사하세요.
            </div>
          </section>
        )}

        {!q && (
          <section className="rounded-lg border border-white/10 bg-white/5 p-6 text-sm text-white/60">
            <div className="mb-2 font-medium text-white/80">예시</div>
            <ul className="space-y-1">
              <li>· 회의 끝남 → 🎉 👏 ✨ 🙌 💪</li>
              <li>· 배고픔 → 🍕 🍔 🍜 😋 🤤</li>
              <li>· 마감 임박 → ⏰ 🔥 💪 😤 ⚡</li>
              <li>· 커피 한잔 → ☕ 🥐 🍩 😌 ✨</li>
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}
