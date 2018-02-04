module.exports = function formatStats (stats, dir, api) {
  const fs = require('fs')
  const zlib = require('zlib')
  const chalk = require('chalk')
  const ui = require('cliui')({ width: 60 })

  const json = stats.toJson({
    hash: false,
    modules: false,
    chunks: false
  })

  let assets = json.assets
    ? json.assets
    : json.children.reduce((acc, child) => acc.concat(child.assets), [])

  const seenNames = new Map()
  const isJS = val => /\.js$/.test(val)
  const isCSS = val => /\.css$/.test(val)
  const isMinJS = val => /\.min\.js$/.test(val)
  assets = assets
    .filter(a => {
      if (seenNames.has(a.name)) {
        return false
      }
      seenNames.set(a.name, true)
      return isJS(a.name) || isCSS(a.name)
    })
    .sort((a, b) => {
      if (isJS(a.name) && isCSS(b.name)) return -1
      if (isCSS(a.name) && isJS(b.name)) return 1
      if (isMinJS(a.name) && !isMinJS(b.name)) return -1
      if (!isMinJS(a.name) && isMinJS(b.name)) return 1
      return b.size - a.size
    })

  function formatSize (size) {
    return (size / 1024).toFixed(2) + ' kb'
  }

  function getGzippedSize (asset) {
    const filepath = api.resolve(`dist/${asset.name}`)
    const buffer = fs.readFileSync(filepath)
    return formatSize(zlib.gzipSync(buffer).length)
  }

  function makeRow (a, b, c) {
    return `  ${a}\t    ${b}\t ${c}`
  }

  ui.div(
    makeRow(
      chalk.cyan.bold(`File`),
      chalk.cyan.bold(`Size`),
      chalk.cyan.bold(`Gzipped`)
    ) + `\n\n` +
    assets.map(a => makeRow(
      /js$/.test(a.name)
        ? chalk.green(`${dir}/${a.name}`)
        : chalk.blue(`${dir}/${a.name}`),
      formatSize(a.size),
      getGzippedSize(a)
    )).join(`\n`)
  )

  return `${ui.toString()}\n\n  ${chalk.gray(`Images and other types of assets omitted.`)}\n`
}
