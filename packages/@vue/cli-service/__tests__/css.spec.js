const { logs } = require('@vue/cli-shared-utils')
const Service = require('../lib/Service')
const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')

beforeEach(() => {
  logs.warn = []
})

const LANGS = ['css', 'sass', 'scss', 'less', 'styl', 'stylus']
const extractLoaderPath = require('mini-css-extract-plugin').loader

const LOADERS = {
  css: 'css',
  sass: 'sass',
  scss: 'sass',
  less: 'less',
  styl: 'stylus',
  stylus: 'stylus'
}

const genConfig = (pkg = {}, env) => {
  const prevEnv = process.env.NODE_ENV
  if (env) process.env.NODE_ENV = env
  const service = new Service('/', { pkg })
  service.init()
  const config = service.resolveWebpackConfig()
  process.env.NODE_ENV = prevEnv
  return config
}

const findRule = (config, lang, index = 3) => {
  const baseRule = config.module.rules.find(rule => {
    return rule.test.test(`.${lang}`)
  })
  // all CSS rules have 4 oneOf rules:
  // 0 - <style module> in Vue files
  // 1 - <style> in Vue files
  // 2 - *.modules.css imports from JS
  // 3 - *.css imports from JS
  return baseRule.oneOf[index]
}

const findLoaders = (config, lang, index) => {
  const rule = findRule(config, lang, index)
  if (!rule) {
    throw new Error(`rule not found for ${lang}`)
  }
  return rule.use.map(({ loader }) => {
    const match = loader.match(/([^\\/]+)-loader/)
    return match ? match[1] : loader
  })
}

const findOptions = (config, lang, _loader, index) => {
  const rule = findRule(config, lang, index)
  const use = rule.use.find(({ loader }) => loader.includes(`${_loader}-loader`))
  return use.options || {}
}

test('default loaders', () => {
  const config = genConfig()

  LANGS.forEach(lang => {
    const loader = lang === 'css' ? [] : LOADERS[lang]
    expect(findLoaders(config, lang)).toEqual(['vue-style', 'css', 'postcss'].concat(loader))
    expect(findOptions(config, lang, 'postcss').postcssOptions.plugins).toEqual([require('autoprefixer')])
    // assert css-loader options
    expect(findOptions(config, lang, 'css')).toEqual({
      sourceMap: false,
      importLoaders: 2
    })
  })
  // sass indented syntax
  expect(findOptions(config, 'sass', 'sass')).toMatchObject({
    sassOptions: {
      indentedSyntax: true
    },
    sourceMap: false
  })
})

test('production defaults', () => {
  const config = genConfig({}, 'production')
  LANGS.forEach(lang => {
    const loader = lang === 'css' ? [] : LOADERS[lang]
    expect(findLoaders(config, lang)).toEqual([extractLoaderPath, 'css', 'postcss'].concat(loader))
    expect(findOptions(config, lang, 'postcss').postcssOptions.plugins).toEqual([require('autoprefixer')])
    expect(findOptions(config, lang, 'css')).toEqual({
      sourceMap: false,
      importLoaders: 2
    })
  })
})

test('override postcss config', () => {
  const config = genConfig({ postcss: {} })
  LANGS.forEach(lang => {
    const loader = lang === 'css' ? [] : LOADERS[lang]
    expect(findLoaders(config, lang)).toEqual(['vue-style', 'css', 'postcss'].concat(loader))
    expect(findOptions(config, lang, 'postcss').postcssOptions).toBeFalsy()
    // assert css-loader options
    expect(findOptions(config, lang, 'css')).toEqual({
      sourceMap: false,
      importLoaders: 2
    })
  })
})

test('Customized CSS Modules rules', () => {
  const userOptions = {
    vue: {
      css: {
        loaderOptions: {
          css: {
            modules: {
              localIdentName: '[folder]-[name]-[local][emoji]'
            }
          }
        }
      }
    }
  }

  const config = genConfig(userOptions)

  LANGS.forEach(lang => {
    const expected = {
      importLoaders: 2, // with postcss-loader
      sourceMap: false,
      modules: {
        localIdentName: `[folder]-[name]-[local][emoji]`
      }
    }
    // vue-modules rules
    expect(findOptions(config, lang, 'css', 0)).toMatchObject(expected)
    expect(findOptions(config, lang, 'css', 0).modules.auto.toString()).toEqual('() => true')
    // normal-modules rules
    expect(findOptions(config, lang, 'css', 2)).toEqual(expected)
    // normal rules
    expect(findOptions(config, lang, 'css', 3)).toEqual(expected)
  })
})

