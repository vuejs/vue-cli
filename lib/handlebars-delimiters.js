/*!
 * handlebars-delimiters <https://github.com/jonschlinkert/handlebars-delimiters>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

/*!
 * the regExp with global flag will cause issue #2:
 * https://github.com/jonschlinkert/handlebars-delimiters/issues/2
 *
 * Hopefully will fix the bug by PR#6:
 * https://github.com/jonschlinkert/handlebars-delimiters/pull/6
 *
 * Not sure whether the library is maintained regularly
 * So copied ane bug-fixed here by KingMario <gcyyq@hotmail.com>
 *
 * Copyright (c) 2017 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict'

module.exports = function (Handlebars, delims) {
  if (delims[0].indexOf('=') === -1) {
    delims[0] = delims[0] + '(?!=)'
  }

  var re = new RegExp(delims[0] + '([\\s\\S]+?)' + delims[1])

  // Idea for compile method from http://stackoverflow.com/a/19181804/1267639
  if (!Handlebars._compile) {
    Handlebars._compile = Handlebars.compile
  }

  Handlebars.compile = function () {
    var args = [].slice.call(arguments)

    if (typeof args[0] !== 'string') {
      throw new Error('The first argument must be a string.')
    }

    if (delims[0] !== '{{' && delims[1] !== '}}') {
      args[0] = escapeDelims(args[0], delims)
    }

    var match
    while ((match = re.exec(args[0]))) {
      args[0] = args[0].replace(re, '{{' + match[1] + '}}')
    }
    return Handlebars._compile.apply(null, args)
  }
}

var escapeDelims = module.exports.escapeDelims = function (str, delims) {
  var defaults = /\{{([\s\S]+?)}}/g
  var match

  while ((match = defaults.exec(str))) {
    str = str.replace(match[0], '\\{{' + match[1] + '}}')
  }
  return str
}
