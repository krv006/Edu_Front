import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const SOURCE = '**/*.{js,jsx,ts,tsx}'

export default defineConfig([
  globalIgnores(['dist', 'src/shared/ui/*.tsx', 'src/shared/hooks/use-mobile.ts']),
  {
    files: [SOURCE],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  // --- Qatlam chegaralari (FSD): app > pages > widgets > modules > shared ---
  {
    files: [`src/shared/${SOURCE}`],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/app/**', '@/pages/**', '@/widgets/**', '@/modules/**'],
          message: 'Shared qatlam yuqoridagi hech bir qatlamga bog‘lanmasligi kerak.',
        }],
      }],
    },
  },
  {
    files: [`src/modules/${SOURCE}`],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/app/**', '@/pages/**', '@/widgets/**'],
          message: 'Domain modul app, page yoki widget qatlamini import qilmasligi kerak.',
        }],
      }],
    },
  },
  {
    files: [`src/widgets/${SOURCE}`],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/app/**', '@/pages/**'],
          message: 'Widget app yoki page qatlamini import qilmasligi kerak.',
        }],
      }],
    },
  },
])
