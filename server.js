/*
 * @Description: 自定义next js 服务
 * @Author: MADAO
 * @Date: 2021-10-13 10:15:55
 * @LastEditors: MADAO
 * @LastEditTime: 2021-10-18 13:58:46
 */
const { parse } = require('url');
const next = require('next');
const Koa = require('koa');
const send = require('koa-send');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = new Koa();
  /**
   * 请求静态资源不能通过app.getRequestHandler()
   * 因为NextJs做了安全限制，build之后添加的文件无法进行访问
   * 注意：开发环境无此限制
   * @see https://github.com/vercel/next.js/issues/12656
   */
  server.use(async (context, next) => {
    const parsedUrl = parse(context.req.url, true);
    let done = false;
    if (/^\/static\/images/.test(parsedUrl.path)) {
      try {
        done = await send(context, context.path);
      } catch (error) {
        if (error.status !== 404) {
          throw error;
        }
      }

      return;
    }

    if (!done) {
      await next();
    }
  });

  server.use(async context => {
    context.respond = false;
    const parsedUrl = parse(context.req.url, true);
    await handle(context.req, context.res, parsedUrl);
  });

  server.listen(3000, error => {
    if (error) {
      throw error;
    }

    console.log('> Ready on http://localhost:3000');
  });
});
