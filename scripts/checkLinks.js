require('events').defaultMaxListeners = 0
const path = require('path')
const fs = require('fs')
const request = require('request-promise-native')

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
      console.log('[OK]', link, result.statusCode)
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

function checkFiles (folder, all = false, recursive = false) {
  const files = fs.readdirSync(folder)
  for (const file of files) {
    const fullPath = path.join(folder, file)
    if (file === 'ui.js' || file === 'prompts.js') {
      checkLinks(fullPath)
    } else if (fs.statSync(fullPath).isDirectory()) {
      checkFiles(fullPath, file === 'ui' || file === 'prompts')
    } else if (all) {
      checkLinks(fullPath)
    }
  }
}

checkFiles(path.resolve(__dirname, '../packages/@vue'), false, true)
checkFiles(path.resolve(__dirname, '../packages/@vue/cli/lib/promptModules'), true, true)
Promise.all(promises).catch(() => {
  process.exit(1)
})
