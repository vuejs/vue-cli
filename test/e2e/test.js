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
const { isLocalPath, getTemplatePath } = require('../../lib/local-path')

const MOCK_META_JSON_PATH = path.resolve('./test/e2e/mock-meta-json')
const MOCK_METALSMITH_CUSTOM_PATH = path.resolve('./test/e2e/mock-metalsmith-custom')
const MOCK_METALSMITH_CUSTOM_BEFORE_AFTER_PATH = path.resolve('./test/e2e/mock-metalsmith-custom-before-after')
const MOCK_TEMPLATE_REPO_PATH = path.resolve('./test/e2e/mock-template-repo')
const MOCK_TEMPLATE_BUILD_PATH = path.resolve('./test/e2e/mock-template-build')
const MOCK_METADATA_REPO_JS_PATH = path.resolve('./test/e2e/mock-metadata-repo-js')
const MOCK_SKIP_GLOB = path.resolve('./test/e2e/mock-skip-glob')
const MOCK_ERROR = path.resolve('./test/e2e/mock-error')

function monkeyPatchInquirer (answers) {
  // monkey patch inquirer
  inquirer.prompt = questions => {
    const key = questions[0].name
    const _answers = {}
    const validate = questions[0].validate
    const valid = validate(answers[key])
    if (valid !== true) {
      return Promise.reject(new Error(valid))
    }
    _answers[key] = answers[key]
    return Promise.resolve(_answers)
  }
}

describe('vue-cli', () => {
  const escapedAnswers = {
    name: 'vue-cli-test',
    author: 'John "The Tester" Doe <john@doe.com>',
    description: 'vue-cli e2e test',
    preprocessor: {
      less: true,
      sass: true
    },
    pick: 'no',
    noEscape: true

  }

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

  it('adds additional data to meta data', done => {
    const data = generate('test', MOCK_META_JSON_PATH, MOCK_TEMPLATE_BUILD_PATH, done)
    expect(data.destDirName).to.equal('test')
    expect(data.inPlace).to.equal(false)
  })

  it('sets `inPlace` to true when generating in same directory', done => {
    const currentDir = process.cwd()
    process.chdir(MOCK_TEMPLATE_BUILD_PATH)
    const data = generate('test', MOCK_META_JSON_PATH, MOCK_TEMPLATE_BUILD_PATH, done)
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

  it('supports custom metalsmith plugins', done => {
    generate('test', MOCK_METALSMITH_CUSTOM_PATH, MOCK_TEMPLATE_BUILD_PATH, err => {
      if (err) done(err)

      expect(exists(`${MOCK_TEMPLATE_BUILD_PATH}/custom/readme.md`)).to.equal(true)

      async.eachSeries([
        'readme.md'
      ], function (file, next) {
        const template = fs.readFileSync(`${MOCK_METALSMITH_CUSTOM_PATH}/template/${file}`, 'utf8')
        const generated = fs.readFileSync(`${MOCK_TEMPLATE_BUILD_PATH}/custom/${file}`, 'utf8')
        render(template, { custom: 'Custom' }, (err, res) => {
          if (err) return next(err)
          expect(res).to.equal(generated)
          next()
        })
      }, done)
    })
  })

  it('supports custom metalsmith plugins with after/before object keys', done => {
    generate('test', MOCK_METALSMITH_CUSTOM_BEFORE_AFTER_PATH, MOCK_TEMPLATE_BUILD_PATH, err => {
      if (err) done(err)

      expect(exists(`${MOCK_TEMPLATE_BUILD_PATH}/custom-before-after/readme.md`)).to.equal(true)

      async.eachSeries([
        'readme.md'
      ], function (file, next) {
        const template = fs.readFileSync(`${MOCK_METALSMITH_CUSTOM_BEFORE_AFTER_PATH}/template/${file}`, 'utf8')
        const generated = fs.readFileSync(`${MOCK_TEMPLATE_BUILD_PATH}/custom-before-after/${file}`, 'utf8')
        render(template, { before: 'Before', after: 'After' }, (err, res) => {
          if (err) return next(err)
          expect(res).to.equal(generated)
          next()
        })
      }, done)
    })
  })

  it('generate a vaild package.json with escaped author', done => {
    monkeyPatchInquirer(escapedAnswers)
    generate('test', MOCK_TEMPLATE_REPO_PATH, MOCK_TEMPLATE_BUILD_PATH, err => {
      if (err) done(err)

      const pkg = fs.readFileSync(`${MOCK_TEMPLATE_BUILD_PATH}/package.json`, 'utf8')
      try {
        var validData = JSON.parse(pkg)
        expect(validData.author).to.equal(escapedAnswers.author)
        done()
      } catch (err) {
        done(err)
      }
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

  it('checks for local path', () => {
    expect(isLocalPath('../')).to.equal(true)
    expect(isLocalPath('../../')).to.equal(true)
    expect(isLocalPath('../template')).to.equal(true)
    expect(isLocalPath('../template/abc')).to.equal(true)
    expect(isLocalPath('./')).to.equal(true)
    expect(isLocalPath('.')).to.equal(true)
    expect(isLocalPath('c:/')).to.equal(true)
    expect(isLocalPath('D:/')).to.equal(true)

    expect(isLocalPath('webpack')).to.equal(false)
    expect(isLocalPath('username/rep')).to.equal(false)
    expect(isLocalPath('bitbucket:username/rep')).to.equal(false)
  })

  it('normalizes template path', () => {
    expect(getTemplatePath('/')).to.equal('/')
    expect(getTemplatePath('/absolute/path')).to.equal('/absolute/path')

    expect(getTemplatePath('..')).to.equal(path.join(__dirname, '/../../..'))
    expect(getTemplatePath('../template')).to.equal(path.join(__dirname, '/../../../template'))
  })

  it('points out the file in the error', done => {
    monkeyPatchInquirer(answers)
    generate('test', MOCK_ERROR, MOCK_TEMPLATE_BUILD_PATH, err => {
      expect(err.message).to.match(/^\[readme\.md\] Parse error/)
      done()
    })
  })
})
