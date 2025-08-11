const fs = require("fs");

class FatImage {
    constructor(path, partitionOffset) {
        this.path = path;
        this.partitionOffset = partitionOffset;
        this.fd = fs.openSync(path, "r+");
        this._readBootSector();
        this._calcLayout();
    }

    _readBootSector() {
        const boot = Buffer.alloc(512);
        fs.readSync(this.fd, boot, 0, 512, this.partitionOffset);

        this.BytesPerSector = boot.readUInt16LE(11);
        this.SectorsPerCluster = boot.readUInt8(13);
        this.ReservedSectors = boot.readUInt16LE(14);
        this.NumFATs = boot.readUInt8(16);
        this.MaxRootEntries = boot.readUInt16LE(17);
        this.TotalSectors16 = boot.readUInt16LE(19);
        this.MediaDescriptor = boot.readUInt8(21);
        this.SectorsPerFAT = boot.readUInt16LE(22);
        this.TotalSectors32 = boot.readUInt32LE(32);

        this.TotalSectors = this.TotalSectors16 !== 0 ? this.TotalSectors16 : this.TotalSectors32;

        const RootDirSectors = Math.floor((this.MaxRootEntries * 32 + this.BytesPerSector - 1) / this.BytesPerSector);
        const DataSectors = this.TotalSectors - (this.ReservedSectors + this.NumFATs * this.SectorsPerFAT + RootDirSectors);
        this.TotalClusters = Math.floor(DataSectors / this.SectorsPerCluster);

        if (this.TotalClusters < 4085) {
            this.FATType = 12;
        } else if (this.TotalClusters < 65525) {
            this.FATType = 16;
        } else {
            throw new Error("FAT32不支持");
        }

        this.RootDirSectors = RootDirSectors;
    }

    _calcLayout() {
        this.FATStart = this.partitionOffset + this.ReservedSectors * this.BytesPerSector;
        this.RootDirStart = this.FATStart + this.NumFATs * this.SectorsPerFAT * this.BytesPerSector;
        this.DataStart = this.RootDirStart + this.RootDirSectors * this.BytesPerSector;
        this.BytesPerCluster = this.BytesPerSector * this.SectorsPerCluster;
    }

    _read(offset, length) {
        const buf = Buffer.alloc(length);
        fs.readSync(this.fd, buf, 0, length, offset);
        return buf;
    }

    _write(offset, buffer) {
        fs.writeSync(this.fd, buffer, 0, buffer.length, offset);
    }

    _readFatEntry(cluster) {
        if (this.FATType === 12) {
            const offset = this.FATStart + Math.floor(cluster * 3 / 2);
            const val = this._read(offset, 2).readUInt16LE(0);
            return (cluster & 1) ? (val >> 4) & 0xFFF : val & 0xFFF;
        } else {
            const offset = this.FATStart + cluster * 2;
            return this._read(offset, 2).readUInt16LE(0);
        }
    }

    _writeFatEntry(cluster, value) {
        if (this.FATType === 12) {
            const offset = this.FATStart + Math.floor(cluster * 3 / 2);
            let orig = this._read(offset, 2).readUInt16LE(0);
            let val;
            if (cluster & 1) {
                val = (orig & 0x000F) | (value << 4);
            } else {
                val = (orig & 0xF000) | (value & 0x0FFF);
            }
            const buf = Buffer.alloc(2);
            buf.writeUInt16LE(val);
            this._write(offset, buf);
        } else {
            const offset = this.FATStart + cluster * 2;
            const buf = Buffer.alloc(2);
            buf.writeUInt16LE(value);
            this._write(offset, buf);
        }
    }

    _clusterToOffset(cluster) {
        return this.DataStart + (cluster - 2) * this.BytesPerCluster;
    }

    _readDirEntries(offset, maxEntries) {
        const data = this._read(offset, maxEntries * 32);
        let entries = [];
        for (let i = 0; i < maxEntries; i++) {
            const entry = data.slice(i * 32, (i + 1) * 32);
            if (entry[0] === 0x00) break;
            entries.push(entry);
        }
        return entries;
    }

    _parseFilename(entry) {
        let name = entry.slice(0, 8).toString("ascii").trim();
        let ext = entry.slice(8, 11).toString("ascii").trim();
        return ext ? `${name}.${ext}` : name;
    }

    _parseDirEntry(entry) {
        return {
            name: this._parseFilename(entry),
            attr: entry[11],
            start_cluster: entry.readUInt16LE(26),
            file_size: entry.readUInt32LE(28),
            raw: Buffer.from(entry)
        };
    }

    _isDir(attr) {
        return (attr & 0x10) !== 0;
    }

    _listDir(offset, maxEntries) {
        return this._readDirEntries(offset, maxEntries).map(e => this._parseDirEntry(e));
    }

