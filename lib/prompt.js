var inquirer = require('inquirer')

// Support types from prompt-for which was used before
var promptMapping = {
  string: 'input',
  boolean: 'confirm'
}

/**
 * Inquirer prompt wrapper.
 *
 * @param {Object} metalsmithMetadata
 * @param {String} key
 * @param {Object} prompt
 * @param {Function} cb
 */

function prompt (metalsmithMetadata, key, prompt, cb) {
  inquirer.prompt([{
    type: promptMapping[prompt.type] || prompt.type,
    name: key,
    message: prompt.label || key,
    default: prompt.default,
    choices: prompt.choices || []
  }], function (answers) {
    if (Array.isArray(answers[key])) {
      metalsmithMetadata[key] = {}
      answers[key].forEach(function (multiChoiceAnswer) {
        metalsmithMetadata[key][multiChoiceAnswer] = true
      })
    } else {
      metalsmithMetadata[key] = answers[key]
    }

    cb()
  })
}

module.exports = prompt
