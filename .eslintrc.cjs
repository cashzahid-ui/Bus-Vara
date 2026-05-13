module.exports = {
  plugins: ['@firebase/security-rules'],
  parser: '@firebase/eslint-plugin-security-rules/parser',
  rules: {
    '@firebase/security-rules/no-allow-without-auth': 'error',
  },
  overrides: [
    {
      files: ['*.rules'],
      extends: ['plugin:@firebase/security-rules/recommended'],
    },
  ],
};
