#!/usr/bin/env bash
# GitHub REST API helpers for generate-prototype Routine.
# `gh` CLI 는 Routine 실행 환경에 없음 → curl 기반.
#
# 필수 env:
#   GITHUB_TOKEN   — fine-grained PAT, Contents (R/W) + Metadata (R)
#   GITHUB_OWNER   — repo 소유자 (e.g. KIMTAEKJU)
set -euo pipefail

# 브랜치 생성 (main 의 최신 커밋을 base 로)
# 사용: gh_create_branch <repo> <branch>
gh_create_branch() {
  local repo="$1" branch="$2"
  local sha
  sha=$(curl -sS \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$GITHUB_OWNER/$repo/git/refs/heads/main" \
    | jq -r '.object.sha')
  if [ -z "$sha" ] || [ "$sha" = "null" ]; then
    echo "ERROR: gh_create_branch — main SHA not found in $GITHUB_OWNER/$repo" >&2
    return 1
  fi
  curl -sS -X POST \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "Content-Type: application/json" \
    "https://api.github.com/repos/$GITHUB_OWNER/$repo/git/refs" \
    -d "$(jq -nc --arg ref "refs/heads/$branch" --arg sha "$sha" '{ref:$ref, sha:$sha}')" \
    >/dev/null
}

# 파일 업로드 (단일 파일 PUT). 기존 파일이면 update, 없으면 create.
# 사용: gh_put_file <repo> <branch> <path> <local_file> <commit_message>
# stdout: 생성된 commit SHA
gh_put_file() {
  local repo="$1" branch="$2" path="$3" local_file="$4" msg="$5"
  local content_b64
  content_b64=$(base64 < "$local_file" | tr -d '\n')

  # 기존 파일 sha 조회 (없으면 빈 문자열)
  local existing_sha
  existing_sha=$(curl -sS \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$GITHUB_OWNER/$repo/contents/$path?ref=$branch" \
    | jq -r '.sha // empty')

  local payload
  if [ -n "$existing_sha" ]; then
    payload=$(jq -nc --arg m "$msg" --arg c "$content_b64" --arg b "$branch" --arg s "$existing_sha" \
      '{message:$m, content:$c, branch:$b, sha:$s}')
  else
    payload=$(jq -nc --arg m "$msg" --arg c "$content_b64" --arg b "$branch" \
      '{message:$m, content:$c, branch:$b}')
  fi

  curl -sS -X PUT \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "Content-Type: application/json" \
    "https://api.github.com/repos/$GITHUB_OWNER/$repo/contents/$path" \
    -d "$payload" \
    | jq -r '.commit.sha'
}
