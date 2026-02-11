import { codesDb } from '../src/lib/db.ts';
import 'dotenv/config';

async function main() {
    console.log('正在初始化测试数据 (Native SQLite)...');

    const adminCode = 'CAT-ADMIN-POWER';
    codesDb.upsert(adminCode, 'admin');
    console.log(`[OK] 管理员码已就绪: ${adminCode}`);

    const testCodes = ['CAT-TEST-0001', 'CAT-TEST-0002', 'CAT-TEST-0003'];
    for (const code of testCodes) {
        codesDb.upsert(code, 'normal');
    }
    console.log(`[OK] ${testCodes.length} 个测试码已就绪。`);
}

main().catch(console.error);
