const fs = require('fs')
const path = require('path')
const { buffer2Hex } = require('../utils')
const CONFIG = require('../config.js')

const { tableFile, refDir, REG_JP_HEX, simplifyJpHex,jpHex2Jp } = CONFIG
createTable(tableFile, refDir, REG_JP_HEX, simplifyJpHex, jpHex2Jp)

function createTable(tableFile, refDir, REG_JP_HEX, simplifyJpHex, jpHex2Jp) {
    const table = []
    const files = fs.readdirSync(refDir)
    for (const file of files) {
        const filePath = path.join(refDir, file)
        const buffer = fs.readFileSync(filePath)
        const latin1 = buffer.toString('latin1')
        const matches = latin1.match(REG_JP_HEX) || []
        if (matches.length === 0) {
            console.log(`warning: ${file} 没有匹配到任何文本`)
            continue
        }
        for (const match of matches) {
            const buf = Buffer.from(match, 'latin1')
            let jpHex = buffer2Hex(buf)
            jpHex = simplifyJpHex(jpHex)
            const jp = jpHex2Jp(jpHex)
            const item = {
                file,
                jpHex,
                cnHex: '',
                jp,
                cn: ''
            }
            table.push(item)
        }
    }
    fs.writeFileSync(tableFile, JSON.stringify(table, null, 2))
    console.log(`０１．成功创建 ${tableFile} 文件`)
}