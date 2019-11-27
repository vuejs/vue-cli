const { logs } = require('@vue/cli-shared-utils')
const Service = require('../lib/Service')

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
  // 0 - <style lang="module"> in Vue files
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
    expect(findOptions(config, lang, 'postcss').plugins).toEqual([require('autoprefixer')])
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
    expect(findOptions(config, lang, 'postcss').plugins).toEqual([require('autoprefixer')])
    expect(findOptions(config, lang, 'css')).toEqual({
      sourceMap: false,
      importLoaders: 2
    })
  })
})

test('override postcss config', () => {
  const config = genConfig({ postcss: {}})
  LANGS.forEach(lang => {
    const loader = lang === 'css' ? [] : LOADERS[lang]
    expect(findLoaders(config, lang)).toEqual(['vue-style', 'css', 'postcss'].concat(loader))
    expect(findOptions(config, lang, 'postcss').plugins).toBeFalsy()
    // assert css-loader options
    expect(findOptions(config, lang, 'css')).toEqual({
      sourceMap: false,
      importLoaders: 2
    })
  })
})

test('CSS Modules rules', () => {
  const config = genConfig({
    vue: {
      css: {
        requireModuleExtension: false
      }
    }
  })
  LANGS.forEach(lang => {
    const expected = {
      importLoaders: 2, // with postcss-loader
      sourceMap: false,
      modules: {
        localIdentName: `[name]_[local]_[hash:base64:5]`
      }
    }
    // vue-modules rules
    expect(findOptions(config, lang, 'css', 0)).toEqual(expected)
    // normal-modules rules
    expect(findOptions(config, lang, 'css', 2)).toEqual(expected)
    // normal rules
    expect(findOptions(config, lang, 'css', 3)).toEqual(expected)
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

  expect(() => {
    genConfig(userOptions)
  }).toThrow('`css.requireModuleExtension` is required when custom css modules options provided')

  userOptions.vue.css.requireModuleExtension = true
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
    expect(findOptions(config, lang, 'css', 0)).toEqual(expected)
    // normal-modules rules
    expect(findOptions(config, lang, 'css', 2)).toEqual(expected)
    // normal rules
    expect(findOptions(config, lang, 'css', 3)).not.toEqual(expected)
  })
})

test('deprecate `css.modules` option', () => {
  const config = genConfig({
    vue: {
      css: {
        modules: true,
        loaderOptions: {
          css: {
            modules: {
              localIdentName: '[folder]-[name]-[local][emoji]'
            }
          }
        }
      }
    }
  })
  expect(logs.warn.some(([msg]) => msg.match('please use "css.requireModuleExtension" instead'))).toBe(true)

  LANGS.forEach(lang => {
    const expected = {
      importLoaders: 2, // with postcss-loader
      sourceMap: false,
      modules: {
        localIdentName: `[folder]-[name]-[local][emoji]`
      }
    }
    // vue-modules rules
    expect(findOptions(config, lang, 'css', 0)).toEqual(expected)
    // normal-modules rules
    expect(findOptions(config, lang, 'css', 2)).toEqual(expected)
    // normal rules
    expect(findOptions(config, lang, 'css', 3)).toEqual(expected)
  })
})

test('favor `css.requireModuleExtension` over `css.modules`', () => {
  const config = genConfig({
    vue: {
      css: {
        requireModuleExtension: false,
        modules: false,

        loaderOptions: {
          css: {
            modules: {
              localIdentName: '[folder]-[name]-[local][emoji]'
            }
          }
        }
      }
    }
  })

  expect(logs.warn.some(([msg]) => msg.match('"css.modules" will be ignored in favor of "css.requireModuleExtension"'))).toBe(true)

  LANGS.forEach(lang => {
    const expected = {
      importLoaders: 2, // with postcss-loader
      sourceMap: false,
      modules: {
        localIdentName: `[folder]-[name]-[local][emoji]`
      }
    }
    // vue-modules rules
    expect(findOptions(config, lang, 'css', 0)).toEqual(expected)
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
    expect(findOptions(config, lang, 'postcss').plugins).toBeTruthy()
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
    expect(findOptions(config2, lang, 'postcss').plugins).toBeTruthy()
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

test('should use dart sass implementation whenever possible', () => {
  const config = genConfig()
  expect(findOptions(config, 'scss', 'sass')).toMatchObject({ implementation: require('sass') })
  expect(findOptions(config, 'sass', 'sass')).toMatchObject({ implementation: require('sass') })
})

