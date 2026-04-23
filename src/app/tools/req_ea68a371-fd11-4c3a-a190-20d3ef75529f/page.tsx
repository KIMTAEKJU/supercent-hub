import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Entry = { emoji: string; keys: string[] }

const DB: Entry[] = [
  { emoji: '🎉', keys: ['축하', '파티', '끝남', '완료', '성공', '런칭', '출시', '생일', '기념', '환영'] },
  { emoji: '👏', keys: ['박수', '잘했', '훌륭', '수고', '굿잡', '칭찬', '응원', '수고하셨'] },
  { emoji: '✨', keys: ['반짝', '새로움', '좋음', '멋짐', '완성', '깨끗', '아이디어', '회의', '끝남'] },
  { emoji: '🙌', keys: ['축하', '환호', '해냈', '성공', '회의', '끝', '기쁨'] },
  { emoji: '💪', keys: ['화이팅', '파이팅', '힘내', '응원', '근육', '가자', '할수있'] },
  { emoji: '🔥', keys: ['핫함', '대박', '열정', '불타', '최고', '인기', '열기', '열심'] },
  { emoji: '🚀', keys: ['출시', '런칭', '빠름', '속도', '배포', '가보자', '시작'] },
  { emoji: '🙏', keys: ['감사', '부탁', '고마움', '죄송', '기도', '미안'] },
  { emoji: '👍', keys: ['좋음', '동의', '오케이', 'ok', '찬성', '굿'] },
  { emoji: '✅', keys: ['완료', '확인', '체크', '승인', '끝', '닫힘', '해결'] },
  { emoji: '❤️', keys: ['사랑', '애정', '좋아', '하트', '고마움'] },
  { emoji: '🥳', keys: ['축하', '파티', '신남', '기쁨', '생일', '환영'] },
  { emoji: '😂', keys: ['웃김', '빵터', 'ㅋㅋ', '유머', '폭소', '재밌'] },
  { emoji: '😭', keys: ['슬픔', '울음', '감동', '눈물', '힘듦', '안타깝'] },
  { emoji: '😅', keys: ['민망', '식은땀', '당황', '어색', '쩔쩔'] },
  { emoji: '🤔', keys: ['고민', '생각', '의문', '궁금', '글쎄'] },
  { emoji: '😴', keys: ['졸림', '피곤', '잠', '지침', '나른'] },
  { emoji: '😎', keys: ['멋짐', '쿨함', '자신감', '선글라스', '여유'] },
  { emoji: '🤯', keys: ['충격', '놀람', '폭발', '대박', '실화'] },
  { emoji: '😱', keys: ['놀람', '경악', '충격', '헐', '실화'] },
  { emoji: '🍕', keys: ['배고픔', '피자', '점심', '저녁', '맛있', '음식'] },
  { emoji: '🍔', keys: ['배고픔', '햄버거', '점심', '저녁', '맛있', '음식', '패스트푸드'] },
  { emoji: '🍜', keys: ['배고픔', '라면', '국수', '따뜻', '점심', '음식'] },
  { emoji: '😋', keys: ['맛있', '배고픔', '먹음직', '군침', '음식'] },
  { emoji: '🤤', keys: ['군침', '배고픔', '맛있', '먹고싶', '탐'] },
  { emoji: '☕', keys: ['커피', '휴식', '아침', '카페', '커피챗', '한잔'] },
  { emoji: '🍺', keys: ['맥주', '회식', '한잔', '퇴근', '금요일'] },
  { emoji: '🍰', keys: ['케이크', '생일', '달콤', '디저트', '축하'] },
  { emoji: '💡', keys: ['아이디어', '생각남', '영감', '떠오름', '제안'] },
  { emoji: '📝', keys: ['메모', '기록', '노트', '작성', '회의록'] },
  { emoji: '📌', keys: ['중요', '공지', '핀', '고정', '강조'] },
  { emoji: '🔔', keys: ['알림', '공지', '주의', '안내'] },
  { emoji: '⏰', keys: ['시간', '알람', '마감', '기한', '늦음', '일정'] },
  { emoji: '📅', keys: ['일정', '캘린더', '회의', '미팅', '약속'] },
  { emoji: '📣', keys: ['공지', '발표', '알림', '광고', '안내'] },
  { emoji: '🐛', keys: ['버그', '이슈', '에러', '오류', '문제'] },
  { emoji: '🛠️', keys: ['수정', '작업중', '개발', '고침', '툴'] },
  { emoji: '🧪', keys: ['실험', '테스트', 'qa', '검증', '시도'] },
  { emoji: '🚢', keys: ['배포', '릴리즈', '출시', '쉬핑', 'ship'] },
  { emoji: '📦', keys: ['배포', '패키지', '릴리즈', '빌드'] },
  { emoji: '💻', keys: ['코딩', '개발', '작업', '컴퓨터', '노트북'] },
  { emoji: '👀', keys: ['주목', '확인', '봄', '지켜봄', '구경'] },
  { emoji: '🤝', keys: ['협업', '동의', '합의', '계약', '악수'] },
  { emoji: '🌱', keys: ['새싹', '시작', '성장', '신규', '처음'] },
  { emoji: '🌟', keys: ['스타', '칭찬', '뛰어남', '최고', '훌륭'] },
  { emoji: '😇', keys: ['천사', '착함', '순수', '미안'] },
  { emoji: '🫡', keys: ['경례', '존경', '알겠', '넵', '받들'] },
  { emoji: '🧘', keys: ['명상', '차분', '여유', '평온', '휴식'] },
  { emoji: '💤', keys: ['잠', '피곤', '졸림', '쉬는중', '수면'] },
  { emoji: '🎯', keys: ['목표', '집중', '타겟', '달성', '핵심'] },
  { emoji: '📈', keys: ['성장', '상승', '증가', '매출', '성과'] },
]

