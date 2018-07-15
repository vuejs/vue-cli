const path = require('path')
const fs = require('fs-extra')
const LRU = require('lru-cache')
const winattr = require('@akryum/winattr')

const hiddenPrefix = '.'
const isPlatformWindows = process.platform.indexOf('win') === 0

const pkgCache = new LRU({
  max: 500,
  maxAge: 1000 * 5
})

const cwd = require('./cwd')

function isDirectory (file) {
  file = file.replace(/\\/g, path.sep)
  try {
    return fs.statSync(file).isDirectory()
  } catch (e) {
    if (process.env.VUE_APP_CLI_UI_DEV) console.warn(e.message)
  }
  return false
}

async function list (base, context) {
  const files = await fs.readdir(base, 'utf8')
  return files.map(
    file => {
      const folderPath = path.join(base, file)
      return {
        path: folderPath,
        name: file,
        hidden: isHidden(folderPath)
      }
    }
  ).filter(
    file => isDirectory(file.path)
  )
}

function isHidden (file) {
  try {
    const prefixed = path.basename(file).charAt(0) === hiddenPrefix
    const result = {
      unix: prefixed,
      windows: false
    }

    if (isPlatformWindows) {
      const windowsFile = file.replace(/\\/g, '\\\\')
      result.windows = winattr.getSync(windowsFile).hidden
    }

    return (!isPlatformWindows && result.unix) || (isPlatformWindows && result.windows)
  } catch (e) {
    if (process.env.VUE_APP_CLI_UI_DEV) {
      console.log('file:', file)
      console.error(e)
    }
  }
}

function generateFolder (file, context) {
  return {
    name: path.basename(file),
    path: file
  }
}

function getCurrent (args, context) {
  const base = cwd.get()
  return generateFolder(base, context)
}

function open (file, context) {
  cwd.set(file, context)
  return generateFolder(cwd.get(), context)
}

function openParent (file, context) {
  const newFile = path.dirname(file)
  cwd.set(newFile, context)
  return generateFolder(cwd.get(), context)
}

function isPackage (file, context) {
  try {
    return fs.existsSync(path.join(file, 'package.json'))
  } catch (e) {
    console.warn(e.message)
  }
  return false
}

function readPackage (file, context, force = false) {
  if (!force) {
    const cachedValue = pkgCache.get(file)
    if (cachedValue) {
      return cachedValue
    }
  }
  const pkgFile = path.join(file, 'package.json')
  if (fs.existsSync(pkgFile)) {
    const pkg = fs.readJsonSync(pkgFile)
    pkgCache.set(file, pkg)
    return pkg
  }
}

function writePackage ({ file, data }, context) {
  fs.outputJsonSync(path.join(file, 'package.json'), data, {
    spaces: 2
  })
  invalidatePackage(file, context)
  return true
}

function invalidatePackage (file, context) {
  pkgCache.del(file)
  return true
}

function isVueProject (file, context) {
  if (!isPackage(file)) return false

  try {
    const pkg = readPackage(file, context)
    return Object.keys(pkg.devDependencies || {}).includes('@vue/cli-service')
  } catch (e) {
    if (process.env.VUE_APP_CLI_UI_DEV) {
      console.log(e)
    }
  }
  return false
}

function listFavorite (context) {
  return context.db.get('foldersFavorite').value().map(
    file => generateFolder(file.id, context)
  )
}

function isFavorite (file, context) {
  return !!context.db.get('foldersFavorite').find({ id: file }).size().value()
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

function createFolder (name, context) {
  const file = path.join(cwd.get(), name)
  fs.mkdirpSync(file)
  return generateFolder(file, context)
}

module.exports = {
  isDirectory,
  getCurrent,
  list,
  open,
  openParent,
  isPackage,
  readPackage,
  writePackage,
  invalidatePackage,
  isVueProject,
  isFavorite,
  listFavorite,
  setFavorite,
  delete: deleteFolder,
  create: createFolder
}
