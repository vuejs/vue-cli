// From https://github.com/webpack-contrib/webpack-bundle-analyzer/blob/4abac503c789bac94118e5bbfc410686fb5112c7/src/parseUtils.js
// Modified by Guillaume Chau (Akryum)

const acorn = require('acorn')
const walk = require('acorn-walk')
const mapValues = require('lodash.mapvalues')
const zlib = require('zlib')
const { warn } = require('@vue/cli-shared-utils')

exports.analyzeBundle = function analyzeBundle (bundleStats, assetSources) {
  // Picking only `*.js` assets from bundle that has non-empty `chunks` array
  const jsAssets = []
  const otherAssets = []

  // Separate JS assets
  bundleStats.assets.forEach(asset => {
    if (asset.name.endsWith('.js') && asset.chunks && asset.chunks.length) {
      jsAssets.push(asset)
    } else {
      otherAssets.push(asset)
    }
  })

  // Trying to parse bundle assets and get real module sizes
  let bundlesSources = null
  let parsedModules = null

  bundlesSources = {}
  parsedModules = {}

  for (const asset of jsAssets) {
    const source = assetSources.get(asset.name)
    let bundleInfo

    try {
      bundleInfo = parseBundle(source)
    } catch (err) {
      const msg = (err.code === 'ENOENT') ? 'no such file' : err.message
      warn(`Error parsing bundle asset "${asset.fullPath}": ${msg}`)
      continue
    }

    bundlesSources[asset.name] = bundleInfo.src
    Object.assign(parsedModules, bundleInfo.modules)
  }

  if (!Object.keys(bundlesSources).length) {
    bundlesSources = null
    parsedModules = null
    warn('\nNo bundles were parsed. Analyzer will show only original module sizes from stats file.\n')
  }

  // Update sizes

  bundleStats.modules.forEach(module => {
    const parsedSrc = parsedModules && parsedModules[module.id]
    module.size = {
      stats: module.size
    }
    if (parsedSrc) {
      module.size.parsed = parsedSrc.length
      module.size.gzip = getGzipSize(parsedSrc)
    } else {
      module.size.parsed = module.size.stats
      module.size.gzip = 0
    }
  })

  jsAssets.forEach(asset => {
    const src = bundlesSources && bundlesSources[asset.name]
    asset.size = {
      stats: asset.size
    }
    if (src) {
      asset.size.parsed = src.length
      asset.size.gzip = getGzipSize(src)
    } else {
      asset.size.parsed = asset.size.stats
      asset.size.gzip = 0
    }
  }, {})

  otherAssets.forEach(asset => {
    const src = assetSources.get(asset.name)
    asset.size = {
      stats: asset.size,
      parsed: asset.size
    }
    if (src) {
      asset.size.gzip = getGzipSize(src)
    } else {
      asset.size.gzip = 0
    }
  })
}

