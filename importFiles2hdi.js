const fs = require('fs')
const path = require('path')
const FatImage = require('./utils/replaceHdiFile')

const lang = process.argv[2] === 'en' ? 'en' : 'cn'

const hdiFile = lang === 'en' ? "Bay City Elegy_EN.hdi" : "J:/PC98 Files/Bay City Elegy_CN.hdi"
const bootSectorOffset = 0x9400
const newFilesDir = lang === 'en' ? 'RB_EN_MES' : 'RB_CN_MES'
const targetPathPrefix = '//YOKOHAMA/RB_MES/'

const newFiles = fs.readdirSync(newFilesDir)
const img = new FatImage(hdiFile, bootSectorOffset)
for (const newFile of newFiles) {
    const newFilePath = path.join(newFilesDir, newFile)
    const newFileBuffer = fs.readFileSync(newFilePath)
    const targetPath = `${targetPathPrefix}${newFile}`
    img.replaceFile(targetPath, newFileBuffer)
}
img.close()
console.log(`０６．已将翻译后的文件导入到 ${hdiFile}`)
