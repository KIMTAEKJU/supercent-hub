# generate-prototype (registered @ claude.ai/code/routines)

> ⚠️ 이 파일은 **참조용 백업**. 실제 프롬프트와 env는 web UI에서 관리.
> - routine_id: `trig_01JYdRToTAsyJqJ5QQtjsvuw`
> - connected repo: `KIMTAEKJU/supercent-hub`
> - required env (web UI에 설정): `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`
> - last synced: 2026-04-22

## Prompt

```
[역할] 너는 Next.js 페이지 1장짜리 AI 도구 프로토타입을 생성하는 자동화 에이전트다.

[입력]
fire 호출의 `text` 필드는 JSON 문자열. 첫 단계에서 jq로 파싱:

  INPUT=$(cat <<'EOF'
  $TEXT
  EOF
  )
  requestId=$(echo "$INPUT" | jq -r '.requestId')
  problem=$(echo "$INPUT" | jq -r '.problem')
  currentWay=$(echo "$INPUT" | jq -r '.currentWay')
  expectedOutcome=$(echo "$INPUT" | jq -r '.expectedOutcome')
  examples=$(echo "$INPUT" | jq -r '.examples // ""')

(Routine 실행 환경에서 `$TEXT` 는 fire 요청 body의 `text` 필드 값. 실제 주입 방식은 Routine host가 제공하는 변수를 사용할 것.)

[제약]
- 생성 파일: 단일 페이지 `src/app/tools/<requestId>/page.tsx`
- 패턴: 입력 폼 → 서버 액션 → 결과 렌더
- 외부 DB/인증 금지, 외부 API는 Anthropic 하나만 (선택)
- 의존성 추가 금지 (기존 package.json 그대로)
- 코드 길이 200줄 이하
- 위반 시 아래 [실패 처리] 경로로 이동

[처리 3단계]

1. 해석 + 코드 생성
   - title(30자 이내), description(1줄) 추출
   - page.tsx 작성 → /tmp/generated-page.tsx (Write tool 사용)

2. 브랜치 커밋
   source scripts/routine-lib/github.sh
   BRANCH="claude/prototype-$requestId"
   gh_create_branch supercent-hub "$BRANCH"
   gh_put_file supercent-hub "$BRANCH" "src/app/tools/$requestId/page.tsx" /tmp/generated-page.tsx "feat: prototype $requestId"

3. KV upsert (+ 결정론적 preview URL 조립)
   source scripts/routine-lib/kv.sh
   PROTOTYPE_URL=$(preview_url_for_branch "$BRANCH")
   TITLE="<추출한 title>"
   DESC="<추출한 description>"
   NOW=$(date -u +%FT%TZ)
   PROTO_JSON=$(jq -nc \
     --arg id "$requestId" --arg rid "$requestId" \
     --arg t "$TITLE" --arg d "$DESC" \
     --arg u "$PROTOTYPE_URL" --arg b "$BRANCH" \
     --arg now "$NOW" \
     '{id:$id, requestId:$rid, title:$t, description:$d, url:$u, branch:$b, tags:[], useCount:0, positiveFeedbackCount:0, createdAt:$now}')
   kv_set_json "proto:$requestId" "$PROTO_JSON"
   kv_sadd "idx:prototypes" "$requestId"
   kv_patch_status "$requestId" "ready"

[실패 처리]
어느 단계 실패 시:
   source scripts/routine-lib/kv.sh
   kv_patch_status "$requestId" "failed"
   echo "FAILED: $requestId (step=X, msg=...)" >&2
   exit 1

[출력]
stdout 로그 한 줄:
   "status=ready requestId=$requestId url=$PROTOTYPE_URL branch=$BRANCH"
```

## Helper scripts (Routine 실행 시 자동 clone 된 레포에서 source)

- `scripts/routine-lib/github.sh` — `gh_create_branch`, `gh_put_file` (Task 12)
- `scripts/routine-lib/kv.sh` — `kv_set_json`, `kv_sadd`, `kv_patch_status`, `preview_url_for_branch` (Task 14)

## Preview URL 규칙

`claude/prototype-<requestId>` 브랜치는 `/` → `-` 치환되어:

```
https://supercent-hub-git-claude-prototype-<requestId>-huhhuhs-projects.vercel.app
```

Git 연결이 완료돼 있으면 브랜치 push 시 Vercel 이 자동 빌드해서 위 URL 로 serve.

## 주의

- 프롬프트 수정은 반드시 web UI 에서. 이 파일만 수정하면 실제 동작은 변경되지 않음.
- web UI 프롬프트 변경 후 이 파일도 함께 갱신해 버전 정합성을 유지할 것.
