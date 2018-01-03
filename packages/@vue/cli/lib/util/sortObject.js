module.exports = function sortObject (obj, keyOrder) {
  if (!obj) return
  const res = {}
  const keys = Object.keys(obj)
  const getOrder = key => {
    const i = keyOrder.indexOf(key)
    return i === -1 ? Infinity : i
  }
  if (keyOrder) {
    keys.sort((a, b) => {
      return getOrder(a) - getOrder(b)
    })
  } else {
    keys.sort()
  }
  keys.forEach(key => {
    res[key] = obj[key]
  })
  return res
}
