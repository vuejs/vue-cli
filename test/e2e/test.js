const { expect } = require('chai')
const fs = require('fs')
const path = require('path')
const rm = require('rimraf').sync
const exists = require('fs').existsSync
const crypto = require('crypto')
const render = require('consolidate').handlebars.render
const inquirer = require('inquirer')
const async = require('async')
const extend = Object.assign || require('util')._extend
const generate = require('../../lib/generate')
const metadata = require('../../lib/options')

const MOCK_META_JSON_PATH = './test/e2e/mock-meta-json'
const MOCK_TEMPLATE_REPO_PATH = './test/e2e/mock-template-repo'
const MOCK_TEMPLATE_BUILD_PATH = path.resolve('./test/e2e/mock-template-build')
const MOCK_METADATA_REPO_JS_PATH = './test/e2e/mock-metadata-repo-js'
const MOCK_SKIP_GLOB = './test/e2e/mock-skip-glob'

function monkeyPatchInquirer (answers) {
  // monkey patch inquirer
  inquirer.prompt = (questions, cb) => {
    const key = questions[0].name
    const _answers = {}
    const validate = questions[0].validate
    const valid = validate(answers[key])
    if (valid !== true) {
      throw new Error(valid)
    }
    _answers[key] = answers[key]
    cb(_answers)
  }
}

describe('vue-cli', () => {
  const answers = {
    name: 'vue-cli-test',
    author: 'John Doe <john@doe.com>',
    description: 'vue-cli e2e test',
    preprocessor: {
      less: true,
      sass: true
    },
    pick: 'no',
    noEscape: true
  }

  it('read metadata from json', () => {
    const meta = metadata('test-pkg', MOCK_TEMPLATE_REPO_PATH)
    expect(meta).to.be.an('object')
    expect(meta.prompts).to.have.property('description')
  })

  it('read metadata from js', () => {
    const meta = metadata('test-pkg', MOCK_METADATA_REPO_JS_PATH)
    expect(meta).to.be.an('object')
    expect(meta.prompts).to.have.property('description')
  })

  it('helpers', done => {
    monkeyPatchInquirer(answers)
    generate('test', MOCK_METADATA_REPO_JS_PATH, MOCK_TEMPLATE_BUILD_PATH, err => {
      if (err) done(err)
      const contents = fs.readFileSync(`${MOCK_TEMPLATE_BUILD_PATH}/readme.md`, 'utf-8')
      expect(contents).to.equal(answers.name.toUpperCase())
      done()
    })
  })

  it('adds additional data to meta data', () => {
    const data = generate('test', MOCK_META_JSON_PATH, MOCK_TEMPLATE_BUILD_PATH)
    expect(data.destDirName).to.equal('test')
    expect(data.inPlace).to.equal(false)
  })

  it('sets `inPlace` to true when generating in same directory', () => {
    const currentDir = process.cwd()
    process.chdir(MOCK_TEMPLATE_BUILD_PATH)
    const data = generate('test', MOCK_META_JSON_PATH, MOCK_TEMPLATE_BUILD_PATH)
    expect(data.destDirName).to.equal('test')
    expect(data.inPlace).to.equal(true)
    process.chdir(currentDir)
  })

  it('template generation', done => {
    monkeyPatchInquirer(answers)
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
    monkeyPatchInquirer(answers)
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

  it('avoid rendering files that match skipInterpolation option', done => {
    monkeyPatchInquirer(answers)
    const binFilePath = `${MOCK_TEMPLATE_REPO_PATH}/template/bin.file`
    const wstream = fs.createWriteStream(binFilePath)
    wstream.write(crypto.randomBytes(100))
    wstream.end()

    generate('test', MOCK_TEMPLATE_REPO_PATH, MOCK_TEMPLATE_BUILD_PATH, err => {
      if (err) done(err)

      const originalVueFileOne = fs.readFileSync(`${MOCK_TEMPLATE_REPO_PATH}/template/src/skip-one.vue`, 'utf8')
      const originalVueFileTwo = fs.readFileSync(`${MOCK_TEMPLATE_REPO_PATH}/template/src/skip-two.vue`, 'utf8')
      const generatedVueFileOne = fs.readFileSync(`${MOCK_TEMPLATE_BUILD_PATH}/src/skip-one.vue`, 'utf8')
      const generatedVueFileTwo = fs.readFileSync(`${MOCK_TEMPLATE_BUILD_PATH}/src/skip-two.vue`, 'utf8')

      expect(originalVueFileOne).to.equal(generatedVueFileOne)
      expect(originalVueFileTwo).to.equal(generatedVueFileTwo)
      expect(exists(binFilePath)).to.equal(true)
      expect(exists(`${MOCK_TEMPLATE_BUILD_PATH}/bin.file`)).to.equal(true)
      rm(binFilePath)

      done()
    })
  })

  it('support multiple globs in skipInterpolation', done => {
    monkeyPatchInquirer(answers)
    const binFilePath = `${MOCK_SKIP_GLOB}/template/bin.file`
    const wstream = fs.createWriteStream(binFilePath)
    wstream.write(crypto.randomBytes(100))
    wstream.end()

    generate('test', MOCK_SKIP_GLOB, MOCK_TEMPLATE_BUILD_PATH, err => {
      if (err) done(err)

      const originalVueFileOne = fs.readFileSync(`${MOCK_SKIP_GLOB}/template/src/no.vue`, 'utf8')
      const originalVueFileTwo = fs.readFileSync(`${MOCK_SKIP_GLOB}/template/src/no.js`, 'utf8')
      const generatedVueFileOne = fs.readFileSync(`${MOCK_TEMPLATE_BUILD_PATH}/src/no.vue`, 'utf8')
      const generatedVueFileTwo = fs.readFileSync(`${MOCK_TEMPLATE_BUILD_PATH}/src/no.js`, 'utf8')

      expect(originalVueFileOne).to.equal(generatedVueFileOne)
      expect(originalVueFileTwo).to.equal(generatedVueFileTwo)
      expect(exists(binFilePath)).to.equal(true)
      expect(exists(`${MOCK_TEMPLATE_BUILD_PATH}/bin.file`)).to.equal(true)
      rm(binFilePath)

      done()
    })
  })

  it('validate input value', done => {
    // deep copy
    var invalidName = extend({}, answers, { name: 'INVALID-NAME' })
    monkeyPatchInquirer(invalidName)
    generate('INVALID-NAME', MOCK_TEMPLATE_REPO_PATH, MOCK_TEMPLATE_BUILD_PATH, err => {
      expect(err).to.be.an('error')
      done()
    })
  })

  it('custom validate', done => {
    var invalidName = extend({}, answers, { name: 'custom' })
    monkeyPatchInquirer(invalidName)
    generate('test', MOCK_METADATA_REPO_JS_PATH, MOCK_TEMPLATE_BUILD_PATH, err => {
      expect(err).to.be.an('error')
      done()
    })
  })
})
