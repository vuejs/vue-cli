// TODO check if jest auto merges options
// if not, merge manually

module.exports = {
  'moduleFileExtensions': [
    'js',
    'json',
    // tell Jest to handle *.vue files
    'vue'
  ],
  'transform': {
    // process js with babel-jest
    '^.+\\.js$': require.resolve('babel-jest'),
    // process *.vue files with vue-jest
    '.*\\.(vue)$': require.resolve('vue-jest')
  },
  // support the same @ -> src alias mapping in source code
  'moduleNameMapper': {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  // serializer for snapshots
  'snapshotSerializers': [
    require.resolve('jest-serializer-vue')
  ],
  'mapCoverage': true
}
