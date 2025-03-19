---
title: '源码阅读のai-chatbot（一）'
subtitle: '登录流程的实现'
author: 'Caisr'
tags: ["AI", "Source Code"]
type: 'ai'
cover: '~/assets/images/cover/cover-10.webp'
---

[ai-chatbot](https://github.com/vercel/ai-chatbot) 是一个开源的 AI 聊天机器人网站模板，这个项目有从登录到对话以及 AI SDK 交互的完整流程，非常适合用来学习。

### 从 NextAuth.js 开始

[NextAuth.js] (https://next-auth.js.org/getting-started/introduction) 是一个适用于 Next.js 应用的身份验证库，它支持很多种身份认证方式。

从这个 `app/(auth)/auth.ts` 文件可以看出 ai-chatbot 项目选择了凭证登录的方式，需要用户去提供用户名和密码，由服务器进行验证。

#### 1. `app/(auth)/auth.config.ts`

这个文件是 NextAuth.js 的配置文件，里面一共有三项：

- pages
- providers
- callbacks

##### pages

NextAuth.js 提供了一些简单的认证流程页面。比如登录页面、注册页面、错误页面等。也可以使用自定义的页面进行覆盖。这个项目中配置了两个自定义页面：

```js
pages: {
  signIn: '/login',
  newUser: '/',
},
```
newUser 表示新用户首次登录时将被引导到的页面。

##### providers

providers 是配置认证方式的地方，根据文档可以知道 NextAuth.js 支持：

- OAuth
- Email
- Credentials

这几种方式，ai-chatbot 项目选择了 Credentials 方式，即用户提供用户名和密码。

```js
Credentials({
  credentials: {},
  async authorize({ email, password }: any) {
    const users = await getUser(email);
    if (users.length === 0) return null;
    // biome-ignore lint: Forbidden non-null assertion.
    const passwordsMatch = await compare(password, users[0].password!);
    if (!passwordsMatch) return null;
    return users[0] as any;
  },
}),
```

- credentials

    表示的是登录表单的配置，比如：

    ```js
    credentials: {
      username: { label: "Username", type: "text", placeholder: "jsmith" },
      password: { label: "Password", type: "password" }
    },
    ```

    这表示登录页面会有两个输入框，一个是用户名，一个是密码。登录页面指的是 `/login` 页面。

    如果为空我猜是不用默认的配置，自己实现相关输入框。

- authorize

    这个就是处理表单提交的函数，如果返回正常的用户信息，表示登录成功，返回 null 表示需要用户检查表单信息，也可以抛出错误用户就会被重定向到错误页面。

##### callbacks

callbacks 有点像登录流程中的钩子函数，比如说 `signIn` 可以控制用户是否允许登录，`redirect` 会在用户登录或者登出的时候被调用。

ai-chatbot 项目中配置了三个

1. authorized
2. jwt
3. session

