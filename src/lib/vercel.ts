/**
 * Vercel Deployments API 조회 — branch → live preview URL + 배포 state.
 *
 * 배경: Vercel 은 branch 이름을 sanitize 한 뒤 총 subdomain 이 63자를 넘으면
 * 앞부분만 남기고 6자 해시로 축약한다. 이 해시 알고리즘은 비공개 → 결정론적
 * URL 조립 불가. 실제 배포 alias 를 API 로 조회한다.
 *
 * 또한 KV 의 proto.status=ready 는 Routine 이 push + KV 쓰기 끝낸 시점이지
 * Vercel 빌드 완료를 의미하지 않는다 → 폴링 엔드포인트가 실제 빌드 state 를
 * 확인해 deploying 단계를 구분해야 사용자 UX 정확.
 *
 * 필요 env:
 *   VERCEL_TOKEN — Personal Access Token (project read 권한)
 */

const VERCEL_TEAM_ID = 'team_rHEXfyqakiYcuD6QoaENooAR'
const VERCEL_PROJECT_ID = 'prj_Ap9heWA5acuOwYmXJkNGMSGDA6lV'

type VercelState = 'READY' | 'BUILDING' | 'QUEUED' | 'INITIALIZING' | 'ERROR' | 'CANCELED'

type VercelDeployment = {
  url: string
  state?: VercelState | string
  alias?: string[]
  meta?: {
    githubCommitRef?: string
    [k: string]: unknown
  }
}

export type DeploymentState =
  | { state: 'READY' | 'BUILDING' | 'ERROR' | 'CANCELED' | 'QUEUED' | 'INITIALIZING'; url: string }
  | { state: 'NONE'; url: null } // 아직 Vercel 이 push 를 감지 못 한 상태
  | { state: 'UNKNOWN'; url: null } // VERCEL_TOKEN 미설정 또는 API 호출 실패

/**
 * 지정 branch 의 가장 최근 배포 state + url 반환.
 * READY > BUILDING > QUEUED/INITIALIZING 순으로 우선순위.
 */
export async function getDeploymentState(branch: string): Promise<DeploymentState> {
  const token = process.env.VERCEL_TOKEN
  if (!token) {
    console.error('[vercel] VERCEL_TOKEN env missing at runtime')
    return { state: 'UNKNOWN', url: null }
  }

  const qs = new URLSearchParams({
    projectId: VERCEL_PROJECT_ID,
    teamId: VERCEL_TEAM_ID,
    target: 'preview',
    limit: '100',
  })
  const res = await fetch(`https://api.vercel.com/v6/deployments?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    console.error(`[vercel] API error ${res.status} for branch=${branch}`)
    return { state: 'UNKNOWN', url: null }
  }

  const data = (await res.json()) as { deployments?: VercelDeployment[] }
  const branchMatches = data.deployments?.filter((d) => d.meta?.githubCommitRef === branch) ?? []
  if (branchMatches.length === 0) {
    return { state: 'NONE', url: null }
  }

  // READY 우선. 없으면 가장 최근 deployment (BUILDING/QUEUED 등).
  const ready = branchMatches.find((d) => d.state === 'READY')
  const pick = ready ?? branchMatches[0]!
  const branchAlias = pick.alias?.find((a) => a.includes('-git-'))
  const url = `https://${branchAlias ?? pick.url}`
  const state = (pick.state ?? 'UNKNOWN') as Exclude<DeploymentState['state'], 'NONE' | 'UNKNOWN'>
  return { state, url }
}

/**
 * READY 상태일 때만 URL 반환. BUILDING/ERROR/MISSING 등은 null.
 * 사용자 버튼 링크 등 "실제 접근 가능한 URL 이 필요" 한 경우에만 쓴다.
 */
export async function getLivePreviewUrl(branch: string): Promise<string | null> {
  const { state, url } = await getDeploymentState(branch)
  return state === 'READY' ? url : null
}
