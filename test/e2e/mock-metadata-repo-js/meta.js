module.exports = {
  prompts: {
    description: {
      type: 'string',
      required: true,
      message: 'Project description'
    }
  },
  helpers: {
    uppercase: function (str) {
      return str.toUpperCase()
    }
  }
}