function parseBundle (bundleContent) {
  const ast = acorn.parse(bundleContent, {
    sourceType: 'script',
    // I believe in a bright future of ECMAScript!
    // Actually, it's set to `2050` to support the latest ECMAScript version that currently exists.
    // Seems like `acorn` supports such weird option value.
    ecmaVersion: 2050
  })

  const walkState = {
    locations: null,
    expressionStatementDepth: 0
  }

  walk.recursive(
    ast,
    walkState,
    {
      ExpressionStatement (node, state, c) {
        if (state.locations) return

        state.expressionStatementDepth++

        if (
          // Webpack 5 stores modules in the the top-level IIFE
          state.expressionStatementDepth === 1 &&
          ast.body.includes(node) &&
          isIIFE(node)
        ) {
          const fn = getIIFECallExpression(node)

          if (
            // It should not contain neither arguments
            fn.arguments.length === 0 &&
            // ...nor parameters
            fn.callee.params.length === 0
          ) {
            // Modules are stored in the very first variable declaration as hash
            const firstVariableDeclaration = fn.callee.body.body.find(n => n.type === 'VariableDeclaration')

            if (firstVariableDeclaration) {
              for (const declaration of firstVariableDeclaration.declarations) {
                if (declaration.init) {
                  state.locations = getModulesLocations(declaration.init)

                  if (state.locations) {
                    break
                  }
                }
              }
            }
          }
        }

        if (!state.locations) {
          c(node.expression, state)
        }

        state.expressionStatementDepth--
      },
      AssignmentExpression (node, state) {
        if (state.locations) return

        // Modules are stored in exports.modules:
        // exports.modules = {};
        const { left, right } = node

        if (
          left &&
          left.object && left.object.name === 'exports' &&
          left.property && left.property.name === 'modules' &&
          isModulesHash(right)
        ) {
          state.locations = getModulesLocations(right)
        }
      },
      CallExpression (node, state, c) {
        if (state.locations) return

        const args = node.arguments

        // Main chunk with webpack loader.
        // Modules are stored in first argument:
        // (function (...) {...})(<modules>)
        if (
          node.callee.type === 'FunctionExpression' &&
          !node.callee.id &&
          args.length === 1 &&
          isSimpleModulesList(args[0])
        ) {
          state.locations = getModulesLocations(args[0])
          return
        }

        // Async Webpack < v4 chunk without webpack loader.
        // webpackJsonp([<chunks>], <modules>, ...)

        // As function name may be changed with `output.jsonpFunction` option we can't rely on it's default name.
        if (
          node.callee.type === 'Identifier' &&
          mayBeAsyncChunkArguments(args) &&
          isModulesList(args[1])
        ) {
          state.locations = getModulesLocations(args[1])
          return
        }

        // Async Webpack v4 chunk without webpack loader.
        // (window.webpackJsonp=window.webpackJsonp||[]).push([[<chunks>], <modules>, ...]);
        // As function name may be changed with `output.jsonpFunction` option we can't rely on it's default name.
        if (isAsyncChunkPushExpression(node)) {
          state.locations = getModulesLocations(args[0].elements[1])
          return
        }

        // Webpack v4 WebWorkerChunkTemplatePlugin
        // globalObject.chunkCallbackName([<chunks>],<modules>, ...);
        // Both globalObject and chunkCallbackName can be changed through the config, so we can't check them.
        if (isAsyncWebWorkerChunkExpression(node)) {
          state.locations = getModulesLocations(args[1])
          return
        }

        // Walking into arguments because some of plugins (e.g. `DedupePlugin`) or some Webpack
        // features (e.g. `umd` library output) can wrap modules list into additional IIFE.
        args.forEach(arg => c(arg, state))
      }
    }
  )

  let modules

  if (walkState.locations) {
    modules = mapValues(walkState.locations,
      loc => bundleContent.slice(loc.start, loc.end)
    )
  } else {
    modules = {}
  }

  return {
    modules: modules,
    src: bundleContent,
    runtimeSrc: getBundleRuntime(bundleContent, walkState.locations)
  }
}

function getGzipSize (buffer) {
  return zlib.gzipSync(buffer).length
}

/**
 * Returns bundle source except modules
 */
function getBundleRuntime (content, modulesLocations) {
  const sortedLocations = Object.values(modulesLocations || {})
    .sort((a, b) => a.start - b.start)

  let result = ''
  let lastIndex = 0

  for (const { start, end } of sortedLocations) {
    result += content.slice(lastIndex, start)
    lastIndex = end
  }

  return result + content.slice(lastIndex, content.length)
}

function isIIFE (node) {
  return (
    node.type === 'ExpressionStatement' &&
    (
      node.expression.type === 'CallExpression' ||
      (node.expression.type === 'UnaryExpression' && node.expression.argument.type === 'CallExpression')
    )
  )
}

function getIIFECallExpression (node) {
  if (node.expression.type === 'UnaryExpression') {
    return node.expression.argument
  } else {
    return node.expression
  }
}

function isModulesList (node) {
  return (
    isSimpleModulesList(node) ||
    // Modules are contained in expression `Array([minimum ID]).concat([<module>, <module>, ...])`
    isOptimizedModulesArray(node)
  )
}

function isSimpleModulesList (node) {
  return (
    // Modules are contained in hash. Keys are module ids.
    isModulesHash(node) ||
    // Modules are contained in array. Indexes are module ids.
    isModulesArray(node)
  )
}

