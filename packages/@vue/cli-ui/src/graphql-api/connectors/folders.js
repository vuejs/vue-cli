const path = require('path')
const fs = require('fs')

const cwd = require('./cwd')

function list (base, context) {
  return new Promise((resolve, reject) => {
    fs.readdir(base, 'utf8', (err, files) => {
      if (err) {
        reject(err)
      } else {
        resolve(files.map(
          file => ({
            path: path.join(base, file),
            name: file
          })
        ).filter(
          file => fs.statSync(file.path).isDirectory()
        ))
      }
    })
  })
}

function generateFolder (file) {
  return {
    name: path.basename(file),
    path: file
  }
}

function getCurrent (args, context) {
  const base = cwd.get()
  return generateFolder(base)
}

function open (file, context) {
  cwd.set(file, context)
  return generateFolder(file)
}

function openParent (file, context) {
  const newFile = path.dirname(file)
  cwd.set(newFile, context)
  return generateFolder(newFile)
}

function isPackage (file, context) {
  return fs.existsSync(path.join(file, 'package.json'))
}

function isVueProject (file, context) {
  if (!isPackage(file)) return false

  const contents = fs.readFileSync(path.join(file, 'package.json'), { encoding: 'utf8' })
  return contents.includes('@vue/cli-service')
}

module.exports = {
  getCurrent,
  list,
  open,
  openParent,
  isPackage,
  isVueProject
}
