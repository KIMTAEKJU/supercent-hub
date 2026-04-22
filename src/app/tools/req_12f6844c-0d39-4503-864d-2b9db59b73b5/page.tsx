import Link from 'next/link'
import { redirect } from 'next/navigation'

import { SiteHeader } from '@/components/site-header'

export const metadata = {
  title: '퇴근버스 알림 도우미',
  description: '정류장과 노선 번호로 퇴근 시간대 버스 도착 리마인더를 만들어줍니다.',
}

type SearchParams = Promise<{
  stop?: string
  route?: string
  time?: string
}>

interface Reminder {
  stop: string
  route: string
  time: string
  etas: string[]
  notifyAt: string
  summary: string
}

function parseTime(hhmm: string): { h: number; m: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm)
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  if (h > 23 || m > 59) return null
  return { h, m }
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`
}

function shift(hh: number, mm: number, delta: number) {
  const total = ((hh * 60 + mm + delta) % 1440 + 1440) % 1440
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

function buildReminder(stop: string, route: string, time: string): Reminder | null {
  const t = parseTime(time)
  if (!t) return null
  const etas = [0, 8, 17].map((d) => shift(t.h, t.m, d))
  const notifyAt = shift(t.h, t.m, -10)
  const summary = `${stop} 정류장에서 ${route}번 버스가 ${etas[0]}부터 약 8~17분 간격으로 도착 예정. ${notifyAt}에 리마인드 알림이 울립니다.`
  return { stop, route, time, etas, notifyAt, summary }
}

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const stop = sp.stop?.trim() ?? ''
  const route = sp.route?.trim() ?? ''
  const time = sp.time?.trim() ?? ''
  const reminder = stop && route && time ? buildReminder(stop, route, time) : null
  const invalid = !reminder && (stop || route || time)

  async function submit(formData: FormData) {
    'use server'
    const qs = new URLSearchParams({
      stop: String(formData.get('stop') ?? '').trim(),
      route: String(formData.get('route') ?? '').trim(),
      time: String(formData.get('time') ?? '').trim(),
    }).toString()
    redirect(`/tools/req_12f6844c-0d39-4503-864d-2b9db59b73b5?${qs}`)
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-black text-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <header className="mb-8 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            프로토타입
          </span>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            퇴근버스 알림 도우미
          </h1>
          <p className="text-sm text-zinc-400">
            정류장·노선·희망 출발 시간을 입력하면 버스 도착 예상 시각과 리마인드 시간을 계산합니다.
          </p>
        </header>

        <form
          action={submit}
          className="space-y-5 rounded-xl border border-white/10 bg-white/[0.02] p-6"
        >
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-300">정류장 이름</span>
            <input
              name="stop"
              required
              defaultValue={stop}
              placeholder="예: 강남역 12번 출구"
              className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-zinc-600 outline-none focus:border-amber-500"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-300">노선 번호</span>
            <input
              name="route"
              required
              defaultValue={route}
              placeholder="예: 146, 9404"
              className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-zinc-600 outline-none focus:border-amber-500"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-300">희망 출발 시간 (HH:MM)</span>
            <input
              name="time"
              required
              defaultValue={time || '18:30'}
              placeholder="18:30"
              pattern="^\d{1,2}:\d{2}$"
              className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-zinc-600 outline-none focus:border-amber-500"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-amber-500/90"
          >
            리마인더 계산하기
          </button>
        </form>

        {reminder ? (
          <section className="mt-8 space-y-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
            <h2 className="text-lg font-semibold text-amber-200">알림 미리보기</h2>
            <p className="text-sm text-zinc-200">{reminder.summary}</p>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-zinc-500">리마인드 시각</dt>
                <dd className="font-mono text-white">{reminder.notifyAt}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">첫 도착 예상</dt>
                <dd className="font-mono text-white">{reminder.etas[0]}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">다음 도착</dt>
                <dd className="font-mono text-white">{reminder.etas[1]}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">그 다음 도착</dt>
                <dd className="font-mono text-white">{reminder.etas[2]}</dd>
              </div>
            </dl>
            <p className="text-xs text-zinc-500">
              실제 실시간 데이터 연동 전 프로토타입 — 도착 간격은 8~17분으로 모의 계산됩니다.
            </p>
          </section>
        ) : invalid ? (
          <p className="mt-6 text-sm text-rose-300">
            시간 형식을 확인해 주세요. (예: 18:30)
          </p>
        ) : null}

        <div className="mt-10 border-t border-white/10 pt-6 text-sm">
          <Link
            href="/catalog"
            className="text-zinc-400 transition-colors hover:text-white"
          >
            ← 카탈로그로 돌아가기
          </Link>
        </div>
      </main>
      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500">
        AI Tool Request Hub · 프로토타입
      </footer>
    </div>
  )
}
