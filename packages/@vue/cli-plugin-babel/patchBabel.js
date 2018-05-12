/* eslint-disable */

const mod = require('@babel/core/lib/transformation/file/generate')

function _convertSourceMap () {
  var data = _interopRequireDefault(require('convert-source-map'))

  _convertSourceMap = function _convertSourceMap () {
    return data
  }

  return data
}

function _generator () {
  var data = _interopRequireDefault(require('@babel/generator'))

  _generator = function _generator () {
    return data
  }

  return data
}

function _interopRequireDefault (obj) { return obj && obj.__esModule ? obj : { default: obj } }

mod.default = function generateCode (pluginPasses, file) {
  var opts = file.opts,
    ast = file.ast,
    shebang = file.shebang,
    code = file.code,
    inputMap = file.inputMap
  var results = []

  for (var _iterator = pluginPasses, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator](); ;) {
    var _ref

    if (_isArray) {
      if (_i >= _iterator.length) break
      _ref = _iterator[_i++]
    } else {
      _i = _iterator.next()
      if (_i.done) break
      _ref = _i.value
    }

    var plugins = _ref

    for (var _iterator2 = plugins, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator](); ;) {
      var _ref2

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break
        _ref2 = _iterator2[_i2++]
      } else {
        _i2 = _iterator2.next()
        if (_i2.done) break
        _ref2 = _i2.value
      }

      var plugin = _ref2
      var generatorOverride = plugin.generatorOverride

      if (generatorOverride) {
        var _result2 = generatorOverride(ast, opts.generatorOpts, code, _generator().default)

        if (_result2 !== undefined) results.push(_result2)
      }
    }
  }

  var result

  if (results.length === 0) {
    result = (0, _generator().default)(ast, opts.generatorOpts, code)
  } else if (results.length === 1) {
    result = results[0]

    if (typeof result.then === 'function') {
      throw new Error('You appear to be using an async parser plugin, ' + 'which your current version of Babel does not support. ' + "If you're using a published plugin, " + 'you may need to upgrade your @babel/core version.')
    }
  } else {
    throw new Error('More than one plugin attempted to override codegen.')
  }

  var _result = result,
    outputCode = _result.code,
    outputMap = _result.map

  if (shebang) {
    outputCode = shebang + '\n' + outputCode
  }

  if (outputMap && inputMap) {
    outputMap = mergeSourceMap(inputMap.toObject(), outputMap)
  }

  if (opts.sourceMaps === 'inline' || opts.sourceMaps === 'both') {
    outputCode += '\n' + _convertSourceMap().default.fromObject(outputMap).toComment()
  }

  if (opts.sourceMaps === 'inline') {
    outputMap = null
  }

  return {
    outputCode: outputCode,
    outputMap: outputMap
  }
}

//

const sourceMap = require('source-map')

function mergeSourceMap (
  inputMap,
  map,
) {
  const input = buildMappingData(inputMap)
  const output = buildMappingData(map)

  // Babel-generated maps always map to a single input filename.
  if (output.sources.length !== 1) {
    throw new Error('Assertion failure - expected a single output file')
  }
  const defaultSource = output.sources[0]

  const mergedGenerator = new sourceMap.SourceMapGenerator()
  for (const { source } of input.sources) {
    if (typeof source.content === 'string') {
      mergedGenerator.setSourceContent(source.path, source.content)
    }
  }

  const insertedMappings = new Map()

  // Process each generated range in the input map, e.g. each range over the
  // code that Babel was originally given.
  eachInputGeneratedRange(input, (generated, original, source) => {
    // Then pick out each range over Babel's _output_ that corresponds with
    // the given range on the code given to Babel.
    eachOverlappingGeneratedOutputRange(defaultSource, generated, item => {
      // It's possible that multiple input ranges will overlap the same
      // generated range. Since sourcemap don't traditionally represent
      // generated locations with multiple original locations, we explicitly
      // skip generated locations once we've seen them the first time.
      const key = makeMappingKey(item)
      if (insertedMappings.has(key)) return
      insertedMappings.set(key, item)

      mergedGenerator.addMapping({
        source: source.path,
        original: {
          line: original.line,
          column: original.columnStart
        },
        generated: {
          line: item.line,
          column: item.columnStart
        },
        name: original.name
      })
    })
  })

  // Since mappings are manipulated using single locations, but are interpreted
  // as ranges, the insertions above may not actually have their ending
  // locations mapped yet. Here be go through each one and ensure that it has
  // a well-defined ending location, if one wasn't already created by the start
  // of a different range.
  for (const item of insertedMappings.values()) {
    if (item.columnEnd === Infinity) {
      continue
    }

    const clearItem = {
      line: item.line,
      columnStart: item.columnEnd
    }

    const key = makeMappingKey(clearItem)
    if (insertedMappings.has(key)) {
      continue
    }

    // Insert mappings with no original position to terminate any mappings
    // that were found above, so that they don't expand beyond their correct
    // range.
    mergedGenerator.addMapping({
      generated: {
        line: clearItem.line,
        column: clearItem.columnStart
      }
    })
  }

  const result = mergedGenerator.toJSON()
  // addMapping expects a relative path, and setSourceContent expects an
  // absolute path. To avoid this whole confusion, we leave the root out
  // entirely, and add it at the end here.
  if (typeof input.sourceRoot === 'string') {
    result.sourceRoot = input.sourceRoot
  }
  return result
}

