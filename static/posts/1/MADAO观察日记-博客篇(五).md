---
title: 'MADAO观察日记-博客篇(五)'
labels: ['Blog', 'Next.js', 'Database']
introduction: '给文章添加标签，实现同步文章到 GitHub 和图片上传功能'
---

![post_blog_5_cover_1645783965510.jpeg](/static/images/posts/post_blog_5_cover_1645783965510.jpeg "post_blog_5_cover_1645783965510.jpeg")

## 前言

[MADAO观察日记-博客篇(四)](https://greed.icu/posts/6)

回顾之前的笔记，发现写的太啰嗦了，很难在笔记中找到知识点，再加上笔记中有大量的代码，很难阅读，所以我今后准备改变风格，主要记录思路，尽量避免写过多的代码在笔记里面。

之前的笔记我都是写在各种平台或者 GitHub上 的，这一次是我第一次买服务器搭建博客系统，比较怕出问题之后我的笔记都丢失，所以我做了一个同步到 GitHub 的功能做一个备份。

这篇笔记涉及到的知识点有：

- 数据库的多对多关系
- Next.js 的自定义服务器功能
- simple-git 的使用

[代码参考](https://github.com/GreedyWhale/code-examples/tree/e94469cca6f28f1a29eb2ff3111d348b9217055f)

## 给文章加上标签

给文章加上标签就是将文章进行分类，这样后续就可以根据标签进行文章的搜索了。

上一篇笔记中实现了User表和Post表的一对多的关系，因为一个用户是可以写多篇文章的，所以User表和Post表是一对多的关系。

一个标签可以用在多个文章中，一篇文章也可以有多个标签，所以这是一个多对多的关系。

在Prisma的模式中，多对多可分为显式和隐式的多对多。


#### 1. 显式的多对多

**Post 表**

|  id   | title | content | introduction | authorId |createdAt | updatedAt |
|  ----  |  ----  |  ----  |  ----  |  ----  |  ----  |  ----  |
| 1  | 测试文章  | 测试  | 这是一篇用于测试的文章  | 1  | 2022-02-24 07:59:12.519  | 2022-02-24 07:59:12.519  |

**Label 表**

| id | name |
| -- | -- |
| 1  | 标签一 |

```
model Post {
  id           Int             @id              @default(autoincrement())
  title        String          @db.VarChar(512)
  content      String          @db.Text
  introduction String          @db.Text
  author       User            @relation(fields: [authorId], references: [id])
  authorId     Int
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
}

model Label {
  id    Int      @id               @default(autoincrement())
  name  String   @db.VarChar(256)   @unique
}
```

如果要让上面两个表形成多对多（显式）关系，需要再加一个表

**e.g.**

```
model LabelsOnPosts {
  post       Post      @relation(fields: [postId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  postId     Int
  label      Label     @relation(fields: [labelId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  labelId    Int

  @@id([postId, labelId])
}
```

- @@id

    组合键，用postId和LabelId组合起来作为一条记录的主键。

- Cascade

    当引用的字段发生更新自动更新，同样如果引用的记录被删除，那么在LabelsOnPosts表中也会自动删除。
    
    除了Cascade还有其他的参照动作，文档里描述的很清楚，这边就不赘述了
    
    [Types of referential actions](https://www.prisma.io/docs/concepts/components/prisma-schema/relations/referential-actions#types-of-referential-actions)


增加了上表之后还需要给Post表和Label表添加对LabelsOnPosts的引用。

**e.g.**

```diff
model Post {
   id           Int             @id              @default(autoincrement())
   title        String          @db.VarChar(512)
   content      String          @db.Text
   introduction String          @db.Text
   author       User            @relation(fields: [authorId], references: [id])
   authorId     Int
   createdAt    DateTime        @default(now())
   updatedAt    DateTime        @updatedAt
+  labels       LabelsOnPosts[]
}

model Label {
   id    Int      @id               @default(autoincrement())
   name  String   @db.VarChar(256)   @unique
+  posts LabelsOnPosts[]
}
```



#### 2. 隐式的多对多


隐式的多对多会简单点

**e.g.**

```diff
model Post {
  id           Int             @id              @default(autoincrement())
  title        String          @db.VarChar(512)
  content      String          @db.Text
  introduction String          @db.Text
  author       User            @relation(fields: [authorId], references: [id])
  authorId     Int
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
+ labels       Label[]
}

model Label {
  id    Int      @id               @default(autoincrement())
  name  String   @db.VarChar(256)   @unique
+ posts Post[]
}
```
    
在Prisma中隐式的多对多关系中，Prisma会帮你创建一个表，虽然在代码里没有写，上面例子中Prisma帮我创建的表叫`_LabelToPost`，这个名字是可以改的，在文档中有说明，但是必须以下划线开头。


#### 3. 在创建文章的时候加上标签

之前的代码是把文章的创建和更新写在了一个方法中，这就导致了对标签的操作有创建、更新和删除，好在Prisma有提供相关的方法能够实现。

首先将Label表迁移到真实的数据库中

`yarn prisma migrate dev --name create_lables_table`

这里选择使用**隐式**的多对多

在浏览器中打开一个prisma的客户端

`yarn prisma studio`

这时候会得到如下界面

![WX20220225-115901@2x_1645761583784.png](/static/images/posts/WX20220225-115901@2x_1645761583784.png "WX20220225-115901@2x_1645761583784.png")

**e.g.**

```ts
// test/label.ts

import type { Post } from 'prisma/prisma-client';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PostParams {
  title: string;
  content: string;
  introduction: string;
  labels: {
    name: string;
    id?: number;
    action: 'add' | 'delete' | 'unchanged';
  }[];
}

// 模拟数据
const data: PostParams = {
  title: '测试文章',
  introduction: '用于测试label的创建、更新和删除',
  content: '用于测试label的创建、更新和删除',
  labels: [
    { name: '标签一', action: 'add' },
    { name: '标签二', action: 'add' },
  ],
};

const handle = async () => {
  const { labels, ...rest } = data;
  await prisma.post.upsert({
    where: { id: -1 }, // 第一次创建文章没有id
    create: {
      ...rest,
      author: {
        connect: { id: 4 },  // 提前创建的用户
      },
      labels: {
        connectOrCreate: labels.filter(label => label.action === 'add').map(label => ({
          where: { name: label.name },
          create: { name: label.name },
        })),
      },
    },
    update: {
      ...rest,
      author: {
        connect: { id: 4 }, // 提前创建的用户
      },
      labels: {
        connectOrCreate: labels.filter(label => label.action === 'add').map(label => ({
          where: { name: label.name },
          create: { name: label.name },
        })),
        delete: labels.filter(value => value.action === 'delete').map(value => ({
          id: value.id,
        })),
      },
    },
  }).then((res: Post) => console.log(res));
  
  await prisma.$disconnect();
};

```

然后执行

`yarn ts-node --project ./node.tsconfig.json ./test/label.ts`

**PS**: [node.tsconfig.json](https://github.com/GreedyWhale/code-examples/blob/main/blog/node.tsconfig.json)

成功之后就可以得到如下记录

![WX20220225-122041@2x_1645762912967.png](/static/images/posts/WX20220225-122041@2x_1645762912967.png "WX20220225-122041@2x_1645762912967.png")


![WX20220225-122003@2x_1645762896185.png](/static/images/posts/WX20220225-122003@2x_1645762896185.png "WX20220225-122003@2x_1645762896185.png")

标签和文章都正确的关联了。


现在模拟一下更新文章的时候有删除标签的情况：

```ts
const data: PostParams = {
  title: '测试文章',
  introduction: '用于测试label的创建、更新和删除',
  content: '用于测试label的创建、更新和删除',
  labels: [
   { name: '标签一', action: 'unchanged' },
   // 需要删除的标签
   { name: '标签二', action: 'delete', id: 4 },
   { name: '标签三', action: 'add' },
  ],
};

const handle = async () => {
  const { labels, ...rest } = data;
  await prisma.post.upsert({
    where: { id: 8 }, // 将文章id改为刚才创建的
    create: {
      ...rest,
      author: {
        connect: { id: 5 },
      },
      labels: {
        connectOrCreate: labels.filter(label => label.action === 'add').map(label => ({
          where: { name: label.name },
          create: { name: label.name },
        })),
      },
    },
    update: {
      ...rest,
      author: {
        connect: { id: 5 },
      },
      labels: {
        connectOrCreate: labels.filter(label => label.action === 'add').map(label => ({
          where: { name: label.name },
          create: { name: label.name },
        })),
        delete: labels.filter(value => value.action === 'delete').map(value => ({
          id: value.id,
        })),
      },
    },
  }).then((res: Post) => console.log(res));

  await prisma.$disconnect();
};

handle();

```

执行完之后得到的结果：

![WX20220225-122852@2x_1645763359424.png](/static/images/posts/WX20220225-122852@2x_1645763359424.png "WX20220225-122852@2x_1645763359424.png")

#### 4. 根据标签搜索文章

**e.g.**

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const handle = async (label: string) => {
  await prisma.post.findMany({
    where: {
      labels: {
        some: {
          name: label,
        },
      },
    },
    include: {
      labels: true,
    },
  }).then(post => {
    console.log(post);
  });

  await prisma.$disconnect();
};

handle('标签一');
```

## 让Next.js服务器支持图片上传

Next.js 在开发环境下，启动服务后，动态的创建文件是可以访问到的，直到我部署到服务器后发现上传了图片都无法访问，经过搜索才发现，Next.js 出于安全考虑会将文件访问限制为仅在服务器以生产模式启动时存在的文件。

[production mode public folder can't access dynamically creating files ](https://github.com/vercel/next.js/issues/12656)


为了实现图片上传功能，只能借助Next.js的自定义服务功能了

[文档地址](https://nextjs.org/docs/advanced-features/custom-server)

这里我选择使用koa来处理图片资源请求，使用koa-send来响应图片。

```
yarn add koa
```

**e.g.**

```ts
// server.js

const { parse } = require('url');
const next = require('next');
const Koa = require('koa');
const send = require('koa-send');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = new Koa();
  server.use(async (context, next) => {
    const parsedUrl = parse(context.req.url, true);
    let done = false;
    // 检测请求路径
    if (/^\/static\/images/.test(parsedUrl.path)) {
      try {
        // 通过koa-send发送文件
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
    // 绕过koa内置的响应，因为这里不需要koa处理了，后续交给Next.js即可
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


创建好`server.js`后，需要把package.json中的命令改成：

```json
"scripts": {
  "dev": "node server.js",
  "build": "next build",
  "start": "NODE_ENV=production node server.js"
}
```

简单实现一个图片上传的接口

这里借助[multer](https://www.npmjs.com/package/multer)库，来处理上传的文件


```
yarn add multer

yarn add @types/multer -D
```

1. 配置好multer

    **e.g.**

    ```ts
    // pages/api/v1/upload.ts
    
    
    import multer from 'multer';
    import path from 'path';
    
    const storage = multer.diskStorage({
      // 设置文件名
      filename: (req, file, cb) => {
        const [filename, extname] = file.originalname.split('.');
        cb(null, `${filename}_${Date.now()}.${extname}`);
      },
      // 设置存储地址，如果是以函数形式传递参数，需要自己先把目录创建好，字符串形式multer会帮你创建目录
      destination: path.join(process.cwd(), '/static/images/posts'),
      },
    });

    const uploader = multer({
      storage,
      // 限制文件类型
      fileFilter: (req, file, cb) => {
        try {
          const isPassed = /^image.*/.test(file.mimetype);
          cb(null, isPassed);
        } catch (error: any) {
          cb(error);
        }
      },
      limits: {
        // 限制文件大小
        fileSize: 10485760,
      },
    });
    ```
    
 2. 声明中间件函数
 
     因为这个库不是围绕Next.js打造的，所以需要写一个兼容这个中间件的函数，官方文档也提供了代码示例
     
     [Connect/Express middleware support](https://nextjs.org/docs/api-routes/api-middlewares#connectexpress-middleware-support)
     
     ```ts
     // pages/api/v1/upload.ts
     
     import type { NextApiRequest, NextApiResponse } from 'next';
     
     /**
     * @see https://nextjs.org/docs/api-routes/api-middlewares
     */
    const runMiddleware = (req: NextApiRequest, res: NextApiResponse, middleware: (..._rest: any[]) => any) => new Promise((resolve, reject) => {
      middleware(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }

        return resolve(result);
      });
    });
     ```
     
 3. 实现上传接口
 
     ```ts
     import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
     
     const imageHandle:NextApiHandler = async (req, res) => {
      await runMiddleware(req, res, uploader.any());

      // @ts-ignore
      console.log(req.files);

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(200);
      res.json({
        code: 200,
        // @ts-ignore
        data: req.files[0],
        message: '上传成功',
      });
    };
    
    // 重要不设置这个，无法从body中获取file
    export const config = {
      api: {
        bodyParser: false,
      },
    };

    export default imageHandle;
    ```
    
    multer处理完成会存储在`req.files`，因为是简易版本，没有写类型声明，这里就用`@ts-ignore`略过了。
    
    
    最终接口的响应结果：
    
    
    ![WX20220225-172240@2x_1645781012731.png](/static/images/posts/WX20220225-172240@2x_1645781012731.png "WX20220225-172240@2x_1645781012731.png")
    
    
    当然也可以通过`域名 + /static/images/posts/图片名`访问到图片。

    
## 同步文章到GitHub


同步到GitHub其实也很简单，主要使用[simple-git](https://www.npmjs.com/package/simple-git)进行git相关的操作。

如果按照我这种方式使用，需要使用ssh方式连接github。

1. 存储文章到本地

    这一步可以在更新文章的时候做，当文章存储文章到数据库之后，再把它存在本地
    
    
    **e.g.**
    
    ```ts
    type CreatePostParams = {
      title: string;
      content: string;
      introduction: string;
    }
    
    async storageToLocal(userId: number, postData: CreatePostParams) {
      const postsDir = path.join(process.cwd(), `/static/posts/${userId}`);

      if (!existsSync(postsDir)) {
        const error = await fsPromises.mkdir(postsDir).catch(error => error);
        if (error) {
          return {
            succeed: false,
            data: error,
          };
        }
      }

      return fsPromises.writeFile(
        path.join(postsDir, `${postData.title}.md`),
        postData.content,
      )
        .then(() => ({ succeed: true, data: {} }))
        .catch(error => ({ succeed: false, data: error }));
    }
    ```
    
2. 使用simple-git同步到GitHub


    这里还是用实现一个接口去提交，和上传接口一样，详细的就不写了，把核心部分写上来。
    
    
    **e.g.**
    
    ```
    import type { SimpleGit } from 'simple-git';
    import simpleGit from 'simple-git';
    import path from 'path';
    
    const git: SimpleGit = simpleGit();
    
    git
      .add(path.join(process.cwd(), '/static'))
      .commit('update：更新static目录')
      .push(['origin', 'main'], () => console.log('sync done')),
    ```
    
    只要这三句就可以了，但是在实际过程中会遇到先`git pull`再`git push`的情况，我这里不先pull的原因是我怕遇到冲突，所以遇到提交失败，我目前的处理方案就是登录到服务器上去手动调试。
