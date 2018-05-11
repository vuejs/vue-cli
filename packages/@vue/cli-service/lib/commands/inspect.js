let patched = false
function patchWebpackChain () {
  if (patched) return

  const Config = require('webpack-chain')

  const toConfig = Config.prototype.toConfig
  Config.prototype.toConfig = function () {
    const config = toConfig.call(this)

    // inject plugin metadata
    const { entries: plugins, order: pluginNames } = this.plugins.order()
    config.plugins.forEach((p, i) => {
      Object.defineProperties(p, {
        __pluginName: {
          value: pluginNames[i]
        },
        __pluginArgs: {
          value: plugins[pluginNames[i]].get('args')
        }
      })
    })

    // inject rule metadata
    const { entries: rules, order: ruleNames } = this.module.rules.order()
    config.module.rules.forEach((rawRule, i) => {
      const ruleName = ruleNames[i]
      const rule = rules[ruleName]
      Object.defineProperties(rawRule, {
        __ruleName: {
          value: ruleName
        }
      })

      if (rawRule.oneOf) {
        const { entries: oneOfs, order: oneOfNames } = rule.oneOfs.order()
        rawRule.oneOf.forEach((o, i) => {
          const oneOfName = oneOfNames[i]
          const oneOf = oneOfs[oneOfName]
          Object.defineProperties(o, {
            __ruleName: {
              value: ruleName
            },
            __oneOfName: {
              value: oneOfName
            }
          })
          patchUse(oneOf, ruleName, oneOfName, o)
        })
      }

      patchUse(rule, ruleName, null, rawRule)
    })

    return config
  }

  patched = true
}

function patchUse (rule, ruleName, oneOfName, rawRule) {
  if (Array.isArray(rawRule.use)) {
    const { order: useNames } = rule.uses.order()
    rawRule.use.forEach((use, i) => {
      Object.defineProperties(use, {
        __ruleName: {
          value: ruleName
        },
        __oneOfName: {
          value: oneOfName
        },
        __useName: {
          value: useNames[i]
        }
      })
    })
  }
}

module.exports = (api, options) => {
  api.registerCommand('inspect', {
    description: 'inspect internal webpack config',
    usage: 'vue-cli-service inspect [options] [...paths]',
    options: {
      '--mode': 'specify env mode (default: development)',
      '--verbose': 'show full function definitions in output'
    }
  }, args => {
    patchWebpackChain()

    const get = require('get-value')
    const stringify = require('javascript-stringify')
    const config = api.resolveWebpackConfig()
    const paths = args._

    let res
    if (paths.length > 1) {
      res = {}
      paths.forEach(path => {
        res[path] = get(config, path)
      })
    } else if (paths.length === 1) {
      res = get(config, paths[0])
    } else {
      res = config
    }

    const pluginRE = /(?:function|class) (\w+Plugin)/
    console.log(stringify(res, (value, indent, stringify) => {
      // shorten long functions
      if (
        !args.verbose &&
        typeof value === 'function' &&
        value.toString().length > 100
      ) {
        return `function () { /* omitted long function */ }`
      }

      // improve plugin output
      if (value && value.__pluginName) {
        let match = (
          value.constructor &&
          value.constructor.toString().match(pluginRE)
        )
        // copy-webpack-plugin
        if (value.__pluginName === 'copy') {
          match = [null, `CopyWebpackPlugin`]
        }
        const name = match[1]
        const prefix = `/* config.plugin('${value.__pluginName}') */\n`

        if (name) {
          return prefix + `new ${name}(${
            value.__pluginArgs.map(arg => stringify(arg)).join(',\n')
          })`
        } else {
          return prefix + stringify({
            args: value.__pluginArgs || []
          })
        }
      }

      // improve rule output
      if (value && value.__ruleName) {
        const prefix = `/* config.module.rule('${value.__ruleName}')${
          value.__oneOfName ? `.oneOf('${value.__oneOfName}')` : ``
        }${
          value.__useName ? `.use('${value.__useName}')` : ``
        } */\n`
        return prefix + stringify(value)
      }

      return stringify(value)
    }, 2))
  })
}

module.exports.defaultModes = {
  inspect: 'development'
}