test('css.extract', () => {
  const config = genConfig({
    vue: {
      css: {
        extract: false
      }
    }
  }, 'production')
  LANGS.forEach(lang => {
    const loader = lang === 'css' ? [] : LOADERS[lang]
    // when extract is false in production,
    // an additional instance of postcss-loader is injected for inline minification.
    expect(findLoaders(config, lang)).toEqual(['vue-style', 'css', 'postcss', 'postcss'].concat(loader))
    expect(findOptions(config, lang, 'css').importLoaders).toBe(3)
    expect(findOptions(config, lang, 'postcss').postcssOptions.plugins).toBeTruthy()
  })

  const config2 = genConfig({
    postcss: {},
    vue: {
      css: {
        extract: false
      }
    }
  }, 'production')
  LANGS.forEach(lang => {
    const loader = lang === 'css' ? [] : LOADERS[lang]
    // if postcss config is present, two postcss-loaders will be used because it
    // does not support mixing config files with loader options.
    expect(findLoaders(config2, lang)).toEqual(['vue-style', 'css', 'postcss', 'postcss'].concat(loader))
    expect(findOptions(config2, lang, 'css').importLoaders).toBe(3)
    // minification loader should be injected before the user-facing postcss-loader
    expect(findOptions(config2, lang, 'postcss').postcssOptions.plugins).toBeTruthy()
  })
})

test('css.sourceMap', () => {
  const config = genConfig({
    postcss: {},
    vue: {
      css: {
        sourceMap: true
      }
    }
  })
  LANGS.forEach(lang => {
    expect(findOptions(config, lang, 'css').sourceMap).toBe(true)
    expect(findOptions(config, lang, 'postcss').sourceMap).toBe(true)
    expect(findOptions(config, lang, LOADERS[lang]).sourceMap).toBe(true)
  })
})

test('css-loader options', () => {
  const localIdentName = '[name]__[local]--[hash:base64:5]'
  const config = genConfig({
    vue: {
      css: {
        loaderOptions: {
          css: {
            localIdentName,
            camelCase: 'only'
          }
        }
      }
    }
  })
  LANGS.forEach(lang => {
    const vueOptions = findOptions(config, lang, 'css', 0)
    expect(vueOptions.localIdentName).toBe(localIdentName)
    expect(vueOptions.camelCase).toBe('only')

    const extOptions = findOptions(config, lang, 'css', 2)
    expect(extOptions.localIdentName).toBe(localIdentName)
    expect(extOptions.camelCase).toBe('only')
  })
})

test('css.loaderOptions', () => {
  const prependData = '$env: production;'
  const config = genConfig({
    vue: {
      css: {
        loaderOptions: {
          sass: {
            prependData,
            sassOptions: {
              includePaths: ['./src/styles']
            }
          }
        }
      }
    }
  })

  expect(findOptions(config, 'scss', 'sass')).toMatchObject({
    prependData,
    sourceMap: false,
    sassOptions: {
      includePaths: ['./src/styles']
    }
  })
  expect(findOptions(config, 'scss', 'sass').sassOptions).not.toHaveProperty('indentedSyntax')
  expect(findOptions(config, 'sass', 'sass')).toMatchObject({
    prependData,
    sassOptions: {
      indentedSyntax: true,
      includePaths: ['./src/styles']
    },
    sourceMap: false
  })
})

test('scss loaderOptions', () => {
  const sassData = '$env: production'
  const scssData = '$env: production;'

  const config = genConfig({
    vue: {
      css: {
        loaderOptions: {
          sass: {
            prependData: sassData
          },
          scss: {
            prependData: scssData,
            webpackImporter: false
          }
        }
      }
    }
  })

  expect(findOptions(config, 'scss', 'sass')).toMatchObject({
    prependData: scssData,
    sourceMap: false
  })
  expect(findOptions(config, 'sass', 'sass')).toMatchObject({
    prependData: sassData,
    sassOptions: {
      indentedSyntax: true
    },
    sourceMap: false
  })

  // should not merge scss options into default sass config
  expect(findOptions(config, 'sass', 'sass')).not.toHaveProperty('webpackImporter')
})

