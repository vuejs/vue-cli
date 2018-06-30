// Subs
const channels = require('../channels')
// Connectors
const { log } = require('../util/logger')

const suggestions = []

function list (context) {
  return suggestions
}

function findOne (id) {
  return suggestions.find(s => s.id === id)
}

function add (suggestion, context) {
  if (findOne(suggestion.id)) return

  if (!suggestion.importance) {
    suggestion.importance = 'normal'
  }
  suggestion.busy = false

  suggestions.push(suggestion)

  context.pubsub.publish(channels.SUGGESTION_ADDED, {
    suggestionAdded: suggestion
  })

  log('Suggestion added', suggestion.id)

  return suggestion
}

function remove (id, context) {
  const suggestion = findOne(id)
  if (!suggestion) return
  const index = suggestions.indexOf(suggestion)
  suggestions.splice(index, 1)

  context.pubsub.publish(channels.SUGGESTION_REMOVED, {
    suggestionRemoved: suggestion
  })

  log('Suggestion removed', suggestion.id)

  return suggestion
}

function clear (context) {
  for (const suggestion of suggestions) {
    remove(suggestion.id, context)
  }
}

function update (data, context) {
  const suggestion = findOne(data.id)
  if (!suggestion) return
  Object.assign(suggestion, data)

  context.pubsub.publish(channels.SUGGESTION_UPDATED, {
    suggestionUpdated: suggestion
  })

  log('Suggestion updated', suggestion.id)

  return suggestion
}

async function activate ({ id }, context) {
  const suggestion = findOne(id)
  if (!suggestion) return

  update({
    id: suggestion.id,
    busy: true
  }, context)

  let result, error

  try {
    result = await suggestion.handler()
  } catch (e) {
    error = e
    console.log(e)
  }

  update({
    id: suggestion.id,
    busy: false
  }, context)

  if (!error && (!result || !result.keep)) {
    remove(suggestion.id, context)
  }

  return suggestion
}

module.exports = {
  list,
  add,
  remove,
  clear,
  activate
}
