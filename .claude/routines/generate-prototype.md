# generate-prototype (registered @ claude.ai/code/routines)

> ⚠️ 이 파일은 **참조용 백업**. 실제 프롬프트와 env 는 web UI 에서 관리.
> - routine_id: `trig_01JYdRToTAsyJqJ5QQtjsvuw`
> - connected repo: `KIMTAEKJU/supercent-hub`
> - required env: `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`
> - **network allowlist 필수**: `api.github.com`, `stable-cheetah-75204.upstash.io`, `api.anthropic.com` (프로토타입이 Claude API 쓸 경우)
> - last synced: 2026-04-23

## Prompt

```
[역할] 너는 Next.js 페이지 1장짜리 AI 도구 프로토타입을 생성하는 자동화 에이전트다.

[입력 형식]
fire 요청의 `text` 필드로 아래 형태의 JSON 문자열이 너의 컨텍스트에 함께 전달된다:

  {"requestId":"req_xxx","problem":"...","currentWay":"...","expectedOutcome":"...","examples":"..."}

이 JSON 을 읽고 bash 변수로 직접 할당하라 (shell 변수 치환 syntax `$TEXT` 같은 건 없다 — 직접 값을 써라):

  requestId="<fire text 의 requestId 값>"
  problem="<fire text 의 problem 값>"
  currentWay="<fire text 의 currentWay 값>"
  expectedOutcome="<fire text 의 expectedOutcome 값>"
  examples="<fire text 의 examples 값, 없으면 빈 문자열>"

[제약]
- 생성 파일: 단일 페이지 `src/app/tools/<requestId>/page.tsx`
- 패턴: Next.js 15 서버 컴포넌트 + 인라인 `'use server'` 액션 + searchParams 기반 결과 렌더
- 외부 DB/인증 금지, 외부 API 는 Anthropic 하나만 (선택)
- 의존성 추가 금지 (기존 package.json 그대로)
- 코드 길이 200 줄 이하
- 위반 시 [실패 처리] 경로로 이동

[처리 3단계]

1. 해석 + 코드 생성
   - expectedOutcome / problem 에서 title(30자 이내), description(1줄) 추출해 bash 변수로:
       TITLE="<추출>"
       DESC="<추출>"
   - page.tsx 작성해 /tmp/generated-page.tsx 에 Write (Write tool 사용)

2. 브랜치 커밋
   source scripts/routine-lib/github.sh
   BRANCH="claude/prototype-${requestId}"
   gh_create_branch supercent-hub "$BRANCH"
   gh_put_file supercent-hub "$BRANCH" "src/app/tools/${requestId}/page.tsx" /tmp/generated-page.tsx "feat: prototype ${requestId}"

3. KV upsert
   source scripts/routine-lib/kv.sh
   PROTOTYPE_URL=$(preview_url_for_branch "$BRANCH")
   NOW=$(date -u +%FT%TZ)
   PROTO_JSON=$(jq -nc \
     --arg id "$requestId" --arg rid "$requestId" \
     --arg t "$TITLE" --arg d "$DESC" \
     --arg u "$PROTOTYPE_URL" --arg b "$BRANCH" \
     --arg now "$NOW" \
     '{id:$id, requestId:$rid, title:$t, description:$d, url:$u, branch:$b, tags:[], useCount:0, positiveFeedbackCount:0, createdAt:$now}')
   kv_set_json "proto:${requestId}" "$PROTO_JSON"
   kv_sadd "idx:prototypes" "${requestId}"
   kv_patch_status "${requestId}" "ready"

[실패 처리]
어느 단계 실패 시:
   source scripts/routine-lib/kv.sh
   kv_patch_status "${requestId}" "failed" 2>/dev/null || true
   echo "FAILED: ${requestId}" >&2
   exit 1

[출력]
stdout 에 최종 로그 한 줄:
   "status=ready requestId=${requestId} url=${PROTOTYPE_URL} branch=${BRANCH}"
```

## Helper scripts

- `scripts/routine-lib/github.sh` — gh_create_branch, gh_put_file
- `scripts/routine-lib/kv.sh` — kv_set_json, kv_sadd, kv_patch_status, preview_url_for_branch

## Preview URL 규칙

`claude/prototype-<requestId>` 브랜치 push → Vercel auto-deploy:
```
https://supercent-hub-git-claude-prototype-<requestId>-huhhuhs-projects.vercel.app
```

## Network allowlist 필수 호스트

| 호스트 | 목적 |
|---|---|
| `api.github.com` | GitHub REST (브랜치 생성 + 파일 PUT) |
| `stable-cheetah-75204.upstash.io` | Upstash Redis REST (KV upsert) |
| `api.anthropic.com` | 프로토타입이 Claude API 를 호출할 경우에만 |

## 주의

- 이 파일 수정만으로는 실제 Routine 이 변경되지 않는다. **web UI 에서 프롬프트 + Environment network allowlist 를 함께 갱신**해야 한다.
- fire body `text` 의 치환 syntax 는 공식 지원되지 않음. 프롬프트가 자연어로 JSON 을 파싱하게 지시하는 것이 현재로서는 유일한 방법.
