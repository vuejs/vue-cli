jest.mock('fs')
jest.mock('mock-config')
jest.mock('vue-cli-plugin-foo')

const fs = require('fs')
const path = require('path')
const Service = require('../Service')

const mockPkg = json => {
  fs.writeFileSync('/package.json', JSON.stringify(json, null, 2))
}

beforeEach(() => {
  mockPkg({})
})

it('env loading', () => {
  fs.writeFileSync('/.env', `FOO=1\nBAR=2`)
  fs.writeFileSync('/.env.local', `FOO=3\nBAZ=4`)
  new Service([])
  expect(process.env.FOO).toBe('3')
  expect(process.env.BAR).toBe('2')
  expect(process.env.BAZ).toBe('4')
})

it('loading plugins from package.json', () => {
  mockPkg({
    devDependencies: {
      'bar': '^1.0.0',
      '@vue/cli-plugin-babel': '^0.1.0',
      'vue-cli-plugin-foo': '^1.0.0'
    }
  })
  const service = new Service()
  expect(service.plugins.some(({ id }) => id === '@vue/cli-plugin-babel')).toBe(true)
  expect(service.plugins.some(({ id }) => id === 'vue-cli-plugin-foo')).toBe(true)
  expect(service.plugins.some(({ id }) => id === 'bar')).toBe(false)
})

it('load project options from package.json', () => {
  mockPkg({
    vue: {
      lintOn: 'save'
    }
  })
  const service = new Service([])
  expect(service.projectOptions.lintOn).toBe('save')
})

it('load project options from vue.config.js', () => {
  process.env.VUE_CLI_SERVICE_CONFIG_PATH = 'mock-config'
  mockPkg({
    vue: {
      lintOn: 'save'
    }
  })
  const service = new Service([])
  expect(service.projectOptions.lintOn).toBe('commit')
  delete process.env.VUE_CLI_SERVICE_CONFIG_PATH
})

it('api: setMode', () => {
  fs.writeFileSync('/.env.foo', `FOO=5\nBAR=6`)
  fs.writeFileSync('/.env.foo.local', `FOO=7\nBAZ=8`)

  new Service([{
    id: 'test-setMode',
    apply: api => {
      api.setMode('foo')
    }
  }])
  expect(process.env.FOO).toBe('7')
  expect(process.env.BAR).toBe('6')
  expect(process.env.BAZ).toBe('8')
  expect(process.env.VUE_CLI_MODE).toBe('foo')
  // for NODE_ENV & BABEL_ENV
  // any mode that is not test or production defaults to development
  expect(process.env.NODE_ENV).toBe('development')
  expect(process.env.BABEL_ENV).toBe('development')

  new Service([{
    id: 'test-setMode',
    apply: api => {
      api.setMode('test')
    }
  }])
  expect(process.env.VUE_CLI_MODE).toBe('test')
  expect(process.env.NODE_ENV).toBe('test')
  expect(process.env.BABEL_ENV).toBe('test')
})

it('api: registerCommand', () => {
  let args
  const service = new Service([{
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

it('api: chainWebpack', () => {
  const service = new Service([{
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

it('api: configureWebpack', () => {
  const service = new Service([{
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

it('api: configureDevServer', () => {
  const cb = () => {}
  const service = new Service([{
    id: 'test',
    apply: api => {
      api.configureDevServer(cb)
    }
  }])
  expect(service.devServerConfigFns).toContain(cb)
})

it('api: resolve', () => {
  const context = process.env.VUE_CLI_CONTEXT
  new Service([{
    id: 'test',
    apply: api => {
      expect(api.resolve('foo.js')).toBe(path.resolve(context, 'foo.js'))
    }
  }])
})

it('api: hasPlugin', () => {
  new Service([
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
