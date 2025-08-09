// 二进制转译日语程序（保留无法解析的十六进制原文）

const iconv = require('iconv-lite');

// 输入十六进制文本内容
const hexInput = `
AA 23 C5 23 28 10 C5 24 28 10 88 A4 89 B9 81 71
81 63 81 63 81 63 81 63 81 63 81 63 81 63 97 49
81 72 A5 81 A2 AB
`;

// 1. 整理成单行模式
const hexLine = hexInput.replace(/\s+/g, ' ').trim();

// 2. 拆分为字节数组
const hexArr = hexLine.split(' ').map(h => parseInt(h, 16));

// 3. 解析
let output = '';
let isLastJp = true;
for (let i = 0; i < hexArr.length; ) {
    const cur = hexArr[i];
    if ((cur >= 0x81 && cur <= 0x9F) || (cur >= 0xE0 && cur <= 0xFC)) {
        // 双字节sjis
        if (i + 1 < hexArr.length) {
            const bytes = Buffer.from([cur, hexArr[i + 1]]);
            output += (!isLastJp ? '\n' : '') + iconv.decode(bytes, 'shift_jis');
            i += 2;
            isLastJp = true;
        } else {
            // 末尾单字节，无法解析，保留原文
            output += hexArr[i].toString(16).toUpperCase().padStart(2, '0') + ' ';
            i++;
        }
    } else if (cur >= 0x2D && cur <= 0x7F) {
        // 单字节转为 0x81, (0x72 + cur)
        const bytes = Buffer.from([0x82, 0x72 + cur]);
        output += (!isLastJp ? '\n' : '') + iconv.decode(bytes, 'shift_jis');
        i++;
        isLastJp = true;
    } else if (cur === 0xA5) {
        output += (!isLastJp ? '\n' : '') + '\n';
        i++;
        isLastJp = true;
    } else {
        // 其他字节，保留原文
        output += (isLastJp ? '\n' : '') + hexArr[i].toString(16).toUpperCase().padStart(2, '0') + ' ';
        i++;
        isLastJp = false;
    }
}

// 去除末尾多余空格
output = output.trim();

// 打印结果
console.log(output);

