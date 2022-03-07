module.exports = api => {
  const isTypeScript = api.hasPlugin('typescript')
  api.render(isTypeScript ? './template-ts' : './template-js', {
    hasTS: isTypeScript
  })

  api.extendPackage({
    devDependencies: {
      '@playwright/test': require('../package.json').devDependencies['@playwright/test']
    }
  })
}
