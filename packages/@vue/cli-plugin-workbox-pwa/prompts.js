module.exports = [
  {
    name: 'manifestType',
    type: 'checkbox',
    message: 'Which type of workbox manifest to use?',
    choices: [
      {
        name: 'Inject Manifest (more flexible)',
        value: 'InjectManifest',
        checked: true
      },
      {
        name: 'Generate Manifest (auto-generated)',
        value: 'GenerateSW'
      }
    ],
    default: 'InjectManifest'
  }
  // {
  //   name: 'addManualUpdate',
  //   type: 'confirm',
  //   message: 'Add code for prompt to user for manual updates of the service worker (y/N)?',
  //   default: false
  // },
  // {
  //   name: 'addAutoUpdate',
  //   type: 'confirm',
  //   message: 'Add code to auto update the service worker at an interval (default 1 hr) (y/N)?',
  //   default: false
  // }
]