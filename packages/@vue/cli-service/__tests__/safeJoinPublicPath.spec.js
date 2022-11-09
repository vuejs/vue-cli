jest.setTimeout(10000)

test('test safeJoinPublicPath', () => {
  const safeJoinPublicPath = require('../lib/util/safeJoinPublicPath')

  expect(safeJoinPublicPath('./', '/js/safari-nomodule-fix.js')).toBe('js/safari-nomodule-fix.js')
  expect(safeJoinPublicPath('./relative', '/js/safari-nomodule-fix.js')).toBe('relative/js/safari-nomodule-fix.js')
  expect(safeJoinPublicPath('./relative/path/to', '/js/safari-nomodule-fix.js')).toBe('relative/path/to/js/safari-nomodule-fix.js')
  expect(safeJoinPublicPath('relative', '/js/safari-nomodule-fix.js')).toBe('relative/js/safari-nomodule-fix.js')
  expect(safeJoinPublicPath('relative/path/to', '/js/safari-nomodule-fix.js')).toBe('relative/path/to/js/safari-nomodule-fix.js')
  expect(safeJoinPublicPath('/relative', '/js/safari-nomodule-fix.js')).toBe('/relative/js/safari-nomodule-fix.js')
  expect(safeJoinPublicPath('/relative/path/to', '/js/safari-nomodule-fix.js')).toBe('/relative/path/to/js/safari-nomodule-fix.js')
  expect(safeJoinPublicPath('http://example.com', '/js/safari-nomodule-fix.js')).toBe('http://example.com/js/safari-nomodule-fix.js')
  expect(safeJoinPublicPath('http://example.com/relative', '/js/safari-nomodule-fix.js')).toBe('http://example.com/relative/js/safari-nomodule-fix.js')
  expect(safeJoinPublicPath('http://example.com/relative/path/to', '/js/safari-nomodule-fix.js')).toBe('http://example.com/relative/path/to/js/safari-nomodule-fix.js')
  expect(safeJoinPublicPath('//example.com', '/js/safari-nomodule-fix.js')).toBe('//example.com/js/safari-nomodule-fix.js')
  expect(safeJoinPublicPath('//example.com/relative', '/js/safari-nomodule-fix.js')).toBe('//example.com/relative/js/safari-nomodule-fix.js')
  expect(safeJoinPublicPath('//example.com/relative/path/to', '/js/safari-nomodule-fix.js')).toBe('//example.com/relative/path/to/js/safari-nomodule-fix.js')
})
