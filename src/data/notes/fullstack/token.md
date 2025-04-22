---
title: '双 Token 无感知刷新'
subtitle: '从零开始实现双 Token 无感知刷新'
author: 'Caisr'
tags: ["Authentication", "Fullstack"]
type: 'fullstack'
cover: {
  image: '~/assets/images/cover/cover-14.jpg',
  source: 'Charles Awelewa (Pexels.com)',
  sourceUrl: 'https://www.pexels.com/photo/mysterious-figure-in-a-suit-and-concealed-face-29676619/'
}
---

## 一. 双 Token 无感知刷新

双 Token 无感知刷新是一种认证机制，通过同时使用短期有效的访问令牌（Access Token）和长期有效的刷新令牌（Refresh Token），实现在用户无感知（无需重新登录）的情况下自动刷新令牌，保障安全性和用户体验。

基本流程如下：

1. 登录时，服务器返回 accessToken（短时效） 和 refreshToken（长时效）。
2. 访问 API 时，前端在 Authorization 头中携带 accessToken。
3. 当 accessToken 过期时，前端用 refreshToken 向服务器请求新的 accessToken，整个过程用户无感知。
4. 若 refreshToken 也失效，要求用户重新登录。

## 二. 后端实现登录接口

逻辑：

1. 用户提交 用户名 + 密码。
2. 如果正确，返回：
   - accessToken（短时有效，比如 10 分钟）。
   - refreshToken（长时有效，比如 7 天，存 HttpOnly Cookie）。
3. 如果错误，返回 401 Unauthorized。

这里选择使用 *Bun* 作为后端框架：

```bash
bun -v # 1.1.40

bun init # 初始化项目

touch server.ts # 创建服务器文件
touch types.d.ts # 创建服务器类型文件
```

完善 `types.d.ts` 文件：

```typescript
// types.d.ts

export type DB = {
  users: {
    username: string;
    password: string;
    id: number;
  }[];
};

// 首先定义用户类型
export type User = DB['users'][number];

// 定义状态类型
export type StatusKey = 'USER_NOT_FOUND' | 'WRONG_PASSWORD' | 'SUCCESS';

// 定义验证结果类型
export type ValidationSuccess<T = undefined> = {
  valid: true;
  user: T;
};

export type ValidationFailure = {
  valid: false;
  status: StatusKey;
};

export type ValidationResult<T = undefined> = ValidationSuccess<T> | ValidationFailure;

// 定义验证表类型
export type ValidationTable = {
  validateUser: (username: string) => ValidationResult<User>;
  validatePassword: (user: User, password: string) => ValidationResult<User>;
};
```

完善 `server.ts` 文件：

```typescript
// server.ts

import type { DB, User, ValidationSuccess, ValidationTable } from './types';

const db:DB = {
  users: [
    {
      username: 'admin',
      password: 'admin',
      id: 1
    }
  ]
};

// 定义状态表
const statusTable = {
  USER_NOT_FOUND: {
    message: 'User not found',
    status: 404
  },
  WRONG_PASSWORD: {
    message: 'Wrong password',
    status: 401
  },
  SUCCESS: {
    message: 'Login success',
    status: 200
  }
};

// 定义验证表
const validationTable: ValidationTable = {
  validateUser: (username) => {
    const user = db.users.find(user => user.username === username);
    return user ? { valid: true, user } : { valid: false, status: 'USER_NOT_FOUND' };
  },

  validatePassword: (user, password) => {
    return user.password === password
      ? { valid: true, user }
      : { valid: false, status: 'WRONG_PASSWORD' };
  }
};

// 生成 token
const generateToken = (payload: Record<string, unknown>, expiresIn: number) => {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresIn,
  })).toString("base64url");
  return `${header}.${body}`;
};

Bun.serve({
  port: 3002,
  routes: {
    '/login': {
      POST: async req => {
        const { username, password } = await req.json() as Omit<User, 'id'>;
        // 使用验证表进行验证
        const userResult = validationTable.validateUser(username);
        if (!userResult.valid && userResult.status) {
          const response = statusTable[userResult.status];
          return Response.json(response.message, { status: response.status });
        }

        const user = (userResult as ValidationSuccess<User>).user;
        const passwordResult = validationTable.validatePassword(user, password);
        if (!passwordResult.valid) {
          const response = statusTable[passwordResult.status];
          return Response.json(response.message, { status: response.status });
        }

        const userId = user.id;
        const maxAge = 604800; // 7天
        const accessToken = generateToken({ userId }, 600); // 10分钟
        const refreshToken = generateToken({ userId }, maxAge); // 7天

        const response = statusTable.SUCCESS;
        return Response.json({ message: response.message, accessToken }, {
          status: response.status,
          headers: {
            'Set-Cookie': `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict`,
            'Refresh-Token': refreshToken
          }
        });
      }
    }
  },
  error(error) {
    console.error(error);
    return new Response(`Internal Error: ${error.message}`, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  },
});

console.log("服务器运行在 http://localhost:3002")
```

