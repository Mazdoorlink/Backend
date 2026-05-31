import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  {
    // Globally ignored files and directories
    ignores: [
      'node_modules/**',
      'dist/**',
      '.wrangler/**',
      'drizzle/**',
      'webpack.config.js',
      'webpack.*.js',
    ],
  },
  // Base recommended rules
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Integrates Prettier so formatting issues show up as ESLint errors, but prevents rule clashes
  eslintPluginPrettierRecommended,

  {
    // Custom rule overrides for your Hono project
    rules: {
      // It is common to use 'any' while prototyping MVP schemas, so we downgrade it to a warning
      '@typescript-eslint/no-explicit-any': 'warn',

      // Allow unused variables if they start with an underscore (useful for unused Hono context params)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
);
