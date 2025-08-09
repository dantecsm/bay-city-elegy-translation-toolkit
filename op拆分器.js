const fs = require('fs');
const path = require('path');

// 读取 MAME_LOG.txt，获取地址数组
const mameLogPath = path.join(__dirname, 'MAME_LOG.txt');
const mameLogLines = fs.readFileSync(mameLogPath, 'utf-8').split(/\r?\n/).filter(Boolean);

const addrArr = mameLogLines.map(line => {
    // 匹配 SI=xxxx
    const match = line.match(/SI=([0-9A-Fa-f]{4})/);
    if (!match) return null;
    const siHex = match[1];
    // 计算 siHex - 9000
    const addr = parseInt(siHex, 16) - 0x9000;
    // 转为两位十六进制字符串
    return addr.toString(16).toUpperCase().padStart(4, '0');
}).filter(Boolean);

// 转为数字数组，方便后续处理
const addrNumArr = addrArr.map(a => parseInt(a, 16));

// 读取 RB_MES/MSG06.MES 文件
const mesPath = path.join(__dirname, 'RB_MES', 'MSG06.MES');
const mesBuf = fs.readFileSync(mesPath);

// 按地址数组拆分
let resultLines = [];
for (let i = 0; i < addrNumArr.length; i++) {
    const start = addrNumArr[i];
    const end = (i + 1 < addrNumArr.length) ? addrNumArr[i + 1] : mesBuf.length;
    const slice = mesBuf.subarray(start, end);
    // 转为十六进制字符串
    const hexStr = Array.from(slice).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
    resultLines.push(hexStr);
}

// 输出到 OP拆分结果.txt
const outputPath = path.join(__dirname, 'OP拆分结果.txt');
fs.writeFileSync(outputPath, resultLines.join('\n'), 'utf-8');

console.log('拆分完成，结果已写入 OP拆分结果.txt');
