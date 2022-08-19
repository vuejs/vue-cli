jest.mock('fs')
jest.mock('vue-cli-plugin-foo', () => () => {}, { virtual: true })

const fs = require('fs')
const path = require('path')
const { semver } = require('@vue/cli-shared-utils')
const Service = require('../lib/Service')

const mockPkg = json => {
  fs.writeFileSync('/package.json', JSON.stringify(json, null, 2))
}

const createMockService = async (plugins = [], init = true, mode) => {
  const service = new Service('/', {
    plugins,
    useBuiltIn: false
  })
  if (init) {
    await service.init(mode)
  }
  return service
}

beforeEach(() => {
  mockPkg({})
  delete process.env.NODE_ENV
  delete process.env.BABEL_ENV
  delete process.env.FOO
  delete process.env.BAR
  delete process.env.BAZ
})

afterEach(() => {
  if (fs.existsSync('/vue.config.js')) {
    fs.unlinkSync('/vue.config.js')
  }
})

test('env loading', async () => {
  process.env.FOO = 0
  fs.writeFileSync('/.env.local', `FOO=1\nBAR=2`)
  fs.writeFileSync('/.env', `BAR=3\nBAZ=4`)
  await createMockService()

  expect(process.env.FOO).toBe('0')
  expect(process.env.BAR).toBe('2')
  expect(process.env.BAZ).toBe('4')

  fs.unlinkSync('/.env.local')
  fs.unlinkSync('/.env')
})

test('env loading for custom mode', async () => {
  process.env.VUE_CLI_TEST_TESTING_ENV = true
  fs.writeFileSync('/.env', 'FOO=1')
  fs.writeFileSync('/.env.staging', 'FOO=2\nNODE_ENV=production')
  await createMockService([], true, 'staging')

  expect(process.env.FOO).toBe('2')
  expect(process.env.NODE_ENV).toBe('production')

  process.env.VUE_CLI_TEST_TESTING_ENV = false
  fs.unlinkSync('/.env')
  fs.unlinkSync('/.env.staging')
})

test('loading plugins from package.json', () => {
  mockPkg({
    devDependencies: {
      bar: '^1.0.0',
      '@vue/cli-plugin-babel': '^5.0.0',
      'vue-cli-plugin-foo': '^1.0.0'
    }
  })
  const service = new Service('/') // this one needs to read from package.json
  expect(service.plugins.some(({ id }) => id === '@vue/cli-plugin-babel')).toBe(true)
  expect(service.plugins.some(({ id }) => id === 'vue-cli-plugin-foo')).toBe(true)
  expect(service.plugins.some(({ id }) => id === 'bar')).toBe(false)
})

test('load project options from package.json', async () => {
  mockPkg({
    vue: {
      lintOnSave: 'default'
    }
  })
  const service = await createMockService()
  expect(service.projectOptions.lintOnSave).toBe('default')
})

test('handle option publicPath and outputDir correctly', async () => {
  mockPkg({
    vue: {
      publicPath: 'https://foo.com/bar',
      outputDir: '/public/'
    }
  })
  const service = await createMockService()
  expect(service.projectOptions.publicPath).toBe('https://foo.com/bar/')
  expect(service.projectOptions.outputDir).toBe('/public')
})

test('normalize publicPath when relative', async () => {
  mockPkg({
    vue: {
      publicPath: './foo/bar'
    }
  })
  const service = await createMockService()
  expect(service.projectOptions.publicPath).toBe('foo/bar/')
})

test('allow custom protocol in publicPath', async () => {
  mockPkg({
    vue: {
      publicPath: 'customprotocol://foo/bar'
    }
  })
  const service = await createMockService()
  expect(service.projectOptions.publicPath).toBe('customprotocol://foo/bar/')
})

test('keep publicPath when empty', async () => {
  mockPkg({
    vue: {
      publicPath: ''
    }
  })
  const service = await createMockService()
  expect(service.projectOptions.publicPath).toBe('')
})

