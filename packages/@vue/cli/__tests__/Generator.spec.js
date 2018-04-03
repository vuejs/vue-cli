jest.mock('fs')

const fs = require('fs')
const path = require('path')
const Generator = require('../lib/Generator')
const { logs } = require('@vue/cli-shared-utils')

// prepare template fixtures
const mkdirp = require('mkdirp')
const templateDir = path.resolve(__dirname, 'template')
mkdirp.sync(templateDir)
fs.writeFileSync(path.resolve(templateDir, 'foo.js'), 'foo(<%- options.n %>)')
mkdirp.sync(path.resolve(templateDir, 'bar'))
fs.writeFileSync(path.resolve(templateDir, 'bar/bar.js'), 'bar(<%- m %>)')

fs.writeFileSync(path.resolve(templateDir, 'replace.js'), `
---
extend: '${path.resolve(templateDir, 'bar/bar.js')}'
replace: !!js/regexp /bar\\((.*)\\)/
---
baz($1)
`.trim())

fs.writeFileSync(path.resolve(templateDir, 'multi-replace-source.js'), `
foo(1)
bar(2)
`.trim())

fs.writeFileSync(path.resolve(templateDir, 'multi-replace.js'), `
---
extend: '${path.resolve(templateDir, 'multi-replace-source.js')}'
replace:
  - !!js/regexp /foo\\((.*)\\)/
  - !!js/regexp /bar\\((.*)\\)/
---
<%# REPLACE %>
baz($1)
<%# END_REPLACE %>

<%# REPLACE %>
qux($1)
<%# END_REPLACE %>
`.trim())

test('api: extendPackage', async () => {
  const generator = new Generator('/', {
    pkg: {
      name: 'hello',
      list: [1],
      vue: {
        foo: 1,
        bar: 2,
        pluginOptions: {
          graphqlMock: true,
          apolloEngine: false
        }
      }
    },
    plugins: [{
      id: 'test',
      apply: api => {
        api.extendPackage({
          name: 'hello2',
          list: [2],
          vue: {
            foo: 2,
            baz: 3,
            pluginOptions: {
              enableInSFC: true
            }
          }
        })
      }
    }]
  })

  await generator.generate()

  const pkg = JSON.parse(fs.readFileSync('/package.json', 'utf-8'))
  expect(pkg).toEqual({
    name: 'hello2',
    list: [1, 2],
    vue: {
      foo: 2,
      bar: 2,
      baz: 3,
      pluginOptions: {
        graphqlMock: true,
        apolloEngine: false,
        enableInSFC: true
      }
    }
  })
})

test('api: extendPackage function', async () => {
  const generator = new Generator('/', {
    pkg: { foo: 1 },
    plugins: [{
      id: 'test',
      apply: api => {
        api.extendPackage(pkg => ({
          foo: pkg.foo + 1
        }))
      }
    }]
  })

  await generator.generate()

  const pkg = JSON.parse(fs.readFileSync('/package.json', 'utf-8'))
  expect(pkg).toEqual({
    foo: 2
  })
})

test('api: extendPackage merge dependencies', async () => {
  const generator = new Generator('/', { plugins: [
    {
      id: 'test1',
      apply: api => {
        api.extendPackage({
          dependencies: {
            foo: '^1.1.0',
            bar: '^1.0.0'
          }
        })
      }
    },
    {
      id: 'test2',
      apply: api => {
        api.extendPackage({
          dependencies: {
            foo: '^1.0.0',
            baz: '^1.0.0'
          }
        })
      }
    }
  ] })

  await generator.generate()

  const pkg = JSON.parse(fs.readFileSync('/package.json', 'utf-8'))
  expect(pkg).toEqual({
    dependencies: {
      foo: '^1.1.0',
      bar: '^1.0.0',
      baz: '^1.0.0'
    }
  })
})

test('api: warn invalid dep range', async () => {
  new Generator('/', { plugins: [
    {
      id: 'test1',
      apply: api => {
        api.extendPackage({
          dependencies: {
            foo: 'foo'
          }
        })
      }
    }
  ] })

  expect(logs.warn.some(([msg]) => {
    return (
      msg.match(/invalid version range for dependency "foo"/) &&
      msg.match(/injected by generator "test1"/)
    )
  })).toBe(true)
})

test('api: extendPackage dependencies conflict', async () => {
  new Generator('/', { plugins: [
    {
      id: 'test1',
      apply: api => {
        api.extendPackage({
          dependencies: {
            foo: '^1.0.0'
          }
        })
      }
    },
    {
      id: 'test2',
      apply: api => {
        api.extendPackage({
          dependencies: {
            foo: '^2.0.0'
          }
        })
      }
    }
  ] })

  expect(logs.warn.some(([msg]) => {
    return (
      msg.match(/conflicting versions for project dependency "foo"/) &&
      msg.match(/\^1\.0\.0 injected by generator "test1"/) &&
      msg.match(/\^2\.0\.0 injected by generator "test2"/) &&
      msg.match(/Using newer version \(\^2\.0\.0\)/)
    )
  })).toBe(true)
})