    _findPath(filepath) {
        filepath = filepath.replace(/\\/g, "/");
        if (filepath.includes(":")) {
            filepath = filepath.split(":")[1];
        }
        filepath = filepath.replace(/^\/+/, "");
        const parts = filepath.split("/").filter(Boolean).map(p => p.toUpperCase());

        let dirOffset = this.RootDirStart;
        let maxEntries = this.MaxRootEntries;
        let currentEntries = this._listDir(dirOffset, maxEntries);

        for (let i = 0; i < parts.length; i++) {
            let found = false;
            for (let j = 0; j < currentEntries.length; j++) {
                const entry = currentEntries[j];
                if (entry.name === parts[i]) {
                    if (i === parts.length - 1) return [dirOffset, j, entry];
                    if (this._isDir(entry.attr)) {
                        if (entry.start_cluster === 0) {
                            dirOffset = this.RootDirStart;
                            maxEntries = this.MaxRootEntries;
                        } else {
                            dirOffset = this._clusterToOffset(entry.start_cluster);
                            maxEntries = this.BytesPerCluster / 32;
                        }
                        currentEntries = this._listDir(dirOffset, maxEntries);
                        found = true;
                        break;
                    } else {
                        throw new Error(`路径部分不是目录: ${parts[i]}`);
                    }
                }
            }
            if (!found) throw new Error(`路径部分未找到: ${parts[i]}`);
        }
        throw new Error("未找到目标文件");
    }

    _readClusterChain(start) {
        let chain = [];
        let cluster = start;
        while (cluster >= 2 && cluster < 0xFF0) {
            chain.push(cluster);
            let next = this._readFatEntry(cluster);
            if (next >= 0xFF8 || next === 0x000) break;
            cluster = next;
        }
        return chain;
    }

    _freeClusterChain(chain) {
        for (let c of chain) {
            this._writeFatEntry(c, 0x000);
        }
    }

    _allocClusters(count) {
        let allocated = [];
        for (let c = 2; allocated.length < count && c <= 0xFF0; c++) {
            if (this._readFatEntry(c) === 0x000) allocated.push(c);
        }
        if (allocated.length < count) throw new Error("空间不足");
        for (let i = 0; i < allocated.length; i++) {
            this._writeFatEntry(allocated[i], i === allocated.length - 1 ? (this.FATType === 12 ? 0xFFF : 0xFFFF) : allocated[i + 1]);
        }
        return allocated;
    }

    _writeClusters(clusters, data) {
        let remain = data.length;
        let pos = 0;
        for (let c of clusters) {
            let toWrite = Math.min(remain, this.BytesPerCluster);
            const buf = Buffer.alloc(this.BytesPerCluster, 0);
            data.copy(buf, 0, pos, pos + toWrite);
            this._write(this._clusterToOffset(c), buf);
            pos += toWrite;
            remain -= toWrite;
            if (remain <= 0) break;
        }
    }

    replaceFile(filepath, newFileData) {
        const [dirOffset, entryIndex, entry] = this._findPath(filepath);
        console.log(`找到文件: ${filepath} 起始簇 ${entry.start_cluster}, 大小 ${entry.file_size}`);
        const oldChain = this._readClusterChain(entry.start_cluster);
        this._freeClusterChain(oldChain);
        const neededClusters = Math.ceil(newFileData.length / this.BytesPerCluster);
        const newChain = this._allocClusters(neededClusters);
        this._writeClusters(newChain, newFileData);

        const newEntry = Buffer.from(entry.raw);
        newEntry.writeUInt16LE(newChain[0], 26);
        newEntry.writeUInt32LE(newFileData.length, 28);
        this._write(dirOffset + entryIndex * 32, newEntry);

        console.log(`替换完成，新大小 ${newFileData.length}，起始簇 ${newChain[0]}`);
    }

    close() {
        fs.closeSync(this.fd);
    }
}

if (require.main === module) {
    if (process.argv.length !== 6) {
        console.log(`Usage: node ${process.argv[1]} <hdi_file> <partition_offset_hex> <target_path_in_image> <new_file>`);
        process.exit(1);
    }

    const hdiFile = process.argv[2];
    const partitionOffset = parseInt(process.argv[3], 16);
    const targetPath = process.argv[4];
    const newFilePath = process.argv[5];
    const newData = fs.readFileSync(newFilePath);

    const img = new FatImage(hdiFile, partitionOffset);
    img.replaceFile(targetPath, newData);
    img.close();
}

module.exports = FatImage;

// 用法示例：
// 1. 直接使用，替换单个文件
// node replace_hdi_file.js  "J:/PC98 Files/Bay City Elegy_CN.hdi" 0x9400 "//YOKOHAMA/RB_MES/MSG01.MES" "./RB_CN_MES/MSG01.MES"
// 其中 0x9400 是该 hdi 文件引导区的开始地址
// 2. 模块化使用
// const FatImage = require('./replaceHdiFile');
// const img = new FatImage(hdiFile, offset);
// img.replaceFile(targetPath, fs.readFileSync(newFilePath))
// img.close()
