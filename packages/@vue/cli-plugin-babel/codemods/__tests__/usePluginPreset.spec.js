jest.autoMockOff()

const { defineTest } = require('jscodeshift/dist/testUtils')

defineTest(__dirname, 'usePluginPreset', null, 'default')
defineTest(__dirname, 'usePluginPreset', null, 'customConfig')
defineTest(__dirname, 'usePluginPreset', null, 'require')
defineTest(__dirname, 'usePluginPreset', null, 'templateLiteral')

