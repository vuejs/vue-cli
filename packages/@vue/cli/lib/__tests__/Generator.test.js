jest.mock('fs')

const fs = require('fs')
const path = require('path')
const Generator = require('../Generator')
const { logs } = require('@vue/cli-shared-utils')

// prepare template fixtures
const mkdirp = require('mkdirp')
const templateDir = path.resolve(__dirname, 'template')
mkdirp.sync(templateDir)
fs.writeFileSync(path.resolve(templateDir, 'foo.js'), 'foo(<%- options.n %>)')
mkdirp.sync(path.resolve(templateDir, 'bar'))
fs.writeFileSync(path.resolve(templateDir, 'bar/bar.js'), 'bar(<%- m %>)')

it('api: extendPackage', async () => {
  const generator = new Generator('/', {
    name: 'hello',
    list: [1],
    vue: {
      foo: 1,
      bar: 2
    }
  }, [{
    id: 'test',
    apply: api => {
      api.extendPackage({
        name: 'hello2',
        list: [2],
        vue: {
          foo: 2,
          baz: 3
        }
      })
    }
  }])

  await generator.generate()

  const pkg = JSON.parse(fs.readFileSync('/package.json', 'utf-8'))
  expect(pkg).toEqual({
    name: 'hello2',
    list: [1, 2],
    vue: {
      foo: 2,
      bar: 2,
      baz: 3
    }
  })
})

it('api: extendPackage function', async () => {
  const generator = new Generator('/', { foo: 1 }, [{
    id: 'test',
    apply: api => {
      api.extendPackage(pkg => ({
        foo: pkg.foo + 1
      }))
    }
  }])

  await generator.generate()

  const pkg = JSON.parse(fs.readFileSync('/package.json', 'utf-8'))
  expect(pkg).toEqual({
    foo: 2
  })
})

it('api: extendPackage + { merge: false }', async () => {
  const generator = new Generator('/', {
    name: 'hello',
    list: [1],
    vue: {
      foo: 1,
      bar: 2
    }
  }, [{
    id: 'test',
    apply: api => {
      api.extendPackage({
        name: 'hello2',
        list: [2],
        vue: {
          foo: 2,
          baz: 3
        }
      }, { merge: false })
    }
  }])

  await generator.generate()

  const pkg = JSON.parse(fs.readFileSync('/package.json', 'utf-8'))
  expect(pkg).toEqual({
    name: 'hello2',
    list: [2],
    vue: {
      foo: 2,
      baz: 3
    }
  })
})

it('api: extendPackage merge dependencies', async () => {
  const generator = new Generator('/', {}, [
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
  ])

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

it('api: warn invalid dep range', async () => {
  new Generator('/', {}, [
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
  ])

  expect(logs.warn.some(([msg]) => {
    return (
      msg.match(/invalid version range for dependency "foo"/) &&
      msg.match(/injected by generator "test1"/)
    )
  })).toBe(true)
})

it('api: extendPackage dependencies conflict', async () => {
  new Generator('/', {}, [
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
  ])

  expect(logs.warn.some(([msg]) => {
    return (
      msg.match(/conflicting versions for project dependency "foo"/) &&
      msg.match(/\^1\.0\.0 injected by generator "test1"/) &&
      msg.match(/\^2\.0\.0 injected by generator "test2"/) &&
      msg.match(/Using newer version \(\^2\.0\.0\)/)
    )
  })).toBe(true)
})

it('api: render fs directory', async () => {
  const generator = new Generator('/', {}, [
    {
      id: 'test1',
      apply: api => {
        api.render('./template', { m: 2 })
      },
      options: {
        n: 1
      }
    }
  ])

  await generator.generate()

  expect(fs.readFileSync('/foo.js', 'utf-8')).toContain('foo(1)')
  expect(fs.readFileSync('/bar/bar.js', 'utf-8')).toContain('bar(2)')
})

it('api: render object', async () => {
  const generator = new Generator('/', {}, [
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
  ])

  await generator.generate()

  expect(fs.readFileSync('/foo1.js', 'utf-8')).toContain('foo(2)')
  expect(fs.readFileSync('/bar/bar1.js', 'utf-8')).toContain('bar(3)')
})

it('api: render middleware', async () => {
  const generator = new Generator('/', {}, [
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
  ])

  await generator.generate()

  expect(fs.readFileSync('/foo2.js', 'utf-8')).toContain('foo(3)')
  expect(fs.readFileSync('/bar/bar2.js', 'utf-8')).toContain('bar(3)')
})

it('api: hasPlugin', () => {
  new Generator('/', {}, [
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
  ])
})

it('api: onCreateComplete', () => {
  const fn = () => {}
  const cbs = []
  new Generator('/', {}, [
    {
      id: 'test',
      apply: api => {
        api.onCreateComplete(fn)
      }
    }
  ], cbs)
  expect(cbs).toContain(fn)
})

it('api: resolve', () => {
  new Generator('/foo/bar', {}, [
    {
      id: 'test',
      apply: api => {
        expect(api.resolve('baz')).toBe(path.resolve('/foo/bar', 'baz'))
      }
    }
  ])
})
