const getModulePath = function (identifier) {
  return identifier.replace(/.*!/, '').replace(/\\/g, '/')
}

export function buildDepModules (modules) {
  const deps = new Map()
  for (const module of modules) {
    const path = getModulePath(module.identifier)
    const pathParts = path.split('/node_modules/')
    if (pathParts.length === 2) {
      let name = pathParts[1]
      if (name.charAt(0) === '@') {
        // Scoped package
        name = name.substr(0, name.indexOf('/', name.indexOf('/') + 1))
      } else {
        name = name.substr(0, name.indexOf('/'))
      }
      let dep = deps.get(name)
      if (!dep) {
        dep = {
          name,
          size: 0
        }
        deps.set(name, dep)
      }
      dep.size += module.size
    }
  }
  let list = Array.from(deps.values())
  list = list.sort((a, b) => b.size - a.size)
  if (list.length) {
    const max = list[0].size
    for (const dep of list) {
      dep.ratio = dep.size / max
    }
  }
  return list
}
