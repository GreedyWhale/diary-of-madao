---
title: 'MADAO观察日记-博客篇(五)'
introduction: '同步到GitHub & 图片上传'
---

![banner_5.jpeg](/_next/upload/banner_5_1670580404589.jpeg "banner_5.jpeg")

## 0x00 前言

作为一个博客网站，肯定需要上传图片功能，可惜的是目前 Next.js 不支持文件上传，所以需要自己实现。

第二个是同步到GitHub，最开始的时候我也说过，如果不是国内平台丧心病狂的审核和随意删除你的文章，也不会有这个项目，同步到GitHub是我做的二重保险。

考虑到方便访问，毕竟不是谁都可以随时随地的科学上网的，所以服务器买的是国内的，但是事实证明这是一个错误的选择，后面部署的时候坑到爆炸。

## 0x01 图片上传

处于安全考虑，Next.js 在生产模式启动后就不允许访问启动时不存在的文件了。

[production mode public folder can't access dynamically creating files](https://github.com/vercel/next.js/issues/12656)

所以后续上传的图片是没法访问的。

这里有两种方案实现图片上传

1. Next.js 提供的自定义服务功能

    [Custom Server](https://nextjs.org/docs/advanced-features/custom-server)
    
    我最初也是采用这个方案，简单贴一下代码：
    
    ```js
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
    ```
    
    然后需要把package.json中的命令改成：
    
    ```json
    "scripts": {
      "dev": "node server.js",
      "build": "next build",
      "start": "NODE_ENV=production node server.js"
    }
    ```
    
    其实就是用 koa 包了一层。
    
    我放弃这个方案的原因是，根据文档自定义服务会失去一些 Next.js 做的优化，其次它无法部署在 Vercel 上。
    
    > Note: A custom server cannot be deployed on Vercel.

    > Before deciding to use a custom server, please keep in mind that it should only be used when the integrated router of Next.js can't meet your app requirements. A custom server will remove important performance optimizations, like serverless functions and Automatic Static Optimization.

2. 使用 Nginx

    这个项目部署本来就用到了 Nginx，所以只需要做一下请求的转发就可以了。
    
    思路就是：
    
    1. 图片上传后存在 `public/upload` 目录下。

    2. 将这个目录和 Nginx 的目录进行映射（docker的功能）。

    3. 判断请求路径，只要符合规则就将请求转发到 Nginx 自己的目录。
    
    这个方案详细的在部署的时候再说，个人感觉是比较简单的。
    
    
这里就按照 Nginx 的方案进行记录

#### 1. 安装 multer

```
yarn add multer

yarn add @types/multer -D
```

#### 2. 配置 multer

```ts
multer({
  storage: multer.diskStorage({
  
    // 设置文件名
    filename(req, file, cb) {
      const [filename, extname] = file.originalname.split('.');
      cb(null, `${filename}_${Date.now()}.${extname}`);
    },
    
    // 设置储存路径
    destination: path.join(process.cwd(), './public/upload'),
  }),

  // 限制文件大小
  limits: {
    fileSize: 10485760,
  },
}).any();
```

#### 3. 在接口中使用

首先定义一个 Upload 的类：

```ts
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Response } from '~/lib/api';

import multer from 'multer';
import path from 'path';

import { formatResponse } from '~/lib/api';

export type FileInfo = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
};

type NextApiRequestWithFiles = NextApiRequest & {
  files: FileInfo[];
};

class UploadModel {
  uploader = multer({
    storage: multer.diskStorage({
      filename(req, file, cb) {
        const [filename, extname] = file.originalname.split('.');
        cb(null, `${filename}_${Date.now()}.${extname}`);
      },
      destination: path.join(process.cwd(), './public/upload'),
    }),
    limits: {
      fileSize: 10485760,
    },
  }).any();

  /*
      因为 multer 不是专门为 Next.js 打造的
      所以需要以这种形式让 multer 去修改请求和响应对象
  */
  async doUpload(req: NextApiRequest, res: NextApiResponse) {
    return new Promise<Response<FileInfo>>(resolve => {
      // @ts-expect-error: 不知道如何定义
      this.uploader(req, res, error => {
        if (error) {
          resolve(formatResponse({ status: 500, message: (error as Error).message }));
          return;
        }

        resolve(formatResponse({ status: 200, message: '上传成功', resource: (req as unknown as NextApiRequestWithFiles).files[0] }));
      });
    });
  }
}

export default UploadModel;

```

在 api 文件中

```ts
// pages/api/v1/upload.ts

import { withSessionRoute } from '~/lib/withSession';
import { withMiddleware } from '~/lib/middleware';
import UploadModel from '~/model/upload';

const upload = new UploadModel();

export default withSessionRoute(withMiddleware({
  async post(req, res) {
    const result = await upload.doUpload(req, res);
    res.status(result.status).json(result);
  },
}));


// 重要设置，不设置这个无法从body中获取file
export const config = {
  api: {
    bodyParser: false,
  },
};

```

## 0x02 同步到GitHub

这个功能主要是借助了[simple-git](https://www.npmjs.com/package/simple-git)这个库实现的。

思路是：

1. 创建 & 更新笔记的时候，在生成静态文件。
2. 在提交到GitHub的时候，只提交这个储存静态文件的目录即可。
3. 提交GitHub采用SSH方式认证，所以在部署额度时候需要在服务器创建对应的公钥和密钥。

#### 1. 安装 simple-git

```
yarn add simple-git
```

#### 2. 实现笔记静态化方法

```ts
import fse from 'fs-extra'; // 这也是一个第三方库，需要单独安装
import path from 'path';

import { formatResponse } from '~/lib/api';

async generateStaticFiles(userId: number, title: string, content: string) {
    try {
      await fse.outputFile(path.join(process.cwd(), `/public/notes/${userId}/${title}.md`), content);
    } catch (error) {
      return Promise.reject(formatResponse({ status: 500, message: (error as Error).message }));
    }
}
```

实现了之后就在创建笔记和更新笔记的时候调用一下，调用的时机就是参数验证成功后调用。


#### 3. 实现 git model

```ts
// model/git.ts


import simpleGit from 'simple-git';
import path from 'path';

import { formatResponse } from '~/lib/api';

class GitModel {
  git = simpleGit();

  async syncToGitHub() {
    return this.git
      // 配置提交用户名
      .addConfig('user.name', 'Username')
      // 配置提交邮箱
      .addConfig('user.email', 'UserEmail')
      .add([
        // 图片上传目录
        path.join(process.cwd(), './public/upload'),
        // 笔记储存目录
        path.join(process.cwd(), './public/notes'),
      ])
      .commit('update：更新笔记相关文件')
      .pull('origin', 'main')
      .push(['origin', 'main'])
      .then(
        () => formatResponse({ status: 200, message: '同步完成' }),
        error => formatResponse({ status: 500, message: (error as Error).message }),
      );
  }
}

export default GitModel;

```

#### 4. 实现提交 GitHub 接口

```ts
// pages/api/v1/git.ts

import { withMiddleware } from '~/lib/middleware';
import { withSessionRoute } from '~/lib/withSession';
import GitModel from '~/model/git';

const git = new GitModel();

export default withSessionRoute(withMiddleware({
  async put(req, res) {
    const result = await git.syncToGitHub();
    res.status(result.status).json(result);
  },
}));

```

## 0x03 结语

这两个功能在代码层面看起啦异常的简单，但是我在实际部署的时候，遇到了好多坑，比如：Next.js 中间件的问题，GitHub身份认证问题，Nginx转发不成功等等...

这又是我讨厌后端编程的一点，Docker、Nginx配置起来好复杂，让人梦回老版Webpack，无尽的配置，感受不到编程的快乐。