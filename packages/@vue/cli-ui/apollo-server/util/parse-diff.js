// From https://github.com/sergeyt/parse-diff
module.exports = function (input) {
  if (!input) { return [] }
  if (input.match(/^\s+$/)) { return [] }

  const lines = input.split('\n')
  if (lines.length === 0) { return [] }

  const files = []
  let file = null
  let lnDel = 0
  let lnAdd = 0
  let current = null

  const start = function (line) {
    file = {
      chunks: [],
      deletions: 0,
      additions: 0
    }
    files.push(file)

    if (!file.to && !file.from) {
      const fileNames = parseFile(line)

      if (fileNames) {
        file.from = fileNames[0]
        file.to = fileNames[1]
      }
    }
  }

  const restart = function () {
    if (!file || file.chunks.length) { return start() }
  }

  const newFile = function () {
    restart()
    file.new = true
    file.from = '/dev/null'
  }

  const deletedFile = function () {
    restart()
    file.deleted = true
    file.to = '/dev/null'
  }

  const index = function (line) {
    restart()
    file.index = line.split(' ').slice(1)
  }

  const fromFile = function (line) {
    restart()
    file.from = parseFileFallback(line)
  }

  const toFile = function (line) {
    restart()
    file.to = parseFileFallback(line)
  }

  const binary = function (line) {
    file.binary = true
  }

  const chunk = function (line, match) {
    let newStart, oldStart
    lnDel = (oldStart = +match[1])
    const oldLines = +(match[2] || 0)
    lnAdd = (newStart = +match[3])
    const newLines = +(match[4] || 0)
    current = {
      content: line,
      changes: [],
      oldStart,
      oldLines,
      newStart,
      newLines
    }
    file.chunks.push(current)
  }

  const del = function (line) {
    if (!current) return
    current.changes.push({ type: 'del', del: true, ln: lnDel++, content: line })
    file.deletions++
  }

  const add = function (line) {
    if (!current) return
    current.changes.push({ type: 'add', add: true, ln: lnAdd++, content: line })
    file.additions++
  }

  const normal = function (line) {
    if (!current) return
    current.changes.push({
      type: 'normal',
      normal: true,
      ln1: lnDel++,
      ln2: lnAdd++,
      content: line
    })
  }

  const eof = function (line) {
    const recentChange = current.changes[current.changes.length - 1]

    return current.changes.push({
      type: recentChange.type,
      [recentChange.type]: true,
      ln1: recentChange.ln1,
      ln2: recentChange.ln2,
      ln: recentChange.ln,
      content: line
    })
  }

  const schema = [
    // todo beter regexp to avoid detect normal line starting with diff
    [/^\s+/, normal],
    [/^diff\s/, start],
    [/^new file mode \d+$/, newFile],
    [/^deleted file mode \d+$/, deletedFile],
    [/^Binary files/, binary],
    [/^index\s[\da-zA-Z]+\.\.[\da-zA-Z]+(\s(\d+))?$/, index],
    [/^---\s/, fromFile],
    [/^\+\+\+\s/, toFile],
    [/^@@\s+-(\d+),?(\d+)?\s+\+(\d+),?(\d+)?\s@@/, chunk],
    [/^-/, del],
    [/^\+/, add],
    [/^\\ No newline at end of file$/, eof]
  ]

  const parse = function (line) {
    for (let p of schema) {
      const m = line.match(p[0])
      if (m) {
        p[1](line, m)
        return true
      }
    }
    return false
  }

  for (let line of lines) {
    parse(line)
  }

  return files
}

function parseFile (s) {
  if (!s) return

  const result = /\sa\/(.*)\sb\/(.*)/.exec(s)

  return [result[1], result[2]]
}

// fallback function to overwrite file.from and file.to if executed
function parseFileFallback (s) {
  s = ltrim(s, '-')
  s = ltrim(s, '+')
  s = s.trim()
  // ignore possible time stamp
  const t = (/\t.*|\d{4}-\d\d-\d\d\s\d\d:\d\d:\d\d(.\d+)?\s(\+|-)\d\d\d\d/).exec(s)
  if (t) { s = s.substring(0, t.index).trim() }
  // ignore git prefixes a/ or b/
  if (s.match((/^(a|b)\//))) { return s.substr(2) } else { return s }
}

function ltrim (s, chars) {
  s = makeString(s)
  if (!chars && trimLeft) { return trimLeft.call(s) }
  chars = defaultToWhiteSpace(chars)
  return s.replace(new RegExp(`^${chars}+`), '')
}

const makeString = s => s === null ? '' : s + ''

const { trimLeft } = String.prototype

function defaultToWhiteSpace (chars) {
  if (chars === null) { return '\\s' }
  if (chars.source) { return chars.source }
  return `[${escapeRegExp(chars)}]`
}

const escapeRegExp = s => makeString(s).replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1')
