jest.setTimeout(30000)

const fetch = require('node-fetch')
const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const serve = require('@vue/cli-test-utils/serveWithPuppeteer')
const createJSONServer = require('@vue/cli-test-utils/createJSONServer')

let mockServer1
let mockServer2

beforeAll(done => {
  mockServer1 = createJSONServer({
    'posts': [
      { 'id': 1, 'title': 'server-one', 'author': 'typicode' }
    ]
  }).listen(3000, () => {
    mockServer2 = createJSONServer({
      'posts': [
        { 'id': 1, 'title': 'server-two', 'author': 'typicode' }
      ]
    }).listen(3001, done)
  })
})

afterAll(() => {
  mockServer1.close()
  mockServer2.close()
})

let newId = 1
async function assertProxy (url, title) {
  const res = await fetch(`${url}posts/1`).then(result => result.json())
  expect(res.title).toBe(title)

  // POST
  newId++
  await fetch(`${url}posts`, {
    method: 'POST',
    body: JSON.stringify({
      id: newId,
      title: 'new',
      author: 'test'
    }),
    headers: { 'Content-Type': 'application/json' }
  })

  const newPost = await fetch(`${url}posts/${newId}`).then(result => result.json())
  expect(newPost.title).toBe('new')
}

test('serve with single proxy', async () => {
  const project = await create('single-proxy', defaultPreset)

  await project.write('vue.config.js', `
    module.exports = {
      devServer: {
        proxy: 'http://localhost:3000'
      }
    }
  `)

  await serve(
    () => project.run('vue-cli-service serve'),
    ({ url }) => assertProxy(url, 'server-one'),
    true /* no need for puppeteer */
  )
})

test('serve with multi proxies', async () => {
  const project = await create('multi-proxy', defaultPreset)

  await project.write('vue.config.js', `
    module.exports = {
      devServer: {
        proxy: {
          '/one': {
            target: 'http://localhost:3000',
            pathRewrite: {
              '^/one': ''
            }
          },
          '/two': {
            target: 'http://localhost:3001',
            pathRewrite: {
              '^/two': ''
            }
          }
        }
      }
    }
  `)

  await serve(
    () => project.run('vue-cli-service serve'),
    async ({ url }) => {
      await assertProxy(`${url}one/`, 'server-one')
      await assertProxy(`${url}two/`, 'server-two')
    },
    true /* no need for puppeteer */
  )
})
