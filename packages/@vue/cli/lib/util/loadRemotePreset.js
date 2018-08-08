const fs = require('fs-extra')
const loadPresetFromDir = require('./loadPresetFromDir')

module.exports = async function fetchRemotePreset (name, clone) {
  const os = require('os')
  const path = require('path')
  const download = require('download-git-repo')
  const tmpdir = path.join(os.tmpdir(), 'vue-cli')

  // clone will fail if tmpdir already exists
  // https://github.com/flipxfx/download-git-repo/issues/41
  if (clone) {
    await fs.remove(tmpdir)
  }

  await new Promise((resolve, reject) => {
    download(name, tmpdir, { clone }, err => {
      if (err) return reject(err)
      resolve()
    })
  })

  return await loadPresetFromDir(tmpdir)
}
