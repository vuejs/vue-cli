jest.setTimeout(80000)

const path = require('path')
const fs = require('fs-extra')
const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const getVueMajor = require('../lib/util/getVueMajor')

test('serve with process.env.VUE_NPM_ALIAS', async () => {
  const project = await create('e2e-vue-npm-alias', defaultPreset)

  const vueNextDir = path.resolve(project.dir, './node_modules/vue-next')

  const vueNextPkg = path.resolve(vueNextDir, './package.json')
  fs.outputFileSync(vueNextPkg, JSON.stringify({
    main: 'index.js'
  }, null, 2))

  const vueNextIndex = path.resolve(vueNextDir, './index.js')
  fs.outputFileSync(vueNextIndex, `module.exports = { version : '3.0.4' };`)

  process.env.VUE_NPM_ALIAS = 'vue-next'

  expect(getVueMajor(project.dir)).toBe(3)

  delete process.env.VUE_NPM_ALIAS
})