function isModulesHash (node) {
  return (
    node.type === 'ObjectExpression' &&
    node.properties
      .map(p => p.value)
      .every(isModuleWrapper)
  )
}

function isModulesArray (node) {
  return (
    node.type === 'ArrayExpression' &&
    node.elements.every(elem =>
      // Some of array items may be skipped because there is no module with such id
      !elem ||
      isModuleWrapper(elem)
    )
  )
}

function isOptimizedModulesArray (node) {
  // Checking whether modules are contained in `Array(<minimum ID>).concat(...modules)` array:
  // https://github.com/webpack/webpack/blob/v1.14.0/lib/Template.js#L91
  // The `<minimum ID>` + array indexes are module ids
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    // Make sure the object called is `Array(<some number>)`
    node.callee.object.type === 'CallExpression' &&
    node.callee.object.callee.type === 'Identifier' &&
    node.callee.object.callee.name === 'Array' &&
    node.callee.object.arguments.length === 1 &&
    isNumericId(node.callee.object.arguments[0]) &&
    // Make sure the property X called for `Array(<some number>).X` is `concat`
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'concat' &&
    // Make sure exactly one array is passed in to `concat`
    node.arguments.length === 1 &&
    isModulesArray(node.arguments[0])
  )
}

function isModuleWrapper (node) {
  return (
    // It's an anonymous function expression that wraps module
    ((node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') && !node.id) ||
    // If `DedupePlugin` is used it can be an ID of duplicated module...
    isModuleId(node) ||
    // or an array of shape [<module_id>, ...args]
    (node.type === 'ArrayExpression' && node.elements.length > 1 && isModuleId(node.elements[0]))
  )
}

function isModuleId (node) {
  return (node.type === 'Literal' && (isNumericId(node) || typeof node.value === 'string'))
}

function isNumericId (node) {
  return (node.type === 'Literal' && Number.isInteger(node.value) && node.value >= 0)
}

function isChunkIds (node) {
  // Array of numeric or string ids. Chunk IDs are strings when NamedChunksPlugin is used
  return (
    node.type === 'ArrayExpression' &&
    node.elements.every(isModuleId)
  )
}

function isAsyncChunkPushExpression (node) {
  const {
    callee,
    arguments: args
  } = node

  return (
    callee.type === 'MemberExpression' &&
    callee.property.name === 'push' &&
    callee.object.type === 'AssignmentExpression' &&
    args.length === 1 &&
    args[0].type === 'ArrayExpression' &&
    mayBeAsyncChunkArguments(args[0].elements) &&
    isModulesList(args[0].elements[1])
  )
}

function mayBeAsyncChunkArguments (args) {
  return (
    args.length >= 2 &&
    isChunkIds(args[0])
  )
}

function isAsyncWebWorkerChunkExpression (node) {
  const { callee, type, arguments: args } = node

  return (
    type === 'CallExpression' &&
    callee.type === 'MemberExpression' &&
    args.length === 2 &&
    isChunkIds(args[0]) &&
    isModulesList(args[1])
  )
}

function getModulesLocations (node) {
  if (node.type === 'ObjectExpression') {
    // Modules hash
    const modulesNodes = node.properties

    return modulesNodes.reduce((result, moduleNode) => {
      const moduleId = moduleNode.key.name || moduleNode.key.value

      result[moduleId] = getModuleLocation(moduleNode.value)
      return result
    }, {})
  }

  const isOptimizedArray = (node.type === 'CallExpression')

  if (node.type === 'ArrayExpression' || isOptimizedArray) {
    // Modules array or optimized array
    const minId = isOptimizedArray
      // Get the [minId] value from the Array() call first argument literal value
      ? node.callee.object.arguments[0].value
      // `0` for simple array
      : 0
    const modulesNodes = isOptimizedArray
      // The modules reside in the `concat()` function call arguments
      ? node.arguments[0].elements
      : node.elements

    return modulesNodes.reduce((result, moduleNode, i) => {
      if (moduleNode) {
        result[i + minId] = getModuleLocation(moduleNode)
      }
      return result
    }, {})
  }

  return {}
}

function getModuleLocation (node) {
  return { start: node.start, end: node.end }
}
