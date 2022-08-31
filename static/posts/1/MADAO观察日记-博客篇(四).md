---
title: 'MADAO观察日记-博客篇(四)'
labels: ['Blog', 'Next.js', 'Database']
introduction: '个人博客网站实现 - 文章的增删改查'
---

![post_blog_4_cover_1645586707182.jpeg](/static/images/posts/post_blog_4_cover_1645586707182.jpeg "post_blog_4_cover_1645586707182.jpeg")

## 前言

[MADAO观察日记-博客篇(三)](https://greed.icu/posts/5)

之前几篇笔记中实现了用户相关的功能，初步了解了一些数据库的基本知识，今天来实现文章的增删改查，这里面涉及到一个新的知识点：

- relations（关系）

[代码参考](https://github.com/GreedyWhale/code-examples/tree/1d2d9ccfd131c8089b8b4d352d495c04abbd6bc6)

## relations

relations指的是在关系数据库中数据表之间的关系，在关系数据库中，当其中一个表具有引用另一个表的*主键*的*外键*时，两个表之间存在关系。

- 主键：指能够通过某个（或者多个）字段唯一区分出不同的记录，这个字段被称为主键，如果主键由多个字段组成，这种主键被称为联合主键。

- 外键：可以将两个表关联起来的字段叫做外键。

**e.g.**


- Member表
    | memberId | name | age |
    | --- | --- | --- |
    | 1 | 呱太 | 16 |

- Order表

    | orderId | price | orderStatus | memberId |
    | --- | --- | --- | --- |
    | 10 | 100 | paid | 1 |


1. Member表的主键是memberId
2. Order表中的memberId是Order表的外键，它指向Member表的memberId列。


通过外键可以实现：

1. 一对一
2. 一对多
3. 多对多

这几种关系。

回到个人博客项目，User表和Post表就是一对多的关系，一个用户可以有多篇文章。

## 创建Post表

先来定义Post表的基本字段

**e.g.**

```prisma
// prisma/schema.prisma

model Post {
  id           Int             @id              @default(autoincrement())
  title        String          @db.VarChar(512)
  content      String          @db.Text
  introduction String          @db.Text
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
}
```

然后将Post表和User表关联起来，按照[Prisma的文档](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)，可以使用`@relation`进行关联。

**e.g.**

```diff
// prisma/schema.prisma

Model User {
+  posts: Post[]
}

Model Post {
+  author   User @relation(fields: [authorId], references: [id])
+  authorId Int
}
```

`@relation(fields: [authorId], references: [id])`的意思是将关联的表中的*id*字段映射成*authorId*字段。

在数据库中生成Post表：

```bash
yarn prisma migrate dev --name create_post_table
```

## 新增文章

有了Post表之后就可以对它进行增删改查的操作了，先来实现创建文章。


#### 1. 定义创建文章的参数类型

**e.g.**

```ts
// types/controller/post.d.ts

export interface PostData {
  title: string;
  content: string;
  introduction: string;
}

export interface CreatePostParams extends PostData {
  id?: number;
}
```

#### 2. 创建postController类

**e.g.**

```ts
// controller/post.ts

import type { CreatePostParams, PostData } from '~/types/controller/post';
import type { User, Post } from '@prisma/client';
import type { ResponseData } from '~/types/api';

import { prisma } from '~/utils/db';
import { formatResponse } from '~/utils/middlewares';
import UserController from './user';

const userController = new UserController();

export default class PostController {
  static validator(postData: CreatePostParams) {
    const postDataErrors = {
      title: '文章标题不能为空',
      content: '文章内容不能为空',
      introduction: '文章简介不能为空',
    };

    let errorMessage = '';
    Object.keys(postData).every(key => {
      if (!postData[key as keyof PostData]) {
        errorMessage = postDataErrors[key as keyof PostData];
        return false;
      }

      return true;
    });

    return errorMessage || true;
  }

  async upsertPost(userId: number, postData: CreatePostParams): Promise<ResponseData<Post | {}>> {
    // 判断用户信息
    const handleUser = () => userController.getUser({ id: userId }).then(user => {
      if (user.status === 'rejected') {
        return Promise.reject(formatResponse(500, user.reason, user.reason.message || '获取用户失败'));
      }

      if (!user.value) {
        return Promise.reject(formatResponse(404, {}, '用户不存在'));
      }

      return user.value;
    });

    // 验证参数
    const handleParams = () => new Promise((resolve, reject) => {
      const postVerifiedResult = PostController.validator(postData);

      if (postVerifiedResult !== true) {
        reject(formatResponse(422, {}, postVerifiedResult));
        return;
      }

      resolve(true);
    });

    // 创建或者更新文章
    const handlePost = (user: User) => {
      const { id = -1, ...rest } = postData;
      return prisma.post.upsert({
        where: { id },
        create: {
          ...rest,
          author: {
            connect: {
              id: user.id,
            },
          },
        },
        update: {
          ...rest,
          author: {
            connect: {
              id: user.id,
            },
          },
        },
      })
        .then(post => post)
        .catch(error => Promise.reject(formatResponse(500, error, error.message)));
    };

    try {
      const user = await handleUser();
      await handleParams();
      await handlePost(user);
      const post = await handlePost(user);
      return formatResponse(200, post, postData.id ? '更新成功' : '发布成功');
    } catch (error) {
      return error;
    }
  }
}
```

上面代码中用到了upsertAPI，这个API是用来更新现有的或创建新的数据库记录（创建或者更新）。

[upsert 文档](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#upsert)

我这边只在操作Post表之前判断了用户是否存在，再严格一点可以给用户添加一些权限，进行权限的判断。

这样一来文章的创建和更新用一个方法就搞定了。


#### 3. 实现posts接口

**e.g.**

```ts
// pages/api/posts/index.ts

import type { NextApiHandler } from 'next';

import { endRequest, checkRequestMethods, formatResponse } from '~/utils/middlewares';
import { SESSION_USER_ID } from '~/utils/constant';
import PostController from '~/controller/post';
import { withSessionRoute } from '~/utils/withSession';

const postController = new PostController();

const postsHandler: NextApiHandler = async (req, res) => {
  await checkRequestMethods(req, res, ['POST']);

  const { postData } = req.body;
  const userId = req.session[SESSION_USER_ID];

  if (req.method === 'POST') {
    if (!userId) {
      return endRequest(res, formatResponse(422, {}, '请先登录'));
    }

    const post = await postController.upsertPost(userId, postData);
    endRequest(res, post);
  }
};

export default withSessionRoute(postsHandler);

```

目前只处理了使用`POST`方法的请求，当创建文章的时候，并不知道文章id，所以把接口写在`pages/api/v1/posts/index.ts`文件中，这样只要请求`api/v1/posts`这个地址，请求就会被发送到这里来。

#### 4. 测试文章提交


**e.g.**

```tsx
// pages/index.tsx

const Home: NextPage<{ userId: number; }> = props => {
  //...
  
  const [post, setPost] = React.useState({
    title: '',
    introduction: '',
    content: '',
  });
  
  const handleSubmit = () => {
    axios.post('/api/v1/posts', { postData: post })
      .then(response => console.log(response));
  };
  
  
  return (
    <div className={styles.container}>
      {/* ... */}
       <section>
        <h1>创建文章</h1>
        <input type="text" placeholder="请输入博客标题" onChange={event => setPost(prev => ({ ...prev, title: event.target.value }))} />
        <input type="text" placeholder="请输入博客简介" onChange={event => setPost(prev => ({ ...prev, introduction: event.target.value }))} />
        <textarea placeholder="请输入博客内容" onChange={event => setPost(prev => ({ ...prev, content: event.target.value }))}></textarea>
        <br />
        <button onClick={handleSubmit}>提交</button>
      </section>
    </div>
  
  )

}

export default Home;
```

结果


![WX20220224-155923@2x_1645689602981.png](/static/images/posts/WX20220224-155923@2x_1645689602981.png "WX20220224-155923@2x_1645689602981.png")


用户id也正确的关联上了，文章也创建成功了。


## 获取文章详情


#### 1. 动态 API 路由

Next.js框架提供了*Dynamic API Routes*这个功能。

[文档地址](https://nextjs.org/docs/api-routes/dynamic-api-routes)

简单说就是可以将文件命名成占位符的格式

**e.g.**

```
pages
  |-api
    |-examples     // 目录名
       |-[id].tsx  // 文件名
```

这样命名了之后，使用`/api/examples/1`去请求，就可以通过以下形式获取到占位符中的值

**e.g.**

```
const handler: NextApiHandler = async (req, res) => {
  console.log(req.query); // { id: '1' }
  res.send('ok');
};
```

不仅是 api 路由可以这样写，页面级的路由也可以这样写。

接下来就来实现`posts`接口，会用到动态 API 路由这个功能。


#### 2. 实现获取文章方法


**e.g.**

```ts
// controller/post.ts


//...
import { promiseWithSettled } from '~/utils/promise';


export default class PostController {
  //...
  async getDetail(id: number) {
    const postDetail = await promiseWithSettled(prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    }));

    if (postDetail.status === 'fulfilled') {
      return formatResponse(200, postDetail.value);
    }

    return formatResponse(500, postDetail.reason, postDetail.reason.message);
  }

}

```

这里面用到了`include`查询参数，`include`定义了要包含哪些关系在返回结果里，之前在创建Post表的时候就让它和User表形成了一个一对多的关系，所以这里可以很方便的获取到文章作者的信息。

#### 3. 实现获取文章详情接口

获取文章详情的接口就要像动态 API 路由里写的那样，写在用占位符形式命名的文件里。

**e.g**

```ts
// pages/api/v1/posts/[id].ts

import type { NextApiHandler } from 'next';

import PostController from '~/controller/post';
import { endRequest, checkRequestMethods } from '~/utils/middlewares';
import { withSessionRoute } from '~/utils/withSession';

const postController = new PostController();

const postDetailHandler:NextApiHandler = async (req, res) => {
  await checkRequestMethods(req, res, ['GET']);
  const { id } = req.query;

  if (req.method === 'GET') {
    const detail = await postController.getDetail(parseInt(id as string, 10));

    endRequest(res, detail);
  }
};

export default withSessionRoute(postDetailHandler);

```

从`req.query`中拿到id，然后查询数据库即可。


## 更新文章

更新文章的方法在创建文章的时候就实现了，这边就直接写接口了。

**e.g.**

```ts
// pages/api/v1/posts/[id].ts

import type { NextApiHandler } from 'next';

import PostController from '~/controller/post';
import { endRequest, checkRequestMethods, formatResponse } from '~/utils/middlewares';
import { withSessionRoute } from '~/utils/withSession';
import { SESSION_USER_ID } from '~/utils/constant';

const postController = new PostController();

const postDetailHandler:NextApiHandler = async (req, res) => {
  await checkRequestMethods(req, res, ['GET', 'PUT']);
  const { id } = req.query;
  const { postData } = req.body;
  const userId = req.session[SESSION_USER_ID];

  if (req.method === 'GET') {
    const detail = await postController.getDetail(parseInt(id as string, 10));

    endRequest(res, detail);
  }

  if (typeof userId !== 'number') {
    endRequest(res, formatResponse(500, {}, '请先登录'));
    return;
  }

  if (req.method === 'PUT') {
    const result = await postController.upsertPost(userId, { ...postData, id: parseInt(id as string, 10) });
    endRequest(res, result);
  }
};

export default withSessionRoute(postDetailHandler);

```

## 删除文章

删除文章这边就不写代码了核心就这一句代码

```
prisma.post.delete({ where: { id } })
```

完整代码参考

[controller/post.ts](https://github.com/GreedyWhale/code-examples/blob/1d2d9ccfd131c8089b8b4d352d495c04abbd6bc6/blog/controller/post.ts)
[pages/api/v1/posts/[id].ts](https://github.com/GreedyWhale/code-examples/blob/1d2d9ccfd131c8089b8b4d352d495c04abbd6bc6/blog/pages/api/v1/posts/%5Bid%5D.ts)


## 获取文章列表

获取文章列表也很简单使用prisma的`findMany`方法就可以了，如果有分页的需求可以这样写：

**e.g.**

```ts
prisma.post.findMany({
  skip: 0, // 跳过的数量（页码 * 每页的文章数）
  take: 10, // 每次饭回的数量
  where: {},
  orderBy: { createdAt: 'desc' }, // 降序排序（Z → A）
}),
```

如果想要获取总数量，可以使用

```ts
prisma.post.count()
```

这里可以使用`prisma.$transaction`进行整体操作

**e.g.**

```ts
const [posts, totalPosts] = await prisma.$transaction([
  prisma.post.findMany({ where: { title: { contains: 'prisma' } } }),
  prisma.post.count(),
])
```

这样的好处是假如有一条语句失败了，那么整个操作都会撤销。

> 把多条语句作为一个整体进行操作的功能，被称为数据库事务
> 
> ----《[事务](https://www.liaoxuefeng.com/wiki/1177760294764384/1179611198786848)》