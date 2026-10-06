import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    // React Hooks v6 flags every synchronous setState in an effect body. In
    // this Next.js app those effects are deliberate: hydrating sessionStorage
    // state after SSR, feature-detecting browser APIs (speech, Intersection-
    // Observer), and resetting UI state on navigation. Each one is a
    // one-shot sync with an external system, not a cascading render loop.
    // Kept as warnings so the signal stays visible without failing the build.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
