const path = require('path')
const notifier = require('node-notifier')

const builtinIcons = {
  'done': path.resolve(__dirname, '../../assets/done.png'),
  'error': path.resolve(__dirname, '../../assets/error.png')
}

exports.notify = ({ title, message, icon }) => {
  notifier.notify({
    title,
    message,
    icon: builtinIcons[icon] || icon
  })
}
