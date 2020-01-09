// Generate editorconfig templates from built-in eslint configs.

// Supported rules:
// indent_style
// indent_size
// end_of_line
// trim_trailing_whitespace
// insert_final_newline
// max_line_length

const fs = require('fs')
const path = require('path')
const CLIEngine = require('eslint').CLIEngine

// Convert eslint rules to editorconfig rules.
function convertRules (config) {
  const result = {}

  const eslintRules = new CLIEngine({
    useEslintrc: false,
    baseConfig: {
      extends: [require.resolve(`@vue/eslint-config-${config}`)]
    }
  }).getConfigForFile().rules

  const getRuleOptions = (ruleName, defaultOptions = []) => {
    const ruleConfig = eslintRules[ruleName]

    if (!ruleConfig || ruleConfig === 0 || ruleConfig === 'off') {
      return
    }

    if (Array.isArray(ruleConfig) && (ruleConfig[0] === 0 || ruleConfig[0] === 'off')) {
      return
    }

    if (Array.isArray(ruleConfig) && ruleConfig.length > 1) {
      return ruleConfig.slice(1)
    }

    return defaultOptions
  }

  // https://eslint.org/docs/rules/indent
  const indent = getRuleOptions('indent', [4])
  if (indent) {
    result.indent_style = indent[0] === 'tab' ? 'tab' : 'space'

    if (typeof indent[0] === 'number') {
      result.indent_size = indent[0]
    }
  }

  // https://eslint.org/docs/rules/linebreak-style
  const linebreakStyle = getRuleOptions('linebreak-style', ['unix'])
  if (linebreakStyle) {
    result.end_of_line = linebreakStyle[0] === 'unix' ? 'lf' : 'crlf'
  }

  // https://eslint.org/docs/rules/no-trailing-spaces
  const noTrailingSpaces = getRuleOptions('no-trailing-spaces', [{ skipBlankLines: false, ignoreComments: false }])
  if (noTrailingSpaces) {
    if (!noTrailingSpaces[0].skipBlankLines && !noTrailingSpaces[0].ignoreComments) {
      result.trim_trailing_whitespace = true
    }
  }

  // https://eslint.org/docs/rules/eol-last
  const eolLast = getRuleOptions('eol-last', ['always'])
  if (eolLast) {
    result.insert_final_newline = eolLast[0] !== 'never'
  }

  // https://eslint.org/docs/rules/max-len
  const maxLen = getRuleOptions('max-len', [{ code: 80 }])
  if (maxLen) {
    // To simplify the implementation logic, we only read from the `code` option.

    // `max-len` has an undocumented array-style configuration,
    // where max code length specified directly as integers
    // (used by `eslint-config-airbnb`).

    if (typeof maxLen[0] === 'number') {
      result.max_line_length = maxLen[0]
    } else {
      result.max_line_length = maxLen[0].code
    }
  }

  return result
}

exports.buildEditorConfig = function buildEditorConfig () {
  console.log('Building EditorConfig files...')
  // Get built-in eslint configs
  const configList = fs.readdirSync(path.resolve(__dirname, '../packages/@vue/'))
    .map(name => {
      const matched = /eslint-config-(\w+)/.exec(name)
      return matched && matched[1]
    })
    .filter(x => x)

  configList.forEach(config => {
    let content = '[*.{js,jsx,ts,tsx,vue}]\n'

    const editorconfig = convertRules(config)

    // `eslint-config-prettier` & `eslint-config-typescript` do not have any style rules
    if (!Object.keys(editorconfig).length) {
      return
    }

    for (const [key, value] of Object.entries(editorconfig)) {
      content += `${key} = ${value}\n`
    }

    const templateDir = path.resolve(__dirname, `../packages/@vue/cli-plugin-eslint/generator/template/${config}`)
    if (!fs.existsSync(templateDir)) {
      fs.mkdirSync(templateDir)
    }
    fs.writeFileSync(`${templateDir}/_editorconfig`, content)
  })
  console.log('EditorConfig files up-to-date.')
}
