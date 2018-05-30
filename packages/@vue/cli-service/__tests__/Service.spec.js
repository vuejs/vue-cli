jest.mock('fs')
jest.mock('/vue.config.js', () => ({ lintOnSave: false }), { virtual: true })
jest.mock('vue-cli-plugin-foo', () => () => {}, { virtual: true })

const fs = require('fs')
const path = require('path')
const Service = require('../lib/Service')

const mockPkg = json => {
  fs.writeFileSync('/package.json', JSON.stringify(json, null, 2))
}

const createMockService = (plugins = [], init = true) => {
  const service = new Service('/', {
    plugins,
    useBuiltIn: false
  })
  if (init) {
    service.init()
  }
  return service
}

beforeEach(() => {
  mockPkg({})
})

test('env loading', () => {
  fs.writeFileSync('/.env', `FOO=1\nBAR=2`)
  fs.writeFileSync('/.env.local', `FOO=3\nBAZ=4`)
  createMockService()
  expect(process.env.FOO).toBe('3')
  expect(process.env.BAR).toBe('2')
  expect(process.env.BAZ).toBe('4')
})

test('loading plugins from package.json', () => {
  mockPkg({
    devDependencies: {
      'bar': '^1.0.0',
      '@vue/cli-plugin-babel': '^3.0.0-beta.15',
      'vue-cli-plugin-foo': '^1.0.0'
    }
  })
  const service = new Service('/') // this one needs to read from package.json
  expect(service.plugins.some(({ id }) => id === '@vue/cli-plugin-babel')).toBe(true)
  expect(service.plugins.some(({ id }) => id === 'vue-cli-plugin-foo')).toBe(true)
  expect(service.plugins.some(({ id }) => id === 'bar')).toBe(false)
})

test('load project options from package.json', () => {
  mockPkg({
    vue: {
      lintOnSave: true
    }
  })
  const service = createMockService()
  expect(service.projectOptions.lintOnSave).toBe(true)
})

test('handle option baseUrl and outputDir correctly', () => {
  mockPkg({
    vue: {
      baseUrl: 'https://foo.com/bar',
      outputDir: '/public/'
    }
  })
  const service = createMockService()
  expect(service.projectOptions.baseUrl).toBe('https://foo.com/bar/')
  expect(service.projectOptions.outputDir).toBe('public')
})

test('load project options from vue.config.js', () => {
  process.env.VUE_CLI_SERVICE_CONFIG_PATH = `/vue.config.js`
  fs.writeFileSync('/vue.config.js', `module.exports = { lintOnSave: false }`)
  mockPkg({
    vue: {
      lintOnSave: true
    }
  })
  const service = createMockService()
  fs.unlinkSync('/vue.config.js')
  delete process.env.VUE_CLI_SERVICE_CONFIG_PATH
  // vue.config.js has higher priority
  expect(service.projectOptions.lintOnSave).toBe(false)
})

test('api: registerCommand', () => {
  let args
  const service = createMockService([{
    id: 'test',
    apply: api => {
      api.registerCommand('foo', _args => {
        args = _args
      })
    }
  }])

  service.run('foo', { n: 1 })
  expect(args).toEqual({ _: [], n: 1 })
})

test('api: defaultModes', () => {
  fs.writeFileSync('/.env.foo', `FOO=5\nBAR=6`)
  fs.writeFileSync('/.env.foo.local', `FOO=7\nBAZ=8`)

  const plugin1 = {
    id: 'test-defaultModes',
    apply: api => {
      expect(process.env.FOO).toBe('7')
      expect(process.env.BAR).toBe('6')
      expect(process.env.BAZ).toBe('8')
      // for NODE_ENV & BABEL_ENV
      // any mode that is not test or production defaults to development
      expect(process.env.NODE_ENV).toBe('development')
      expect(process.env.BABEL_ENV).toBe('development')
      api.registerCommand('foo', () => {})
    }
  }
  plugin1.apply.defaultModes = {
    foo: 'foo'
  }

  createMockService([plugin1], false /* init */).run('foo')

  const plugin2 = {
    id: 'test-defaultModes',
    apply: api => {
      expect(process.env.NODE_ENV).toBe('test')
      expect(process.env.BABEL_ENV).toBe('test')
      api.registerCommand('test', () => {})
    }
  }
  plugin2.apply.defaultModes = {
    test: 'test'
  }

  createMockService([plugin2], false /* init */).run('test')
})

test('api: chainWebpack', () => {
  const service = createMockService([{
    id: 'test',
    apply: api => {
      api.chainWebpack(config => {
        config.output.path('test-dist')
      })
    }
  }])

  const config = service.resolveWebpackConfig()
  expect(config.output.path).toBe('test-dist')
})

test('api: configureWebpack', () => {
  const service = createMockService([{
    id: 'test',
    apply: api => {
      api.configureWebpack(config => {
        config.output = {
          path: 'test-dist-2'
        }
      })
    }
  }])

  const config = service.resolveWebpackConfig()
  expect(config.output.path).toBe('test-dist-2')
})

test('api: configureWebpack returning object', () => {
  const service = createMockService([{
    id: 'test',
    apply: api => {
      api.configureWebpack(config => {
        return {
          output: {
            path: 'test-dist-3'
          }
        }
      })
    }
  }])

  const config = service.resolveWebpackConfig()
  expect(config.output.path).toBe('test-dist-3')
})

test('api: configureDevServer', () => {
  const cb = () => {}
  const service = createMockService([{
    id: 'test',
    apply: api => {
      api.configureDevServer(cb)
    }
  }])
  expect(service.devServerConfigFns).toContain(cb)
})

test('api: resolve', () => {
  createMockService([{
    id: 'test',
    apply: api => {
      expect(api.resolve('foo.js')).toBe(path.resolve('/', 'foo.js'))
    }
  }])
})

test('api: hasPlugin', () => {
  createMockService([
    {
      id: 'vue-cli-plugin-foo',
      apply: api => {
        expect(api.hasPlugin('bar')).toBe(true)
        expect(api.hasPlugin('@vue/cli-plugin-bar')).toBe(true)
      }
    },
    {
      id: '@vue/cli-plugin-bar',
      apply: api => {
        expect(api.hasPlugin('foo')).toBe(true)
        expect(api.hasPlugin('vue-cli-plugin-foo')).toBe(true)
      }
    }
  ])
})
