module.exports = {
  extends: './node_modules/kcd-scripts/eslint.js',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
  rules: {
    'babel/camelcase': 'off',
    'no-undef': 'off',
    'import/no-unresolved': 'off',
    'react/prop-types': 'off',
    'react/no-adjacent-inline-elements': 'off',
    'no-console': 'off',
    'react/jsx-filename-extension': 'off',
    'jest/unbound-method': 'off',

    // this rule is quite slow...
    'import/no-cycle': 'off',

    // meh...
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/return-await': 'off',
    'max-lines-per-function': 'off',
    '@typescript-eslint/sort-type-union-intersection-members': 'off',
    'one-var': 'off',

    // this didn't seem to work 🤔
    '@typescript-eslint/restrict-template-expressions': 'off',
    // I can't figure these out:
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
  },
  overrides: [
    {
      files: ['**/__tests__/**'],
      rules: {
        'react/display-name': 'off',
      },
    },
  ],
}
