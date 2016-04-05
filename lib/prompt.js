var inquirer = require('inquirer')

var promptInquirerTypeMapping = {
  string: 'input',
  boolean: 'confirm'
}

/**
 * Prompt plugin.
 *
 * @param {Object} metalsmithMetadata
 * @param {String} key
 * @param {Object} prompt
 * @param {Function} cb
 */

function promptWithInquirer (metalsmithMetadata, key, prompt, cb) {
  inquirer.prompt([{
    type: promptInquirerTypeMapping[prompt.type] || prompt.type,
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

module.exports = promptWithInquirer
