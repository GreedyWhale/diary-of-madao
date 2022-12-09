---
title: 'MADAO观察日记-博客篇(三)'
introduction: '实现登录功能及代码优化'
---

![banner_3.jpeg](/_next/upload/banner_3_1670576072877.jpeg "banner_3.jpeg")

## 0x00 前言

上一篇笔记记录了实现用户注册的过程，还十分简陋，代码也需要优化。

在实现登录功能之前，先来进行代码的重构，这次重构的目标有：

1. 实现中间件功能
    
    - 用户身份验证
    - 请求方法的验证 

2. 封装验证请求参数方法
3. 封装格式化返回数据方法

## 0x01  Middleware

Middleware 翻译过来就是中间件，我初次接触到中间件的概念还是在第一次找工作时为了面试而学习*Express*的时候接触到的，我对中间件的理解是：

![note_3_middleware.png](/_next/upload/note_3_middleware_1670297113576.png "note_3_middleware.png")

从接收到请求到最终响应，可以使用多个中间件（函数）对请求对象或者响应对象进行处理，当前中间件处理完毕后，就移交给下一个中间件，当所有中间件处理完成后，就进行最终的响应，但是中间件也有中止处理的权限，提前进行响应，比如：用户鉴权。当用户鉴权不通过时，直接进行响应，不用经过后面的中间件处理。

