const fs = require('fs')
const path = require('path')
const CONFIG = require('../config.js')

const { tableFile, gtInputDir, text2NameAndMessage } = CONFIG
exportJP(tableFile, gtInputDir, text2NameAndMessage)

function exportJP(tableFile, gtInputDir, text2NameAndMessage) {
    if (!fs.existsSync(gtInputDir)) {
        fs.mkdirSync(gtInputDir)
    }
    const table = JSON.parse(fs.readFileSync(tableFile))
    const fileHash = {}
    for (const item of table) {
        const { file, jp } = item
        if (!fileHash[file]) {
            fileHash[file] = []
        }
        const { name, message } = text2NameAndMessage(jp)
        fileHash[file].push({ name, message })
    }
    const files = Object.keys(fileHash)
    for (const file of files) {
        const filePath = path.join(gtInputDir, file + '.json')
        const data = fileHash[file]
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    }
    console.log(`０２．已写入 ${files.length} 个文件到 ${gtInputDir} 目录`)
}
