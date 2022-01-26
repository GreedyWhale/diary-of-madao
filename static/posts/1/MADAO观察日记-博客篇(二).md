---
title: 'MADAO观察日记-博客篇(二)'
labels: ['Blog', 'Next.js', 'Database']
introduction: '个人博客网站实现笔记 - 用户注册功能实现'
---

## 前言

[MADAO观察日记-博客篇(一)](https://greed.icu/posts/1)

这一篇笔记记录了实现用户的注册功能。

涉及到的知识有：

- 数据表的设计
- 前后端接口的设计


[代码参考](https://github.com/GreedyWhale/code-examples/tree/359b7ac2ca013b26ddd89299ea76013d926e2209/blog)

## 一些数据库相关的概念

1. 关系型数据库

    创建在关系模型基础上的数据库，关系模型将数据用二维表格表示，任何数据都可以行号+列号唯一确定。
    
    e.g.
    
    | id | name | age |
    | --- | --- | --- |
    | 1 | croak | 30 |
    | 2 | goblin | 16 |

2. 数据库设计范式

    [数据库规范化](https://zh.wikipedia.org/wiki/%E6%95%B0%E6%8D%AE%E5%BA%93%E8%A7%84%E8%8C%83%E5%8C%96)
    
    说实话基本看不懂，我是看了其他人的文章才理解了一些，但是不确定是不是对的。
    
    数据库的设计一般满足到第三范式即可。
    
    **第一范式**：字段原子性，就是说字段不可再分，比如有一个字段是*联系方式*，联系方式可以再拆分成*手机号*、*社交媒体账号*、*电子邮箱地址*等等，这种字段就不符合第一范式。
    
    **第二范式**：没有部分函数依赖。
    
    这里需要先搞懂*函数依赖*
    
    ```
    R = {学号，姓名，年龄}
    ```
    
    假设有一个集合R，知道了*学号*，就能得出*姓名*和*年龄*，就可以说*姓名*和*年龄*函数依赖于*学号*，类似于函数关系 y = f(x)，在x的值确定的情况下，y的值一定是确定的。
    
    部分函数依赖的意思是：
    
    e.g.
    
    | 学号 | 姓名 | 年龄 | 课程 | 分数 |
    | --- | --- | --- | --- | --- |
    | 1 | 呱太 | 16 | 起死回生 | 100 |
    | 1 | 呱太 | 16 | 续命 | 100 |
    
    确定了*学号 + 课程* 就能确定*姓名*、*年龄*，如果只确定*学号*也能得出*姓名*、*年龄*，这种情况就可以说是*姓名*、*年龄*部分函数依赖*学号 + 课程*。
    
    > 通过AB能得出C，通过A也能得出C，或者通过B也能得出C，那么说C部分依赖于AB。 
    >
    > ---- [关系型数据库设计三大范式到底是什么？](https://www.bilibili.com/read/cv9002189)
    
    完全函数依赖
    
    确定了*学号 + 课程*就能获得*分数*，但是只有*学号*或者只有*课程*是无法得出*分数*的，这样的情况就是*分数*完全函数依赖于*学号 + 课程*
    
    
    e.g.
    
    | 学号 | 姓名 | 年龄 | 课程 | 分数 |
    | --- | --- | --- | --- | --- |
    | 1 | 呱太 | 16 | 起死回生 | 100 |
    | 1 | 呱太 | 16 | 续命 | 100 |
    
    这个表就不符合第二范式的要求
    
    所以需要改成这样
    
    e.g.
    
    | 学号 | 姓名 | 年龄 |
    | --- | --- | --- |
    | 1 | 呱太 | 16 |
    
    | 学号 | 课程 | 分数 |
    | --- | --- | --- |
    | 1 |起死回生 | 100 |
    | 1 |续命 | 100 |

    **第三范式**：没有传递函数依赖
    
    
    e.g.
    
    | 学号 | 姓名 | 年龄 | 系名 | 系主任 |
    | --- | --- | --- | --- | --- |
    | 1 | 呱太 | 16 | 电击系 | 御坂美琴 |
    | 2 | 20001号 | 16 | 把妹系 | 上条当麻 |
    
    上表中只要知道了学号就能得出剩余的字段，但是在没有学号的情况下只要确定了*系名*也能得出*系主任*，上表中有这样一个关系
    
    `学号 -> 系名`
    `系名 -> 系主任`
    
    *系主任*和*学号*就出现了传递函数依赖。
    
    需要改成
    
    e.g.
    
    | 学号 | 姓名 | 年龄 | 系名 |
    | --- | --- | --- | --- |
    | 1 | 呱太 | 16 | 电击系 |
    | 2 | 20001号 | 16 | 把妹系 |
    
    | 系名 | 系主任 |
    | --- | --- |
    | 电击系 | 御坂美琴 |
    | 把妹系 | 上条当麻 |

## 创建User表

先不考虑其他情况，用户所需要的基本字段有：

| id | 用户名 | 密码 | 创建时间 | 更新时间 |
| --- | --- | --- | --- | --- |

**这里需要注意的是用户的密码一定不能明文存储**

```prisma
// prisma/schema.prisma

model User {
  id             Int      @default(autoincrement())  @id
  username       String   @db.VarChar(255)           @unique
  passwordDigest String   @db.Text
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

然后执行`yarn prisma migrate dev --name create_user_table`


执行成功后就可以去容器看看创建好的User表

```bash
docker ps -a # 获取容器id

docker exec -it 容器id bash # 进入容器

psql -U admin # 以admin的身份登录PostgreSQL

\c development # 连接development数据库

SELECT * FROM "User"; # 查看User表中的所有数据
```

## 实现注册功能

#### 1. 简单写一个注册表单

**e.g.**


```html
<!-- pages/index.tsx -->
<section>
  <h1>注册</h1>

  <div>
    <label htmlFor="Username">用户名</label>
    <input type="text" placeholder="Username" name="Username" />
  </div>

  <div>
    <label htmlFor="Password">密码</label>
    <input type="password" placeholder="Password" name="Password"/>
  </div>

  <button>提交</button>
</section>
```

#### 2. 实现注册流程逻辑

在上一步实现的表单中添加一些方法，用于处理用户输入的数据。

**e.g.**

```tsx
// pages/index.tsx

const [username, setUsername] = React.useState('');
const [password, setPassword] = React.useState('');

const handleSignUp = () => {
  // 提交注册信息
};

return (
  <div className={styles.inputWrap}>
    <label htmlFor="Username">用户名</label>
    <input
      type="text"
      placeholder="Username"
      name="Username"
      onChange={event => setUsername(event.currentTarget.value)}
    />
  </div>

  <div className={styles.inputWrap}>
    <label htmlFor="Password">密码</label>
    <input
      type="password"
      placeholder="Password"
      name="Password"
      onChange={event => setPassword(event.currentTarget.value)}
    />
  </div>

  <button onClick={handleSignUp}>提交</button>
)
```

现在用户输入的用户名和密码可以在前端获取到了，需要实现一个接口将这些数据提交给服务器。


#### 3. 实现注册接口


注册的流程是：

1. 表单验证（检查用户输入是否符合要求）
2. 检查用户名是否已存在
3. 对提交的密码进行加密
4. 创建新用户

按照上面的流程一个一个实现

- #### 表单验证

    **e.g.**

    ```ts
    // controller/user.ts

    export default class UserController {

      static validator(username: string, password: string) {
        if (!/^[\w\d]{3,20}$/.test(username)) {
          return {
            passed: false,
            message: '用户名格式错误，用户名长度为3～20的字母或数字组成',
          };
        }

        if (!/^[\w\d]{6,15}$/.test(password)) {
          return {
            passed: false,
            message: '密码格式错误，密码长度为6～15的字母或数字组成',
          };
        }

        return {
          passed: true,
          message: '验证通过',
        };
      }
    }
    ```

- #### 检查用户名是否已存在

    检查用户名存在需要连接数据库，连接数据库的方法Prisma官方有提供一个最佳实践：

    [Best practice for instantiating PrismaClient with Next.js](https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices#solution)


    **e.g.**

    ```ts
    // utils/db.ts


    import { PrismaClient } from '@prisma/client';

    export const prisma = global.prisma || new PrismaClient({ log: ['query'] });

    if (process.env.NODE_ENV !== 'production') {
      global.prisma = prisma;
    }
    ```

    ```ts
    // types/addOnNodeJSGlobal.d.ts

    import type { PrismaClient } from '@prisma/client';

    declare global {
      // allow global `var` declarations
      // eslint-disable-next-line no-var
      var prisma: PrismaClient | undefined;
    }
    ```

    有了连接了数据库的方法之后就可以进行数据查询了

    ```
    // controller/user.ts
    import { prisma } from '~/utils/db';

    export default class UserController {

      // ...
      async getUser(condition: Partial<{
        id: number;
        username: string;
      }>) {
        const user = await prisma
          .user
          .findUnique({ where: condition })
          .then(result => ({ value: result, status: 'fulfilled' }))
          .catch(error => ({ reason: error, status: 'rejected' }));

        return user;
      }
    }
    ```

- #### 密码加密

    上面几步做完就可以在数据库中创建用户记录了，在创建之前不要忘记对密码进行加密

    ```bash
    yarn add crypto-js 

    yarn add @types/crypto-js -D
    ```

    **e.g.**

    ```ts
    // controller/user.ts

    import sha3 from 'crypto-js/sha3';
    import hex from 'crypto-js/enc-hex';

    export default class UserController {
      //...

      static crypto(password: string) {
        return hex.stringify(sha3(password));
      }
    }
    ```

- #### 创建用户

    **e.g.**

    ```ts
    // controller/user.ts

    export default class UserController {
      // ...
      async createUser(username: string, password: string) {
        const user = await prisma
          .user
          .create({
            data: {
              username,
              passwordDigest: UserController.crypto(password),
            },
          })
          .then(result => ({ value: result, status: 'fulfilled' }))
          .catch(error => ({ reason: error, status: 'rejected' }));

        return user;
      }
    }

    ```

上面几步完成后就可以写接口了

在Next.js中前后端通讯的接口需要写在*pages/api*目录下

e.g.

```ts
// pages/api/v1/user.ts

import type { NextApiHandler } from 'next';

import UserController from '~/controller/user';

const userController = new UserController();

const user: NextApiHandler = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // 检查请求方法
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405);
    res.json({
      code: 405,
      message: '请求方法不允许',
      data: {},
    });
    return;
  }

  const { username, password } = req.body;

  // 检查用户提交数据
  const testResult = UserController.validator(username, password);
  if (!testResult.passed) {
    res.status(422);
    res.json({
      code: 422,
      message: testResult.message,
      data: {},
    });
    return;
  }

  // 检测用户是否已经存在
  const user = await userController.getUser({ username });
  if (user.status === 'fulfilled' && user.value) {
    res.status(422);
    res.json({
      code: 422,
      message: '用户已存在，请直接登录',
      data: {},
    });
    return;
  }

  // 创建新用户
  const newUser = await userController.createUser(username, password);

  if (newUser.status === 'rejected') {
    res.status(500);
    res.json({
      code: 500,
      message: newUser.reason.message || '创建用户失败，请稍后重试！',
      data: newUser.reason,
    });
    return;
  }

  res.status(200);
  res.json({
    code: 200,
    message: '创建成功！',
    data: newUser.value,
  });
};

export default user;

```

目前代码有很多优化的地方，先不用优化，测试下功能正不正常。

#### 4. 补全注册页面的代码

这个项目使用*axios*进行数据请求，首先安装它

```bash
yarn add axios
```

**e.g.**

```tsx
// pages/index.tsx

const handleSignUp = () => {
  axios.post('/api/v1/user', { username, password })
    .then(response => {
      alert('注册成功');
      console.log('response', response);
    })
    .catch(error => {
      alert('注册失败');
      console.log('error', error);
    });
};
```
**注意**：这里我选择在后端去验证用户输入，如果选择在前端验证，上面的UserController部分的代码就需要改动一下，因为PrismaClient无法在浏览器端使用，如果使用`UserController.validator`在前端去验证就会报错。

目前注册的流程就完了，经过测试发现接口会把用户加密过的密码也返回

![注册结果](/static/images/posts/WX20220126-163025@2x_1643185871747.png "WX20220126-163025@2x_1643185871747.png")

这样做有点不安全，所以还需要优化一下。


## 优化代码

#### 1. 去除接口返回的passwordDigest字段

**e.g.**

```tsx
// controller/user.ts

export default class UserController {
  // ...
  
  async createUser(username: string, password: string) {
    const user = await prisma
      .user
      .create({
        data: {
          username,
          passwordDigest: UserController.crypto(password),
        },
        /* 新增 */
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
        /* 新增结束 */
      })
      .then(result => ({ value: result, status: 'fulfilled' }))
      .catch(error => ({ reason: error, status: 'rejected' }));

    return user;
  }
}
```

PrismaClient提供了一个select参数，它可以让使用者选择从数据库中获取记录的哪些字段，还有一种方法是手动去掉`passwordDigest`字段，比如使用*lodash*库提供的`omit`方法。


#### 2. 增加promiseWithSettled方法

*UserController*的*getUser*、*createUser*方法具有高度的相似度，其实就是把promise包裹一下。

参考[Promise.allSettled](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)方法，自己实现一个promiseWithSettled

**e.g.**

```ts
// types/promise.d.ts

export type PromiseWithSettled = {
  <T>(promiseInstance: Promise<T>): Promise<{
    value: T;
    status: 'fulfilled'
  } | {
    reason: any;
    status: 'rejected'
  }>
};
```


```
// utils/promise.ts

import type { PromiseWithSettled } from '~/types/promise';

export const promiseWithSettled: PromiseWithSettled = promiseInstance => promiseInstance
  /*
   * 这里ts的写法很奇怪，我目前还想不到好的写法，
   * ts总是把status推导成string，所以这里用as强制转换类型
   */
  .then(result => ({ value: result, status: 'fulfilled' as 'fulfilled' }))
  .catch(error => ({ reason: error, status: 'rejected' }));

```

*UserController*的*getUser*、*createUser*方法

```ts
// controller/user.ts
import { promiseWithSettled } from '~/utils/promise';


export default class UserController {

  async getUser(condition: Partial<{
    id: number;
    username: string;
  }>) {
    const user = await promiseWithSettled(prisma.user.findUnique({ where: condition }));
    return user;
  }

  async createUser(username: string, password: string) {
    const createParams = {
      data: {
        username,
        passwordDigest: UserController.crypto(password),
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    };
    const user = await promiseWithSettled(prisma.user.create(createParams));

    return user;
  }
}
```

#### 3. 优化api/v1/user.ts接口

user接口也是有很多相似的代码也需要优化一下

**e.g.**

```ts
types/api.d.ts

export type ResponseStatusCode = 200
| 204
| 401
| 403
| 404
| 405
| 422
| 500;

export type ResponseData<T> = {
  code: ResponseStatusCode;
  data: T;
  message: string;
};

export type ResponseMessageMap = {
  [key in ResponseStatusCode]: string;
};
```

```ts
// utils/middlewares.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ResponseData, ResponseStatusCode, ResponseMessageMap } from '~/types/api';

const messages: ResponseMessageMap = {
  200: '请求成功',
  204: 'No Content',
  401: '用户认证失败',
  403: '权限不足',
  404: '未找到相关资源',
  405: '请求方法不允许',
  422: '请求参数，请检查后重试',
  500: '服务器出错',
};

export const formatResponse = <T>(code: ResponseStatusCode, data?: T, message?: string) => ({
  code,
  data: data || {},
  message: message || messages[code],
});

export const endRequest = <T>(res: NextApiResponse, data: ResponseData<T>, headers?: Record<string, string>) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (headers) {
    Object.entries(headers).forEach(item => {
      const [key, value] = item;
      res.setHeader(key, value);
    });
  }

  res.status(data.code);
  res.json(data);
};

export const checkRequestMethods = async (req: NextApiRequest, res: NextApiResponse, allowedMethods: string[]) => {
  if (allowedMethods.includes(req.method || '')) {
    return Promise.resolve(true);
  }

  const data = formatResponse(405);
  endRequest(res, data, { Allow: allowedMethods.join(',') });
  return Promise.reject(new Error('请求方法不允许'));
};

```

上面封装了检查请求方法、格式化响应数据、接口返回这三个方法，现在修改`api/v1/user.ts`

**e.g.**

```ts
// pages/v1/user.ts
import type { NextApiHandler } from 'next';

import UserController from '~/controller/user';
import { formatResponse, checkRequestMethods, endRequest } from '~/utils/middlewares';

const userController = new UserController();

const user: NextApiHandler = async (req, res) => {
  await checkRequestMethods(req, res, ['POST']);
  const { username, password } = req.body;

  // 检查用户提交数据
  const testResult = UserController.validator(username, password);
  if (!testResult.passed) {
    endRequest(res, formatResponse(422, {}, testResult.message));
    return;
  }

  // 检测用户是否已经存在
  const user = await userController.getUser({ username });
  if (user.status === 'fulfilled' && user.value) {
    endRequest(res, formatResponse(422, {}, '用户已存在，请直接登录'));
    return;
  }

  // 创建新用户
  const newUser = await userController.createUser(username, password);
  if (newUser.status === 'rejected') {
    endRequest(res, formatResponse(500, newUser.reason, newUser.reason.message || '创建用户失败，请稍后重试！'));
    return;
  }

  endRequest(res, formatResponse(200, newUser.value, '创建成功！'));
};

export default user;
```
    