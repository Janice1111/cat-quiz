import { codesDb } from '../src/lib/db.ts';
import 'dotenv/config';

async function main() {
    const stats = codesDb.getStats();
    console.log('--- 数据库统计 (Native SQLite) ---');
    console.log('激活码总数:', stats.total);
    console.log('已核销数量:', stats.used);
    console.log('剩余可用数:', stats.remaining);
    console.log('管理员码数:', stats.adminCount);
    console.log('整体核销率:', stats.usageRate.toFixed(2) + '%');
    console.log('---------------------------------');
}

main().catch(console.error);
