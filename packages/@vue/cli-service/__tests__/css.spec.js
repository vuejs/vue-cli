const Service = require('../lib/Service')

const LANGS = ['css', 'sass', 'scss', 'less', 'styl', 'stylus']

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
  const config = new Service('/', { pkg }).resolveWebpackConfig()
  process.env.NODE_ENV = prevEnv
  return config
}

const findRule = (config, lang) => config.module.rules.find(rule => {
  const test = rule.test.toString().replace(/\\/g, '')
  return test.indexOf(`${lang}$`) > -1
})

const findLoaders = (config, lang) => {
  const rule = findRule(config, lang)
  return rule.use.map(({ loader }) => loader.replace(/-loader$/, ''))
}

const findOptions = (config, lang, _loader) => {
  const rule = findRule(config, lang)
  const use = rule.use.find(({ loader }) => `${_loader}-loader` === loader)
  return use.options
}

const findUsesForVue = (config, lang) => {
  const vueOptions = findOptions(config, 'vue', 'vue')
  return vueOptions.loaders[lang]
}

const findLoadersForVue = (config, lang) => {
  return findUsesForVue(config, lang).map(({ loader }) => loader.replace(/-loader$/, ''))
}

const findOptionsForVue = (config, lang, _loader) => {
  const uses = findUsesForVue(config, lang)
  const use = uses.find(({ loader }) => `${_loader}-loader` === loader)
  return use.options
}

const expectedCssLoaderModulesOptions = {
  importLoaders: 1,
  localIdentName: `[name]_[local]__[hash:base64:5]`,
  minimize: false,
  sourceMap: false,
  modules: true
}

test('default loaders', () => {
  const config = genConfig()

  LANGS.forEach(lang => {
    const loader = lang === 'css' ? [] : LOADERS[lang]
    expect(findLoaders(config, lang)).toEqual(['vue-style', 'css', 'postcss'].concat(loader))
    // vue-loader loaders should not include postcss because it's built-in
    expect(findLoadersForVue(config, lang)).toEqual(['vue-style', 'css'].concat(loader))
    // assert css-loader options
    expect(findOptions(config, lang, 'css')).toEqual({
      minimize: false,
      sourceMap: false
    })
    // files ending in .module.lang
    expect(findOptions(config, `module.${lang}`, 'css')).toEqual(expectedCssLoaderModulesOptions)
  })

  // sass indented syntax
  expect(findOptions(config, 'sass', 'sass')).toEqual({ indentedSyntax: true, sourceMap: false })
  expect(findOptionsForVue(config, 'sass', 'sass')).toEqual({ indentedSyntax: true, sourceMap: false })
})

test('production defaults', () => {
  const config = genConfig({}, 'production')
  const extractLoaderPath = require.resolve('extract-text-webpack-plugin/dist/loader')
  LANGS.forEach(lang => {
    const loader = lang === 'css' ? [] : LOADERS[lang]
    expect(findLoaders(config, lang)).toEqual([extractLoaderPath, 'vue-style', 'css', 'postcss'].concat(loader))
    expect(findLoadersForVue(config, lang)).toEqual([extractLoaderPath, 'vue-style', 'css'].concat(loader))
    expect(findOptions(config, lang, 'css')).toEqual({
      minimize: true,
      sourceMap: false
    })
  })
})

test('css.modules', () => {
  const config = genConfig({
    vue: {
      css: {
        modules: true
      }
    }
  })
  LANGS.forEach(lang => {
    expect(findOptions(config, lang, 'css')).toEqual(expectedCssLoaderModulesOptions)
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
  const extractLoaderPath = require.resolve('extract-text-webpack-plugin/dist/loader')
  LANGS.forEach(lang => {
    expect(findLoaders(config, lang)).not.toContain(extractLoaderPath)
    expect(findLoadersForVue(config, lang)).not.toContain(extractLoaderPath)
  })
})

test('css.sourceMap', () => {
  const config = genConfig({
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
    expect(findOptionsForVue(config, lang, 'css').sourceMap).toBe(true)
    expect(findOptionsForVue(config, lang, LOADERS[lang]).sourceMap).toBe(true)
  })
})

test('css.loaderOptions', () => {
  const data = '$env: production;'
  const config = genConfig({
    vue: {
      css: {
        loaderOptions: {
          sass: {
            data
          }
        }
      }
    }
  })

  expect(findOptions(config, 'scss', 'sass')).toEqual({ data, sourceMap: false })
  expect(findOptionsForVue(config, 'scss', 'sass')).toEqual({ data, sourceMap: false })
  expect(findOptions(config, 'sass', 'sass')).toEqual({ data, indentedSyntax: true, sourceMap: false })
  expect(findOptionsForVue(config, 'sass', 'sass')).toEqual({ data, indentedSyntax: true, sourceMap: false })
})
