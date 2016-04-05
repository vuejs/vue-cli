const { expect } = require('chai')
const fs = require('fs')
const path = require('path')
const rm = require('rimraf').sync
var exists = require('fs').existsSync
const crypto = require('crypto')
const render = require('consolidate').handlebars.render

const MOCK_TEMPLATE_REPO_PATH = './test/e2e/mock-template-repo'
const MOCK_TEMPLATE_BUILD_PATH = path.resolve('./test/e2e/mock-template-build')

describe('vue-cli', () => {
  const options = require('../../lib/options')('test')
  const answers = {
    name: 'vue-cli-test',
    author: 'ziga',
    description: 'vue-cli e2e test',
    preprocessor: {
      less: true,
      sass: true
    }
  }

  const promptFn = (metalsmithMetadata, key, prompt, cb) => {
    metalsmithMetadata[key] = answers[key]
    cb()
  }
  const ask = require('../../lib/ask')(options, promptFn)
  const generate = require('../../lib/generate')(ask)

  it('template generation', done => {
    generate(MOCK_TEMPLATE_REPO_PATH, MOCK_TEMPLATE_BUILD_PATH, err => {
      if (err) done()

      const handlebarsPackageJsonFile = fs.readFileSync(`${MOCK_TEMPLATE_REPO_PATH}/template/package.json`, 'utf8')
      const generatedPackageJsonFile = fs.readFileSync(`${MOCK_TEMPLATE_BUILD_PATH}/package.json`, 'utf8')

      render(handlebarsPackageJsonFile, answers, (err, res) => {
        if (err) return done(err)

        // compare if vue-cli generate returns same as passing options directly to handlebars
        expect(res).to.equal(generatedPackageJsonFile)
        done()
      })
    })
  })

  it('avoid rendering files that do not have mustaches', done => {
    const binFilePath = `${MOCK_TEMPLATE_REPO_PATH}/template/bin.file`
    const wstream = fs.createWriteStream(binFilePath)
    wstream.write(crypto.randomBytes(100))
    wstream.end()

    generate(MOCK_TEMPLATE_REPO_PATH, MOCK_TEMPLATE_BUILD_PATH, err => {
      if (err) done()

      const handlebarsPackageJsonFile = fs.readFileSync(`${MOCK_TEMPLATE_REPO_PATH}/template/package.json`, 'utf8')
      const generatedPackageJsonFile = fs.readFileSync(`${MOCK_TEMPLATE_BUILD_PATH}/package.json`, 'utf8')

      render(handlebarsPackageJsonFile, answers, (err, res) => {
        if (err) return done(err)

        expect(res).to.equal(generatedPackageJsonFile)
        expect(exists(binFilePath)).to.equal(true)
        expect(exists(`${MOCK_TEMPLATE_BUILD_PATH}/bin.file`)).to.equal(true)
        rm(binFilePath)

        done()
      })
    })
  })
})
