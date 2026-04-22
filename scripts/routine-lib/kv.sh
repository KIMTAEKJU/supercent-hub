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
# 사용: kv_patch_status <request_id> <status>  — status ∈ {pending, ready, failed}
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

# Vercel preview URL 결정론적 조립.
# 브랜치의 `/` → `-` 치환 (Vercel sanitize 규칙).
# 사용: preview_url_for_branch <branch>
# 예: claude/prototype-abc123 → https://supercent-hub-git-claude-prototype-abc123-huhhuhs-projects.vercel.app
preview_url_for_branch() {
  local branch="$1"
  local sanitized="${branch//\//-}"
  echo "https://supercent-hub-git-${sanitized}-huhhuhs-projects.vercel.app"
}
