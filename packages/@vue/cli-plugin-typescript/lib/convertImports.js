module.exports = function convertImports (file) {
  return file
    .replace(/import (.*from )?('([^']+)'|"([^"]+)")/g, ($1, $2, $3, $4) => {
      const isRelative = $4.charAt(0) === '.'
      const isExtensionless = !/\.\w+$/.test($4)
      const isJS = /\.js$/.test($4)
      const replaced = isRelative
        ? isExtensionless
          ? $3.replace($4, `${$4}.ts`)
          : isJS
            ? $3.replace(/\.js('|")$/, '.ts$1')
            : $3
        : $3
      return `import ${$2 || ''}${replaced}`
    })
}
