exports.config = (api, preset, rootOptions = {}) => {
  const config = {
    root: true,
    env: { node: true },
    extends: ['plugin:vue/essential'],
    parserOptions: {
      ecmaVersion: 2020
    },
    rules: {
      'no-console': makeJSOnlyValue(`process.env.NODE_ENV === 'production' ? 'warn' : 'off'`),
      'no-debugger': makeJSOnlyValue(`process.env.NODE_ENV === 'production' ? 'warn' : 'off'`)
    }
  }

  if (api.hasPlugin('babel') && !api.hasPlugin('typescript')) {
    config.parserOptions = {
      parser: 'babel-eslint'
    }
  }

  if (preset === 'airbnb') {
    config.extends.push('@vue/airbnb')
  } else if (preset === 'standard') {
    config.extends.push('@vue/standard')
  } else if (preset === 'prettier') {
    config.extends.push(...['eslint:recommended', '@vue/prettier'])
  } else {
    // default
    config.extends.push('eslint:recommended')
  }

  if (api.hasPlugin('typescript')) {
    // typically, typescript ruleset should be appended to the end of the `extends` array
    // but that is not the case for prettier, as there are conflicting rules
    if (preset === 'prettier') {
      config.extends.pop()
      config.extends.push(...['@vue/typescript/recommended', '@vue/prettier', '@vue/prettier/@typescript-eslint'])
    } else {
      config.extends.push('@vue/typescript/recommended')
    }
  }

  if (rootOptions.vueVersion === '3') {
    const updateConfig = cfg =>
      cfg.replace(
        /plugin:vue\/(essential|recommended|strongly-recommended)/gi,
        'plugin:vue/vue3-$1'
      )
    config.extends = config.extends.map(updateConfig)
  }

  return config
}

// __expression is a special flag that allows us to customize stringification
// output when extracting configs into standalone files
function makeJSOnlyValue (str) {
  const fn = () => {}
  fn.__expression = str
  return fn
}

const baseExtensions = ['.js', '.jsx', '.vue']
exports.extensions = api => api.hasPlugin('typescript')
  ? baseExtensions.concat('.ts', '.tsx')
  : baseExtensions
