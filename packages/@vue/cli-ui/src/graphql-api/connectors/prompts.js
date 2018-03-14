let answers = {}
let prompts = []

function getPrompt (id) {
  return prompts.find(
    p => p.id === id
  )
}

function generatePromptError (value) {
  let message
  if (typeof value === 'string') {
    message = value
  } else {
    message = 'Invalid input'
  }
  return {
    message
  }
}

function getDefaultValue (prompt) {
  const defaultValue = prompt.raw.default
  if (typeof defaultValue === 'function') {
    return defaultValue(answers)
  } else if (prompt.type === 'checkbox') {
    const choices = getChoices(prompt)
    if (choices) {
      return choices.filter(
        c => c.checked
      ).map(
        c => c.value
      )
    }
  } else if (prompt.type === 'confirm') {
    return false
  }
  return defaultValue
}

function getEnabled (value) {
  const type = typeof value
  if (type === 'function') {
    return !!value(answers)
  } else if (type === 'boolean') {
    return value
  } else {
    return true
  }
}

function validateInput (prompt, value) {
  const validate = prompt.raw.validate
  if (typeof validate === 'function') {
    return validate(value, answers)
  }
  return true
}

function getValue (prompt, value) {
  const filter = prompt.raw.filter
  if (typeof filter === 'function') {
    return filter(value)
  }
  return value
}

function getDisplayedValue (prompt, value) {
  const transform = prompt.raw.transform
  if (typeof transform === 'function') {
    value = transform(value)
  }
  return JSON.stringify(value)
}

function generatePromptChoice (prompt, data) {
  return {
    value: getDisplayedValue(prompt, data.value),
    name: data.name,
    checked: data.checked,
    disabled: data.disabled
  }
}

function getChoices (prompt) {
  const data = prompt.raw.choices
  if (!data) {
    return null
  }

  let result
  if (typeof data === 'function') {
    result = data(answers)
  } else {
    result = data
  }
  return result.map(
    item => generatePromptChoice(prompt, item)
  )
}

function setAnswer (id, value) {
  const fields = id.split('.')
  let obj = answers
  const l = fields.length
  for (let i = 0; i < l - 1; i++) {
    const key = fields[i]
    if (!obj[key]) {
      obj[key] = {}
    }
    obj = obj[key]
  }
  obj[fields[l - 1]] = value
}

function removeAnswer (id) {
  const fields = id.split('.')
  let obj = answers
  const l = fields.length
  const objs = []
  for (let i = 0; i < l - 1; i++) {
    const key = fields[i]
    if (!obj[key]) {
      return
    }
    objs.splice(0, 0, { obj, key, value: obj[key] })
    obj = obj[key]
  }
  delete obj[fields[l - 1]]
  // Clear empty objects
  for (const { obj, key, value } of objs) {
    if (!Object.keys(value).length) {
      delete obj[key]
    }
  }
}

function generatePrompt (data) {
  return {
    id: data.name,
    enabled: true,
    type: data.type,
    name: data.short || null,
    message: data.message,
    description: data.description || null,
    link: data.link || null,
    choices: null,
    value: null,
    valueChanged: false,
    error: null,
    raw: data
  }
}

function updatePrompts () {
  for (const prompt of prompts) {
    const oldEnabled = prompt.enabled
    prompt.enabled = getEnabled(prompt.raw.when)

    prompt.choices = getChoices(prompt)

    if (oldEnabled !== prompt.enabled && !prompt.enabled) {
      removeAnswer(prompt.id)
      prompt.valueChanged = false
    } else if (prompt.enabled && !prompt.valueChanged) {
      let value = getDefaultValue(prompt)
      prompt.value = getDisplayedValue(prompt, value)
      setAnswer(prompt.id, getValue(prompt, value))
    }
  }
}

// Public API

function setAnswers (newAnswers) {
  answers = newAnswers
  updatePrompts()
}

function changeAnswers (cb) {
  cb(answers)
  updatePrompts()
}

function getAnswers () {
  return answers
}

function reset () {
  prompts = []
  setAnswers({})
}

function list () {
  return prompts
}

function add (data) {
  prompts.push(generatePrompt(data))
}

function start () {
  updatePrompts()
}

function remove (id) {
  const index = prompts.findIndex(p => p.id === id)
  index !== -1 && prompts.splice(index, 1)
}

function setValue ({ id, value }) {
  const prompt = getPrompt(id)
  if (!prompt) {
    console.warn(`Prompt '${prompt}' not found`)
    return null
  }

  const validation = validateInput(prompt, value)
  if (validation !== true) {
    prompt.error = generatePromptError(validation)
  } else {
    prompt.error = null
  }
  prompt.value = getDisplayedValue(prompt, value)
  const finalValue = getValue(prompt, value)
  prompt.valueChanged = true
  setAnswer(prompt.id, finalValue)
  updatePrompts()
  return prompt
}

module.exports = {
  setAnswers,
  changeAnswers,
  getAnswers,
  reset,
  list,
  add,
  remove,
  start,
  setValue
}
