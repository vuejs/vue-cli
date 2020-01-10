const fn = require('../lib/convertLintFlags')

test('convert ESLint flags to TSLint flags', () => {
  expect(fn(`
/* eslint-disable */
/* eslint-disable no-console, foo-bar, haha */
// eslint-disable-next-line
// eslint-disable-next-line no-console, foo-bar, haha
foo() // eslint-disable-line
foo() // eslint-disable-line no-console, foo-bar, haha
  `)).toMatch(`
/* tslint:disable */
/* tslint:disable:no-console, foo-bar, haha */
// tslint:disable-next-line
// tslint:disable-next-line:no-console, foo-bar, haha
foo() // tslint:disable-line
foo() // tslint:disable-line:no-console, foo-bar, haha
  `)
})
