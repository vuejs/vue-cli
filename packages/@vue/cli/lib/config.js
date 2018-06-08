const fs = require('fs')
const homedir = require('os').homedir()
const { error } = require('@vue/cli-shared-utils')

async function config (options) {
  const path = homedir + '/' + '.vuerc'
  await fs.readFile(path, 'utf-8', (err, data) => {
    if (err) error(err)
    console.log(data, '\n', path)
  })
}

module.exports = (...args) => {
  return config(...args).catch(err => {
    error(err)
  })
}
