import { NextResponse } from 'next/server';
import { codesDb } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        // 简易安全检查: 需要在环境变量中配置 ADMIN_SECRET
        const ADMIN_SECRET = process.env.ADMIN_SECRET || 'CAT-ADMIN-123456';

        if (secret !== ADMIN_SECRET) {
            return NextResponse.json(
                { error: '未授权访问' },
                { status: 403 }
            );
        }

        // 获取统计数据 (直接通过封装好的 getStats)
        const stats = codesDb.getStats();

        return NextResponse.json({
            success: true,
            stats: {
                ...stats,
                lowInventory: stats.remaining < 1000 // 低库存预警阈值
            },
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json(
            { error: '获取统计数据失败' },
            { status: 500 }
        );
    }
}
