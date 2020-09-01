import assertPromptModule from '@vue/cli-test-utils/assertPromptModule'
import createJSONServer from '@vue/cli-test-utils/createJSONServer'
import createServer from '@vue/cli-test-utils/createServer'
import createTestProject from '@vue/cli-test-utils/createTestProject'
import generateWithPlugin from '@vue/cli-test-utils/generateWithPlugin'
import launchPuppeteer from '@vue/cli-test-utils/launchPuppeteer'
import serveWithPuppeteer from '@vue/cli-test-utils/serveWithPuppeteer'
import path from 'path'

const expectedPrompts = [{ choose: 0 }]

const expectedOptions = {
  useConfigFiles: false,
  plugins: {
    foo: {}
  }
}

assertPromptModule(
  api => {
    api.injectFeature({
      name: 'Foo',
      value: 'foo'
    })
    api.injectFeature({
      name: 'Bar',
      value: 'bar'
    })
    api.onPromptComplete((answers, options) => {
      if (answers.features.includes('foo')) {
        options.plugins.foo = {}
      }
    })
  },
  expectedPrompts,
  expectedOptions
)

const mockServer1 = createJSONServer({
  posts: [{ id: 1, title: 'server-one', author: 'typicode' }]
}).listen(3000, () => {})

const server = createServer({ root: path.resolve(__dirname, 'temp') })

async function createTest() {
  const project = await createTestProject(
    'eslint',
    {
      plugins: {
        '@vue/cli-plugin-babel': {},
        '@vue/cli-plugin-eslint': {
          config: 'airbnb',
          lintOn: 'commit'
        }
      }
    },
    null,
    true
  )
  const { dir, has, read, write, run, rm } = project

  if (!has('src/main.js')) return

  const main = await read('src/main.js')

  const updatedMain = main.replace(/;/g, '')

  await write('src/main.js', updatedMain)

  await project.rm(`src/test.js`)

  const { stdout } = await run('vue-cli-service lint')

  await serveWithPuppeteer(
    () => project.run('vue-cli-service serve'),
    async ({ url, browser, page, nextUpdate, helpers, requestUrls }) => {
      await helpers.getText('h1')
    }
  )
}

async function testGenerate() {
  const { pkg, files } = await generateWithPlugin({
    id: 'test-plugin',
    apply: (api, options, rootOptions, invoking) => {
      if (options.skip) return
      console.log(rootOptions.bare, rootOptions.projectName, rootOptions.useConfigFiles, rootOptions.cssPreprocessor)
      if (rootOptions.plugins) console.log(rootOptions.plugins['@vue/cli-service'])
      if (rootOptions.configs) console.log(rootOptions.configs.vue)
    },
    options: {
      skip: true
    }
  })
  const lint = pkg.scripts.lint
  const main = files['src/main.js']

  await generateWithPlugin({
    id: 'test-plugin-no-options',
    apply: (api, options, rootOptions, invoking) => {}
  })
}

async function testLaunchPuppeteer() {
  const { browser, page, logs, requestUrls } = await launchPuppeteer(`http://localhost:8080/`)
}
