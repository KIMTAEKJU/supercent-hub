# Design Journal — 5단계 피벗의 전체 기록

슈퍼센트 'AI 애플리케이션 엔지니어' 과제 (2026-04-16 ~ 04-23) 수행 중 거친 **5단계 기획 피벗**의 공개 기록입니다. 최종 제출물은 5번째 안인 [AI Tool Request Hub](05-ai-tool-request-hub.md) 이지만, **그 선택이 어떤 사실 기반 판단에서 나왔는지**를 증명하는 자료로 이 저널을 남깁니다.

## 전체 타임라인

| # | 날짜 | 기획안 | 도달 단계 | 결과 | 문서 |
|---|---|---|---|---|---|
| 1 | 2026-04-16 | **GameSpec AI** | 설계 | 폐기 — "프롬프트 래퍼" 비판 | [01](01-gamespec-ai.md) |
| 2 | 2026-04-18 | **AdSpec AI** | **구현·배포 완료** | 폐기 — downstream 공백 + $500 API 폭주 | [02](02-adspec-ai.md) |
| 3 | 2026-04-19~20 | **Virtual Playtest Panel (Option L)** | 9h 설계 · ADR-006 | 폐기 — 사내 AI Player 중복 발견 | [03](03-virtual-playtest-panel.md) |
| 4 | 2026-04-22 | **Competitor Creative Studio** | 중간 피벗 | 흡수 — Routines 채택을 Hub 에 계승 | [04](04-competitor-creative-studio.md) |
| 5 | 2026-04-22~23 | **AI Tool Request Hub** | ✅ **제출** | [supercent-hub.vercel.app](https://supercent-hub.vercel.app) | [05](05-ai-tool-request-hub.md) |

## 부록

- [**decisions.md**](decisions.md) — 7개 주요 기술 의사결정 (왜 Routines, 왜 KV, 왜 4필드, 왜 fire-and-forget, 왜 `claude/` 브랜치, 왜 GET form 패턴 등)
- [**lessons.md**](lessons.md) — 각 단계가 다음 단계로 넘긴 사실·결정의 인과 관계
- [**references.md**](references.md) — 설계 과정에서 참조한 **외부 자료 40+** (슈퍼센트 공식 블로그, Claude Code 공식 문서, 학술 논문, 경쟁 선례 등)

## 이 기록의 의도

1. **피벗이 "꾸밈" 이 아니라 "사실 기반 폐기"** 임을 원문 단위로 증명
2. **회사 이해 시그널 추적**: 슈퍼센트 AI Hub 블로그의 4공백 · 사내 AI Player 존재 · AI 영상 PD 직군 신설 등의 외부 사실이 각 단계 기획에 어떻게 반영되었는지
3. **기술 의사결정의 누적 근거**: 최종 Hub 의 아키텍처 선택(Routines + KV + Git+Vercel)이 즉흥이 아니라 이전 4단계에서 축적된 제약과 해결책의 결과임을 노출

## 관련 자료

- [제출 문서](../submission/) — 본 과제 최종 제출물
- [와이어프레임](../wireframes/) — 5개 화면 저화질 레이아웃 SVG
- [사용자 플로우](../wireframes/user-flow.md) — Mermaid 플로우차트
- [라이브 URL](https://supercent-hub.vercel.app)
