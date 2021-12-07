module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module'
  },
  rules: {
    'explicit-module-boundary-types': 'off',
    'no-explicit-any': 'off',
    semi: 'warn',
    'comma-dangle': [2, 'never'],
    'import/prefer-default-export': 0,
    'global-require': 0,
    'new-cap': 0,
    'consistent-return': 1,
    'max-len': ['warn', 120],
    'no-param-reassign': 0,
    'no-underscore-dangle': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never'
      }
    ],
    'no-shadow': 'error',
    // just warn
    'no-return-await': 'warn',
    'import/no-extraneous-dependencies': 'off',
    'no-use-before-define': 'warn',
    'no-unsafe-optional-chaining': 'warn'
  }
};
