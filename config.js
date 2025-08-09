const iconv = require('iconv-lite')
const { buffer2Hex, 半角转全角, 中文转日区 } = require('./utils')

module.exports = {
    tableFile: 'table.json',
    refDir: 'RB_MES',
    destDir: 'RB_CN_MES',
    // refROM 和 destROM 可以留空，表示不进行修改
    refROM: '',
    destROM: '',
    gtInputDir: 'gt_input',
    gtOutputDir: 'gt_output',
    REG_JP_HEX: /\xAA\x23(\xC5\x23\x28\x10\xC3\x24\x2C\x7F\x7F){0,1}([\x81-\x9F\xE0-\xFC][\s\S]|[\x2E-\x80]|[\xA5\x21\x00])+\xAB/g,
    jpHex2Jp: (jpHex) => {
        // 去掉前面的 AA 23 和后面的 AB
        const jpHexArr = jpHex.split(' ').slice(2, -1)
        // 去掉可能存在的其它前缀
        if (jpHexArr.join(' ').startsWith('C5 23 28 10 C3 24 2C 7F 7F')) {
            jpHexArr.splice(0, 9)
        }
        let jp = ''
        let idx = 0
        while (idx < jpHexArr.length) {
            const hex = parseInt(jpHexArr[idx], 16)
            if (hex >= 0x2D && hex <= 0x7F) {
                const jpBuf = Buffer.from([0x82, 0x72 + hex])
                jp += iconv.decode(jpBuf, 'sjis')
                idx += 1
            } else if (hex === 0xA5) {
                jp += '\n'
                idx += 1
            } else {
                const jpBuf = Buffer.from(jpHexArr.slice(idx, idx + 2).join(''), 'hex')
                const curJp = iconv.decode(jpBuf, 'sjis')
                jp += curJp
                idx += 2
            }
        }
        return jp
    },
    text2NameAndMessage: (jp) => {
        const item = { name: undefined, message: jp }
        return item
    },
    nameAndMessage2Text: ({ name, message }) => {
        const cn = message
        return cn
    },
    cn2CnHex: (cn, jpHex) => {
        cn = 半角转全角(cn)
        cn = 中文转日区(cn)
        const cnBuf = iconv.encode(cn, 'sjis')
        const cnHex = buffer2Hex(cnBuf)
        return cnHex
    },
    // null 或者 (jpHex, cnHex) => { return { hexProblem, newCnHex } }
    autoFill: (jpHex, cnHex) => {
        const jpHexArr = jpHex ? jpHex.split(' ') : []
        const cnHexArr = cnHex ? cnHex.split(' ') : []
        const diffLen = jpHexArr.length - cnHexArr.length
        const isOdd = diffLen % 2 !== 0
        if (isOdd) {
            throw `hex 差值为奇数: ${jpHex} 与 ${cnHex}`
        }
        if (diffLen === 0) {
            return { newCnHex: cnHex }
        } else if (diffLen > 0) {
            for (let i = 0; i < diffLen; i++) {
                cnHexArr.push('20')
            }
            const newCnHex = cnHexArr.join(' ')
            return { newCnHex }
        } else {
            const hexProblem = `中文字节数超出 ${-diffLen} 个字节`
            console.log(hexProblem)
            return { hexProblem }
        }
    }
}