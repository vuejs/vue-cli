import { expect } from 'chai'
const fs = require('fs')
const render = require('consolidate').handlebars.render

describe('vue-cli generate', () => {
  it('test template generation', done => {
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

    generate('./test/e2e/mock-template-repo', '../../mock-template-build', err => {
      if (err) done()

      const handlebarsPackageJsonFile = fs.readFileSync('./test/e2e/mock-template-repo/template/package.json', 'utf8')
      const generatedPackageJsonFile = fs.readFileSync('./test/e2e/mock-template-build/package.json', 'utf8')

      render(handlebarsPackageJsonFile, answers, (err, res) => {
        if (err) return done(err)

        // compare if vue-cli generate returns same as passing options directly to handlebars
        expect(res).to.equal(generatedPackageJsonFile)
        done()
      })
    })
  })
})
