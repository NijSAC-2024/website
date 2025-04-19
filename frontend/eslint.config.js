import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooksPlugin from 'eslint-plugin-react-hooks';

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, {
  plugins: {
    'typescript-eslint': tseslint.plugin,
    'react-hooks': hooksPlugin
  },
  ignores: ['eslint.config.js', 'vite.config.ts', 'tailwind.config.js'],
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
    indent: ['error', 2],
    quotes: ['error', 'single']
  }
});
