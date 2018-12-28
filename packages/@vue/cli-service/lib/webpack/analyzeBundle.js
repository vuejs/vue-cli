// From https://github.com/webpack-contrib/webpack-bundle-analyzer/blob/ba3dbd71cec7becec0fbf529833204425f66efde/src/parseUtils.js
// Modified by Guillaume Chau (Akryum)

const acorn = require('acorn')
const walk = require('acorn-walk')
const mapValues = require('lodash.mapvalues')
const transform = require('lodash.transform')
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
      bundleInfo = null
    }

    if (!bundleInfo) {
      warn(
        `\nCouldn't parse bundle asset "${asset.fullPath}".\n` +
        'Analyzer will use module sizes from stats file.\n'
      )
      parsedModules = null
      bundlesSources = null
      break
    }

    bundlesSources[asset.name] = bundleInfo.src
    Object.assign(parsedModules, bundleInfo.modules)
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
    locations: null
  }

  walk.recursive(
    ast,
    walkState,
    {
      CallExpression (node, state, c) {
        if (state.sizes) return

        const args = node.arguments

        // Additional bundle without webpack loader.
        // Modules are stored in second argument, after chunk ids:
        // webpackJsonp([<chunks>], <modules>, ...)
        // As function name may be changed with `output.jsonpFunction` option we can't rely on it's default name.
        if (
          node.callee.type === 'Identifier' &&
          args.length >= 2 &&
          isArgumentContainsChunkIds(args[0]) &&
          isArgumentContainsModulesList(args[1])
        ) {
          state.locations = getModulesLocationFromFunctionArgument(args[1])
          return
        }

        // Additional bundle without webpack loader, with module IDs optimized.
        // Modules are stored in second arguments Array(n).concat() call
        // webpackJsonp([<chunks>], Array([minimum ID]).concat([<module>, <module>, ...]))
        // As function name may be changed with `output.jsonpFunction` option we can't rely on it's default name.
        if (
          node.callee.type === 'Identifier' &&
          (args.length === 2 || args.length === 3) &&
          isArgumentContainsChunkIds(args[0]) &&
          isArgumentArrayConcatContainingChunks(args[1])
        ) {
          state.locations = getModulesLocationFromArrayConcat(args[1])
          return
        }

        // Main bundle with webpack loader
        // Modules are stored in first argument:
        // (function (...) {...})(<modules>)
        if (
          node.callee.type === 'FunctionExpression' &&
          !node.callee.id &&
          args.length === 1 &&
          isArgumentContainsModulesList(args[0])
        ) {
          state.locations = getModulesLocationFromFunctionArgument(args[0])
          return
        }

        // Additional bundles with webpack 4 are loaded with:
        // (window.webpackJsonp=window.webpackJsonp||[]).push([[chunkId], [<module>, <module>], [[optional_entries]]]);
        if (
          isWindowPropertyPushExpression(node) &&
          args.length === 1 &&
          isArgumentContainingChunkIdsAndModulesList(args[0])
        ) {
          state.locations = getModulesLocationFromFunctionArgument(args[0].elements[1])
          return
        }

        // Walking into arguments because some of plugins (e.g. `DedupePlugin`) or some Webpack
        // features (e.g. `umd` library output) can wrap modules list into additional IIFE.
        args.forEach(arg => c(arg, state))
      }
    }
  )

  if (!walkState.locations) {
    return null
  }

  return {
    src: bundleContent,
    modules: mapValues(walkState.locations,
      loc => bundleContent.slice(loc.start, loc.end)
    )
  }
}

function getGzipSize (buffer) {
  return zlib.gzipSync(buffer).length
}

function isArgumentContainsChunkIds (arg) {
  // Array of numeric or string ids. Chunk IDs are strings when NamedChunksPlugin is used
  return (arg.type === 'ArrayExpression' && arg.elements.every(isModuleId))
}

function isArgumentContainsModulesList (arg) {
  if (arg.type === 'ObjectExpression') {
    return arg.properties
      .map(arg => arg.value)
      .every(isModuleWrapper)
  }

  if (arg.type === 'ArrayExpression') {
    // Modules are contained in array.
    // Array indexes are module ids
    return arg.elements.every(elem =>
      // Some of array items may be skipped because there is no module with such id
      !elem ||
      isModuleWrapper(elem)
    )
  }

  return false
}

function isArgumentContainingChunkIdsAndModulesList (arg) {
  if (
    arg.type === 'ArrayExpression' &&
    arg.elements.length >= 2 &&
    isArgumentContainsChunkIds(arg.elements[0]) &&
    isArgumentContainsModulesList(arg.elements[1])
  ) {
    return true
  }
  return false
}

function isArgumentArrayConcatContainingChunks (arg) {
  if (
    arg.type === 'CallExpression' &&
    arg.callee.type === 'MemberExpression' &&
    // Make sure the object called is `Array(<some number>)`
    arg.callee.object.type === 'CallExpression' &&
    arg.callee.object.callee.type === 'Identifier' &&
    arg.callee.object.callee.name === 'Array' &&
    arg.callee.object.arguments.length === 1 &&
    isNumericId(arg.callee.object.arguments[0]) &&
    // Make sure the property X called for `Array(<some number>).X` is `concat`
    arg.callee.property.type === 'Identifier' &&
    arg.callee.property.name === 'concat' &&
    // Make sure exactly one array is passed in to `concat`
    arg.arguments.length === 1 &&
    arg.arguments[0].type === 'ArrayExpression'
  ) {
    // Modules are contained in `Array(<minimum ID>).concat(` array:
    // https://github.com/webpack/webpack/blob/v1.14.0/lib/Template.js#L91
    // The `<minimum ID>` + array indexes are module ids
    return true
  }

  return false
}

function isWindowPropertyPushExpression (node) {
  return node.callee.type === 'MemberExpression' &&
    node.callee.property.name === 'push' &&
    node.callee.object.type === 'AssignmentExpression' &&
    node.callee.object.left.object.name === 'window'
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

function getModulesLocationFromFunctionArgument (arg) {
  if (arg.type === 'ObjectExpression') {
    const modulesNodes = arg.properties

    return transform(modulesNodes, (result, moduleNode) => {
      const moduleId = moduleNode.key.name || moduleNode.key.value

      result[moduleId] = getModuleLocation(moduleNode.value)
    }, {})
  }

  if (arg.type === 'ArrayExpression') {
    const modulesNodes = arg.elements

    return transform(modulesNodes, (result, moduleNode, i) => {
      if (!moduleNode) return

      result[i] = getModuleLocation(moduleNode)
    }, {})
  }

  return {}
}

function getModulesLocationFromArrayConcat (arg) {
  // arg(CallExpression) =
  //   Array([minId]).concat([<minId module>, <minId+1 module>, ...])
  //
  // Get the [minId] value from the Array() call first argument literal value
  const minId = arg.callee.object.arguments[0].value
  // The modules reside in the `concat()` function call arguments
  const modulesNodes = arg.arguments[0].elements

  return transform(modulesNodes, (result, moduleNode, i) => {
    if (!moduleNode) return

    result[i + minId] = getModuleLocation(moduleNode)
  }, {})
}

function getModuleLocation (node) {
  return { start: node.start, end: node.end }
}
