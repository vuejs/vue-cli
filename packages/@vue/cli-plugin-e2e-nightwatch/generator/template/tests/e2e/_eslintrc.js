<%_ if (hasESLint) { _%>
module.exports = {
  rules: {
    <%_ if (hasESLint) { _%>
    '@typescript-eslint/no-var-requires': 'off',
    <%_ } _%>
    'no-unused-expressions': 'off'
  }
}
<%_ } _%>
