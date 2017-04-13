const fs = require('fs')
const path = require('path')

function dirTree(filename) {
  const stats = fs.lstatSync(filename)
  const info = {
    path: filename,
    name: path.basename(filename)
  }
  if (stats.isDirectory()) {
    info.type = 'folder'
    info.children = fs.readdirSync(filename).map((child) => {
      return dirTree(filename + '/' + child)
    })
  } else {
    info.type = 'file'
  }

  return info
}

if (module.parent === undefined) {
  const util = require('util')
  console.log(util.inspect(dirTree(process.argv[2]), false, null))
}
