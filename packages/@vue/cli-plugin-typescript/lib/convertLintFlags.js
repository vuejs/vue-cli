module.exports = function convertLintFlags (file) {
  return file
    .replace(/\/\*\s?eslint-(enable|disable)([^*]+)?\*\//g, (_, $1, $2) => {
      if ($2) $2 = $2.trim()
      return `/* tslint:${$1}${$2 ? `:${$2}` : ``} */`
    })
    .replace(/\/\/\s?eslint-disable-(next-)?line(.+)?/g, (_, $1, $2) => {
      if ($2) $2 = $2.trim()
      return `// tslint:disable-${$1 || ''}line${$2 ? `:${$2}` : ``}`
    })
}
