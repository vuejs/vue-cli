jest.autoMockOff()

const { defineTest } = require('jscodeshift/dist/testUtils')

defineTest(__dirname, 'migrateComponentType', null, 'shims-vue', { parser: 'ts' })