启动服务器：
```bash
bun run server.ts
```

然后就可以用 postman 测试接口了。

这里再说一下 `JWT` 是什么：

> JWT，全称是 JSON Web Token，是一种轻量级、无状态、跨语言的用户认证凭证格式，常用于前后端分离项目的登录授权（Authentication / Authorization）。

它就是一个字符串，由三部分组成，分别是：

```css
xxxxx.yyyyy.zzzzz
│     │     │
│     │     └── 签名 Signature（防篡改）
│     └───────── 载荷 Payload（存储信息）
└──────────────── 头部 Header（说明格式）
```

1. 头部（Header）：
    - 头部用于描述 JWT 的元数据，通常是一个 JSON 对象。
    - 头部通常由两部分组成：
      - 类型（Type）：表示 JWT 的类型，通常是 JWT。
      - 加密算法（Algorithm）：表示 JWT 的签名算法，通常是 HMAC、RSA 等。

    🌰：

    ```json
    {
      "alg": "HS256",
      "typ": "JWT"
    }
    ```

2. 载荷（Payload）：
    - 载荷用于存储 JWT 的信息，通常也是一个 JSON 对象。
    - 载荷可以存储任何信息，例如用户 ID、用户名、权限等。
    - 载荷也可以存储一些元数据，例如签发时间、过期时间等。

    🌰：

    ```json
    {
      "userId": 123,
      "iat": 1712886596, // 签发时间
      "exp": 1712886656  // 过期时间
    }
    ```

3. 签名（Signature）：
    - 签名用于验证 JWT 的完整性，防止 JWT 被篡改。
    - 签名是通过将头部和载荷进行编码，然后使用密钥进行加密得到的。
    - 签名可以防止 JWT 被篡改，因为只有知道密钥的人才能生成正确的签名。

    🌰：

     ```js
     HMACSHA256(
       base64UrlEncode(header) + "." + base64UrlEncode(payload),
       secret
     )
     ```

    secret 指的是密钥，用于加密，需要存储在服务器端。

#### 签名

目前上面的实现还没有签名这一部分，这里需要补全：

```typescript
// server.ts

// 之前代码保持不变

const generateToken = async (payload: Record<string, unknown>, expiresIn: number) => {
  const secret = Bun.env.JWT_SECRET || 'secret';
  const encoder = new TextEncoder();
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresIn,
  })).toString("base64url");
  const unsignedToken = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(unsignedToken)
  );

  const signature = Buffer.from(signatureBuffer).toString("base64url");
  return `${unsignedToken}.${signature}`;
};
```

解释一下代码：

- HMAC-SHA256 是啥？

    JWT 的签名部分用的是一种对称加密方式叫 HMAC-SHA256，简单来说就是：
    
    > 用一个 secret + 原始内容，生成一串 hash，用于确保内容在传输过程中没有被篡改。

- importKey

    ```typescript
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    ```
    
    作用：把我们自己的 secret 转换成 Web Crypto 可以用的密钥对象（KeyObject）。

    | 参数位置 | 说明 |
    |---------|------|
    | "raw" | 表示我们传的是原始二进制密钥（不是证书或 JSON 格式） |
    | encoder.encode(secret) | 把字符串的 secret 转成 Uint8Array（UTF-8 编码） |
    | { name: "HMAC", hash: "SHA-256" } | 指定我们要用的算法（HMAC + SHA-256） |
    | false | 表示这个密钥不能导出（我们不打算泄露它） |
    | ["sign"] | 我们只打算用它来签名（不是验证、不是加密） |

- sign

    ```typescript
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(unsignedToken)
    );
    ```

    作用：把我们自己的 secret 转换成 Web Crypto 可以用的密钥对象（KeyObject）。

    | 参数位置 | 说明 |
    |---------|------|
    | "HMAC" | 使用的算法 |
    | key | 上一步生成的 CryptoKey |
    | encoder.encode(unsignedToken) | 你要签名的数据，转成 Uint8Array（字节数组） |

- 把签名变成字符串

  ```typescript
  const signature = Buffer.from(signatureBuffer).toString("base64url");
  ```

  作用：JWT 要求的是 base64url 格式的签名，所以需要：


## 三. 前端需要在请求的同时带上 accessToken

