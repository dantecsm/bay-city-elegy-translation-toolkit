const fs = require('fs')
const path = require('path')
const { replaceBuffer } = require('../utils')
const CONFIG = require('../config.js')

const { enTableFile: tableFile, refDir, enDestDir: destDir } = CONFIG
applyChanges(tableFile, refDir, destDir)

function applyChanges(tableFile, refDir, destDir) {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir)
    }
    const table = JSON.parse(fs.readFileSync(tableFile))
    const files = fs.readdirSync(refDir)
    for (const file of files) {
        const refPath = path.join(refDir, file)
        const destPath = path.join(destDir, file)
        let buffer = fs.readFileSync(refPath)
        const items = table.filter(item => item.file === file)
        for (const item of items) {
            const { jpHex, enHex } = item
            const jpBuf = Buffer.from(jpHex.replaceAll(' ', ''), 'hex')
            const enBuf = Buffer.from(enHex.replaceAll(' ', ''), 'hex')
            buffer = replaceBuffer(buffer, jpBuf, enBuf)
        }
        fs.writeFileSync(destPath, buffer)
    }
    console.log(`０５．已将表格文件的修改从 ${refDir} 应用到 ${destDir}`)
}
