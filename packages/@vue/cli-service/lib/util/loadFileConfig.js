// @ts-check
const { existsSync, unlinkSync, promises } = require('fs')
const { join, extname, isAbsolute, dirname } = require('path')
const { build } = require('esbuild')
// @ts-ignore
const { loadModule } = require('@vue/cli-shared-utils')

const POSSIBLE_CONFIG_PATHS = [
  process.env.VUE_CLI_SERVICE_CONFIG_PATH,
  'vue.config.js',
  'vue.config.cjs',
  'vue.config.mjs',
  'vue.config.ts'
].filter((i) => !!i)

const removeFile = (p) => {
  if (existsSync(p)) unlinkSync(p)
}

const bundleConfig = async (p, ctx, mjs = false) => {
  const outFile = p.replace(/\.[a-z]+$/, '.bundled.js')
  const readConfig = () => {
    // eslint-disable-next-line
    delete eval(`require.cache`)[outFile]
    const result = mjs ? import(outFile) : require(outFile)
    removeFile(outFile)
    return result.default || result
  }

  try {
    await build({
      absWorkingDir: ctx,
      entryPoints: [p],
      outfile: outFile,
      platform: 'node',
      bundle: true,
      target: 'es2017',
      format: mjs ? 'esm' : 'cjs',
      plugins: [
        {
          name: 'ignore',
          setup (bld) {
            bld.onResolve({ filter: /.*/ }, (args) => {
              // eslint-disable-next-line
              if (!isAbsolute(args.path) && !/^[\.\/]/.test(args.path)) {
                return { external: true }
              }
            })
            bld.onLoad(
              { filter: /\.(js|ts|mjs|cjs)$/ },
              // @ts-ignore
              async (args) => {
                const contents = await promises.readFile(args.path, 'utf8')
                return {
                  contents: contents
                    .replace(/\b__dirname\b/g, JSON.stringify(dirname(args.path)))
                    .replace(/\b__filename\b/g, JSON.stringify(args.path))
                    .replace(/\bimport\.meta\.url\b/g, JSON.stringify(`file://${args.path}`)),
                  loader: args.path.endsWith('.ts') ? 'ts' : 'js'
                }
              }
            )
          }
        }
      ]
    })
    return readConfig()
  } catch (e) {
    removeFile(outFile)
    throw e
  }
}

function loadFileConfig (context) {
  let fileConfig

  const formatPath = (p) => join(context, p)
  const getPkg = () => {
    try {
      return require(formatPath('package.json'))
    } catch (e) {
      return {}
    }
  }

  const fileConfigPath = POSSIBLE_CONFIG_PATHS.map(formatPath).find((p) => existsSync(p))
  const ext = extname(fileConfigPath || '')
  const isMjs = (ext === '.js' && getPkg().type === 'module') || ext === '.mjs'

  if (isMjs) {
    fileConfig = import(fileConfigPath)
  } else if (ext === '.ts') {
    // use esbuild to compile .ts config
    fileConfig = bundleConfig(fileConfigPath, context, true)
  } else if (ext) {
    fileConfig = loadModule(fileConfigPath, context)
  }

  return { fileConfig, fileConfigPath }
}

module.exports = loadFileConfig
