const dirToJson = require('dir-to-json')
const interfaceNames = ['eth', 'miner', 'net', 'web3']
const fs = require('fs')

const fileLines = ['const interfaces = {}']

interfaceNames.forEach((interfaceName) => {
  fileLines.push(`interfaces.${interfaceName} = {}`)
  dirToJson(`./lib/interfaces/${interfaceName}`, (err, dirTree) => {
    if (err) {
      throw err
    } else {
      dirTree.children.forEach((child) => {
        const fileName = child.name
        if (fileName.indexOf('.js') === -1) { return }
        const methodName = child.name = fileName.split('.js')[0]
        const path = `./interfaces/${interfaceName}/${fileName}`
        fileLines.push(`interfaces.${interfaceName}.${methodName} = require('${path}')`)
      })
      done()
    }
  })
})

let i = 0
function done() {
  i ++
  if (i === interfaceNames.length) {
    try {
      fileLines.push('module.exports = interfaces')
      fs.writeFileSync('./lib/interfacesPojo.js', fileLines.join('\r\n'))
    } catch(_err) {
      console.log(_err)
    }
  }
}