一般来说，前端在获得 accessToken 后，会把它存储在 Cookie 或者 LocalStorage 中，然后在每次请求时带上。

请求的时候将 accessToken 放在请求头的 Authorization 字段，格式为：

```
Authorization: Bearer <access_token>
```

Bearer 的意思是“持有者”，它表示：任何持有这个 Token 的人都被认为是经过授权的。这个是标准约定的格式。除此之外还有：

- Basic：基本认证，格式为：`Authorization: Basic <base64(username:password)>`。
- Digest：摘要认证，格式为：`Authorization: Digest <digest>`。

## 四. 后端验证 accessToken

```typescript
// 用于验证 token 是否被篡改
const verifyToken = async (token: string) => {
  const secret = Bun.env.JWT_SECRET || 'secret';
  const encoder = new TextEncoder();

  const [encodedHeader, encodedPayload, signature] = token.split('.');

  if (!encodedHeader || !encodedPayload || !signature) {
    return { valid: false, reason: "Token 结构无效" };
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const expectedSignature = await crypto.subtle.verify(
    "HMAC",
    key,
    Uint8Array.from(Buffer.from(signature, "base64url")),
    encoder.encode(unsignedToken)
  );

  if (!expectedSignature) {
    return { valid: false, reason: "签名无效" };
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString());

  if (payload.exp && Date.now() / 1000 > payload.exp) {
    return { valid: false, reason: "Token 已过期" };
  }

  return { valid: true, payload };
};
```

实现一个获取用户信息的接口：

```typescript
// server.ts
// 之前代码保持不变
Bun.serve({
  routes: {
    '/profile': {
      GET: async req => {
        const accessToken = req.headers.get('Authorization')?.split(' ')[1];

        if (!accessToken) {
          return Response.json('No access token', { status: 401 });
        }

        const verified = await verifyToken(accessToken);
        if (!verified.valid) {
          return Response.json(verified.reason || 'Invalid access token', { status: 401 });
        }


        const userId = verified.payload.userId;
        const user = db.users.find(user => user.id === userId);

        if (!user) {
          return Response.json('User not found', { status: 404 });
        }

        return Response.json(user);
      }
    }
  }
})
```

`profile` 接口验证了三种情况：

1. 没有 accessToken
2. accessToken 无效
3. accessToken 过期

除此之外还有一个 refreshToken 没有用到，也就是当 accessToken 过期时，可以用 refreshToken 来换取新的 accessToken，所以还需要改造一下：


```typescript

// 因为需要用 refreshToken 来生成新的 accessToken，所以需要知道 accessToken 是过期还是无效。
// 这里 valid 就不能是布尔值了，所以这里用 'valid' | 'invalid' | 'expired' 来表示。
const verifyToken = async (token?: string) => {
  const secret = Bun.env.JWT_SECRET || 'secret';
  const encoder = new TextEncoder();

  if (!token) {
    return { valid: 'invalid', reason: "Token 不存在" };
  }

  const [encodedHeader, encodedPayload, signature] = token.split('.');

  if (!encodedHeader || !encodedPayload || !signature) {
    return { valid: 'invalid', reason: "Token 结构无效" };
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const expectedSignature = await crypto.subtle.verify(
    "HMAC",
    key,
    Uint8Array.from(Buffer.from(signature, "base64url")),
    encoder.encode(unsignedToken)
  );

  if (!expectedSignature) {
    return { valid: 'invalid', reason: "签名无效" };
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString());

  // 检查是否过期
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    return { valid: 'expired', reason: "Token 已过期", payload };
  }

  return { valid: 'passed', payload };
};


Bun.serve({
  port: 3002,
  routes: {
    '/profile': {
      GET: async req => {
        const accessToken = req.headers.get('Authorization')?.split(' ')[1];
        const refreshToken = req.cookies.get("refreshToken") || '';

        if (!accessToken) {
          return Response.json({ message: 'No access token' }, { status: 401 });
        }

        const verified = await verifyToken(accessToken);
        if (verified.valid === 'invalid') {
          return Response.json({ message: verified.reason }, { status: 401 });
        }

        const userId = verified.payload.userId;
        const user = db.users.find(user => user.id === userId);

        if (!user) {
          return Response.json({ message: 'User not found' }, { status: 404 });
        }

        if (verified.valid === 'expired') {
          const verifiedRefresh = await verifyToken(refreshToken);
          if (verifiedRefresh.valid === 'invalid') {
            return Response.json({ message: verifiedRefresh.reason }, { status: 401 });
          }

          if (verifiedRefresh.valid === 'expired') {
            return Response.json({ message: 'Refresh token expired' }, { status: 401 });
          }

          const newAccessToken = await generateToken({ userId }, 600); // 10分钟
          return Response.json({ user, accessToken: newAccessToken }, { status: 200 });
        }

        return Response.json({ user });
      }
    }
  },
});
```

