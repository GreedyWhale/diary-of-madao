import { Handler, withIronSession } from 'next-iron-session';

export default function withSession(handler: Handler) {
  return withIronSession(handler, {
    cookieName: 'diary-of-madao',
    password: process.env.COOKIE_PASSWORD!,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  });
}
