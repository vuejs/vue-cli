/** @typedef {'warn' | 'error' | 'info' | 'done'} LogType */

/**
 * @typedef Log
 * @prop {string} id
 * @prop {string} date
 * @prop {LogType} type
 * @prop {string} tag
 * @prop {string} message
 */

const shortId = require('shortid')
const { events } = require('@vue/cli-shared-utils/lib/logger')
const { generateTitle } = require('@vue/cli/lib/util/clearConsole')
// Subs
const channels = require('../channels')
// Context
const getContext = require('../context')

/** @type {Log []} */
let logs = []

/**
 * @param {Log} log
 * @param {any} context
 */
exports.add = function (log, context) {
  /** @type {Log} */
  const item = {
    id: shortId.generate(),
    date: new Date().toISOString(),
    tag: null,
    ...log
  }
  logs.push(item)
  context.pubsub.publish(channels.CONSOLE_LOG_ADDED, {
    consoleLogAdded: item
  })
  return item
}

exports.list = function (context) {
  return logs
}

exports.last = function (context) {
  if (logs.length) {
    return logs[logs.length - 1]
  }
  return null
}

exports.clear = function (context) {
  logs = []
  return logs
}

// Init
{
  const context = getContext()
  events.on('log', log => {
    exports.add(log, context)
  })

  exports.add({
    type: 'info',
    tag: null,
    message: generateTitle(true)
  }, context)
}
