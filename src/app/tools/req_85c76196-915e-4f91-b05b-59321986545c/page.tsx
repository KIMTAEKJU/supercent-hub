import { redirect } from 'next/navigation'

const REQUEST_ID = 'req_85c76196-915e-4f91-b05b-59321986545c'

const EMOJI_MAP: Array<{ keys: string[]; emojis: string[] }> = [
  { keys: ['회의', '미팅', '회의끝', '종료', '끝남', '마무리', '완료'], emojis: ['🎉', '👏', '✨', '🙌', '💪', '🔚', '✅'] },
  { keys: ['배고', '식사', '점심', '저녁', '밥', '식당', '맛집'], emojis: ['🍕', '🍔', '🍜', '😋', '🤤', '🍙', '🍚'] },
  { keys: ['커피', '카페', '졸림', '아메리카노', '모닝'], emojis: ['☕', '🥱', '😴', '🫖', '🧋'] },
  { keys: ['축하', '생일', '기념', '성공', '합격'], emojis: ['🎉', '🎊', '🥳', '🎂', '🎁', '🙌', '👏'] },
  { keys: ['감사', '고마', '땡큐', 'thanks', 'thank'], emojis: ['🙏', '💖', '🫶', '🥰', '✨', '🙇'] },
  { keys: ['퇴근', '하루끝', '끝', '마감'], emojis: ['🏃', '🌙', '🍻', '🛋️', '😮‍💨', '🎮'] },
  { keys: ['출근', '시작', '월요', '파이팅', '화이팅'], emojis: ['💼', '☕', '💪', '🚀', '⏰', '🌅'] },
  { keys: ['슬픔', '우울', '힘듦', '지침', '피곤'], emojis: ['😢', '🥲', '😮‍💨', '🫠', '🥹', '😔'] },
  { keys: ['웃김', '재밌', '유머', '개그', 'lol', 'lmao'], emojis: ['😂', '🤣', '😆', '😹', '💀', '🤪'] },
  { keys: ['놀람', '깜짝', '와우', '헐', '대박'], emojis: ['😱', '🤯', '😳', '🫢', '✨', '😲'] },
  { keys: ['사랑', '좋아', '하트', '애정'], emojis: ['❤️', '💖', '🥰', '😘', '💕', '🫶'] },
  { keys: ['동의', '찬성', 'ok', '좋아요', '오케이'], emojis: ['👍', '✅', '💯', '🙆', '🤝', '👌'] },
  { keys: ['반대', '안됨', '거절'], emojis: ['👎', '❌', '🙅', '😐', '🚫'] },
  { keys: ['생각', '고민', '흠'], emojis: ['🤔', '🧐', '💭', '🫣', '😶'] },
  { keys: ['코딩', '개발', '코드'], emojis: ['💻', '🐛', '🚀', '🔧', '⚙️', '🧑‍💻', '🔥'] },
  { keys: ['버그', '에러', '문제', '장애'], emojis: ['🐛', '🔥', '🚨', '💥', '😱', '🫠'] },
  { keys: ['긴급', '급함', 'asap', '알림'], emojis: ['🚨', '🔥', '⚡', '⏰', '📣'] },
  { keys: ['휴가', '여행', '바다', '산', '쉬기'], emojis: ['🏖️', '✈️', '🌴', '🗻', '🧳', '😎'] },
  { keys: ['날씨', '비', '눈', '맑음', '더움', '추움'], emojis: ['☀️', '🌧️', '❄️', '🌈', '⛅', '🌪️'] },
  { keys: ['운동', '헬스', '달리기', '요가'], emojis: ['🏋️', '🏃', '🧘', '💪', '🥵', '🔥'] },
  { keys: ['pr', '리뷰', '머지', '승인'], emojis: ['🔀', '✅', '👀', '🧑‍⚖️', '🟢', '📝'] },
  { keys: ['배포', '릴리즈', '런칭', '라이브'], emojis: ['🚀', '🎉', '📦', '🟢', '✨'] },
]

const FALLBACK = ['✨', '💬', '👍', '🙌', '🙂', '🎈']

function recommendEmojis(raw: string): string[] {
  const q = raw.trim().toLowerCase()
  if (!q) return []
  const scored = new Map<string, number>()
  for (const entry of EMOJI_MAP) {
    const hit = entry.keys.some((k) => q.includes(k.toLowerCase()))
    if (!hit) continue
    for (const e of entry.emojis) scored.set(e, (scored.get(e) ?? 0) + 1)
  }
  if (scored.size === 0) return FALLBACK
  return [...scored.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([e]) => e)
}

async function recommendAction(formData: FormData): Promise<void> {
  'use server'
  const query = String(formData.get('query') ?? '').trim().slice(0, 80)
  redirect(`/tools/${REQUEST_ID}?q=${encodeURIComponent(query)}`)
}

type SearchParams = Promise<{ q?: string }>

export default async function EmojiRecommendPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { q = '' } = await searchParams
  const query = q.trim()
  const emojis = query ? recommendEmojis(query) : []
  const noMatch = query.length > 0 && emojis === FALLBACK

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-black text-white">
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <header className="mb-10 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            Prototype
          </span>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            슬랙 이모지 추천기
          </h1>
          <p className="text-base text-zinc-400">
            한 단어 또는 짧은 상황 설명을 입력하면 어울리는 이모지 5~8개를 추천합니다.
          </p>
        </header>

        <form action={recommendAction} className="space-y-4">
          <label htmlFor="query" className="block text-sm font-medium text-white">
            상황 또는 키워드
          </label>
          <input
            id="query"
            name="query"
            required
            maxLength={80}
            defaultValue={query}
            placeholder="예: 회의 끝남 / 배고픔 / 배포 성공"
            className="w-full rounded-md border border-white/10 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
          />
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-zinc-500">한국어 · 영어 키워드 모두 가능 · 최대 80자</p>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-md bg-amber-500 px-6 text-sm font-semibold text-black transition-colors hover:bg-amber-500/90"
            >
              이모지 추천받기
            </button>
          </div>
        </form>

        {emojis.length > 0 ? (
          <section className="mt-10 space-y-4">
            <div className="text-xs uppercase tracking-wider text-zinc-500">
              추천 결과 · “{query}”
              {noMatch ? <span className="ml-2 text-amber-400">일반 추천</span> : null}
            </div>
            <div className="flex flex-wrap gap-3 rounded-xl border border-white/10 bg-zinc-950/60 p-6">
              {emojis.map((e, i) => (
                <span
                  key={`${e}-${i}`}
                  className="inline-flex h-14 min-w-14 items-center justify-center rounded-lg border border-white/10 bg-black px-3 text-3xl"
                  title={e}
                >
                  {e}
                </span>
              ))}
            </div>
            <p className="text-xs text-zinc-500">
              이모지 텍스트를 길게 눌러 복사하세요. 클릭 복사는 다음 버전에 추가 예정입니다.
            </p>
          </section>
        ) : null}

        <footer className="mt-16 border-t border-white/10 pt-6 text-xs text-zinc-500">
          AI Tool Request Hub · 슈퍼센트 내부 프로토타입
        </footer>
      </main>
    </div>
  )
}
