/*
 * @Description: https://nextjs.org/docs/advanced-features/middleware
 * @Author: MADAO
 * @Date: 2022-09-30 09:52:24
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-19 21:00:42
 */
import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session/edge';

import { sessionOptions } from '~/lib/sessionConfig';

const skipCheck = (pathname: string, method: string) => {
  switch (true) {
    case pathname.endsWith('/session'):
    case pathname.endsWith('/note') && method === 'GET':
      return true;
    default:
      return false;
  }
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 登录接口不做cookie检查
  if (skipCheck(request.nextUrl.pathname, request.method)) {
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
