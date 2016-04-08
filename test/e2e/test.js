const { expect } = require('chai')
const fs = require('fs')
const path = require('path')
const rm = require('rimraf').sync
const exists = require('fs').existsSync
const crypto = require('crypto')
const render = require('consolidate').handlebars.render
const inquirer = require('inquirer')
const async = require('async')
const generate = require('../../lib/generate')

const MOCK_TEMPLATE_REPO_PATH = './test/e2e/mock-template-repo'
const MOCK_TEMPLATE_BUILD_PATH = path.resolve('./test/e2e/mock-template-build')

describe('vue-cli', () => {
  const answers = {
    name: 'vue-cli-test',
    author: 'ziga',
    description: 'vue-cli e2e test',
    preprocessor: {
      less: true,
      sass: true
    },
    pick: 'no'
  }

  // monkey patch inquirer
  inquirer.prompt = (questions, cb) => {
    const key = questions[0].name
    const _answers = {}
    _answers[key] = answers[key]
    cb(_answers)
  }

  it('template generation', done => {
    generate('test', MOCK_TEMPLATE_REPO_PATH, MOCK_TEMPLATE_BUILD_PATH, err => {
      if (err) done(err)

      expect(exists(`${MOCK_TEMPLATE_BUILD_PATH}/src/yes.vue`)).to.equal(true)
      expect(exists(`${MOCK_TEMPLATE_BUILD_PATH}/src/no.js`)).to.equal(false)

      async.eachSeries([
        'package.json',
        'src/yes.vue'
      ], function (file, next) {
        const template = fs.readFileSync(`${MOCK_TEMPLATE_REPO_PATH}/template/${file}`, 'utf8')
        const generated = fs.readFileSync(`${MOCK_TEMPLATE_BUILD_PATH}/${file}`, 'utf8')

        render(template, answers, (err, res) => {
          if (err) return next(err)
          expect(res).to.equal(generated)
          next()
        })
      }, done)
    })
  })

  it('avoid rendering files that do not have mustaches', done => {
    const binFilePath = `${MOCK_TEMPLATE_REPO_PATH}/template/bin.file`
    const wstream = fs.createWriteStream(binFilePath)
    wstream.write(crypto.randomBytes(100))
    wstream.end()

    generate('test', MOCK_TEMPLATE_REPO_PATH, MOCK_TEMPLATE_BUILD_PATH, err => {
      if (err) done(err)

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
