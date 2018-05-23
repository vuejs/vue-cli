const path = require('path')
const fs = require('fs-extra')
const LRU = require('lru-cache')

const pkgCache = new LRU({
  max: 500,
  maxAge: 1000 * 5
})

const cwd = require('./cwd')

async function list (base, context) {
  const files = await fs.readdir(base, 'utf8')
  return files.map(
    file => ({
      path: path.join(base, file),
      name: file
    })
  ).filter(
    file => fs.statSync(file.path).isDirectory()
  )
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

function readPackage (file, context, force = false) {
  if (!force) {
    const cachedValue = pkgCache.get(file)
    if (cachedValue) {
      return cachedValue
    }
  }
  const pkg = fs.readJsonSync(path.join(file, 'package.json'))
  pkgCache.set(file, pkg)
  return pkg
}

function writePackage ({ file, data }, context) {
  fs.outputJsonSync(path.join(file, 'package.json'), data, {
    spaces: 2
  })
  return true
}

function isVueProject (file, context) {
  if (!isPackage(file)) return false

  const pkg = readPackage(file, context)
  return Object.keys(pkg.devDependencies || {}).includes('@vue/cli-service')
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

async function deleteFolder (file) {
  await fs.remove(file)
}

module.exports = {
  getCurrent,
  list,
  open,
  openParent,
  isPackage,
  readPackage,
  writePackage,
  isVueProject,
  listFavorite,
  setFavorite,
  delete: deleteFolder
}
