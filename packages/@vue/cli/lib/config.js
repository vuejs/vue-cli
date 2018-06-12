const fs = require('fs')
const homedir = require('os').homedir()
const opn = require('opn')
const { error } = require('@vue/cli-shared-utils')

async function config (options) {
  const path = homedir + '/' + '.vuerc'
  await fs.readFile(path, 'utf-8', (err, data) => {
    if (err) error(err)
    console.log(data, '\n', path)
  })

  const config = JSON.parse(fs.readFileSync(path, 'utf-8'))

  if (options.get) {
    console.log(config[options.get])
  }

  if (options.delete) {
    delete config[options.delete]
    await fs.writeFile(path, JSON.stringify(config, null, 4), 'utf-8', (err) => {
      if (err) error(err)
      console.log(`You have removed the preset: ${options.delete}`)
    })
  }

  if (options.edit) {
    opn(path, { app: process.env.EDITOR })
    process.exit()
  }
}

module.exports = (...args) => {
  return config(...args).catch(err => {
    error(err)
  })
}