test('api: render fs directory', async () => {
  const generator = new Generator('/', { plugins: [
    {
      id: 'test1',
      apply: api => {
        api.render('./template', { m: 2 })
      },
      options: {
        n: 1
      }
    }
  ] })

  await generator.generate()

  expect(fs.readFileSync('/foo.js', 'utf-8')).toMatch('foo(1)')
  expect(fs.readFileSync('/bar/bar.js', 'utf-8')).toMatch('bar(2)')
  expect(fs.readFileSync('/replace.js', 'utf-8')).toMatch('baz(2)')
  expect(fs.readFileSync('/multi-replace.js', 'utf-8')).toMatch('baz(1)\nqux(2)')
})

test('api: render object', async () => {
  const generator = new Generator('/', { plugins: [
    {
      id: 'test1',
      apply: api => {
        api.render({
          'foo1.js': path.join(templateDir, 'foo.js'),
          'bar/bar1.js': path.join(templateDir, 'bar/bar.js')
        }, { m: 3 })
      },
      options: {
        n: 2
      }
    }
  ] })

  await generator.generate()

  expect(fs.readFileSync('/foo1.js', 'utf-8')).toMatch('foo(2)')
  expect(fs.readFileSync('/bar/bar1.js', 'utf-8')).toMatch('bar(3)')
})

test('api: render middleware', async () => {
  const generator = new Generator('/', { plugins: [
    {
      id: 'test1',
      apply: (api, options) => {
        api.render((files, render) => {
          files['foo2.js'] = render('foo(<%- n %>)', options)
          files['bar/bar2.js'] = render('bar(<%- n %>)', options)
        })
      },
      options: {
        n: 3
      }
    }
  ] })

  await generator.generate()

  expect(fs.readFileSync('/foo2.js', 'utf-8')).toMatch('foo(3)')
  expect(fs.readFileSync('/bar/bar2.js', 'utf-8')).toMatch('bar(3)')
})

test('api: hasPlugin', () => {
  new Generator('/', { plugins: [
    {
      id: 'foo',
      apply: api => {
        expect(api.hasPlugin('foo')).toBe(true)
        expect(api.hasPlugin('bar')).toBe(true)
        expect(api.hasPlugin('baz')).toBe(true)
        expect(api.hasPlugin('vue-cli-plugin-bar')).toBe(true)
        expect(api.hasPlugin('@vue/cli-plugin-baz')).toBe(true)
      }
    },
    {
      id: 'vue-cli-plugin-bar',
      apply: () => {}
    },
    {
      id: '@vue/cli-plugin-baz',
      apply: () => {}
    }
  ] })
})

test('api: onCreateComplete', () => {
  const fn = () => {}
  const cbs = []
  new Generator('/', {
    plugins: [
      {
        id: 'test',
        apply: api => {
          api.onCreateComplete(fn)
        }
      }
    ],
    completeCbs: cbs
  })
  expect(cbs).toContain(fn)
})

test('api: resolve', () => {
  new Generator('/foo/bar', { plugins: [
    {
      id: 'test',
      apply: api => {
        expect(api.resolve('baz')).toBe(path.resolve('/foo/bar', 'baz'))
      }
    }
  ] })
})

test('extract config files', async () => {
  const configs = {
    vue: {
      lintOnSave: true
    },
    babel: {
      presets: ['@vue/app']
    },
    postcss: {
      autoprefixer: {}
    },
    eslintConfig: {
      extends: ['plugin:vue/essential']
    },
    jest: {
      foo: 'bar'
    }
  }

  const generator = new Generator('/', { plugins: [
    {
      id: 'test',
      apply: api => {
        api.extendPackage(configs)
      }
    }
  ] })

  await generator.generate({
    extractConfigFiles: true
  })

  const json = v => JSON.stringify(v, null, 2)
  expect(fs.readFileSync('/vue.config.js', 'utf-8')).toMatch('module.exports = {\n  lintOnSave: true\n}')
  expect(fs.readFileSync('/.babelrc', 'utf-8')).toMatch(json(configs.babel))
  expect(fs.readFileSync('/.postcssrc', 'utf-8')).toMatch(json(configs.postcss))
  expect(fs.readFileSync('/.eslintrc', 'utf-8')).toMatch(json(configs.eslintConfig))
  expect(fs.readFileSync('/jest.config.js', 'utf-8')).toMatch(`module.exports = {\n  foo: 'bar'\n}`)
})