function score(input: string, entry: Entry): number {
  const q = input.toLowerCase()
  let s = 0
  for (const k of entry.keys) {
    if (q.includes(k.toLowerCase())) s += k.length
  }
  return s
}

function recommend(input: string): string[] {
  const trimmed = input.trim()
  if (!trimmed) return []
  const scored = DB.map((e) => ({ e, s: score(trimmed, e) })).filter((x) => x.s > 0)
  scored.sort((a, b) => b.s - a.s)
  if (scored.length === 0) {
    return ['✨', '💬', '👀', '🤔', '📝', '💡']
  }
  return scored.slice(0, 8).map((x) => x.e)
}

async function suggest(formData: FormData) {
  'use server'
  const q = String(formData.get('q') ?? '').trim().slice(0, 120)
  if (!q) redirect('.')
  redirect(`?q=${encodeURIComponent(q)}`)
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const sp = await searchParams
  const q = sp.q ?? ''
  const results = recommend(q)
  const fallback = q && results.length === 6 && results[0] === '✨'

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-2xl px-6 py-16">
        <header className="mb-10 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            Prototype · Slack Emoji Finder
          </span>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            슬랙 이모지 추천기
          </h1>
          <p className="text-sm text-zinc-400">
            한 단어나 짧은 상황(예: &quot;회의 끝남&quot;, &quot;배고픔&quot;)을 입력하면 어울리는 이모지 5~8개를 추천합니다.
          </p>
        </header>

        <form action={suggest} className="flex flex-col gap-3 sm:flex-row">
          <input
            name="q"
            defaultValue={q}
            maxLength={120}
            required
            placeholder="예: 회의 끝남 / 배고픔 / 배포 완료"
            className="flex-1 rounded-md border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-amber-500 px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-amber-400"
          >
            추천받기
          </button>
        </form>

        {q && (
          <section className="mt-10">
            <div className="mb-4 text-xs uppercase tracking-wider text-white/50">
              &quot;{q}&quot; 에 어울리는 이모지
            </div>
            <ul className="flex flex-wrap gap-3">
              {results.map((e, i) => (
                <li
                  key={`${e}-${i}`}
                  className="flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-3xl"
                  aria-label={`추천 이모지 ${e}`}
                >
                  {e}
                </li>
              ))}
            </ul>
            {fallback && (
              <p className="mt-4 text-xs text-zinc-500">
                정확히 매칭되는 키워드가 없어 범용 이모지를 보여드립니다. 다른 키워드로 다시 시도해보세요.
              </p>
            )}
            <p className="mt-4 text-xs text-zinc-500">
              마음에 드는 이모지를 클릭 대신 길게 눌러 복사하거나, 슬랙의 `:emoji:` 검색에 활용하세요.
            </p>
          </section>
        )}

        {!q && (
          <section className="mt-10 space-y-3 text-sm text-zinc-400">
            <div className="text-xs uppercase tracking-wider text-white/50">예시</div>
            <ul className="space-y-2">
              <li>&quot;회의 끝남&quot; → 🎉 👏 ✨ 🙌 💪</li>
              <li>&quot;배고픔&quot; → 🍕 🍔 🍜 😋 🤤</li>
              <li>&quot;배포 완료&quot; → 🚀 ✅ 🚢 🎉 📦</li>
              <li>&quot;감사합니다&quot; → 🙏 ❤️ ✨ 🙌 👏</li>
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}
