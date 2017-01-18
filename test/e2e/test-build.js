const path = require('path')
const { expect } = require('chai')
const execa = require('execa')
const fs = require('fs')
const rm = require('rimraf').sync

describe('command:build', () => {
  const cli = path.join(__dirname, '../../bin/vue-build')
  let originalCwd = process.cwd()

  function setup () {
    process.chdir(path.join(__dirname, 'mock-vue-app'))
  }

  function teardown (done) {
    rm('dist')
    process.chdir(originalCwd)
    done()
  }

  describe('build an app', () => {
    let result
    let files
    before(done => {
      setup()
      execa(cli, ['index.js', '--prod'])
        .then(res => {
          result = res
          files = fs.readdirSync('dist')
          done()
        })
        .catch(done)
    })
    after(teardown)

    it('build with expected files', done => {
      expect(files.length).to.equal(5)
      expect(result.code).to.equal(0)
      done()
    })

    it('build with default autoprefixer', done => {
      const cssFile = files.filter(file => file.endsWith('.css'))[0]
      expect(typeof cssFile).to.equal('string')
      const cssContent = fs.readFileSync(path.join('dist', cssFile), 'utf8')
      expect(cssContent).to.contain('-ms-flexbox')
      done()
    })
  })

  describe('build with local config', () => {
    let result
    let files
    before(done => {
      setup()
      execa(cli, ['App.vue', '--prod', '--config', 'config.js', '--lib'])
        .then(res => {
          result = res
          files = fs.readdirSync('dist')
          done()
        })
        .catch(done)
    })
    after(teardown)

    it('build with custom autoprefixer options', done => {
      const cssFile = files.filter(file => file.endsWith('.css'))[0]
      expect(typeof cssFile).to.equal('string')
      const cssContent = fs.readFileSync(path.join('dist', cssFile), 'utf8')
      expect(cssContent).to.not.contain('-ms-flexbox')
      expect(result.code).to.equal(0)
      done()
    })

    it('export in umd format', done => {
      const m = require(path.join(process.cwd(), 'dist/App.js'))
      expect(typeof m.render).to.equal('function')
      done()
    })
  })
})
