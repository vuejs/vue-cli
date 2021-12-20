jest.setTimeout(40000)

const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')

async function makeProjectMultiEntry (project) {
  await project.write('vue.config.js', `
    module.exports = {
      chainWebpack: config => {
        config.output.filename("testLib.[name].js");
        config.entryPoints.clear();
        config
          .entry("foo")
          .add("./src/foo.js")
          .end();
        config
          .entry("bar")
          .add("./src/bar.js")
          .end();
      }
    }
  `)
  await project.write('src/foo.js', `
    import Vue from 'vue'
    new Vue({
      el: '#app',
      render: h => h('h1', 'Foo')
    })
  `)
  await project.write('src/bar.js', `
    import Vue from 'vue'
    new Vue({
      el: '#app',
      render: h => h('h1', 'Bar')
    })
  `)
}

test('build as lib with multi-entry', async () => {
  const project = await create('build-lib-multi-entry', defaultPreset)

  await makeProjectMultiEntry(project)

  const { stdout } = await project.run('vue-cli-service build --target lib')
  expect(stdout).toMatch('Build complete.')

  expect(project.has('dist/demo.html')).toBe(true)
  expect(project.has('dist/testLib.foo.common.js')).toBe(true)
  expect(project.has('dist/testLib.foo.umd.js')).toBe(true)
  expect(project.has('dist/testLib.foo.umd.min.js')).toBe(true)
  expect(project.has('dist/testLib.bar.common.js')).toBe(true)
  expect(project.has('dist/testLib.bar.umd.js')).toBe(true)
  expect(project.has('dist/testLib.bar.umd.min.js')).toBe(true)
})