import { defineConfig } from 'vitest/config'
import path from 'node:path'

// Phase 1 Task 5: Vitest config.
// - Node 환경(서버/라이브러리 코드 대상). jsdom 불필요.
// - `@/*` alias 를 tsconfig.json 과 동기화.
// - 테스트 파일: src/**/*.{test,spec}.ts(x)
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    globals: false,
    clearMocks: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
