/*
 * @Description: https://nextjs.org/docs/advanced-features/middleware
 * @Author: MADAO
 * @Date: 2022-09-30 09:52:24
 * @LastEditors: MADAO
 * @LastEditTime: 2022-09-30 16:51:56
 */
import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session/edge';

import { sessionOptions } from '~/lib/sessionConfig';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 登录接口不做cookie检查
  if (request.nextUrl.pathname.endsWith('/sessions')) {
    return response;
  }

  const session = await getIronSession(request, response, sessionOptions);
  if (!session.user) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/api/v1/:path*',
  ],
};
