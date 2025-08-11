# Bay City Elegy Translation Toolkit

An end-to-end toolkit for extracting, translating, re-encoding, and reinjecting in-game text for the PC-98 title “Bay City Elegy (Yokohama Elegy, 横浜エレジィ)”.

## Requirements
- Node.js >= 16
- Windows environment recommended

Install dependencies:

```bash
npm install
```

## Workflow (English):
1. Manually translate or polish the `en` field in `enTable.json`.
2. `npm run enAll`: Automatically runs `enHex` → `enApply` → `enHdi` in sequence.
    1. `npm run enHex`: Converts the `en` field to the `enHex` field in `enTable.json`.
    2. `npm run enApply`: Replaces text in `RB_EN_MES/` based on the `jpHex` and `enHex` fields in `enTable.json`.
    3. `npm run enHdi`: Injects `RB_EN_MES/` into the English HDI file `Bay City Elegy_EN.hdi`.

## Workflow (Chinese):
1. Manually translate or polish the `cn` field in `table.json`.
2. `npm run all`: Automatically runs `hex` → `apply` → `hdi` in sequence.
    1. `npm run hex`: Converts the `cn` field to the `cnHex` field in `table.json`.
    2. `npm run apply`: Replaces text in `RB_CN_MES/` based on the `jpHex` and `cnHex` fields in `table.json`.
    3. `npm run hdi`: Injects `RB_CN_MES/` into the English HDI file `Bay City Elegy_CN.hdi`.

## 工作流（中文）：
1. 手动翻译或润色 `table.json` 文件中的 `cn` 字段。
2. 执行 `npm run all`，自动依次运行 `cnHex` → `apply` → `hdi` 三个步骤。
    1. `npm run cnHex`：将 `table.json` 中的 `cn` 字段转换为 `cnHex` 字段（中文文本转为十六进制编码）。
    2. `npm run apply`：根据 `table.json` 中的 `jpHex` 和 `cnHex` 字段，替换 `RB_CN_MES/` 目录下所有 MES 文件的文本。
    3. `npm run hdi`：将 `RB_CN_MES/` 目录下的 MES 文件注入到中文 HDI 文件 `Bay City Elegy_CN.hdi` 中（需要先手动复制原版 hdi 文件为副本，并修改 importFiles2hdi.js 一处对应的文件路径为该副本文件在你电脑的实际路径）。

## Important Folder or Files
- `table.json`: Master table for JP→CN
- `enTable.json`: Master table for JP→EN
- `RB_MES/`: Original reference `.MES` files from the game
- `RB_CN_MES/`: Patched Chinese `.MES` files (generated)
- `RB_EN_MES/`: Patched English `.MES` files (generated)
- `Bay City Elegy_EN.hdi`: Patched English hdi file

## Notes
1. If the number of lines in an English sentence (including both explicit `\n` newlines and automatic line breaks due to text overflow) exceeds the original Japanese, the first line of text may overlap with the ▽ symbol. In such cases, it is necessary to remove any excess `\n▽` symbols at the end of the sentence to prevent display issues.
2. The position of `\n` newlines in the English translation should ideally match the Japanese source. This helps avoid forced line breaks caused by overly long lines in English, which can disrupt the intended layout.
3. It is recommended to adjust the number of spaces following a `\n` according to the length of the character's name, in order to maintain proper alignment and visual consistency.
