// jest/babel-jest use babel to supports TypeScript
// esbuild-register will not work
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ],
    '@babel/preset-typescript'
  ]
}
