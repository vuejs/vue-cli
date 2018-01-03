jest.mock('fs')

const { saveOptions } = require('@vue/cli/lib/options')

it('should pass', () => {
  saveOptions({
    useTaobaoRegistry: true
  })
})
