const configDescriptor = require('../ui/configDescriptor')
const { getEslintConfigName, getDefaultValue } = configDescriptor

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
