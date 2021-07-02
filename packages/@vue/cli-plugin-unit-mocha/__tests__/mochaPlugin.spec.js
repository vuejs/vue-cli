jest.setTimeout(3000000)

const createOutside = require('@vue/cli-test-utils/createUpgradableProject')

test('should work', async () => {
  const project = await createOutside('unit-mocha', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-mocha': {}
    }
  })
  await project.run(`vue-cli-service test:unit`)
})

test('should work with dart-sass on *nix system', async () => {
  const project = await createOutside('unit-mocha-dart-sass', {
    cssPreprocessor: 'dart-sass',
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-mocha': {}
    }
  })

  const file = await project.read('src/components/HelloWorld.vue')
  project.write('src/components/HelloWorld.vue', file.replace(`<style scoped lang="scss">`, `<style scoped lang="scss">\n@use 'bug';`))
  project.write('src/assets/bug.scss', '')
  project.write('vue.config.js', `
const path = require('path')

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        sassOptions: {
          includePaths: [path.resolve('src', 'assets')]
        }
      }
    }
  }
}
  `)

  await project.run(`vue-cli-service test:unit`)
})
