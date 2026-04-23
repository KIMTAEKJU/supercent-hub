/**
 * Vercel Deployments API 조회 — branch → live preview URL.
 *
 * 배경: Vercel 은 branch 이름을 sanitize 한 뒤 총 subdomain 이 63자를 넘으면
 * 앞부분만 남기고 6자 해시로 축약한다. 이 해시 알고리즘은 비공개 → 결정론적
 * URL 조립 불가. 따라서 실제 배포 alias 를 API 로 조회한다.
 *
 * 필요 env:
 *   VERCEL_TOKEN — Personal Access Token (project read 권한)
 *
 * 사용 패턴:
 *   const url = await getLivePreviewUrl("claude/prototype-xxx")
 *   url 이 null 이면 VERCEL_TOKEN 미설정 또는 배포 미발견. 호출자가 KV 의 proto.url 을 fallback 으로 쓰면 된다.
 */

// `.vercel/project.json` 에서 확인한 값 (변경 잦지 않음).
const VERCEL_TEAM_ID = 'team_rHEXfyqakiYcuD6QoaENooAR'
const VERCEL_PROJECT_ID = 'prj_Ap9heWA5acuOwYmXJkNGMSGDA6lV'

type VercelDeployment = {
  url: string
  state?: string
  alias?: string[]
  meta?: {
    githubCommitRef?: string
    [k: string]: unknown
  }
}

/**
 * 지정 branch 의 가장 최근 READY 배포 alias 를 반환.
 * - alias 배열에서 `-git-` 포함한 것을 우선 (branch alias, 영구적)
 * - 없으면 deployment.url (hash-based, 배포 단위)
 * - 호출 실패/미발견 → null
 *
 * Next.js fetch cache: 30 초 revalidate (폴링 트래픽 과다 호출 방지).
 */
export async function getLivePreviewUrl(branch: string): Promise<string | null> {
  const token = process.env.VERCEL_TOKEN
  if (!token) return null

  const qs = new URLSearchParams({
    projectId: VERCEL_PROJECT_ID,
    teamId: VERCEL_TEAM_ID,
    target: 'preview',
    state: 'READY',
    limit: '50',
  })
  const res = await fetch(`https://api.vercel.com/v6/deployments?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 30 },
  })
  if (!res.ok) return null

  const data = (await res.json()) as { deployments?: VercelDeployment[] }
  const match = data.deployments?.find((d) => d.meta?.githubCommitRef === branch)
  if (!match) return null

  // branch alias 가 있으면 우선 (영구 URL). 없으면 hash-based url.
  const branchAlias = match.alias?.find((a) => a.includes('-git-'))
  return `https://${branchAlias ?? match.url}`
}
