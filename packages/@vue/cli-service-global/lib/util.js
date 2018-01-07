const fs = require('fs')
const path = require('path')

exports.toPlugin = id => ({ id, apply: require(id) })

exports.findExisting = (context, files) => {
  for (const file of files) {
    if (fs.existsSync(path.join(context, file))) {
      return file
    }
  }
}
