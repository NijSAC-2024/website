import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooksPlugin from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import react from 'eslint-plugin-react';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.js',
      'vite.config.ts',
      'tailwind.config.js',
      'dist/**/*',
      'node_modules/**/*'
    ]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'typescript-eslint': tseslint.plugin,
      'react-hooks': hooksPlugin,
      'react-refresh': reactRefresh,
      '@stylistic/ts': stylisticTs,
      react
    },
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        project: './tsconfig.json',
        extraFileExtensions: ['.vue'],
        sourceType: 'module'
      }
    },
    rules: {
      ...hooksPlugin.configs.recommended.rules,
      quotes: ['error', 'single'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      curly: ['error', 'all'],
      '@stylistic/ts/indent': ['error', 2, {
        'CallExpression': { 'arguments': 1 }
      }]
    }
  }
);
