// these prompts are used if the plugin is late-installed into an existing
// project and invoked by `vue invoke`.
module.exports = [
  {
    name: 'type',
    type: 'list',
    message: 'What do you want to generate?',
    choices: [
      {
        name: 'Initial setup',
        value: 'init'
      }
      // TODO: Vuex Module
    ]
  }
]
