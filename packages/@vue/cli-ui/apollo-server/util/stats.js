const stats = new Map()

exports.get = (type, id) => {
  let dic = stats.get(type)
  if (!dic) {
    dic = new Map()
    stats.set(type, dic)
  }
  let stat = dic.get(id)
  if (!stat) {
    stat = {
      value: 0
    }
    dic.set(id, stat)
  }
  return stat
}