function makeMappingKey (item) {
  return JSON.stringify([item.line, item.columnStart])
}

function eachOverlappingGeneratedOutputRange (
  outputFile,
  inputGeneratedRange,
  callback,
) {
  // Find the Babel-generated mappings that overlap with this range in the
  // input sourcemap. Generated locations within the input sourcemap
  // correspond with the original locations in the map Babel generates.
  const overlappingOriginal = filterApplicableOriginalRanges(
    outputFile,
    inputGeneratedRange,
  )

  for (const { generated } of overlappingOriginal) {
    for (const item of generated) {
      callback(item)
    }
  }
}

function filterApplicableOriginalRanges (
  { mappings },
  { line, columnStart, columnEnd },
) {
  // The mapping array is sorted by original location, so we can
  // binary-search it for the overlapping ranges.
  return filterSortedArray(mappings, ({ original: outOriginal }) => {
    if (line > outOriginal.line) return -1
    if (line < outOriginal.line) return 1

    if (columnStart >= outOriginal.columnEnd) return -1
    if (columnEnd <= outOriginal.columnStart) return 1

    return 0
  })
}

function eachInputGeneratedRange (
  map,
  callback

  ,
) {
  for (const { source, mappings } of map.sources) {
    for (const { original, generated } of mappings) {
      for (const item of generated) {
        callback(item, original, source)
      }
    }
  }
}

function buildMappingData (map) {
  const consumer = new sourceMap.SourceMapConsumer({
    ...map,

    // This is a bit hack. .addMapping expects source values to be relative,
    // but eachMapping returns mappings with absolute paths. To avoid that
    // incompatibility, we leave the sourceRoot out here and add it to the
    // final map at the end instead.
    sourceRoot: null
  })

  const sources = new Map()
  const mappings = new Map()

  let last = null

  consumer.computeColumnSpans()

  consumer.eachMapping(
    m => {
      if (m.originalLine === null) return

      let source = sources.get(m.source)
      if (!source) {
        source = {
          path: m.source,
          content: consumer.sourceContentFor(m.source, true)
        }
        sources.set(m.source, source)
      }

      let sourceData = mappings.get(source)
      if (!sourceData) {
        sourceData = {
          source,
          mappings: []
        }
        mappings.set(source, sourceData)
      }

      const obj = {
        line: m.originalLine,
        columnStart: m.originalColumn,
        columnEnd: Infinity,
        name: m.name
      }

      if (
        last &&
        last.source === source &&
        last.mapping.line === m.originalLine
      ) {
        last.mapping.columnEnd = m.originalColumn
      }

      last = {
        source,
        mapping: obj
      }

      sourceData.mappings.push({
        original: obj,
        generated: consumer
          .allGeneratedPositionsFor({
            source: m.source,
            line: m.originalLine,
            column: m.originalColumn
          })
          .map(item => ({
            line: item.line,
            columnStart: item.column,
            // source-map's lastColumn is inclusive, not exclusive, so we need
            // to add 1 to it.
            columnEnd: item.lastColumn + 1
          }))
      })
    },
    null,
    sourceMap.SourceMapConsumer.ORIGINAL_ORDER,
  )

  return {
    file: map.file,
    sourceRoot: map.sourceRoot,
    sources: Array.from(mappings.values())
  }
}

function findInsertionLocation (
  array,
  callback,
) {
  let left = 0
  let right = array.length
  while (left < right) {
    const mid = Math.floor((left + right) / 2)
    const item = array[mid]

    const result = callback(item)
    if (result === 0) {
      left = mid
      break
    }
    if (result >= 0) {
      right = mid
    } else {
      left = mid + 1
    }
  }

  // Ensure the value is the start of any set of matches.
  let i = left
  if (i < array.length) {
    while (i > 0 && callback(array[i]) >= 0) {
      i--
    }
    return i + 1
  }

  return i
}

function filterSortedArray (
  array,
  callback,
) {
  const start = findInsertionLocation(array, callback)

  const results = []
  for (let i = start; i < array.length && callback(array[i]) === 0; i++) {
    results.push(array[i])
  }

  return results
}
