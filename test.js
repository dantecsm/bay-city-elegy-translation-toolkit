const fs = require('fs')
const path = require('path')
const iconv = require('iconv-lite')

const gtInputDir = 'gt_input'
const gtOutputDir = 'gt_output'
const nameSet = new Set()

// 读取 gt_input 目录下所有文件
const inputFiles = fs.readdirSync(gtInputDir)

inputFiles.forEach(file => {
    const inputPath = path.join(gtInputDir, file)
    const outputPath = path.join(gtOutputDir, file)
    if (!fs.existsSync(outputPath)) {
        console.warn(`未找到输出文件: ${outputPath}`)
        return
    }
    // 读取输入和输出文件
    const inputArr = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
    const outputArr = JSON.parse(fs.readFileSync(outputPath, 'utf8'))

    // 遍历输出数组，为每个成员添加原名和原文字段
    for (let i = 0; i < outputArr.length; i++) {
        const a = inputArr[i]
        const b = outputArr[i]
        // 处理 a 可能没有 name 字段的情况
        b['原名'] = a.hasOwnProperty('name') ? a.name : ''
        b['原文'] = a.message

        if (a.name) nameSet.add(a.name)
    }

    // 写回输出文件
    fs.writeFileSync(outputPath, JSON.stringify(outputArr, null, 2), 'utf8')
    console.log(`已处理: ${file}`)
})
// console.log(Array.from(nameSet))

// const names = ['愛音', '山崎', '東山', '菅原', ' 悠 ', '(声)', '美夏', ' 客 ', '神緒', 'レポーターＢ', 'レポーターＡ', 'レポーターＣ',
//     '藤島', '恵子', '希子', ' 仁 ', ' 悠 ・希子', '客Ａ', '客Ｂ', '万里子', ' 丈 ', 'ダフ屋', '親衛隊々長', '親衛隊たち', '梨奈',
//     '守衛', '運転手', '悠', '司会', '運転手(声)', '吉川(声)', '吉川', '神緒・美夏', '神緒・美夏・梨奈・恵子・希子'
// ]
// const regs = names.map(name => {
//     const hexStr = name.split('').map(char => {
//         if (char === ' ') return '212000'
//         const buf = iconv.encode(char, 'sjis')
//         const hexs = buf.toString('hex')
//         return hexs
//     }).join('')
//     // 把 hexStr 从形如 '8ee7' 改为 '\x8e\xe7' 格式
//     const regStr = hexStr.replace(/([0-9a-fA-F]{2})/g, '\\x$1')
//     return regStr
// })
// console.log(regs)
// const Rs = regs.map(reg => `(${reg}\\x81\\x75[\\s\\S]+?\\x81\\x76|${reg}\\x81\\x71[\\s\\S]+?\\x81\\x72)`)
// const REG_JP_HEX = new RegExp(Rs.join('|'), 'g')
// console.log(REG_JP_HEX)

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