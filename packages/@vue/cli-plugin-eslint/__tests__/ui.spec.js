const configDescriptor = require('../ui/configDescriptor')
const { getEslintConfigName, getDefaultValue, getEslintPrompts } = configDescriptor

describe('getEslintConfigName', () => {
  describe('for "extend" of string type', () => {
    it('returns null if it doesn\'t extend vue plugin config', () => {
      expect(getEslintConfigName({
        extends: 'eslint:recommended'
      })).toBe(null)
    })

    it('returns vue config used', () => {
      expect(getEslintConfigName({
        extends: 'plugin:vue/recommended'
      })).toBe('plugin:vue/recommended')
    })
  })

  describe('for "extend" of array type', () => {
    it('returns null if it doesn\'t extend vue plugin config', () => {
      expect(getEslintConfigName({
        extends: ['eslint:recommended', 'standard']
      })).toBe(null)
    })

    it('returns vue config used', () => {
      expect(getEslintConfigName({
        extends: ['eslint:recommended', 'plugin:vue/recommended']
      })).toBe('plugin:vue/recommended')
    })
  })
})

describe('getDefaultValue', () => {
  const getResult = (config, ruleCategory) => {
    const rule = {
      meta: {
        docs: {
          category: ruleCategory
        }
      }
    }

    const data = {
      eslint: {
        extends: config
      }
    }

    return getDefaultValue(rule, data)
  }

  it('returns "ERROR" value if the rule belongs to the selected configuration', () => {
    expect(getResult('plugin:vue/base', 'base')).toBe('error')
    expect(getResult('plugin:vue/essential', 'base')).toBe('error')
    expect(getResult('plugin:vue/essential', 'essential')).toBe('error')
    expect(getResult('plugin:vue/strongly-recommended', 'base')).toBe('error')
    expect(getResult('plugin:vue/strongly-recommended', 'essential')).toBe('error')
    expect(getResult('plugin:vue/strongly-recommended', 'strongly-recommended')).toBe('error')
    expect(getResult('plugin:vue/recommended', 'base')).toBe('error')
    expect(getResult('plugin:vue/recommended', 'essential')).toBe('error')
    expect(getResult('plugin:vue/recommended', 'strongly-recommended')).toBe('error')
    expect(getResult('plugin:vue/recommended', 'recommended')).toBe('error')
  })

  it('returns "OFF" value if the rule doesn\'t belong to the selected configuration', () => {
    expect(getResult('plugin:vue/base', 'essential')).toBe('off')
    expect(getResult('plugin:vue/base', 'strongly-recommended')).toBe('off')
    expect(getResult('plugin:vue/base', 'recommended')).toBe('off')
    expect(getResult('plugin:vue/essential', 'strongly-recommended')).toBe('off')
    expect(getResult('plugin:vue/essential', 'recommended')).toBe('off')
    expect(getResult('plugin:vue/strongly-recommended', 'recommended')).toBe('off')
    expect(getResult('plugin:vue/base', undefined)).toBe('off')
    expect(getResult('plugin:vue/essential', undefined)).toBe('off')
    expect(getResult('plugin:vue/strongly-recommended', undefined)).toBe('off')
    expect(getResult('plugin:vue/recommended', undefined)).toBe('off')
  })
})

describe('getEslintPrompts', () => {
  // project configuration
  const data = {
    eslint: {
      extends: 'plugin:vue/recommended',
      rules: {
        'vue/lorem': ['error', ['asd']], // custom setting
        'vue/ipsum': 'warning'
      }
    }
  }

  // all rules
  const rules = {
    'lorem': {
      meta: {
        docs: {
          category: undefined,
          description: 'Lorem description',
          url: 'http://test.com/lorem'
        }
      }
    },
    'ipsum': {
      meta: {
        docs: {
          category: 'recommended',
          description: 'Ipsum description',
          url: 'http://test.com/ipsum'
        }
      }
    },
    'dolor': {
      meta: {
        docs: {
          category: 'strongly-recommended',
          description: 'Dolor description',
          url: 'http://test.com/dolor'
        }
      }
    },
    'sit': {
      meta: {
        docs: {
          category: 'base',
          description: 'Sit description',
          url: 'http://test.com/sit'
        }
      }
    }
  }

  const prompts = getEslintPrompts(data, rules)

  it('creates an array with 3 settings, leaving out category "base"', () => {
    expect(prompts).toHaveLength(3)
  })

  it('creates an array which order matches eslint categories', () => {
    expect(prompts[0].name).toBe('vue/dolor')
    expect(prompts[1].name).toBe('vue/ipsum')
    expect(prompts[2].name).toBe('vue/lorem')
  })

  it('doesn\'t set value on prompt item, if the rule wasn\'t set in project\'s eslint config', () => {
    expect(prompts[0].value).toBe(undefined)
  })

  it('sets value on prompt item, if the rule was set in project\'s eslint config', () => {
    expect(prompts[1].value).toBe('"warning"')
    expect(prompts[2].value).toBe('["error",["asd"]]')
  })

  it('generates an extra choice for rules that have a custom setting', () => {
    expect(prompts[0].choices).toHaveLength(3)
    expect(prompts[1].choices).toHaveLength(3)
    expect(prompts[2].choices).toHaveLength(4)
  })

  it('sets a default value to "ERROR" for rule that belong to the chosen config', () => {
    expect(prompts[0].default).toBe('"error"')
    expect(prompts[1].default).toBe('"error"')
    expect(prompts[2].default).toBe('"off"')
  })
})
