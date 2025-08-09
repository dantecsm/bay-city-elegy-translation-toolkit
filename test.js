const fs = require('fs')
const path = require('path')

const gtInputDir = 'gt_input'
const gtOutputDir = 'gt_output'

// 读取 gt_input 目录下所有文件
const inputFiles = fs.readdirSync(gtInputDir)

// inputFiles.forEach(file => {
//     const inputPath = path.join(gtInputDir, file)
//     const outputPath = path.join(gtOutputDir, file)
//     if (!fs.existsSync(outputPath)) {
//         console.warn(`未找到输出文件: ${outputPath}`)
//         return
//     }
//     // 读取输入和输出文件
//     const inputArr = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
//     const outputArr = JSON.parse(fs.readFileSync(outputPath, 'utf8'))

//     // 遍历输出数组，为每个成员添加原名和原文字段
//     for (let i = 0; i < outputArr.length; i++) {
//         const a = inputArr[i]
//         const b = outputArr[i]
//         // 处理 a 可能没有 name 字段的情况
//         b['原名'] = a.hasOwnProperty('name') ? a.name : ''
//         b['原文'] = a.message
//     }

//     // 写回输出文件
//     fs.writeFileSync(outputPath, JSON.stringify(outputArr, null, 2), 'utf8')
//     console.log(`已处理: ${file}`)    
// })

const jpMESDir = 'RB_MES'
const cnMESDir = 'RB_CN_MES'
const files = fs.readdirSync(jpMESDir)

files.forEach(file => {
    const jpFile = path.join(jpMESDir, file)
    const cnFile = path.join(cnMESDir, file)

    const jpStat = fs.statSync(jpFile)
    const cnStat = fs.statSync(cnFile)
    if (jpStat.size !== cnStat.size) {
        console.log(`文件大小不一致: ${file}，日文文件大小: ${jpStat.size}，中文文件大小: ${cnStat.size}`)
    }
})