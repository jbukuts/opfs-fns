// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  eslintPluginPrettierRecommended,
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }]
    }
  },
  { ignores: ['dist/*', 'coverage/*'] }
);