test('load project options from vue.config.js', async () => {
  fs.writeFileSync(path.resolve('/', 'vue.config.js'), '') // only to ensure fs.existsSync returns true
  jest.mock(path.resolve('/', 'vue.config.js'), () => ({ lintOnSave: false }), { virtual: true })
  mockPkg({
    vue: {
      lintOnSave: 'default'
    }
  })
  const service = await createMockService()
  // vue.config.js has higher priority
  expect(service.projectOptions.lintOnSave).toBe(false)
})

test('load project options from vue.config.js as a function', async () => {
  fs.writeFileSync(path.resolve('/', 'vue.config.js'), '')
  jest.mock(path.resolve('/', 'vue.config.js'), () => function () { return { lintOnSave: false } }, { virtual: true })
  mockPkg({
    vue: {
      lintOnSave: 'default'
    }
  })
  const service = await createMockService()
  // vue.config.js has higher priority
  expect(service.projectOptions.lintOnSave).toBe(false)
})

test('api: assertVersion', async () => {
  const plugin = {
    id: 'test-assertVersion',
    apply: api => {
      const majorVersionNumber = semver.major(api.version)
      expect(() => api.assertVersion(majorVersionNumber)).not.toThrow()
      expect(() => api.assertVersion(`^${majorVersionNumber}.0.0-0`)).not.toThrow()
      // expect(() => api.assertVersion('>= 4')).not.toThrow()

      expect(() => api.assertVersion(4.1)).toThrow('Expected string or integer value')
      expect(() => api.assertVersion('^100')).toThrow('Require @vue/cli-service "^100"')
    }
  }
  await createMockService([plugin], true /* init */)
})

test('api: registerCommand', async () => {
  let args
  const service = await createMockService([{
    id: 'test',
    apply: api => {
      api.registerCommand('foo', _args => {
        args = _args
      })
    }
  }])

  await service.run('foo', { n: 1 })
  expect(args).toEqual({ _: [], n: 1 })
})

test('api: --skip-plugins', async () => {
  let untouched = true
  const service = await createMockService([{
    id: 'test-command',
    apply: api => {
      api.registerCommand('foo', _args => {

      })
    }
  },
  {
    id: 'vue-cli-plugin-test-plugin',
    apply: api => {
      untouched = false
    }
  }], false)

  await service.run('foo', { 'skip-plugins': 'test-plugin' })
  expect(untouched).toEqual(true)
})

describe('internal: gather pluginsToSkip and cleanup args', () => {
  let resultingArgs, resultingRawArgv

  const testCommand = {
    id: 'test-command',
    apply: api => {
      api.registerCommand('foo', (_args, _rawArgv) => {
        resultingArgs = _args
        resultingRawArgv = _rawArgv
      })
    }
  }
  const plugin1 = {
    id: 'vue-cli-plugin-test-plugin1',
    apply: api => {
    }
  }

  test('Single --skip-plugins', async () => {
    const service = await createMockService([
      testCommand,
      plugin1
    ], false)
    const args = { 'skip-plugins': 'test-plugin1' }
    const rawArgv = ['foo', '--skip-plugins', 'test-plugin1']
    await service.run('foo', args, rawArgv)
    expect(resultingArgs).toEqual({ '_': [] })
    expect(resultingRawArgv).toEqual([])
    expect(...service.pluginsToSkip).toEqual('vue-cli-plugin-test-plugin1')
  })

  resultingArgs = resultingRawArgv = undefined
  test('Multiple --skip-plugins', async () => {
    const service = await createMockService([
      testCommand,
      plugin1,
      {
        id: 'vue-cli-plugin-test-plugin2',
        apply: api => {
        }
      },
      {
        id: 'vue-cli-plugin-test-plugin3',
        apply: api => {
        }
      }
    ], false)
    const args = { 'skip-plugins': ['test-plugin1,test-plugin2', 'test-plugin3'] }
    const rawArgv = ['foo', '--skip-plugins', 'test-plugin1,test-plugin2', '--skip-plugins', 'test-plugin3']
    await service.run('foo', args, rawArgv)
    expect(resultingArgs).toEqual({ '_': [] })
    expect(resultingRawArgv).toEqual([])
    expect([...service.pluginsToSkip].sort()).toEqual(['vue-cli-plugin-test-plugin1', 'vue-cli-plugin-test-plugin2', 'vue-cli-plugin-test-plugin3'])
  })
})

