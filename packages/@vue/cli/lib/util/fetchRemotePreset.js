const fs = require('fs-extra')

module.exports = async function fetchRemotePreset (name, clone) {
  // github shorthand fastpath
  if (!clone && /^[\w_-]+\/[\w_-]+$/.test(name)) {
    const { request } = require('@vue/cli-shared-utils')
    return request.get(`https://raw.githubusercontent.com/${name}/master/preset.json`)
      .then(res => res.body)
  }

  // fallback to full download
  const os = require('os')
  const path = require('path')
  const download = require('download-git-repo')
  const tmpdir = path.join(os.tmpdir(), 'vue-cli')

  // clone will fail if tmpdir already exists
  // https://github.com/flipxfx/download-git-repo/issues/41
  if (clone) {
    await fs.remove(tmpdir)
  }

  return new Promise((resolve, reject) => {
    download(name, tmpdir, { clone }, err => {
      if (err) return reject(err)
      let preset
      try {
        preset = require(path.join(tmpdir, 'preset.json'))
      } catch (e) {
        return reject(e)
      }
      resolve(preset)
    })
  })
}
