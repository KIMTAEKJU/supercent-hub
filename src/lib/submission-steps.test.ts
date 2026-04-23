import { describe, it, expect } from 'vitest'

import { STAGE_LABEL, statusToCompletedSteps } from './submission-steps'

describe('statusToCompletedSteps', () => {
  it('pending → 0 (1단계 active)', () => {
    expect(statusToCompletedSteps('pending')).toBe(0)
  })

  it('interpreting → 0 (1단계 active, pending과 동일 취급)', () => {
    expect(statusToCompletedSteps('interpreting')).toBe(0)
  })

  it('generating → 1 (2단계 active)', () => {
    expect(statusToCompletedSteps('generating')).toBe(1)
  })

  it('committing → 2 (3단계 active)', () => {
    expect(statusToCompletedSteps('committing')).toBe(2)
  })

  it('deploying → 3 (4단계 active)', () => {
    expect(statusToCompletedSteps('deploying')).toBe(3)
  })

  it('ready → 5 (5단계 완료)', () => {
    expect(statusToCompletedSteps('ready')).toBe(5)
  })

  it('failed → -1 (에러 모드)', () => {
    expect(statusToCompletedSteps('failed')).toBe(-1)
  })
})

describe('STAGE_LABEL', () => {
  it('maps each in-progress status to a human-readable stage label', () => {
    expect(STAGE_LABEL.pending).toBe('요청 접수')
    expect(STAGE_LABEL.interpreting).toBe('1단계(요청 해석)')
    expect(STAGE_LABEL.generating).toBe('2단계(코드 생성)')
    expect(STAGE_LABEL.committing).toBe('3단계(Git 커밋)')
    expect(STAGE_LABEL.deploying).toBe('4단계(Vercel 배포)')
  })
})
