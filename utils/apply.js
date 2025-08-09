const fs = require('fs')
const path = require('path')
const { replaceBuffer } = require('../utils')
const CONFIG = require('../config.js')

const { tableFile, refDir, destDir, refROM, destROM } = CONFIG
applyChanges(tableFile, refDir, destDir, refROM, destROM)

function applyChanges(tableFile, refDir, destDir, refROM, destROM) {
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
            const { jpHex, cnHex } = item
            const jpBuf = Buffer.from(jpHex.replaceAll(' ', ''), 'hex')
            const cnBuf = Buffer.from(cnHex.replaceAll(' ', ''), 'hex')
            buffer = replaceBuffer(buffer, jpBuf, cnBuf)
        }
        fs.writeFileSync(destPath, buffer)
    }
    console.log(`０５．已将表格文件的修改从 ${refDir} 应用到 ${destDir}`)
    if (refROM && destROM) {
        updateROMFile(refDir, destDir, refROM, destROM)
        console.log(`已将修改应用到 ${destROM} 文件`)
    }
}

function updateROMFile(refDir, destDir, refROM, destROM) {
    const files = fs.readdirSync(refDir)
    let buffer = fs.readFileSync(refROM)
    for (const file of files) {
        const refPath = path.join(refDir, file)
        const targetPath = path.join(destDir, file)
        const refBuf = fs.readFileSync(refPath)
        const targetBuf = fs.readFileSync(targetPath)
        buffer = replaceBuffer(buffer, refBuf, targetBuf)
    }
    fs.writeFileSync(destROM, buffer)
}