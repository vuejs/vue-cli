jest.setTimeout(60000)

const path = require('path')
const create = require('@vue/cli-test-utils/createTestProject')
const serve = require('@vue/cli-test-utils/serveWithPuppeteer')

const runSilently = fn => {
  const log = console.log
  console.log = () => {}
  fn()
  console.log = log
}

test('should work', async () => {
  const project = await create('eslint', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'commit'
      }
    }
  })
  const { read, write, run } = project
  // should've applied airbnb autofix
  const main = await read('src/main.js')
  expect(main).toMatch(';')
  // remove semicolons
  const updatedMain = main.replace(/;/g, '')
  await write('src/main.js', updatedMain)
  // lint
  await run('vue-cli-service lint')
  expect(await read('src/main.js')).toMatch(';')

  // lint-on-commit
  runSilently(() => {
    require('yorkie/src/install')(path.join(project.dir, 'node_modules'))
  })
  const hook = await read('.git/hooks/pre-commit')
  expect(hook).toMatch('#yorkie')
  await write('src/main.js', updatedMain)
  // nvm doesn't like PREFIX env
  if (process.platform === 'darwin') {
    delete process.env.PREFIX
  }
  await run('git add -A')
  await run('git commit -m save')
  // should be linted on commit
  expect(await read('src/main.js')).toMatch(';')

  // lint-on-save
  write('vue.config.js', 'module.exports = { lintOnSave: true }')
  await serve(project, async ({ nextUpdate }) => {
    // linted when starting up the server by eslint-loader
    expect(await read('src/main.js')).toMatch(';')
    write('src/main.js', updatedMain)
    await nextUpdate()
    await new Promise(r => setTimeout(r, 1000))
    // should be linted again on save
    expect(await read('src/main.js')).toMatch(';')
  })
})
