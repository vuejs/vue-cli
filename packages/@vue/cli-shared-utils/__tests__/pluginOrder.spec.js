const { topologicalSorting } = require('../lib/pluginOrder')
const { logs } = require('../lib/logger')

/**
 *
 * @param {string} id
 * @param {{stage: number, after: string|Array<string>}} [order]
 */
function plugin (id, order) {
  order = order || {}
  const { after } = order

  // use object instead of function here
  const apply = {}
  apply.after = after
  return {
    id,
    apply
  }
}

describe('topologicalSorting', () => {
  test(`no specifying 'after' will preserve sort order`, () => {
    const plugins = [
      plugin('foo'),
      plugin('bar'),
      plugin('baz')
    ]
    const orderPlugins = topologicalSorting(plugins)
    expect(orderPlugins).toEqual(plugins)
  })

  test(`'after' specified`, () => {
    const plugins = [
      plugin('foo', { after: 'bar' }),
      plugin('bar', { after: 'baz' }),
      plugin('baz')
    ]
    const orderPlugins = topologicalSorting(plugins)
    expect(orderPlugins).toEqual([
      plugin('baz'),
      plugin('bar', { after: 'baz' }),
      plugin('foo', { after: 'bar' })
    ])
  })

  test(`'after' can be Array<string>`, () => {
    const plugins = [
      plugin('foo', { after: ['bar', 'baz'] }),
      plugin('bar'),
      plugin('baz')
    ]
    const orderPlugins = topologicalSorting(plugins)
    expect(orderPlugins).toEqual([
      plugin('bar'),
      plugin('baz'),
      plugin('foo', { after: ['bar', 'baz'] })
    ])
  })

  test('it is not possible to sort plugins because of cyclic graph, return original plugins directly', () => {
    logs.warn = []
    const plugins = [
      plugin('foo', { after: 'bar' }),
      plugin('bar', { after: 'baz' }),
      plugin('baz', { after: 'foo' })
    ]
    const orderPlugins = topologicalSorting(plugins)
    expect(orderPlugins).toEqual(plugins)

    expect(logs.warn.length).toBe(1)
  })
})
