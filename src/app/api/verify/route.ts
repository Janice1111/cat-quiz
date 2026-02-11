import { NextResponse } from 'next/server';
import { codesDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { code } = body;

        if (!code) {
            return NextResponse.json(
                { error: '请输入激活码' },
                { status: 400 }
            );
        }

        // 标准化输入
        const normalizedCode = code.trim().toUpperCase();

        // 数据库校验
        const activationCode = codesDb.findByCode(normalizedCode);

        if (!activationCode) {
            return NextResponse.json(
                { error: '无效的激活码，请检查输入' },
                { status: 401 }
            );
        }

        // 如果是普通码，检查是否已使用
        if (activationCode.type === 'normal' && activationCode.isUsed) {
            return NextResponse.json(
                { error: '该激活码已失效' },
                { status: 401 }
            );
        }

        // 返回成功 + 简易 session token (base64 编码的 code)
        return NextResponse.json({
            success: true,
            token: Buffer.from(normalizedCode).toString('base64'),
            message: '验证成功'
        });

    } catch (error) {
        console.error('Verify error:', error);
        return NextResponse.json(
            { error: '服务器内部错误' },
            { status: 500 }
        );
    }
}
