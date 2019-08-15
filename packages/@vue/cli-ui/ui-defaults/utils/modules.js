const getModulePath = function (identifier) {
  return identifier.replace(/.*!/, '').replace(/\\/g, '/')
}

exports.filterModules = function (modules) {
  return modules.filter(module => module.name.indexOf('(webpack)') === -1)
}

exports.buildSortedModules = function (modules, sizeField) {
  let list = modules.slice()
  if (list.length) {
    list = list.map(module => {
      const size = module.size[sizeField]
      return {
        id: module.id,
        identifier: module.identifier,
        size
      }
    })
    list.sort((a, b) => b.size - a.size)
  }
  return list
}

exports.buildDepModules = function (modules) {
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
  list.sort((a, b) => b.size - a.size)
  if (list.length) {
    const max = list[0].size
    for (const dep of list) {
      dep.ratio = dep.size / max
    }
  }
  return list
}

/*
{
  id: './node_modules',
  size: {
    stats: 1024,
    parsed: 0,
    gzip: 400
  }
  fullPath: '/node_modules',
  children: [
    {
      id: 'vuex',
      identifier: '...',
      size: {
        stats: 42,
        parsed: 0,
        gzip: 12
      },
      // Total size of previous children in list
      previousSize: {
        stats: 0,
        parsed: 0,
        gzip: 0
      },
      fullPath: '/node_modules/vuex',
      children: [
        ...
      ],
    },
    ...
  ]
}
*/

exports.buildModulesTrees = function (modules, sizeType) {
  const trees = {}

  for (const module of modules) {
    const path = getModulePath(module.identifier)
    if (path.indexOf('multi ') === 0) continue
    const parts = path.split('/')
    for (const treeId of module.chunks) {
      let subtree = trees[treeId]
      if (!subtree) {
        subtree = trees[treeId] = {
          id: treeId,
          size: {
            stats: 0,
            parsed: 0,
            gzip: 0
          },
          children: {}
        }
      }
      let fullPath = []
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        let child = subtree.children[part]
        if (!child) {
          fullPath.push(part)
          child = subtree.children[part] = {
            id: part,
            size: {
              stats: 0,
              parsed: 0,
              gzip: 0
            },
            fullPath: fullPath.join('/'),
            children: {}
          }
        }
        child.size.stats += module.size.stats
        child.size.parsed += module.size.parsed || 0
        child.size.gzip += module.size.gzip || 0
        // Leaf
        if (i === parts.length - 1) {
          child.identifier = module.identifier
        }
        subtree = child
      }
    }
  }

  for (const n in trees) {
    let tree = trees[n]
    let keys
    while ((keys = Object.keys(tree.children)).length !== 0 && keys.length === 1) {
      tree = tree.children[keys[0]]
    }
    walkTreeToSortChildren(tree, sizeType)
    trees[n] = tree
  }

  return trees
}

function walkTreeToSortChildren (tree, sizeType) {
  let size = {
    stats: 0,
    parsed: 0,
    gzip: 0
  }
  tree.children = Object.keys(tree.children).map(
    key => tree.children[key]
  ).filter(
    child => child.size.stats > tree.size.stats * 0.01 && child.size.stats > 1024
  ).sort((a, b) => b.size[sizeType] - a.size[sizeType])
  for (const child of tree.children) {
    child.previousSize = {
      stats: size.stats,
      parsed: size.parsed,
      gzip: size.gzip
    }
    size.stats += child.size.stats
    size.parsed += child.size.parsed
    size.gzip += child.size.gzip
    walkTreeToSortChildren(child, sizeType)
  }
}
