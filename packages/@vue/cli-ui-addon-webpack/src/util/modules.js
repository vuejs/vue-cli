const getModulePath = function (identifier) {
  return identifier.replace(/.*!/, '').replace(/\\/g, '/')
}

export function filterModules (modules) {
  return modules.filter(module => module.name.indexOf('(webpack)') === -1)
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

/*
{
  id: './node_modules',
  size: {
    disk: 1024,
    gzip: 400
  }
  fullPath: '/node_modules',
  parent: undefined,
  children: [
    {
      id: 'vuex',
      identifier: '...',
      size: {
        disk: 42,
        gzip: 12
      },
      // Total size of previous children in list
      previousSize: {
        disk: 0,
        gzip: 0
      },
      fullPath: '/node_modules/vuex',
      children: [
        ...
      ],
      parent: ...
    },
    ...
  ]
}
*/

export function buildModulesTrees (modules) {
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
            disk: 0,
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
              disk: 0,
              gzip: 0
            },
            fullPath: fullPath.join('/'),
            children: {},
            parent: subtree
          }
        }
        child.size.disk += module.size
        child.size.gzip += module.gzipSize || 0
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
    walkTreeToSortChildren(tree)
    trees[n] = tree
  }

  return trees
}

function walkTreeToSortChildren (tree) {
  let size = {
    disk: 0,
    gzip: 0
  }
  tree.children = Object.keys(tree.children).map(
    key => tree.children[key]
  ).sort((a, b) => b.size.gzip - a.size.gzip)
  for (const child of tree.children) {
    child.previousSize = {
      disk: size.disk,
      gzip: size.gzip
    }
    size.disk += child.size.disk
    size.gzip += child.size.gzip
    walkTreeToSortChildren(child)
  }
}