在 Next.js 中也有 Middleware 功能，[文档地址](https://nextjs.org/docs/advanced-features/middleware)。

一开始我也使用的是它内置的Middleware，后来遇到了一些坑，导致我不得不自己写。

遇到的坑是：在 Next.js v12.3.1 的版本，只要存在中间件，你就无法上传超过 16kb 大小的文件，这导致我无法实现图片上传功能，具体参考：

[Presence of middleware prevents access to raw request bodies greater than or equal to 16,384 bytes (16 KiB)](https://github.com/vercel/next.js/issues/39262)

**注意**：在现在最新的 Next.js v13 版本中，该问题已修复，并且增加了中间件响应的功能，看起来十分好用，我还没用过，所以如果使用的是`>= 13`的版本，使用内置的 Middleware 应该是最优方案。


## 0x02 实现格式化响应数据的方法

首先定义响应数据的格式：

```ts
const response = {
    resource: {},            // 响应数据
    status: 200,             // 状态吗
    message: 'OK',           // 响应描述
    errors: {                // 错误信息
        username: ['错误信息'],
        password: ['错误信息']
    }
}
```

错误信息定义成这种是受了 Ruby On Rails 的影响，这样定义错误信息主要是用于表单验证，可以很方便的写表单字段验证方法，假设不是表单类型的验证，可以直接在message字段返回错误信息，缺点就是前端处理起来会麻烦一点。


接下来就来实现：

```ts
// lib/api.ts

export type Response<T> = {
  resource?: T;
  status: number;
  message: string;
  errors?: Record<string, string[]>;
};

const responseMessageMap: Record<string, string> = {
  200: 'ok',
  401: 'Unauthorized',
  404: 'Not Found',
  405: 'Method Not Allowed',
  500: 'Internal Server Error',
};

export const formatResponse = <T>(params: Partial<Response<T>>): Response<T> => {
  const status = params.status ?? 200;

  return {
    resource: params.resource,
    status,
    message: params.message ? params.message : responseMessageMap[status],
    errors: params.errors,
  };
};

```



## 0x03 实现判断请求方法的中间件

```ts
// lib/middleware.ts

import type { NextApiRequest, NextApiResponse } from 'next';

import { formatResponse } from '~/lib/api';

// 定义中间件函数类型
type MiddlewareType = (req: NextApiRequest, res: NextApiResponse, ...args: any[]) => Promise<any>;

// 检查请求方法
export const noMatchMiddleware: MiddlewareType = async (req, res, allowedMethods: string[]) => {
  const currentMethod = (req.method ?? '').toLowerCase();
  if (allowedMethods.includes(currentMethod)) {
    return true;
  }

  res.setHeader('Allow', allowedMethods.map(value => value.toLocaleUpperCase()).join(','));
  res.status(405);
  return Promise.reject(formatResponse({ status: 405 }));
};
```

因为中间件不可能总是同步函数，所以我这里为了保持统一，即便`noMatchMiddleware`不需要异步，我也把它写成了异步，只是为了让代码看起来比较整齐，没啥其他的作用。


## 0x04 实现执行中间件的中间件


执行中间件的中间件这个概念有点绕，以上面实现的中间件来举例子，中间件有一个重要的功能就是提前结束请求，比如上面实现的检查请求方法的中间件，假如请求方法都错了，那后面的中间件就没有必要继续处理了。

所以一个简单的请求可能是这样的：

```ts

const handler: NextApiHandler = async (req, res) => {
  try {
    await noMatchMiddleware(req, res, ['POST']);
  } catch (error) {
    res.json(error);
  }
};
```

但是这个`try...catch...`语句要在每一个用到中间的请求中写一遍，所以我又封装了一层：

```ts
// lib/middleware.ts

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

type HandlerType = Partial<Record<'get' | 'post' | 'put' | 'patch' | 'delete', NextApiHandler>>;

export const withMiddleware = (handler: HandlerType): NextApiHandler => async (req, res) => {
  const method = (req.method ?? '').toLowerCase() as keyof HandlerType;

  try {
    await noMatchMiddleware(req, res, Object.keys(handler));
    await handler[method]!(req, res);
  } catch (error) {
    res.json(error);
  }
};
```

解释下代码：

1. `withMiddleware` 就是执行中间件的中间件，它接受一个对象，然后返回一个 `NextApiHandler` 类型的函数。

2. `withMiddleware` 接受的对象是这种结构：

    ```ts
    const handlerMap = {
        get: async (req, res) => {},
        post: async (req, res) => {},
        put: async (req, res) => {},
        patch: async (req, res) => {},
        delete: async (req, res) => {},
    };
    ```
    
这样定义参数结构，也是受到Ruby On Rails 的启发。
 
这样定义参数后，请求方法就可以看对象的`key`了，只要没有定义`key`，那么就表示当前接口不支持该请求方法。

在上面代码中

```ts
Object.keys(handler)
```

这一句就是获取所有支持请求方法的代码。

使用起来就是这样：

```ts
import { withMiddleware } from '~/lib/middleware';
import { formatResponse } from '~/lib/api';

export default withMiddleware({
  async get(req, res) {
    res.status(200).json(formatResponse({ status: 200, message: '请求成功' }));
  },

  async post(req, res) {
    res.status(200).json(formatResponse({ status: 200, message: '请求成功' }));
  }
});
```


有了这个中间件就可以改写上一篇笔记中的注册方法了：

- 改写前：


     ```ts
     // pages/api/v1/session.ts

     import type { NextApiHandler } from 'next';

     import UserModel from '~/model/user';

     const session: NextApiHandler = async (req, res) => {
       if (req.method === 'POST') {
         const user = new UserModel();

         const result = await user.create(req.body.username, req.body.password);

         res.status(result.status).json(result);

         return;
       }

       res.status(405).json({ message: '请求方法不允许' });
     };

     export default session;

     ```
     
 
- 改写后：

    ```ts
    import UserModel from '~/model/user';
    import { withMiddleware } from '~/lib/middleware';
    import { formatResponse } from '~/lib/api';

    export default withMiddleware({
      async post(req, res) {
        const user = new UserModel();
        const result = await user.create(req.body.username, req.body.password);
        res.status(result.status).json(result);
      },
    });
    ```

## 0x05 封装验证方法

这里的验证方法指的是验证请求参数的方法，请求参数应该后端去验证，因为前端代码是公开的，请求也可以伪造，所以就算前段有验证，后端也要再验证一遍。

```ts
// lib/validator.ts

export type CustomObject = Record<string, any>;

export type Rules<T> = Array<{
  key: keyof T;
  message: string;
  required: boolean | ((_value: T[keyof T]) => boolean);
}>;

type Errors<T> = {
  [key in keyof T]?: string[]
};

export const validator = <T extends CustomObject>(dataSource: T, rules: Rules<T>): Errors<T> | undefined => {
  const errors: Errors<T> = {};

  rules.forEach(rule => {
    const value = dataSource[rule.key];

    if (typeof rule.required === 'boolean') {
      if (value !== 0 && !value) {
        errors[rule.key] = errors[rule.key] || [];
        errors[rule.key]?.push(rule.message);
      }

      return;
    }

    const passed = rule.required(value);
    if (!passed) {
      errors[rule.key] = errors[rule.key] || [];
      errors[rule.key]?.push(rule.message);
    }
  });

  if (Object.keys(errors).length === 0) {
    return;
  }

  return errors;
};
```

这就是验证方法，它接受参数是这样的：

```ts

const dataSource = {
    name: 'allen',
    password: '123456',
    gender: 'male'
};


const rules = [
    { key: 'name', message: '姓名不能为空', required: true },
    { key: 'name', message: '姓名格式错误', required: value => /^\w{6,20}$/.test(value) },
    { key: 'password', message: '密码不能为空', required: true },
    { key: 'gender', message: '性别错误，性别必须包含在以下的值中：male、female、other', required: value => ['male', 'female', 'other'].includes(value) },
];
```

返回的数据格式是：

```ts
const errors = {
    name: ['message1', 'message2'],
    password: ['message1']
    ...
};
```

这样验证的好处是可以对同一个字段定义多个规则，验证的时候可以全部验证，避免了使用多个`if`去判断。

这个是思路受到*Ant Design*这个框架启发，它的表单框架就可以在表单项上去定义这些规则，用起来很方便。

将这个验证方法写到一个类中，然后让接口的`Model`都继承自这个类。

```ts
// model/index.ts

import type { Response } from '~/lib/api';
import type { Rules, CustomObject } from '~/lib/validator';

import { validator } from '~/lib/validator';
import { formatResponse } from '~/lib/api';

class BaseModel {
  async validator<T extends CustomObject>(dataSource: T, rules: Rules<T> = []) {
    const errors = validator(dataSource, rules);

    if (errors) {
      return Promise.reject(formatResponse({ status: 422, errors: errors as Response<unknown>['errors'] }));
    }
  }

  async execSql<T extends Promise<unknown>, R = Response<Awaited<T>>>(sql: T, formatFn?: (result: Awaited<T>) => R): Promise<R> {
    try {
      const result = await sql;
      if (formatFn) {
        return formatFn(result);
      }

      return formatResponse({ resource: result }) as R;
    } catch (error) {
      return formatResponse({ status: 500, message: (error as Error).message }) as R;
    }
  }
}

export default BaseModel;

```

在这个基础类上除了实现了验证方法，我还写了一个用于执行数据库查询语句的方法。因为数据库查询我这里的处理都是，查询成功就返回数据，失败就报500错误，所以可以简单的封装一下，同时再接受一个格式化函数参数，从数据库中查询到的数据可以使用这个函数进行格式化。


这个基础类写好之后，UserMadel 就可以进行改写了：

- 改写前：

```ts
// model/user.ts

import type { User } from '@prisma/client';

import { pick } from 'lodash';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';

import { prisma } from '~/lib/db';


export type UserInfo = Pick<User, 'id' | 'username'>;

class UserModel {

  // 加密方法
  encryptPassword(password: string) {
    return Base64.stringify(hmacSHA512(password, process.env.USER_PASSWORD_KEY!));
  }

  async create(username: string, password: string) {
    // 查找用户是否存在
    const user = await prisma.user.findUnique({ where: { username } });
    
    // 如果用户存在，则判断密码是否正确
    if (user) {
      // 有了加密之后，就要判断加密后的密码是否正确
      if (user.password !== this.encryptPassword(password)) {
        return { status: 401, message: '密码错误' };
      }

      return {
        status: 200,
        message: '成功',
        // 使用pick的原因是不想把用户密码也一起返回给前端，所以这里进行属性筛选
        resource: pick(user, ['id', 'username'])
      };
    }


    // 不存在则创建用户
    const newUser = await prisma.user.create({
      data: {
        username,
        // 储存加密的密码
        password: this.encryptPassword(password),
      },
      select: { username: true, id: true },
    });

    return { status: 200, message: '成功', resource: newUser };
  }
}

export default UserModel;

```
- 改写后：

```ts
// model/user.ts

import type { User } from '@prisma/client';
import type { Response } from '~/lib/api';

import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';
import { pick } from 'lodash';

import BaseModel from './index';
import { prisma } from '~/lib/db';
import { formatResponse } from '~/lib/api';

export type UserInfo = Pick<User, 'id' | 'username'>;

class UserModel extends BaseModel {
  encryptPassword(password: string) {
    return Base64.stringify(hmacSHA512(password, process.env.USER_PASSWORD_KEY!));
  }

  async create(username: string, password: string) {
    const encryptedPassword = this.encryptPassword(password);
    try {
      await this.validator(
        { username, password },
        [
          { key: 'username', message: '用户名格式错误，用户名长度为3～20的字母或数字组成', required: value => /^[\w\d]{3,20}$/.test(value) },
          { key: 'username', message: '备案原因，暂时不支持非管理员用户登录', required: value => value === process.env.ADMIN_NAME },
          { key: 'password', message: '密码格式错误，密码长度为6～15的字母或数字组成', required: value => /^[\w\d]{6,15}$/.test(value) },
        ],
      );
      const user = await this.execSql(
        prisma.user.findUnique({ where: { username } }),
        user => {
          if (user) {
            if (user.password !== encryptedPassword) {
              return Promise.reject(formatResponse({ status: 401, message: '密码错误' }));
            }

            return formatResponse({ resource: pick(user, ['id', 'username']) });
          }
        },
      );

      if (user) {
        return user;
      }

      return await this.execSql(prisma.user.create({
        data: { username, password: encryptedPassword },
        select: { username: true, id: true },
      }));
    } catch (error) {
      return error as Promise<Response<UserInfo>>;
    }
  }
}

export default UserModel;

```

这里改写后的代码反而变得更复杂，这是因为我还没有找到一种优雅处理多个异步任务的方法。

曾经尝试过使过这种模式的写法：

```ts
const [result1, error1] = await promiseTask1();

if (error1) {
    return;
}

const [result2, error2] = await promiseTask2();
```

显而易见的是要写很多`if`语句，还不如 `try...catch...`简洁。

代码优化就到此为止，后面边写边优化。

我比较喜欢的一个观点：

> 代码重构要随时进行，只要有时间就进行重构，每两三个月，甚至间隔更长时间的重构，不叫重构，叫重写。

## 0x06 实现登录功能

我所接触过的用户登录方式有两种：

1. Cookie/Session
2. JWT


这里我选择 *Cookie/Session* 的方案，*JWT* 我在另一个项目中有使用，准备在记录那个项目的笔记中细说。

先来说一说*Cookie/Session*。

HTTP 协议有一个特点就是**无状态**，**无状态**意味着服务端无法确定客户端的身份，如果服务端无法确定客户端的身份，登录也就失去了意义，为了让服务端能确定请求者的身份，需要在请求中加上一些标识，这些标识就是*Cookie/Session*。

*Cookie/Session*都是数据，由服务端生成，当请求到达服务端的时候，服务端会在响应头中加上`Set-Cookie: cookie`，浏览器在收到响应后就会把`Set-Cookie`中的值存起来，在下次请求这个服务端的时候自动的把cookie带到请求头中的`Cookie`字段。

从cookie的管理到携带，都是浏览器自动完成的，前端基本不用做任何操作，当然JavaScript是可以操作cookie的。

所以*Cookie/Session*方案对前端是比较友好的。

之前我对Session的理解就是存在服务端的一段数据，它可以存在文件、内存甚至数据库中，后来我看了这篇文章[《前端应该知道的web登录》](https://zhuanlan.zhihu.com/p/62336927)。

发现Session只要可以维护登录状态就可以了，怎么实现并没有要求。

> 广义的session：广义的session就是从登录成功到登出的过程，在这个过程中客户端和服务器端维持了保持登录的状态，至于具体怎么维持住这种登录的状态，没有要求。
> 
>---- [《前端应该知道的web登录》](https://zhuanlan.zhihu.com/p/62336927)

这也解释了我接下来用的[iron-session
](https://github.com/vvo/iron-session)这个库的实现session的方式。

我一直很好奇[iron-session](https://github.com/vvo/iron-session)是怎么存session的，后来看代码发现它没有存session，而是直接把数据进行加密，当作cookie发给浏览器，当接收到请求的时候，对cookie进行解密，解密成功就是验证成功。

这个就非常巧妙，感觉结合了一些*JWT*的方式。


### 实现

1. 安装 `iron-session`

    ```bash
    yarn add iron-session
    ```
    
2. 设置密钥

    ```bash
    # .env
    
    COOKIE_KEY=y4ajgGsK5DYydu4h4pULn0BkninfJw0B
    ```
    
    **注意**：
    
      - `.env`文件不能公开（不要提交到GitHUb）
      - cookie加密密钥的长度至少32位
      - 可以在这个网站随机生成密钥[https://1password.com/password-generator/](https://1password.com/password-generator/)

3. 配置iron-session参数

    ```ts
    // lib/sessionConfig.ts
    
    import type { IronSessionOptions } from 'iron-session';

    export const sessionOptions: IronSessionOptions = {
      password: process.env.COOKIE_KEY!,
      cookieName: 'diary_of_madao_cookie',
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
      },
    };

    ```
    
4. 封装*withSession*方法

    ```ts
    // lib/withSession.ts
    
    import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next';
    import type {
      GetServerSidePropsContext,
      GetServerSidePropsResult,
      NextApiHandler,
    } from 'next';

    import { sessionOptions } from './sessionConfig';

    export function withSessionRoute(handler: NextApiHandler) {
      return withIronSessionApiRoute(handler, sessionOptions);
    }

    export function withSessionSsr<
      P extends Record<string, unknown> = Record<string, unknown>,
    >(
      handler: (
        context: GetServerSidePropsContext,
      ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
    ) {
      return withIronSessionSsr(handler, sessionOptions);
    }

    ```
    
    这里的封装在文档中都找的到，所以就不在赘述了。
    
5. 定义session类型

    ```ts
    // types/iron-session.d.ts
    
    declare module 'iron-session' {
      // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
      interface IronSessionData {
        user?: {
          id: number;
        };
      }
    }

    export {};
    ```
    
    这里的类型可以随意定义，看个人需求，我的博客项目是只需要一个`userId`即可，再通过这个`userId`去获取用户信息。
    
6. 改写*session API*，实现登录

    ```ts
    // pages/api/v1/session.ts

    import UserModel from '~/model/user';
    import { withSessionRoute } from '~/lib/withSession';
    import { withMiddleware } from '~/lib/middleware';
    import { formatResponse } from '~/lib/api';

    export default withSessionRoute(withMiddleware({
      async post(req, res) {
        const user = new UserModel();
        const result = await user.create(req.body.username, req.body.password);
        if (result.resource) {
          // 设置session
          req.session.user = {
            id: result.resource.id,
          };
          // 保存session
          await req.session.save();
        }

        res.status(result.status).json(result);
      }
    }));

    ```
    
7. 在页面中获取session中的数据


    ```tsx
    import type { NextPage, InferGetServerSidePropsType } from 'next';

    import React from 'react';

    import { withSessionSsr } from '~/lib/withSession';


    const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
      console.log(props.userId)

      return (
        <div>Hello World</div>
      );
    };

    export const getServerSideProps = withSessionSsr(async context => {
      return {
        props: {
          // 获取userId
          userId: context.req.session.user?.id ?? 0,
        },
      };
    });

    export default Home;

    ```
    
8. 退出登录

    ```ts
    // pages/api/v1/session.ts

    import UserModel from '~/model/user';
    import { withSessionRoute } from '~/lib/withSession';
    import { withMiddleware } from '~/lib/middleware';
    import { formatResponse } from '~/lib/api';

    export default withSessionRoute(withMiddleware({
      async post(req, res) {
        const user = new UserModel();
        const result = await user.create(req.body.username, req.body.password);
        if (result.resource) {
          req.session.user = {
            id: result.resource.id,
          };
          await req.session.save();
        }

        res.status(result.status).json(result);
      },

      // 退出登录
      async delete(req, res) {
        // 删除session
        req.session.destroy();
        res.status(204).json(formatResponse({ status: 204, message: '退出成功' }));
      },
    }));

    ```
    
上面流程就是登录/登出的流程，基本上文档都说明了，所以没什么特别需要说明的。


## 0x07 实现用户鉴权的中间件

部分接口在不登录的情况下是不允许请求的，这个功能也用中间件实现。

```ts
// lib/middleware.ts

export const authMiddleware: MiddlewareType = async (req, res) => {
  const { user } = req.session;
  const url = req.url ?? '';
  const method = req.method ?? '';

  switch (true) {
    case url.endsWith('/session'):
    case url.includes('/note') && method === 'GET':
    case url.endsWith('/label') && method === 'GET':
      return true;
    default:
      if (!user) {
        res.status(401);
        return Promise.reject(formatResponse({ status: 401, message: 'Unauthorized' }));
      }

      break;
  }
};

```

基本没什么可以说的，只需要注意一下`switch`语句，那个语句一个的`case`是为了过滤不要登录的接口的，由于我采用的是 `Restful` 风格，所以除了判断接口地址，还需要判断请求方法，感觉这里可以优化一下，但是还没想好怎么优化。

实现了`authMiddleware`中间件后，就可以把它添加到`withMiddleware`中去鉴权了。

```ts
// lib/middleware.ts

export const withMiddleware = (handler: HandlerType): NextApiHandler => async (req, res) => {
  const method = (req.method ?? '').toLowerCase() as keyof HandlerType;

  try {
    await noMatchMiddleware(req, res, Object.keys(handler));
    await authMiddleware(req, res);
    await handler[method]!(req, res);
  } catch (error) {
    res.json(error);
  }
};
```