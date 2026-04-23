/**
 * 제출 대기 UI 의 단계 매핑.
 *
 * KvStatus + 'deploying' (폴링 엔드포인트가 Vercel API 로 동적 조립) → 5 단계 중
 * "완료된 단계 수" 로 변환.
 *
 * 단일 출처: submission-progress 컴포넌트 + 실패 메시지 렌더 공용.
 */
import type { RequestRecord } from './kv'

type KvStatus = RequestRecord['status']

/**
 * 폴링 엔드포인트가 반환할 수 있는 전체 상태 집합.
 * `deploying` 은 KV 에 저장되지 않는 가상 상태로, `/api/proto/[id]/status` 가
 * Vercel API 조회 결과로 동적 조립한다.
 */
export type PollStatus = KvStatus | 'deploying'

/**
 * 5 단계 진행률 바에서 "실제로 진행 중"일 수 있는 상태 키.
 * `ready`(전체 완료) 와 `failed`(에러) 는 특정 단계가 아니므로 제외.
 */
export type StageKey = Exclude<PollStatus, 'ready' | 'failed'>

/**
 * KV status → 5 단계 중 현재까지 "완료된 단계 수" 로 매핑.
 *   pending/interpreting → 0 (1단계 active)
 *   generating           → 1 (2단계 active)
 *   committing           → 2 (3단계 active)
 *   deploying            → 3 (4단계 active)
 *   ready                → 5 (전 단계 완료)
 *   failed               → -1 (에러 모드)
 */
export function statusToCompletedSteps(status: PollStatus): number {
  switch (status) {
    case 'pending':
    case 'interpreting':
      return 0
    case 'generating':
      return 1
    case 'committing':
      return 2
    case 'deploying':
      return 3
    case 'ready':
      return 5
    case 'failed':
      return -1
    default:
      return 0
  }
}

/**
 * `failed` 상태에서 UI 가 "X 단계에서 실패했습니다" 메시지를 렌더할 때 사용.
 * 각 진행 단계의 사용자 가시 라벨.
 */
export const STAGE_LABEL: Record<StageKey, string> = {
  pending: '요청 접수',
  interpreting: '1단계(요청 해석)',
  generating: '2단계(코드 생성)',
  committing: '3단계(Git 커밋)',
  deploying: '4단계(Vercel 배포)',
}
