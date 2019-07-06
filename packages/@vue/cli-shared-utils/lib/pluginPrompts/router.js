const chalk = require('chalk')

exports.historyMode = {
  name: 'historyMode',
  type: 'confirm',
  message: `Use history mode for router? ${chalk.yellow(`(Requires proper server setup for index fallback in production)`)}`,
  description: `By using the HTML5 History API, the URLs don't need the '#' character anymore.`,
  link: 'https://router.vuejs.org/guide/essentials/history-mode.html'
}
