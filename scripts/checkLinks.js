const path = require('path')
const fs = require('fs')
const request = require('request-promise-native')

const root = path.resolve(__dirname, '../packages/@vue')
const promises = []

async function checkLink (file, link, n) {
  try {
    const result = await request({
      method: 'HEAD',
      uri: link,
      resolveWithFullResponse: true
    })
    if (result.statusCode !== 200) {
      throw new Error('error')
    } else {
      // console.log('[OK]', link, result.statusCode)
    }
  } catch (e) {
    console.warn('[!!]', link, `${file}:${parseInt(n) + 1}`)
    throw e
  }
}

function checkLinks (file) {
  const contents = fs.readFileSync(file, { encoding: 'utf8' })
  const lines = contents.split('\n')
  for (const n in lines) {
    const line = lines[n]
    const matched = line.match(/link:\s+'(.+?)'/)
    if (matched) {
      const link = matched[1]
      promises.push(checkLink(file, link, n))
    }
  }
}

function checkFiles (folder, recursive = false) {
  const files = fs.readdirSync(folder)
  for (const file of files) {
    const fullPath = path.join(folder, file)
    if (file === 'ui.js') {
      checkLinks(fullPath)
    } else if (fs.statSync(fullPath).isDirectory()) {
      if (file === 'ui') {
        checkLinks(path.join(fullPath, 'index.js'))
      } else if (recursive) {
        checkFiles(fullPath)
      }
    }
  }
}

checkFiles(root, true)
Promise.all(promises).catch(() => {
  process.exit(1)
})
