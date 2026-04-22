'use client'

import { useMemo, useState, useTransition } from 'react'

import { PrototypeCard } from '@/components/prototype-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { PrototypeRecord } from '@/lib/kv'

/**
 * 카탈로그 검색 / 태그 / 정렬 필터 (Client Component).
 *
 * 설계 원칙:
 *   - 서버에서 한 번 받은 `initial` 배열을 props 로 받아 클라에서만 필터링.
 *   - URL state 는 Task 15(SWR) 에서 라우팅과 결합해 동기화 예정 — 지금은 in-memory.
 *   - 비우선 필터 변경은 useTransition 으로 렌더 우선순위를 낮춘다 (rerender-transitions).
 */
export function CatalogFilter({ initial }: { initial: PrototypeRecord[] }) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [sort, setSort] = useState<'recent' | 'usage'>('recent')
  const [, startTransition] = useTransition()

  // 모든 prototype 의 태그 유니온 — Set 으로 O(n) 집계 후 정렬.
  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const p of initial) for (const t of p.tags) set.add(t)
    return Array.from(set).sort()
  }, [initial])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = initial.filter((p) => {
      if (activeTag && !p.tags.includes(activeTag)) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
    })
    const sorted = base.slice()
    if (sort === 'recent') {
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    } else {
      sorted.sort((a, b) => b.useCount - a.useCount)
    }
    return sorted
  }, [initial, query, activeTag, sort])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            const next = e.target.value
            startTransition(() => setQuery(next))
          }}
          placeholder="프로토타입 검색"
          className="max-w-md bg-zinc-950/40 text-white placeholder:text-zinc-500"
        />
        <div className="flex items-center gap-2">
          <Button
            variant={sort === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => startTransition(() => setSort('recent'))}
            className={cn(
              sort === 'recent' && 'bg-amber-500 text-black hover:bg-amber-500/90',
            )}
          >
            최신순
          </Button>
          <Button
            variant={sort === 'usage' ? 'default' : 'outline'}
            size="sm"
            onClick={() => startTransition(() => setSort('usage'))}
            className={cn(
              sort === 'usage' && 'bg-amber-500 text-black hover:bg-amber-500/90',
            )}
          >
            사용순
          </Button>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => startTransition(() => setActiveTag(null))}
            className="focus:outline-none"
          >
            <Badge
              variant={activeTag === null ? 'default' : 'outline'}
              className={cn(
                activeTag === null
                  ? 'bg-amber-500 text-black'
                  : 'border-white/15 text-zinc-300',
              )}
            >
              전체
            </Badge>
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() =>
                startTransition(() =>
                  setActiveTag((prev) => (prev === tag ? null : tag)),
                )
              }
              className="focus:outline-none"
            >
              <Badge
                variant={activeTag === tag ? 'default' : 'outline'}
                className={cn(
                  activeTag === tag
                    ? 'bg-amber-500 text-black'
                    : 'border-white/15 text-zinc-300',
                )}
              >
                {tag}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-zinc-400">
          {initial.length === 0
            ? '아직 생성된 프로토타입이 없습니다. 첫 번째 도구를 요청해 보세요.'
            : '검색 조건과 일치하는 프로토타입이 없습니다.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PrototypeCard key={p.id} prototype={p} />
          ))}
        </div>
      )}
    </div>
  )
}
