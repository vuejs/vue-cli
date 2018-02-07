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
    if (!a) {
      console.error(`no matching assertion for prompt:`, prompt)
      console.log(prompts)
      console.log(pendingAssertions)
    }

    if (a.message) {
      const message = typeof prompt.message === 'function'
        ? prompt.message(answers)
        : prompt.message
      expect(message).toMatch(a.message)
    }

    const choices = typeof prompt.choices === 'function'
      ? prompt.choices(answers)
      : prompt.choices
    if (a.choices) {
      expect(choices.length).toBe(a.choices.length)
      a.choices.forEach((c, i) => {
        const expected = a.choices[i]
        if (expected) {
          expect(choices[i].name).toMatch(expected)
        }
      })
    }

    if (a.input != null) {
      expect(prompt.type).toBe('input')
      setValue(a.input)
    }

    if (a.choose != null) {
      expect(prompt.type === 'list' || prompt.type === 'rawList').toBe(true)
      setValue(choices[a.choose].value)
    }

    if (a.check != null) {
      expect(prompt.type).toBe('checkbox')
      setValue(a.check.map(i => choices[i].value))
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
