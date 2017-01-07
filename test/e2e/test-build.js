const path = require('path')
const { expect } = require('chai')
const execa = require('execa')
const fs = require('fs')
const rm = require('rimraf').sync

describe('command:build', () => {
  const cli = path.join(__dirname, '../../bin/vue-build')
  let originalCwd = process.cwd()

  before(() => {
    process.chdir(path.join(__dirname, 'mock-vue-app'))
  })

  after(() => {
    process.chdir(originalCwd)
  })

  afterEach(() => {
    rm('.vue')
  })

  it('production mode', done => {
    execa(cli, ['--prod'])
      .then(res => {
        const files = fs.readdirSync('dist')
        expect(files.length).to.equal(3)
        expect(res.code).to.equal(0)
        done()
      })
      .catch(done)
  })

  it('hot reloading', done => {
    // TODO
    done()
  })
})
