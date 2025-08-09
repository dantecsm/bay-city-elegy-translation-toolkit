const fs = require('fs')
const path = require('path')
const CONFIG = require('../config.js')

const { tableFile, cn2CnHex, autoFill } = CONFIG
updateCnHex(tableFile, cn2CnHex, autoFill)

function updateCnHex(tableFile, cn2CnHex, autoFill) {
    const table = JSON.parse(fs.readFileSync(tableFile))
    for (const item of table) {
        const { cn, jpHex } = item
        delete item.hexProblem
        let cnHex = cn2CnHex(cn, jpHex)
        if (autoFill) {
            const { hexProblem, newCnHex } = autoFill(jpHex, cnHex)
            if (hexProblem) {
                item.hexProblem = hexProblem
                cnHex = jpHex
            } else {
                cnHex = newCnHex
            }
            if (jpHex.length !== cnHex.length) {
                throw `日语字节与中文字节数不一致：${jpHex} 不等长 ${cnHex}`
            }
        }
        item.cnHex = cnHex
    }
    fs.writeFileSync(tableFile, JSON.stringify(table, null, 2))
    console.log(`０４．${tableFile} 的 cnHex 列更新完成`)
}
