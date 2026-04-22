import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { isPromotionCandidateSync, type PrototypeRecord } from '@/lib/kv'

/**
 * 카탈로그/랜딩 공용 프로토타입 카드 (Server Component).
 * - 승격 후보 판정은 동기 헬퍼로 카드마다 await 없이 처리 (병렬 per-card fetch 웨이브 방지).
 * - 전체 카드가 Link 래퍼로 클릭 가능. 실제 라우트(/prototype/[id])는 Task 16 에서 구현.
 */
export function PrototypeCard({ prototype }: { prototype: PrototypeRecord }) {
  const promotion = isPromotionCandidateSync(prototype)

  return (
    <Link
      href={`/prototype/${prototype.id}`}
      className="block transition-transform hover:-translate-y-0.5"
    >
      <Card className="h-full bg-zinc-950/60 ring-white/10 hover:ring-amber-500/60">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-white">{prototype.title}</CardTitle>
            {promotion && (
              <Badge className="bg-amber-500 text-black hover:bg-amber-500/90">
                승격 후보
              </Badge>
            )}
          </div>
          {prototype.description && (
            <CardDescription className="line-clamp-2 text-zinc-400">
              {prototype.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <span aria-hidden>사용</span>
            <span className="font-mono text-white">{prototype.useCount}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden>+</span>
            <span className="font-mono text-white">
              {prototype.positiveFeedbackCount}
            </span>
          </span>
          {prototype.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-white/15 text-zinc-300"
            >
              {tag}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </Link>
  )
}
