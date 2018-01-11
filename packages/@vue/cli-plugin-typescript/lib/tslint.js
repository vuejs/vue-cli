module.exports = function lint (args = {}, api, silent) {
  process.chdir(api.resolve('.'))

  const { run } = require('tslint/lib/runner')

  // TODO make this support *.vue files
  return run({
    files: args._ && args._.length ? args._ : ['src/**/*.ts', 'test/**/*.ts'],
    exclude: args.exclude || [],
    fix: !args['no-fix'],
    project: args.project,
    config: args.config || api.resolve('tslint.json'),
    force: args.force,
    format: args.format,
    formattersDirectory: args['formatters-dir'],
    init: args.init,
    out: args.out,
    outputAbsolutePaths: args['output-absolute-paths'],
    rulesDirectory: args['rules-dir'],
    test: args.test,
    typeCheck: args['type-check']
  }, {
    log (m) { if (!silent) process.stdout.write(m) },
    error (m) { process.stdout.write(m) }
  }).then(code => {
    process.exitCode = code
  }).catch(err => {
    console.error(err)
    process.exitCode = 1
  })
}
