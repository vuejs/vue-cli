const fs = require('fs-extra')
const loadPresetFromDir = require('./loadPresetFromDir')

module.exports = async function loadRemotePreset (repository, clone) {
  const os = require('os')
  const path = require('path')
  const download = require('download-git-repo')

  const presetName = repository
    .replace(/((?:.git)?#.*)/, '')
    .split('/')
    .slice(-1)[0]
    // for direct urls, it's hard to get the correct project name,
    // but we need to at least make sure no special characters remaining
    .replace(/[:#]/g, '')

  const tmpdir = path.join(os.tmpdir(), 'vue-cli-presets', presetName)

  // clone will fail if tmpdir already exists
  // https://github.com/flipxfx/download-git-repo/issues/41
  if (clone) {
    await fs.remove(tmpdir)
  }

  await new Promise((resolve, reject) => {
    download(repository, tmpdir, { clone }, err => {
      if (err) return reject(err)
      resolve()
    })
  })

  return await loadPresetFromDir(tmpdir)
}
