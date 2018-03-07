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

function generateFolder (file, context) {
  return {
    name: path.basename(file),
    path: file,
    favorite: context.db.get('foldersFavorite').find({ id: file }).size().value()
  }
}

function getCurrent (args, context) {
  const base = cwd.get()
  return generateFolder(base, context)
}

function open (file, context) {
  cwd.set(file, context)
  return generateFolder(file, context)
}

function openParent (file, context) {
  const newFile = path.dirname(file)
  cwd.set(newFile, context)
  return generateFolder(newFile, context)
}

function isPackage (file, context) {
  return fs.existsSync(path.join(file, 'package.json'))
}

function readPackage (file, context) {
  return fs.readFileSync(path.join(file, 'package.json'), { encoding: 'utf8' })
}

function isVueProject (file, context) {
  if (!isPackage(file)) return false

  const contents = readPackage(file)
  return contents.includes('@vue/cli-service')
}

function listFavorite (context) {
  return context.db.get('foldersFavorite').value().map(
    file => generateFolder(file.id, context)
  )
}

function setFavorite ({ file, favorite }, context) {
  const collection = context.db.get('foldersFavorite')
  if (favorite) {
    collection.push({ id: file }).write()
  } else {
    collection.remove({ id: file }).write()
  }
  return generateFolder(file, context)
}

module.exports = {
  getCurrent,
  list,
  open,
  openParent,
  isPackage,
  readPackage,
  isVueProject,
  listFavorite,
  setFavorite
}
