var chalk = require('chalk')

module.exports = {
  deprecation: function (template, name) {
    var initCommand = 'vue init ' + template.replace('-2.0', '') + ' ' + name

    console.log(chalk.red('  This template is deprecated.'))
    console.log()
    console.log(chalk.yellow('  Please use this command instead: ') + chalk.green(initCommand))
    console.log()
  },
  vue2Version: function (template, name) {
    var vue1InitCommand = 'vue init ' + template + '#1.0' + ' ' + name

    console.log(chalk.red('  This will install Vue 2.x version of template.'))
    console.log()
    console.log(chalk.yellow('  For Vue 1.x use: ') + chalk.green(vue1InitCommand))
    console.log()
  }
}
