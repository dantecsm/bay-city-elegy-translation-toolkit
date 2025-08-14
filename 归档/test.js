const fs = require('fs')
const path = require('path')
const iconv = require('iconv-lite')

// const gtInputDir = 'gt_input'
// const gtOutputDir = 'gt_output'
// const nameSet = new Set()

// 读取 gt_input 目录下所有文件
// const inputFiles = fs.readdirSync(gtInputDir)

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

//         if (a.name) nameSet.add(a.name)
//     }

//     // 写回输出文件
//     fs.writeFileSync(outputPath, JSON.stringify(outputArr, null, 2), 'utf8')
//     console.log(`已处理: ${file}`)
// })
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

// const jpMESDir = 'RB_MES'
// const cnMESDir = 'RB_CN_MES'
// const files = fs.readdirSync(jpMESDir)

// files.forEach(file => {
//     const jpFile = path.join(jpMESDir, file)
//     const cnFile = path.join(cnMESDir, file)

//     const jpStat = fs.statSync(jpFile)
//     const cnStat = fs.statSync(cnFile)
//     if (jpStat.size < cnStat.size) {
//         const diff = cnStat.size - jpStat.size
//         console.log(`文件大小不一致: ${file}，中文文件比日文文件大 ${diff} 字节`)
//     }
// })

// const tableFile1 = '../table.json'
// const tableFile2 = '../table2.json'
// const table1 = JSON.parse(fs.readFileSync(tableFile1))
// const table2 = JSON.parse(fs.readFileSync(tableFile2))
// const table2Set = new Set()
// table2.forEach(item => {
//     const key = `${item.file}→${item.jp}`
//     table2Set.add(key)
// })
// const table1Set = new Set()
// table1.forEach(item => {
//     const key = `${item.file}→${item.jp}`
//     table1Set.add(key)
// })
// // 找出 table2Set 中有的但 table1Set 中没有的元素
// const diff = []
// table2Set.forEach(key => {
//     if (!table1Set.has(key)) {
//         diff.push(key)
//     }
// })
// console.log('table2Set 中有但 table1Set 中没有的元素：')
// console.log(diff)

// table2.forEach(item => {
//     const { file, jpHex } = item
//     const index = table1.findIndex(item1 => item1.file === file && item1.jpHex === jpHex)
//     if (index < 0) {
//         throw '找不到'
//     } else {
//         const { cn, cnHex } = table1[index]
//         item.cn = cn
//         item.cnHex = cnHex
//         table1.splice(index, 1)
//     }
// })
// fs.writeFileSync(tableFile2, JSON.stringify(table2, null, 2))

// const enTableFile = '../enTable.json'
// const enTable = JSON.parse(fs.readFileSync(enTableFile))
// enTable.forEach(item => {
//     item.enHex = ''
//     item.en = item.jp
// })
// fs.writeFileSync(enTableFile, JSON.stringify(enTable, null, 2))
// const arr = []
// enTable.slice(0, 50).map(e => {
//     arr.push({
//         jp: e.jp,
//         en: ''
//     })
// })
// console.log(arr)

// const enTableFile = '../enTable.json'
// const enTable = JSON.parse(fs.readFileSync(enTableFile))
// console.log(enTable.length)
// const enDemo = require('../enDemo.json')
// enTable.slice(0, 50).forEach((item, index) => {
//     item.en = enDemo[index].en
// })
// enTable.filter(item => !item.en).forEach(item => item.en = item.jp)
// fs.writeFileSync(enTableFile, JSON.stringify(enTable, null, 2))

// const enTableFile = '../enTable.json'
// const enjpFile = '../Bay City Elegy.json'
// const enTable = JSON.parse(fs.readFileSync(enTableFile))
// console.log(enTable.length)
// const enjp = enTable.map(item => {
//     return { message: item.jp }
// })
// fs.writeFileSync(enjpFile, JSON.stringify(enjp, null, 2))

// const jp = require('./Bay City Elegy_jp.json')
// const en = require('./Bay City Elegy_en.json')
// const enjp = jp.map((item, index) => {
//     return { jp: item.message, en: en[index].message }
// })
// fs.writeFileSync('./en.json', JSON.stringify(enjp, null, 2))

// const enTableFile = '../enTable.json'
// const enjpFile = './en.json'
// const enTable = JSON.parse(fs.readFileSync(enTableFile))
// const enjp = JSON.parse(fs.readFileSync(enjpFile))
// enTable.forEach((item, index) => {
//     const enjpItem = enjp[index]
//     if (item.jp !== enjpItem.jp) {
//         if (!item.jp.startsWith(enjpItem.jp)) {
//             throw 1
//         } else {
//             enjpItem.en += item.jp.slice(enjpItem.jp.length)
//             enjpItem.jp = item.jp
//         }
//     }
// })
// fs.writeFileSync(enjpFile, JSON.stringify(enjp, null, 2))

// const enTableFile = '../enTable.json'
// const enTable = JSON.parse(fs.readFileSync(enTableFile))
// const enjp = require('./en.json')
// enTable.forEach((item, index) => {
//     if (item.jp !== enjp[index].jp) {
//         throw 1
//     } else {
//         item.en = enjp[index].en
//     }
// })
// fs.writeFileSync(enTableFile, JSON.stringify(enTable, null, 2))

const enTableFile = '../enTable.json'
const enTable = JSON.parse(fs.readFileSync(enTableFile))
enTable.forEach((item) => {
    const en = item.en
    let endIdx = en.length - 1
    while (en[endIdx] === ('\n') || en[endIdx] === ('▽') || en[endIdx] === ('△')) {
        endIdx -= 1
    }
    // let part1 = en.slice(0, endIdx + 1)
    // let part2 = en.slice(endIdx + 1)
    // part1 = part1.replace(/\n/g, '')
    // part1 = part1.replace(/(?!^)(\u3000{2,})(?!$)/g, '')
    // const newEn = part1 + part2
    // if (newEn !== en) {
    //     item.en = newEn
    // }
    if (en.includes('　')) {
        // 将 en 中所有全角空格替换为半角空格
        item.en = en.replace(/　/g, ' ')
    }
})
fs.writeFileSync(enTableFile, JSON.stringify(enTable, null, 2))
