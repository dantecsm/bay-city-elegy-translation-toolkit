const iconv = require('iconv-lite')
const { buffer2Hex, 半角转全角, 中文转日区 } = require('./utils')

// const asciiSet = new Set()

module.exports = {
    tableFile: 'table.json',
    refDir: 'RB_MES',
    destDir: 'RB_CN_MES',
    // refROM 和 destROM 可以留空，表示不进行修改
    refROM: '',
    destROM: '',
    gtInputDir: 'gt_input',
    gtOutputDir: 'gt_output',
    // 正则解释
    // AA 23 是清理对话框的 OP，非选项文本的开头
    // C3 (){2} 和 C5(){2} 是无关 OP，可以忽略，其中的 () 代表 [23-27], 28 和 [29-2C] 三种分支，分别对应 1, 2, 3 三种长度
    // D0 73 65 是无关 OP，它对应 D0 73 65，直到第一个非 20，如果是 22 则到下一个 22 结束，如果不是 22 则按照 [23-27], 28 和 [29-2C] 三种分支判断，分别对应 1, 2, 3 三种长度
    // 还有一种选项文本，以 『 ... 』 为规律
    // 文字有三种模式，一种是 SJIS，一种是 2D-7F 的 82 72+X 的简写，一种是 A5 换行
    // 需要去除末尾的 81 97，即 @
    REG_JP_HEX: /\xAA\x23([\xC3\xC5]([\x23-\x27]|\x28[\s\S]|[\x29-\x2C][\s\S]{2}){2}|\xD0\x73\x65(\x20){0,}(\x22[^\x22]+\x22|[^\x22]([\x23-\x27]|\x28[\s\S]|[\x29-\x2C][\s\S]{2}){0,1})){0,}([\x81-\x9F\xE0-\xFC][\s\S]|[\x2D-\x7F]|[\xA5]|\x21[^\x00]+\x00)+|\x81\x77([\x81-\x9F\xE0-\xFC][\s\S]|[\x2D-\x7F]|[\xA5]|\x21[^\x00]+\x00)+\x81\x78/g,
    simplifyJpHex: (jpHex) => {
        const jpHexArr = jpHex.split(' ')

        // 去掉前面的 AA 23 和无关 OP
        if (jpHexArr[0] === 'AA' && jpHexArr[1] === '23') {
            jpHexArr.splice(0, 2)
        }

        // 去除无关 OP 组（C3/C5）
        do {
            const op = jpHexArr[0]
            if (op === 'C3' || op === 'C5') {
                let idx = 1
                for (let i = 0; i < 2; i++) {
                    const param = jpHexArr[idx]
                    if (parseInt(param, 16) >= 0x23 && parseInt(param, 16) <= 0x27) {
                        idx++
                    } else if (parseInt(param, 16) === 0x28) {
                        idx += 2
                    } else if (parseInt(param, 16) >= 0x29 && parseInt(param, 16) <= 0x2C) {
                        idx += 3
                    } else {
                        // 即 C3/C5 后的字节不属于 [23-27], 28, [29-2C] 三种分支
                    }
                }
                jpHexArr.splice(0, idx)
            } else if (op === 'D0') {
                if (jpHexArr[1] === '73' && jpHexArr[2] === '65') {
                    idx = 3
                    // 排除所有连续的 0x20
                    while (idx < jpHexArr.length) {
                        const hex = parseInt(jpHexArr[idx], 16)
                        if (hex === 0x20) {
                            idx++
                        } else break
                    }
                    if (jpHexArr[idx] === 0x22) {
                        // 判断是 0x22 的处理，跳过直到下一个 0x22 为止 "..."
                        idx++
                        while (jpHexArr[idx] !== 0x22) {
                            idx++
                        }
                        idx++
                    } else {
                        // 判断非 0x22 的处理，三分支逻辑
                        const param = jpHexArr[idx]
                        if (parseInt(param, 16) >= 0x23 && parseInt(param, 16) <= 0x27) {
                            idx++
                        } else if (parseInt(param, 16) === 0x28) {
                            idx += 2
                        } else if (parseInt(param, 16) >= 0x29 && parseInt(param, 16) <= 0x2C) {
                            idx += 3
                        } else {
                            // 即 C3/C5 后的字节不属于 [23-27], 28, [29-2C] 三种分支
                        }
                    }
                    jpHexArr.splice(0, idx)
                } else {
                    break
                }
            } else {
                break
            }
        } while (true)
        // 去除 jpHexArr 末尾可能连续出现的 '81', '97'
        while (
            jpHexArr.length >= 2 &&
            jpHexArr[jpHexArr.length - 2] === '81' &&
            jpHexArr[jpHexArr.length - 1] === '97'
        ) {
            jpHexArr.splice(jpHexArr.length - 2, 2)
        }
        // 去除 jpHexArr 末尾的 ▽△/n 三种符号的组合，它们不需要翻译
        do {
            const a = jpHexArr[jpHexArr.length - 2]
            const b = jpHexArr[jpHexArr.length - 1]
            if (b === 'A5') {
                jpHexArr.pop()
            } else if ((a === '81' && b === 'A4') || (a === '81' && b === 'A2')) {
                jpHexArr.pop()
                jpHexArr.pop()
            } else break
        } while (true)
        return jpHexArr.join(' ')
    },
    jpHex2Jp: (jpHex) => {
        const jpHexArr = jpHex.split(' ')
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
            } else if (hex === 0x21) {
                // 处理 0x21 开头的 ascii 片段，直到 0x00 为止
                let asciiArr = []
                idx += 1
                while (idx < jpHexArr.length && parseInt(jpHexArr[idx], 16) !== 0x00) {
                    asciiArr.push(parseInt(jpHexArr[idx], 16))
                    idx += 1
                }
                // 跳过 0x00
                if (idx < jpHexArr.length && parseInt(jpHexArr[idx], 16) === 0x00) {
                    idx += 1
                }

                const ascii = Buffer.from(asciiArr).toString('ascii')
                // 统计 ascii 字符
                // asciiSet.add(ascii)
                // console.log(Array.from(asciiSet))
                jp += ascii
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
        let name = undefined
        let message = jp
        if (jp.includes('「')) {
            // 形如 " 悠 「この時点でのオレは――」"
            // 把 「 之前的作为 name，把 「 到最后一个」之间的作为 message
            const firstQuoteIdx = jp.indexOf('「')
            const lastQuoteIdx = jp.lastIndexOf('」')
            if (firstQuoteIdx !== -1 && lastQuoteIdx !== -1 && lastQuoteIdx > firstQuoteIdx) {
                name = jp.slice(0, firstQuoteIdx)
                message = jp.slice(firstQuoteIdx + 1, lastQuoteIdx)
            }
        } else if (jp.includes('〈')) {
            // 形如 " 悠 〈よしっ――と、これでいい〉"
            // 把 〈 之前的作为 name，把 〈 到最后一个〉之间的作为 message
            const firstAngleIdx = jp.indexOf('〈')
            const lastAngleIdx = jp.lastIndexOf('〉')
            if (firstAngleIdx !== -1 && lastAngleIdx !== -1 && lastAngleIdx > firstAngleIdx) {
                name = jp.slice(0, firstAngleIdx)
                message = jp.slice(firstAngleIdx + 1, lastAngleIdx)
            }
        }
        const item = { name, message }
        return item
    },
    nameAndMessage2Text: ({ name, message }, jp) => {
        if (!name) return message
        const isChat = jp.includes('「')
        const isThinking = jp.includes('〈')
        if (isChat) {
            return `${name}「${message}」`
        } else if (isThinking) {
            return `${name}〈${message}〉`
        } else {
            throw `非预期的情形：有 name 属性时，该文本要么是对话要么是想法，即原文有 「 或 〈`
        }
    },
    cn2CnHex: (cn, jpHex) => {
        // 有 5 种半角符号不用转全角，' ', '(', ')', '!', '?'
        // 实际 [ '!!', ' ', '(', ')', '!?' ]
        const asciis = [' ', '(', ')', '!', '?']
        const codes = ['212000', '212800', '212900', '212800', '213F00']
        cn = 半角转全角(cn, asciis)
        cn = 中文转日区(cn)
        const parts = cn.split('').map(char => {
            const asciiIdx = asciis.indexOf(char)
            if (asciiIdx > -1) {
                return Buffer.from(codes[asciiIdx])
            } else {
                return iconv.encode(char, 'sjis')
            }
        })
        const cnBuf = Buffer.concat(parts)
        let cnHex = buffer2Hex(cnBuf)
        if (cnHex.includes('21 28 00 21 28 00') || cnHex.includes('21 28 00 21 3F 00')) {
            console.log(1)
        }
        cnHex = cnHex.replaceAll('21 28 00 21 28 00', '21 28 28 00')
        cnHex = cnHex.replaceAll('21 28 00 21 3F 00', '21 28 3F 00')
        return cnHex
    },
    // null 或者 (jpHex, cnHex) => { return { hexProblem, newCnHex } }
    autoFill: null
    // autoFill: (jpHex, cnHex) => {
    //     const jpHexArr = jpHex ? jpHex.split(' ') : []
    //     const cnHexArr = cnHex ? cnHex.split(' ') : []
    //     const diffLen = jpHexArr.length - cnHexArr.length
    //     const isOdd = diffLen % 2 !== 0
    //     if (isOdd) {
    //         throw `hex 差值为奇数: ${jpHex} 与 ${cnHex}`
    //     }
    //     if (diffLen === 0) {
    //         return { newCnHex: cnHex }
    //     } else if (diffLen > 0) {
    //         for (let i = 0; i < diffLen; i++) {
    //             cnHexArr.push('20')
    //         }
    //         const newCnHex = cnHexArr.join(' ')
    //         return { newCnHex }
    //     } else {
    //         const hexProblem = `中文字节数超出 ${-diffLen} 个字节`
    //         console.log(hexProblem)
    //         return { hexProblem }
    //     }
    // }
}