test('Auto recognition of CSS Modules by file names', async () => {
  const project = await create('css-modules-auto', defaultPreset)
  await project.write('vue.config.js', 'module.exports = { filenameHashing: false }\n')

  await project.write('src/App.vue', `<template>
  <div id="app" :class="$style.red">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import style1 from './style.module.css'
import style2 from './style.css'

console.log(style1, style2)

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style module>
.red {
  color: red;
}
</style>
`)
  await project.write('src/style.module.css', `.green { color: green; }\n`)
  await project.write('src/style.css', `.yellow { color: yellow; }\n`)

  const { stdout } = await project.run('vue-cli-service build')

  expect(stdout).toMatch('Build complete.')

  const appCss = await project.read('dist/css/app.css')

  // <style module> successfully transformed
  expect(appCss).not.toMatch('.red')
  expect(appCss).toMatch('color: red')

  // style.module.css successfully transformed
  expect(appCss).not.toMatch('.green')
  expect(appCss).toMatch('color: green')

  // class names in style.css should not be transformed
  expect(appCss).toMatch('.yellow')
  expect(appCss).toMatch('color: yellow')

  const appJs = await project.read('dist/js/app.js')

  // should contain the class name map in js
  expect(appJs).toMatch(/\{"red":/)
  expect(appJs).toMatch(/\{"green":/)
  expect(appJs).not.toMatch(/\{"yellow":/)
}, 300000)

test('CSS Moduels Options', async () => {
  const project = await create('css-modules-options', defaultPreset)

  await project.write('src/App.vue', `<template>
  <div id="app" :class="$style.red">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import style1 from './style.module.css'
import style2 from './style.css'

console.log(style1, style2)

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style module>
.red {
  color: red;
}
</style>
`)
  await project.write('src/style.module.css', `.green { color: green; }\n`)
  await project.write('src/style.css', `.yellow { color: yellow; }\n`)

  // disable CSS Modules
  await project.write(
    'vue.config.js',
    `module.exports = {
      filenameHashing: false,
      css: {
        loaderOptions: {
          css: {
            modules: false
          }
        }
      }
    }`
  )
  let { stdout } = await project.run('vue-cli-service build')
  expect(stdout).toMatch('Build complete.')
  let appCss = await project.read('dist/css/app.css')

  // <style module> works anyway
  expect(appCss).not.toMatch('.red')
  expect(appCss).toMatch('color: red')
  // style.module.css should not be transformed
  expect(appCss).toMatch('.green')
  expect(appCss).toMatch('color: green')
  // class names in style.css should not be transformed
  expect(appCss).toMatch('.yellow')
  expect(appCss).toMatch('color: yellow')

  let appJs = await project.read('dist/js/app.js')

  // should not contain class name map
  expect(appJs).toMatch(/\{"red":/) // <style module> works anyway
  expect(appJs).not.toMatch(/\{"green":/)
  expect(appJs).not.toMatch(/\{"yellow":/)

  // enable CSS Modules for all files
  await project.write(
    'vue.config.js',
    `module.exports = {
      filenameHashing: false,
      css: {
        loaderOptions: {
          css: {
            modules: {
              auto: () => true
            }
          }
        }
      }
    }`
  )

  stdout = (await project.run('vue-cli-service build')).stdout
  expect(stdout).toMatch('Build complete.')
  appCss = await project.read('dist/css/app.css')

  // <style module> works anyway
  expect(appCss).not.toMatch('.red')
  expect(appCss).toMatch('color: red')
  // style.module.css should be transformed
  expect(appCss).not.toMatch('.green')
  expect(appCss).toMatch('color: green')
  // class names in style.css should be transformed
  expect(appCss).not.toMatch('.yellow')
  expect(appCss).toMatch('color: yellow')

  appJs = await project.read('dist/js/app.js')
  // should contain class name map
  expect(appJs).toMatch(/\{"red":/)
  expect(appJs).toMatch(/\{"green":/)
  expect(appJs).toMatch(/\{"yellow":/)
}, 300000)
