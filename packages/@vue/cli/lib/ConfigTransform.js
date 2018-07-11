const transforms = require('./util/configTransforms')

class ConfigTransform {
  constructor (options) {
    this.fileDescriptor = options.file
  }

  transform (value, checkExisting, files, context) {
    let file
    if (checkExisting) {
      file = this.findFile(files)
    }
    if (!file) {
      file = this.getDefaultFile()
    }
    const { type, filename } = file

    const transform = transforms[type]

    let source
    let existing
    if (checkExisting) {
      source = files[filename]
      if (source) {
        existing = transform.read({
          source,
          filename,
          context
        })
      }
    }

    const content = transform.write({
      source,
      filename,
      context,
      value,
      existing
    })

    return {
      filename,
      content
    }
  }

  findFile (files) {
    for (const type of Object.keys(this.fileDescriptor)) {
      const descriptors = this.fileDescriptor[type]
      for (const filename of descriptors) {
        if (files[filename]) {
          return { type, filename }
        }
      }
    }
  }

  getDefaultFile () {
    const [type] = Object.keys(this.fileDescriptor)
    const [filename] = this.fileDescriptor[type]
    return { type, filename }
  }
}

module.exports = ConfigTransform
