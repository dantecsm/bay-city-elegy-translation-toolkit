const fs = require('fs')
const path = require('path')
const CONFIG = require('../config.js')

const { tableFile, gtOutputDir, nameAndMessage2Text } = CONFIG
importCN(tableFile, gtOutputDir)

function importCN(tableFile, gtOutputDir) {
    if (!fs.existsSync(gtOutputDir)) {
        throw `找不到 ${gtOutputDir} 目录`
    }
    const table = JSON.parse(fs.readFileSync(tableFile))
    const files = fs.readdirSync(gtOutputDir)
    for (const file of files) {
        const filePath = path.join(gtOutputDir, file)
        const data = JSON.parse(fs.readFileSync(filePath))
        const key = file.replace('.json', '')
        const items = table.filter(item => item.file === key)
        items.forEach((item, idx) => {
            const { 原名, 原文, name, message, problem } = data[idx]
            const { jp, cn } = item
            const jpText = nameAndMessage2Text({name: 原名, message: 原文}, jp)
            if (jp !== jpText) {
                throw `${key} 文件的 ${jp} 和 ${gtOutputDir} 结果算出的 ${jpText} 不匹配`
            }
            const cnText = nameAndMessage2Text({name, message}, jp)
            item.cn = cnText
            delete item.problem
            item.problem = problem
        })
    }
    fs.writeFileSync(tableFile, JSON.stringify(table, null, 2))
    console.log(`０３．导入 ${gtOutputDir} 到 ${tableFile} 完成`)
}
