const path = require('path')

module.exports = {
  isLocalPath: templatePath => /^[./]|(^[a-zA-Z]:)/.test(templatePath),

  getTemplatePath: templatePath =>
    path.isAbsolute(templatePath)
      ? templatePath
      : path.normalize(path.join(process.cwd(), templatePath))
}