test('api: defaultModes', async () => {
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

  await (await createMockService([plugin1], false /* init */)).run('foo')

  delete process.env.NODE_ENV
  delete process.env.BABEL_ENV

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

  await (await createMockService([plugin2], false /* init */)).run('test')
})

test('api: chainWebpack', async () => {
  const service = await createMockService([{
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

test('api: configureWebpack', async () => {
  const service = await createMockService([{
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

test('api: configureWebpack returning object', async () => {
  const service = await createMockService([{
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

test('api: configureWebpack preserve ruleNames', async () => {
  const service = await createMockService([
    {
      id: 'babel',
      apply: require('@vue/cli-plugin-babel')
    },
    {
      id: 'test',
      apply: api => {
        api.configureWebpack({
          module: {
            rules: []
          }
        })
      }
    }
  ])

  const config = service.resolveWebpackConfig()
  expect(config.module.rules[0].__ruleNames).toEqual(['js'])
})

test('internal: should correctly set VUE_CLI_ENTRY_FILES', async () => {
  delete process.env.VUE_CLI_ENTRY_FILES

  const service = await createMockService([{
    id: 'test',
    apply: api => {
      api.configureWebpack(config => {
        config.entry = {
          page1: './src/page1.js',
          page2: './src/page2.js'
        }
      })
    }
  }])

  service.resolveWebpackConfig()
  expect(process.env.VUE_CLI_ENTRY_FILES).toEqual(
    JSON.stringify([
      path.resolve('/', './src/page1.js'),
      path.resolve('/', './src/page2.js')
    ])
  )
})

test('api: configureDevServer', async () => {
  const cb = () => {}
  const service = await createMockService([{
    id: 'test',
    apply: api => {
      api.configureDevServer(cb)
    }
  }])
  expect(service.devServerConfigFns).toContain(cb)
})

test('api: resolve', async () => {
  await createMockService([{
    id: 'test',
    apply: api => {
      expect(api.resolve('foo.js')).toBe(path.resolve('/', 'foo.js'))
    }
  }])
})

test('api: hasPlugin', async () => {
  await createMockService([
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

test('order: service plugins order', async () => {
  const applyCallOrder = []
  function apply (id, order) {
    order = order || {}
    const fn = jest.fn(() => { applyCallOrder.push(id) })
    fn.after = order.after
    return fn
  }
  const service = new Service('/', {
    plugins: [
      {
        id: 'vue-cli-plugin-foo',
        apply: apply('vue-cli-plugin-foo')
      },
      {
        id: 'vue-cli-plugin-bar',
        apply: apply('vue-cli-plugin-bar', { after: 'vue-cli-plugin-baz' })
      },
      {
        id: 'vue-cli-plugin-baz',
        apply: apply('vue-cli-plugin-baz')
      }
    ]
  })
  expect(service.plugins.map(p => p.id)).toEqual([
    'built-in:commands/serve',
    'built-in:commands/build',
    'built-in:commands/inspect',
    'built-in:commands/help',
    'built-in:config/base',
    'built-in:config/assets',
    'built-in:config/css',
    'built-in:config/prod',
    'built-in:config/app',
    'vue-cli-plugin-foo',
    'vue-cli-plugin-baz',
    'vue-cli-plugin-bar'
  ])

  await service.init()
  expect(applyCallOrder).toEqual([
    'vue-cli-plugin-foo',
    'vue-cli-plugin-baz',
    'vue-cli-plugin-bar'
  ])
})
