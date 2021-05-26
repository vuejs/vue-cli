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
]