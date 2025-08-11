const fs = require('fs')
const CONFIG = require('../config.js')

const { enTableFile: tableFile, en2EnHex } = CONFIG
updateEnHex(tableFile, en2EnHex)

function updateEnHex(tableFile, en2EnHex) {
    const table = JSON.parse(fs.readFileSync(tableFile))
    for (const item of table) {
        const { en, jp, jpHex } = item
        if (en !== jp) {
            let enHex = en2EnHex(en, jpHex)
            item.enHex = enHex
        } else {
            item.enHex = jpHex
        }
    }
    fs.writeFileSync(tableFile, JSON.stringify(table, null, 2))
    console.log(`０４．${tableFile} 的 enHex 列更新完成`)
}
