const path = require('path')
const notifier = require('node-notifier')

const builtinIcons = {
  done: path.resolve(__dirname, '../../src/assets/done.png'),
  error: path.resolve(__dirname, '../../src/assets/error.png')
}

let notifCallback = null
exports.setNotificationCallback = cb => {
  notifCallback = cb
    ? (_err, action) => (action === 'activate') && cb()
    : null
}

// https://github.com/mikaelbr/node-notifier/issues/154
// Specify appID to prevent SnoreToast shortcut installation.
// SnoreToast actually uses it as the string in the notification's
// title bar (different from title heading inside notification).
// This only has an effect in Windows.
const snoreToastOptions = notifier.Notification === notifier.WindowsToaster && { appID: 'Vue UI' }

exports.notify = ({ title, message, icon }) => {
  notifier.notify({
    ...snoreToastOptions,
    title,
    message,
    icon: builtinIcons[icon] || icon
  }, notifCallback)
}
