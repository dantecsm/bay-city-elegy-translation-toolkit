# Bay City Elegy (Yokohama Elegy, 横浜エレジィ) Translation Toolkit

An end-to-end toolkit for extracting, translating, re-encoding, and reinjecting in-game text for the PC-98 title “Bay City Elegy (Yokohama Elegy, 横浜エレジィ)”.

This repository provides:
- A JSON-based translation workflow, for Chinese translation, use `table.json`, for English translation, use `enTable.json`
- Direct replacement of files inside FAT12/FAT16 `.hdi` disk images.

## Requirements
- Node.js >= 16
- Yarn or npm
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

## Important Folder or Files
- `enTable.json`: Master table for JP→EN
- `RB_MES/`: Original reference `.MES` files from the game
- `RB_EN_MES/`: Patched English `.MES` files (generated)
- `Bay City Elegy_EN.hdi`: Patched English hdi file

## Notes
1. If the number of lines in an English sentence (including both explicit `\n` newlines and automatic line breaks due to text overflow) exceeds the original Japanese, the first line of text may overlap with the ▽ symbol. In such cases, it is necessary to remove any excess `\n▽` symbols at the end of the sentence to prevent display issues.
2. The position of `\n` newlines in the English translation should ideally match the Japanese source. This helps avoid forced line breaks caused by overly long lines in English, which can disrupt the intended layout.
3. It is recommended to adjust the number of spaces following a `\n` according to the length of the character's name, in order to maintain proper alignment and visual consistency.