这里代码需要优化一下，可以看到上面判断了很多的情况，先是判断 accessToken 是否存在，然后再判断 accessToken 是否有效，最后再判断 accessToken 是否过期，然后还要判断 refreshToken 是否存在，然后再判断 refreshToken 是否有效，最后再判断 refreshToken 是否过期。

还是挺麻烦的，所以需要拆分逻辑，分为以下几个模块

1. server.ts - 入口文件
2. token.ts - 验证 token 和生成 token 的模块
3. db.ts - 模拟数据库的模块
4. authGuard.ts - 验证用户是否登录的模块

```typescript
// db.ts
import type { DB } from './types';

export const db:DB = {
  users: [
    {
      username: 'admin',
      password: 'admin',
      id: 1
    }
  ]
};
```

```typescript
// token.ts
export const generateToken = async (payload: Record<string, unknown>, expiresIn: number) => {
  const secret = Bun.env.JWT_SECRET || 'secret';
  const encoder = new TextEncoder();
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresIn,
  })).toString("base64url");
  const unsignedToken = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(unsignedToken)
  );

  const signature = Buffer.from(signatureBuffer).toString("base64url");
  return `${unsignedToken}.${signature}`;
};

export const verifyToken = async (token?: string) => {
  const secret = Bun.env.JWT_SECRET || 'secret';
  const encoder = new TextEncoder();

  if (!token) {
    return { valid: 'invalid', reason: "Token 不存在" };
  }

  const [encodedHeader, encodedPayload, signature] = token.split('.');

  if (!encodedHeader || !encodedPayload || !signature) {
    return { valid: 'invalid', reason: "Token 结构无效" };
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const expectedSignature = await crypto.subtle.verify(
    "HMAC",
    key,
    Uint8Array.from(Buffer.from(signature, "base64url")),
    encoder.encode(unsignedToken)
  );

  if (!expectedSignature) {
    return { valid: 'invalid', reason: "签名无效" };
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString());

  // 检查是否过期
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    return { valid: 'expired', reason: "Token 已过期", payload };
  }

  return { valid: 'passed', payload };
};
```


```typescript
// authGuard.ts

import { db } from "./db";
import { generateToken, verifyToken } from "./token";
/*
  * AuthResult 需要在之前的 types.d.ts 中定义
    export type AuthResult =
      | { status: 200; user: User }
      | { status: 401; message: string }
      | { status: 404; message: string };
*/
import type { AuthResult } from "./types";


const extractTokens = (req: Bun.BunRequest) => {
  const accessToken = req.headers.get('Authorization')?.split(' ')[1];
  const refreshToken = req.cookies.get('refreshToken') || '';
  return { accessToken, refreshToken };
};


export const authGuard = async (req: Bun.BunRequest): Promise<AuthResult> => {
  const { accessToken, refreshToken } = extractTokens(req);

  if (!accessToken) {
    return { status: 401, message: '未提供 access token' };
  }

  const access = await verifyToken(accessToken);
  if (access.valid === 'passed') {
    const user = db.users.find(u => u.id === access.payload.userId);
    if (!user) return { status: 404, message: "用户不存在" };
    return { status: 200, user };
  }

  if (access.valid === 'expired') {
    const refresh = await verifyToken(refreshToken);
    if (refresh.valid === 'expired') return { status: 401, message: 'Refresh token 无效' };
    if (refresh.valid === 'invalid') return { status: 401, message: 'Refresh token 已过期' };

    const user = db.users.find(u => u.id === refresh.payload.userId);
    if (!user) return { status: 404, message: "用户不存在" };

    const newAccessToken = await generateToken({ userId: refresh.payload.userId }, 600);
    return { status: 200, user, accessToken: newAccessToken };
  }

  return { status: 401, message: access.reason || "Access token 无效" };
};

```

在 `server.ts` 中就可以这样用了:

```typescript
'/profile': {
  GET: async req => {
    const result = await authGuard(req);
    if (result.status !== 200) {
      return Response.json({ message: result.message }, { status: result.status });
    }

    return Response.json({ user: result.user, accessToken: result.accessToken });
  }
}
```

## 五. 其他

双 Token 还有一种模式就是，只要用户刷新了 Token，那么就自动延长 Token 的有效期，但是 Token 这种方案有一个问题就是，没有办法让用户的登录状态主动失效，所以一旦泄露那么别人就可以一直使用用户的 token 了，所以这里没有使用这种方案。