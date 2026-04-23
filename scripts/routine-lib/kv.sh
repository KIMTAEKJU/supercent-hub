#!/usr/bin/env bash
# Upstash Redis REST API helpers + Vercel preview URL assembly.
#
# 필수 env:
#   KV_REST_API_URL     — e.g. https://stable-cheetah-75204.upstash.io
#   KV_REST_API_TOKEN   — Upstash bearer token
set -euo pipefail

# proto/req/feedback JSON 저장 (Upstash String SET)
# 사용: kv_set_json <key> <json-string>
kv_set_json() {
  local key="$1" json="$2"
  curl -sS -X POST \
    -H "Authorization: Bearer $KV_REST_API_TOKEN" \
    -H "Content-Type: application/json" \
    "$KV_REST_API_URL/set/$key" \
    -d "$json" \
    | jq -e '.result == "OK"' >/dev/null
}

# 인덱스 set 에 member 추가 (Upstash Set SADD)
# 사용: kv_sadd <key> <member>
kv_sadd() {
  local key="$1" member="$2"
  curl -sS -X POST \
    -H "Authorization: Bearer $KV_REST_API_TOKEN" \
    "$KV_REST_API_URL/sadd/$key/$member" \
    >/dev/null
}

# req:<id>.status 필드만 PATCH (get → jq set → write-back)
# 사용: kv_patch_status <request_id> <status>
#   status ∈ {pending, interpreting, generating, committing, ready, failed}
kv_patch_status() {
  local req_id="$1" status="$2"
  local body next
  body=$(curl -sS \
    -H "Authorization: Bearer $KV_REST_API_TOKEN" \
    "$KV_REST_API_URL/get/req:$req_id" \
    | jq -r '.result')
  if [ -z "$body" ] || [ "$body" = "null" ]; then
    echo "ERROR: kv_patch_status — req:$req_id 없음" >&2
    return 1
  fi
  next=$(echo "$body" | jq -c --arg s "$status" '.status=$s')
  kv_set_json "req:$req_id" "$next"
}

# req:<id>.status = "failed" + lastStatus = <stage> 동시 PATCH.
# 사용: kv_patch_failed <request_id> <last_stage>
#   last_stage ∈ {pending, interpreting, generating, committing, deploying}
# kv_patch_status 와 구조 동일 (GET → jq 수정 → write-back). 두 필드 원자적 갱신.
# last_stage 가 빈 문자열이면 lastStatus 필드를 생략하고 status 만 failed 로 기록.
kv_patch_failed() {
  local req_id="$1" last="$2"
  local body next
  body=$(curl -sS \
    -H "Authorization: Bearer $KV_REST_API_TOKEN" \
    "$KV_REST_API_URL/get/req:$req_id" \
    | jq -r '.result')
  if [ -z "$body" ] || [ "$body" = "null" ]; then
    echo "ERROR: kv_patch_failed — req:$req_id 없음" >&2
    return 1
  fi
  if [ -n "$last" ]; then
    next=$(echo "$body" | jq -c --arg s "failed" --arg l "$last" \
      '.status=$s | .lastStatus=$l')
  else
    next=$(echo "$body" | jq -c --arg s "failed" '.status=$s')
  fi
  kv_set_json "req:$req_id" "$next"
}

# Vercel preview URL 결정론적 조립.
# 브랜치의 `/` → `-` 치환 (Vercel sanitize 규칙).
# 사용: preview_url_for_branch <branch>
# 예: claude/prototype-abc123 → https://supercent-hub-git-claude-prototype-abc123-huhhuhs-projects.vercel.app
preview_url_for_branch() {
  local branch="$1"
  local sanitized="${branch//\//-}"
  echo "https://supercent-hub-git-${sanitized}-huhhuhs-projects.vercel.app"
}
