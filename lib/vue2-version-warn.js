var chalk = require('chalk')

module.exports = function (template, name) {
  var vue1InitCommand = 'vue init ' + template + '#1.0' + ' ' + name

  console.log(chalk.red('  This will install Vue 2.x version of template.'))
  console.log()
  console.log(chalk.yellow('  For Vue 1.x use: ') + chalk.green(vue1InitCommand))
  console.log()
}
