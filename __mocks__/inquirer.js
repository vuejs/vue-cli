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
    const a = pendingAssertions[i - skipped]
    if (a.message) {
      expect(prompt.message).toContain(a.message)
    }
    if (a.choices) {
      expect(prompt.choices.length).toBe(a.choices.length)
      a.choices.forEach((c, i) => {
        expect(prompt.choices[i].name).toContain(a.choices[i])
      })
    }
    if (a.choose != null) {
      expect(prompt.type).toBe('list')
      answers[prompt.name] = prompt.choices[a.choose].value
    }
    if (a.check != null) {
      expect(prompt.type).toBe('checkbox')
      answers[prompt.name] = a.check.map(i => prompt.choices[i].value)
    }
    if (a.confirm != null) {
      expect(prompt.type).toBe('confirm')
      answers[prompt.name] = a.confirm
    }
  })

  expect(prompts.length).toBe(pendingAssertions.length + skipped)
  pendingAssertions = null

  return Promise.resolve(answers)
}

exports.expectPrompts = assertions => {
  pendingAssertions = assertions
}
