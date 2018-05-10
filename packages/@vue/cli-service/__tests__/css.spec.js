const Service = require('../lib/Service')

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

const findRule = (config, lang, index = 1) => {
  const baseRule = config.module.rules.find(rule => {
    return rule.test.test(`.${lang}`)
  })
  // all CSS rules have oneOf with two child rules, one for <style lang="module">
  // and one for normal imports
  return baseRule.oneOf[index]
}

const findLoaders = (config, lang, index) => {
  const rule = findRule(config, lang, index)
  if (!rule) {
    throw new Error(`rule not found for ${lang}`)
  }
  return rule.use.map(({ loader }) => loader.replace(/-loader$/, ''))
}

const findOptions = (config, lang, _loader, index) => {
  const rule = findRule(config, lang, index)
  const use = rule.use.find(({ loader }) => loader.includes(`${_loader}-loader`))
  return use.options || {}
}

test('default loaders', () => {
  const config = genConfig({ postcss: {}})

  LANGS.forEach(lang => {
    const loader = lang === 'css' ? [] : LOADERS[lang]
    expect(findLoaders(config, lang)).toEqual(['vue-style', 'css', 'postcss'].concat(loader))
    // assert css-loader options
    expect(findOptions(config, lang, 'css')).toEqual({
      minimize: false,
      sourceMap: false,
      importLoaders: lang === 'css' ? 1 : 2
    })
  })
  // sass indented syntax
  expect(findOptions(config, 'sass', 'sass')).toEqual({ indentedSyntax: true, sourceMap: false })
})

test('production defaults', () => {
  const config = genConfig({ postcss: {}}, 'production')
  LANGS.forEach(lang => {
    const loader = lang === 'css' ? [] : LOADERS[lang]
    expect(findLoaders(config, lang)).toEqual([extractLoaderPath, 'css', 'postcss'].concat(loader))
    expect(findOptions(config, lang, 'css')).toEqual({
      minimize: true,
      sourceMap: false,
      importLoaders: lang === 'css' ? 1 : 2
    })
  })
})

test('CSS Modules rules', () => {
  const config = genConfig()
  LANGS.forEach(lang => {
    expect(findOptions(config, lang, 'css', 0)).toEqual({
      importLoaders: lang === 'css' ? 0 : 1, // no postcss-loader
      localIdentName: `[name]_[local]_[hash:base64:5]`,
      minimize: false,
      sourceMap: false,
      modules: true
    })
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
    expect(findLoaders(config, lang)).not.toContain(extractLoaderPath)
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

test('css.localIdentName', () => {
  const localIdentName = '[name]__[local]--[hash:base64:5]'
  const config = genConfig({
    vue: {
      css: {
        localIdentName: localIdentName
      }
    }
  })
  LANGS.forEach(lang => {
    expect(findOptions(config, lang, 'css', 0).localIdentName).toBe(localIdentName)
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
  expect(findOptions(config, 'sass', 'sass')).toEqual({ data, indentedSyntax: true, sourceMap: false })
})

test('skip postcss-loader if no postcss config found', () => {
  const config = genConfig()
  LANGS.forEach(lang => {
    const loader = lang === 'css' ? [] : LOADERS[lang]
    expect(findLoaders(config, lang)).toEqual(['vue-style', 'css'].concat(loader))
  })
})
