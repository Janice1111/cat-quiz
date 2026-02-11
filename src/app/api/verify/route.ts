import { NextResponse } from 'next/server';

// Mock database of active codes
// In a real app, this would be a database query (e.g., Supabase, Vercel KV)
const MOCK_VALID_CODES = new Set([
    'CAT-TEST-CODE',
    'CAT-8823-X9Y2'
]);

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

        // Standardize input
        const normalizedCode = code.trim().toUpperCase();

        // Mock Validation Logic
        // 1. Check if code matches format (CAT-XXXX-XXXX)
        // 2. Check if code exists in DB (simulate with Set or Prefix check for demo)

        // For DEMO purposes: allow any code starting with CAT-
        const isValid = normalizedCode.startsWith('CAT-') || MOCK_VALID_CODES.has(normalizedCode);

        if (!isValid) {
            return NextResponse.json(
                { error: '无效的激活码，请检查输入' },
                { status: 401 }
            );
        }

        // In a real app: check if code is already used
        // const isUsed = await db.check specific code...
        // if (isUsed) return error...

        // Return success + a session token (mock)
        return NextResponse.json({
            success: true,
            token: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            message: '验证成功'
        });

    } catch (error) {
        return NextResponse.json(
            { error: '服务器内部错误' },
            { status: 500 }
        );
    }
}
