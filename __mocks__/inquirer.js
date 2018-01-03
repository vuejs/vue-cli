let pendingAssertions

exports.prompt = prompts => {
  if (!pendingAssertions) {
    throw new Error(`inquirer was mocked and used without pending assertions: ${prompts}`)
  }

  const answers = {}
  let skipped = 0
  prompts.forEach((prompt, i) => {
    if (prompt.when && !prompt.when(answers)) {
      skipped++
      return
    }

    const setValue = val => {
      if (prompt.validate) {
        const res = prompt.validate(val)
        if (res !== true) {
          throw new Error(`validation failed for prompt: ${prompt}`)
        }
      }
      answers[prompt.name] = prompt.filter
        ? prompt.filter(val)
        : val
    }

    const a = pendingAssertions[i - skipped]

    if (a.message) {
      const message = typeof prompt.message === 'function'
        ? prompt.message(answers)
        : prompt.message
      expect(message).toContain(a.message)
    }

    if (a.choices) {
      expect(prompt.choices.length).toBe(a.choices.length)
      a.choices.forEach((c, i) => {
        const expected = a.choices[i]
        if (expected) {
          expect(prompt.choices[i].name).toContain(expected)
        }
      })
    }

    if (a.input != null) {
      expect(prompt.type).toBe('input')
      setValue(a.input)
    }

    if (a.choose != null) {
      expect(prompt.type === 'list' || prompt.type === 'rawList').toBe(true)
      setValue(prompt.choices[a.choose].value)
    }

    if (a.check != null) {
      expect(prompt.type).toBe('checkbox')
      setValue(a.check.map(i => prompt.choices[i].value))
    }

    if (a.confirm != null) {
      expect(prompt.type).toBe('confirm')
      setValue(a.confirm)
    }

    if (a.useDefault) {
      expect('default' in prompt).toBe(true)
      setValue(
        typeof prompt.default === 'function'
          ? prompt.default(answers)
          : prompt.default
      )
    }
  })

  expect(prompts.length).toBe(pendingAssertions.length + skipped)
  pendingAssertions = null

  return Promise.resolve(answers)
}

exports.expectPrompts = assertions => {
  pendingAssertions = assertions
}
