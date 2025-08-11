const names = ['愛音', '山崎', '東山', '菅原', ' 悠 ', '(声)', '美夏', ' 客 ', '神緒', 'レポーターＢ', 'レポーターＡ', 'レポーターＣ',
    '藤島', '恵子', '希子', ' 仁 ', ' 悠 ・希子', '客Ａ', '客Ｂ', '万里子', ' 丈 ', 'ダフ屋', '親衛隊々長', '親衛隊たち', '梨奈',
    '守衛', '運転手', '悠', '司会', '運転手(声)', '吉川(声)', '吉川', '神緒・美夏', '神緒・美夏・梨奈・恵子・希子'
]
const regs = names.map(name => {
    const hexStr = name.split('').map(char => {
        if (char === ' ') return '212000'
        const buf = iconv.encode(char, 'sjis')
        const hexs = buf.toString('hex')
        return hexs
    }).join('')
    // 把 hexStr 从形如 '8ee7' 改为 '\x8e\xe7' 格式
    const regStr = hexStr.replace(/([0-9a-fA-F]{2})/g, '\\x$1')
    return regStr
})
const regArray = regs.map(reg => `(${reg}\\x81\\x75[\\s\\S]+?\\x81\\x76|${reg}\\x81\\x71[\\s\\S]+?\\x81\\x72)`)
const regex1 = /\xAA\x23([\xC3\xC5]([\x23-\x27]|\x28[\s\S]|[\x29-\x2C][\s\S]{2}){2}|\xD0\x73\x65(\x20){0,}(\x22[^\x22]+\x22|[^\x22]([\x23-\x27]|\x28[\s\S]|[\x29-\x2C][\s\S]{2}){0,1})){0,}([\x81-\x9F\xE0-\xFC][\s\S]|[\x2D-\x7F]|[\xA5]|\x21[^\x00]+\x00)+|\x81\x77([\x81-\x9F\xE0-\xFC][\s\S]|[\x2D-\x7F]|[\xA5]|\x21[^\x00]+\x00)+\x81\x78/
const regex2 = new RegExp(regArray.join('|'))
const REG_JP_HEX = new RegExp(`(${regex1.source})|(${regex2.source})`, 'g')

module.exports = REG_JP_HEX
