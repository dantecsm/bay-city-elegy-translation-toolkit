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
