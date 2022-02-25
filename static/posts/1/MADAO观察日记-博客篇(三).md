---
title: 'MADAO观察日记-博客篇(三)'
labels: ['Blog', 'Next.js', 'Database']
introduction: '个人博客网站实现 - 用户登录功能实现'
---

![post_blog_3_cover_1644850616419.jpeg](/static/images/posts/post_blog_3_cover_1644850616419.jpeg "post_blog_3_cover_1644850616419.jpeg")

## 前言

[MADAO观察日记-博客篇(二)](https://greed.icu/posts/4)

接着上一篇的笔记，这次来实现用户的登录和退出登录功能。

涉及到的知识有：

- cookie/session


[完整代码参考](https://github.com/GreedyWhale/code-examples/tree/a67a375e211e6fbd7da36343ae4e3c72d12f6986/blog)


## cookie/session

面试经常会问到cookie相关的问题，我在实现这个Blog网站之前也是记一些概念，因为我从第一份工作开始就没有操作过cookie，都是采用从服务器请求一个token存在本地，之后的请求就携带上这个token这种方案，这次采用了cookie的方案，一方面是课程这样讲的，另一个方面是觉得比较简单，因为cookie的管理和携带可以交给浏览器，趁这个机会就深入的了解一下吧。

#### 1. 为什么需要cookie/session

HTTP协议有一个特性就是**无状态**（有些人认为HTTP/2是有状态的协议），我是这样理解无状态的，每一个HTTP请求都是独立的，假如发送了两个请求，后面的请求的执行结果和上一个请求是没有关系的，哪怕上一个请求失败了，后面的请求也是可以继续处理的，这种特性已经不能满足现在的需求了，因为无状态就意味着服务器不能知道这个请求是谁发送的，比如一个网站需要保持用户的登录状态就需要让服务器知道请求是那个用户发送的，基于这类需求就诞生了cookie/session方案。

#### 2. 我理解的cookie/session

- cookie

    cookie是一小段数据，服务器通过`Set-Cookie`响应头发送给浏览器，浏览器就会将这一段数据存储在本地，之后所有向这个服务器发送的请求都会自动在请求头`Cookie`上带上这一段数据，因为cookie是存在浏览器端的，可以被任何人获取到，所以不要存一些敏感的信息，比如用户的密码。

- session

    我一开始理解的session是服务器存储的数据（类似一张数据表），通过cookie来从里面获取对应的数据，它可以存在内存、文件或者是数据库中，现在看了[《前端应该知道的web登录》](https://zhuanlan.zhihu.com/p/62336927)这篇文章之后觉得session不一定是以实体的方式出现的，只要session能维持住客户端和服务端的状态就可以称为session
    
    > 广义的session：广义的session就是从登录成功到登出的过程，在这个过程中客户端和服务器端维持了保持登录的状态，至于具体怎么维持住这种登录的状态，没有要求。
    >
    > ---[《前端应该知道的web登录》](https://zhuanlan.zhihu.com/p/62336927)
    
    包括我这次使用的这个库[iron-session](https://www.npmjs.com/package/iron-session)，我粗略的看了下它的源代码，发现它并没有存储session，它把数据进行加密后当作cookie发送给了浏览器，然后在响应请求的时候将cookie解密出来供服务器处理请求时使用，这样其实也能维持一个会话的状态，比如我将userID加密后当cookie发给浏览器，下次请求的时候我就能通过cookie拿到这个userID，就能确定是那个用户发出的请求了，但是这样做有个问题就是不能存很多数据，因为cookie有大小限制。
    
     
    这种应该也算是session吧。
    
    
## 实现

回到之前的`pages/api/v1/user.ts`文件

```js
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

```

这是上一篇中实现注册的核心部分，现在要加上登录、登出功能，在加功能之前先优化整理下代码，注册这一部分可以封装到`controller/user.ts`中，之后就可以根据请求方法执行不同的方法，这样代码看起来比较简洁。


#### 1. 封装注册方法

**e.g.**


```ts
// controller/user.ts
import { formatResponse } from '~/utils/middlewares';

export default class UserController {
  //...

  async signUp(username: string, password: string) {
    // 检查用户提交数据
    const testResult = UserController.validator(username, password);
    if (!testResult.passed) {
      return Promise.reject(formatResponse(422, {}, testResult.message));
    }

    // 检测用户是否已经存在
    const user = await this.getUser({ username });
    if (user.status === 'fulfilled' && user.value) {
      return Promise.reject(formatResponse(422, {}, '用户已存在，请直接登录'));
    }

    // 创建新用户
    const newUser = await this.createUser(username, password);
    if (newUser.status === 'rejected') {
      return Promise.reject(formatResponse(500, newUser.reason, newUser.reason.message || '创建用户失败，请稍后重试！'));
    }

    return formatResponse(200, newUser.value, '创建成功！');
  }
}
```

**e.g.**

```ts
// pages/api/v1/user.ts

const user: NextApiHandler = async (req, res) => {
  await checkRequestMethods(req, res, ['POST']);
  const { username, password } = req.body;

  try {
    if (req.method === 'POST') {
      const user = await userController.signUp(username, password);
      return endRequest(res, user);
    }
  } catch (error: any) {
    return endRequest(res, error);
  }
};
```

#### 2. 添加iron-session

- 安装iron-session

    ```bash
    yarn add iron-session
    ```
    
- 添加cookie加密的环境变量

    cookie的值需要加密，这个加密的密钥需要放在本地，千万不要提交到github上面去，Next.js集成了添加环境变量的方法[Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
    
    密钥可以使用这个网站生成[https://1password.com/password-generator/ ](https://1password.com/password-generator/)
    
    至少需要32位

    **e.g.**
    
    ```
    // .env.local
    
    COOKIE_PASSWORD=U268GVJg3grcqjGeTGA1M3ngDqRenC3n
    ```
    
- 封装session相关方法

    将cookie的名字写成一个常量便于复用
    
    **e.g.**
    
    ```ts
    // utils/contants
    
    export const SESSION_USER_ID = 'SESSION_USER_ID'; // 储存在cookie/session中的userId;
    ```

    这里的代码iron-session库有示例，可以直接拿来用
    
    **e.g.**

    ```ts
    // utils/withSession.ts
    
    import type {
      GetServerSidePropsContext,
      GetServerSidePropsResult,
      NextApiHandler,
    } from 'next';

    import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next';
    
    import { SESSION_USER_ID } from '~/utils/constant';

    const sessionOptions = {
      password: process.env.COOKIE_PASSWORD as string,
      cookieName: SESSION_USER_ID,
      // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
      },
    };

    export function withSessionRoute(handler: NextApiHandler) {
      return withIronSessionApiRoute(handler, sessionOptions);
    }

    // Theses types are compatible with InferGetStaticPropsType https://nextjs.org/docs/basic-features/data-fetching#typescript-use-getstaticprops
    export function withSessionSsr<
      P extends { [key: string]: unknown } = { [key: string]: unknown },
    >(
      handler: (
        _context: GetServerSidePropsContext,
      ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
    ) {
      return withIronSessionSsr(handler, sessionOptions);
    }

    ```
    
    withSessionRoute方法给Next.js的api路由添加session属性
    
    withSessionSsr方法给Next.js的getServerSideProps方法添加session属性
    
    
#### 3. 添加登录相关的类型声明

**e.g.**

```ts
// typs/controller/user.d.ts

export type UserQueryConditions = Partial<{
  id: number;
  username: string;
}>;
```

```ts
// typs/addOnIronSession.d.ts

declare module 'iron-session' {
  interface IronSessionData {
    SESSION_USER_ID?: number;
  }
}

export {}; // 官网文档没有这一句
```

**注意**: 官方文档上是没有`export {};`这一句的，我不加这一句无法正确的推断类型，不知道是typescript的版本问题，还是文档问题，只要加了就可以正确推断了。

添加完之后从Next.js的api中获取session就不会报错了



#### 4. 实现登录方法

首先封装设置cookie的方法

**e.g.**

```ts
// utils/middlewares.ts

import { SESSION_USER_ID } from '~/utils/constant';

export const setCookie = async (req: NextApiRequest, value: any) => {
  req.session[SESSION_USER_ID] = value;
  await req.session.save();
};
```


因为要把用户密码不能返回给前端，所以这里使用lodash的omit方法，将密码从数据库查询结果中去除。

安装lodash

```bash
yarn add lodash
yarn add @types/lodash -D
```

然后在userController中添加signIn方法

**e.g.**

```ts

import type { UserQueryConditions } from '~/types/controller/user';

import { omit } from 'lodash';

export default class UserController {
  //...

  async getUser(condition: UserQueryConditions) {
    const user = await promiseWithSettled(prisma.user.findUnique({ where: condition }));
    return user;
  }

  async signIn(condition: UserQueryConditions, password?: string) {
    const user = await this.getUser(condition);

    if (user.status === 'rejected') {
      return formatResponse(500, user.reason, user.reason.message || '无法获取用户信息');
    }

    if (!user.value) {
      return formatResponse(404, {}, '用户不存在');
    }

    if (password && UserController.crypto(password) !== user.value.passwordDigest) {
      return formatResponse(422, {}, '用户密码错误');
    }

    return formatResponse(200, omit(user.value, ['passwordDigest']), '登录成功');
  }
}
```

在`/pages/api/v1/user.ts`中补全登录方法

**e.g.**

```ts
// pages/api/v1/user.ts

import type { User } from '@prisma/client';
import type { ResponseData } from '~/types/api';

import { checkRequestMethods, endRequest, formatResponse, setCookie } from '~/utils/middlewares';
import { withSessionRoute } from '~/utils/withSession';
import { SESSION_USER_ID } from '~/utils/constant';

const user: NextApiHandler = async (req, res) => {
  await checkRequestMethods(req, res, ['POST', 'GET']);
  try {
    //...

    if (req.method === 'GET') {
      // 从session中拿到cookie中存的id
      const id = req.session[SESSION_USER_ID];
      // 因为是get请求，所以username和password从url中获取
      const { username, password } = req.query;
      let user: ResponseData<User | {}> | null = null;

      if (username && password) {
        user = await userController.signIn({ username: username as string }, password as string);
      } else if (id) {
        user = await userController.signIn({ id });
      }

      if (user) {
        // 登录成功后设置cookie
        if (user.code === 200) {
          await setCookie(req, (user.data as User).id);
        } else {
          // 登录失败后删除cookie
          req.session.destroy();
        }

        endRequest(res, user);
        return;
      }

      req.session.destroy();
      endRequest(res, formatResponse(401, {}, '用户身份验证失败'));
      return;
    }
  } catch (error: any) {
    return endRequest(res, error);
  }
}

// 重要，使用withSessionRoute包裹了之后才能使用session属性
export default withSessionRoute(user);
```

#### 5. 测试登录

**e.g.**

```tsx
// pages/index.tsx


import { withSessionSsr } from '~/utils/withSession';
import { SESSION_USER_ID } from '~/utils/constant';

const Home: NextPage<{ userId: number; }> = props => {

  const handleSignIn = (type: 'cookie' | 'userInfo') => {
    console.log(props.id);
    const params = type === 'cookie' ? {} : { username: 'admin', password: '123456' };
    axios.get('/api/v1/user', params)
      .then(() => alert('登录成功'));
  };
  
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <section>
          <button onClick={() => handleSignIn('userInfo')}>使用用户名/密码登录</button>
          <button onClick={() => handleSignIn('cookie')}>使用cookie登录</button>
        </section>
      </main>
    </div>
  );
}

export const getServerSideProps = withSessionSsr(async context => ({
  props: {
    userId: context.req.session[SESSION_USER_ID] || -1,
  },
}));
```

经过测试两种方式都能成功登录，cookie也能正确的设置。


#### 6.退出登录实现

退出登录就很简单了，只要把cookie删除就行

**e.g.**

```ts
// pages/api/v1/user.ts

const user: NextApiHandler = async (req, res) => {
  await checkRequestMethods(req, res, ['POST', 'GET', 'DELETE']);
  
  //...
  
  if (req.method === 'DELETE') {
    // 删除cookie
    req.session.destroy();
    endRequest(res, formatResponse(204, {}, '退出成功'));
    return;
  }
}
```


到这里登录的流程就结束了。