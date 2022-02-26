jest.setTimeout(process.env.APPVEYOR ? 120000 : 60000)

const create = require('@vue/cli-test-utils/createTestProject')

test('should add types to existing tsconfig.json', async () => {
  const { dir, read, write } = await create('e2e-webdriverio-tsconfig', {
    plugins: {
      '@vue/cli-plugin-typescript': {},
      '@vue/cli-plugin-e2e-webdriverio': {
        webdrivers: ['chrome']
      }
    }
  })
  await write('tsconfig.json', JSON.stringify({ compilerOptions: { types: ['some-type'] } }))

  const invoke = require('@vue/cli/lib/invoke')
  await invoke('e2e-webdriverio', { webdrivers: ['chrome'] }, dir)

  const tsconfig = await read('tsconfig.json')
  expect(tsconfig).toMatch(/\r?\n$/)
  expect(JSON.parse(tsconfig).compilerOptions.types)
    .toEqual(['some-type', 'mocha', '@wdio/mocha-framework', 'webdriverio/sync'])
})
