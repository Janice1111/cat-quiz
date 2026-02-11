import { codesDb } from '../src/lib/db.ts';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let part1 = '';
    let part2 = '';
    for (let i = 0; i < 4; i++) {
        part1 += chars.charAt(Math.floor(Math.random() * chars.length));
        part2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `CAT-${part1}-${part2}`;
}

async function main() {
    const count = parseInt(process.argv[2]) || 100;
    const codes = [];
    const codeStrings = [];

    console.log(`正在生成 ${count} 个激活码...`);

    for (let i = 0; i < count; i++) {
        const code = generateCode();
        codes.push({ code, type: 'normal' });
        codeStrings.push(code);
    }

    try {
        console.log('正在入库...');
        codesDb.batchCreate(codes);
        console.log(`成功入库 ${count} 个激活码`);

        const exportPath = path.join(process.cwd(), 'scripts', 'generated_codes.txt');
        fs.writeFileSync(exportPath, codeStrings.join('\n'));
        console.log(`成功写入文件: ${exportPath}`);
    } catch (error) {
        console.error('生成失败:', error);
    }
}

main();
