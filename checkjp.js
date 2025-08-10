const table = require('./table.json')

const jps = table.map(item => item.jp)

const UP = '△'
const DN = '▽'
const jpsWithUp = jps.filter(jp => jp.includes(UP))
const jpsWithDown = jps.filter(jp => jp.includes(DN))
console.log(jpsWithUp.length, jpsWithDown.length)

// 没有同时包含 UP 和 DN 符号的文本
// const jpsWithUpAndDown = jps.filter(jp => jp.includes(UP) && jp.includes(DN))
// console.log(jpsWithUpAndDown.length)

// 所有 ▽ 的文本，▽ 都是跟换行组合在最后面
const jpsWithDownNotEndsWithDownOrNewline = jpsWithDown.filter(jp => {
    while(jp.endsWith(DN) || jp.endsWith('\n')) {
        jp = jp.slice(0, -1)
    }
    return jp.includes(DN)
})
console.log(jpsWithDownNotEndsWithDownOrNewline)

// 所有 △ 的文本，△ 都是跟换行组合在最后面
const jpsWithUpNotEndsWithUpOrNewline = jpsWithUp.filter(jp => {
    while(jp.endsWith(UP) || jp.endsWith('\n')) {
        jp = jp.slice(0, -1)
    }
    return jp.includes(UP)
})
console.log(jpsWithUpNotEndsWithUpOrNewline)

// 『〈「
console.log(jps.length)
const notOptionJps = jps.filter(jp => !jp.includes('『'))
console.log(notOptionJps.length)
const notOptionOrThinkingJps = notOptionJps.filter(jp => !jp.includes('〈'))
console.log(notOptionOrThinkingJps.length)
const notOptionOrThinkingOrChatJps = notOptionOrThinkingJps.filter(jp => !jp.includes('「'))
console.log(notOptionOrThinkingOrChatJps)

// 证明 「 和 」 是成对的，〈 和 〉也是成对的
const a = jps.filter(jp => jp.includes('「') && !jp.includes('」'))
console.log(a.length)
const b = jps.filter(jp => jp.includes('〈') && !jp.includes('〉'))
console.log(b.length)

// 证明所有包含「的文本，必以」结尾，所有包含〈的文本，必以〉结尾
const notEndWithChat = jps.filter(jp => jp.includes('「') && !jp.endsWith('」'))
console.log('包含「但不以」结尾的数量:', notEndWithChat.length)
const notEndWithThinking = jps.filter(jp => jp.includes('〈') && !jp.endsWith('〉'))
console.log('包含〈但不以〉结尾的数量:', notEndWithThinking.length)

// 非 name 的 message 中可能出现 21 ... 00 的 ascii 字符，只有 ! 和 ？两种，比如
// 神緒・美夏・梨奈・恵子・希子「悠は、誰が好きなのよ!?」

// 找出所有 hex 长度差值为 1 的 cnHex 与 jpHex
table.forEach(item => {
    const { jpHex, cnHex } = item
    const jpArr = jpHex.split(' ')
    const cnArr = cnHex.split(' ')
    const diffLen = cnArr.length - jpArr.length
    if (Math.abs(diffLen) === 1) {
        console.log(jpHex)
    }
})

table.forEach(item => {
    const { jp, cn } = item
    if (jp.startsWith('『') && jp.endsWith('』')) {
        if (!(cn.startsWith('『') && cn.endsWith('』'))) {
            console.log(`${jp}\n${cn}`)
        }
    }
})