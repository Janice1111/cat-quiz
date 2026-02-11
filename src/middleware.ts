import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 保护 /quiz 和 /result 路由
    if (request.nextUrl.pathname.startsWith('/quiz') || request.nextUrl.pathname.startsWith('/result')) {
        // 检查请求中的 cookie 或者 header 中的 token
        // 由于我们使用的是 localStorage，无法在服务器端直接读取
        // 所以我们换一个策略：要求客户端通过 cookie 传递 token

        const token = request.cookies.get('cat_test_token')?.value;

        if (!token) {
            // 没有 token，重定向到首页
            return NextResponse.redirect(new URL('/', request.url));
        }

        // 注意：这里我们只检查 token 存在，真正的验证在 API 层
        // 如果需要更严格的验证，可以在这里调用数据库检查
    }

    return NextResponse.next();
}

// 配置需要应用中间件的路径
export const config = {
    matcher: ['/quiz/:path*', '/result/:path*'],
};
