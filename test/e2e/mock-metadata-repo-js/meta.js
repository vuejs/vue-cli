module.exports = {
  prompts: {
    description: {
      type: 'string',
      required: true,
      message: 'Project description'
    },
    name: {
      type: 'string',
      required: true,
      label: 'Project name',
      validate: function (input) {
        return input === 'custom' ? 'can not input `custom`' : true
      }
    },
    q1: {
      type: 'list',
      required: true,
      label: 'Which choice?',
      choices: ['a1', 'a2']
    },
    q2: {
      when: function (answers) {
        return answers.q1 === 'a1'
      },
      label: 'Which choice',
      type: 'confirm'
    }
  },
  helpers: {
    uppercase: function (str) {
      return str.toUpperCase()
    }
  }
}
