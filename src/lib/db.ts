import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'cat-quiz.db');

// 确保存储目录存在
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// 导出单例实例
const db = new Database(DB_PATH);

// 初始化表结构
db.exec(`
  CREATE TABLE IF NOT EXISTS activation_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    isUsed INTEGER DEFAULT 0,
    usedAt TEXT,
    type TEXT DEFAULT 'normal',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_code ON activation_codes(code);
  CREATE INDEX IF NOT EXISTS idx_type_used ON activation_codes(type, isUsed);
`);

export const codesDb = {
    // 查找激活码
    findByCode(code: string) {
        return db.prepare('SELECT * FROM activation_codes WHERE code = ?').get(code) as any;
    },

    // 标记为已使用
    markAsUsed(code: string) {
        return db.prepare('UPDATE activation_codes SET isUsed = 1, usedAt = ? WHERE code = ? AND type = "normal"')
            .run(new Date().toISOString(), code);
    },

    // 批量创建设活码 (原子操作)
    batchCreate(codes: { code: string; type: string }[]) {
        const insert = db.prepare('INSERT OR IGNORE INTO activation_codes (code, type) VALUES (?, ?)');
        const insertMany = db.transaction((codes) => {
            for (const item of codes) insert.run(item.code, item.type);
        });
        insertMany(codes);
    },

    // 获取统计信息
    getStats() {
        const total = (db.prepare('SELECT COUNT(*) as count FROM activation_codes').get() as any).count;
        const used = (db.prepare('SELECT COUNT(*) as count FROM activation_codes WHERE isUsed = 1').get() as any).count;
        const normal = (db.prepare("SELECT COUNT(*) as count FROM activation_codes WHERE type = 'normal'").get() as any).count;
        const admin = (db.prepare("SELECT COUNT(*) as count FROM activation_codes WHERE type = 'admin'").get() as any).count;

        return {
            total,
            used,
            remaining: normal - used,
            adminCount: admin,
            usageRate: total > 0 ? (used / normal) * 100 : 0
        };
    },

    // Upsert 操作 (用于种子脚本)
    upsert(code: string, type: string) {
        const existing = this.findByCode(code);
        if (existing) {
            db.prepare('UPDATE activation_codes SET type = ?, isUsed = 0, usedAt = NULL WHERE code = ?').run(type, code);
        } else {
            db.prepare('INSERT INTO activation_codes (code, type) VALUES (?, ?)').run(code, type);
        }
    }
};

export default db;
