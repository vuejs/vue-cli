const DEPS_MAP = {
  base: {
    eslint: '^7.20.0',
    'eslint-plugin-vue': '^8.0.1'
  },
  airbnb: {
    '@vue/eslint-config-airbnb': '^5.3.0',
    'eslint-plugin-import': '^2.20.2'
  },
  prettier: {
    'eslint-config-prettier': '^8.3.0',
    'eslint-plugin-prettier': '^4.0.0',
    prettier: '^2.4.1'
  },
  standard: {
    '@vue/eslint-config-standard': '^6.1.0',
    'eslint-plugin-import': '^2.20.2',
    'eslint-plugin-node': '^11.1.0',
    'eslint-plugin-promise': '^5.1.0'
  },
  typescript: {
    '@vue/eslint-config-typescript': '^9.0.0',
    '@typescript-eslint/eslint-plugin': '^5.2.0',
    '@typescript-eslint/parser': '^5.2.0'
  }
}

exports.DEPS_MAP = DEPS_MAP

exports.getDeps = function (api, preset, rootOptions = {}) {
  const deps = Object.assign({}, DEPS_MAP.base, DEPS_MAP[preset])

  if (api.hasPlugin('typescript')) {
    Object.assign(deps, DEPS_MAP.typescript)
  }

  if (api.hasPlugin('babel') && !api.hasPlugin('typescript')) {
    Object.assign(deps, {
      '@babel/eslint-parser': '^7.12.16',
      '@babel/core': '^7.12.16'
    })
  }

  return deps
}
