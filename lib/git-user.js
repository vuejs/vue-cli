var exec = require('child_process').execSync

module.exports = function () {
  var name, email
  try {
    var name = exec('git config --get user.name')
    var email = exec('git config --get user.email')
  } catch (e) {}
  name = name && name.toString().trim()
  email = email && (' <' + email.toString().trim() + '>')
  return (name || '') + (email || '')
}
