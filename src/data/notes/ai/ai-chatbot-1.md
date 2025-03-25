---
title: '源码阅读のai-chatbot（一）'
subtitle: '登录流程的实现'
author: 'Caisr'
tags: ["AI", "Source Code"]
type: 'ai'
cover: '~/assets/images/cover/cover-10.webp'
---

[ai-chatbot](https://github.com/vercel/ai-chatbot) 是一个开源的 AI 聊天机器人网站模板，这个项目有从登录到对话以及 AI SDK 交互的完整流程，非常适合用来学习。

## 一. 从 NextAuth.js 开始

[NextAuth.js] (https://next-auth.js.org/getting-started/introduction) 是一个适用于 Next.js 应用的身份验证库，它支持很多种身份认证方式。

从这个 `app/(auth)/auth.ts` 文件可以看出 ai-chatbot 项目选择了凭证登录的方式，需要用户去提供用户名和密码，由服务器进行验证。

### `app/(auth)/auth.config.ts`

这个文件是 NextAuth.js 的配置文件，里面一共有三项：

- pages
- providers
- callbacks

#### pages

NextAuth.js 提供了一些简单的认证流程页面。比如登录页面、注册页面、错误页面等。也可以使用自定义的页面进行覆盖。这个项目中配置了两个自定义页面：

```js
pages: {
  signIn: '/login',
  newUser: '/',
},
```
newUser 表示新用户首次登录时将被引导到的页面。

#### providers

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

1. credentials

    登录表单的配置，比如：
    
    ```js
    credentials: {
      username: { label: "Username", type: "text", placeholder: "jsmith" },
      password: { label: "Password", type: "password" }
    },
    ```
    
    这表示登录页面会有两个输入框，一个是用户名，一个是密码。登录页面指的是 `/login` 页面。
    
    如果为空我猜是不用默认的配置，自己实现相关输入框。

2. authorize

    这个就是处理表单提交的函数，如果返回正常的用户信息，表示登录成功，返回 null 表示需要用户检查表单信息，也可以抛出错误用户就会被重定向到错误页面。

#### callbacks

callbacks 是登录流程中的钩子函数，比如说 `signIn` 会在登录是被调用，可以控制用户是否允许登录，`redirect` 会在用户登录或者登出的时候被调用。

ai-chatbot 项目中配置了三个

1. authorized

    这个配置是 V5 版本才有的，文档参考 [callbacks](https://authjs.dev/reference/nextjs#callbacks), 然后 auth 方法也是 V5 版本新增的一个方法，用于用户的身份验证，可以参考 [Authentication methods](https://authjs.dev/getting-started/migrating-to-v5#authenticating-server-side)

    通过文档可以知道 authorized 这个钩子是在调用 `auth` 方法时被调用的。

    ```typescript
    authorized({ auth, request: { nextUrl } }) {
      // 检查用户是否已登录
      const isLoggedIn = !!auth?.user;
      // 检查当前路径是否为聊天页面（根路径）
      const isOnChat = nextUrl.pathname.startsWith('/');
      // 检查当前路径是否为注册页面
      const isOnRegister = nextUrl.pathname.startsWith('/register');
      // 检查当前路径是否为登录页面
      const isOnLogin = nextUrl.pathname.startsWith('/login');

      // 如果用户已登录且尝试访问登录或注册页面
      // 则重定向到首页
      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      // 允许所有用户访问登录和注册页面
      if (isOnRegister || isOnLogin) {
        return true;
      }

      // 处理聊天页面的访问权限
      if (isOnChat) {
        if (isLoggedIn) return true;  // 已登录用户可以访问
        return false;                  // 未登录用户不能访问，将被重定向到登录页
      }

      // 已登录用户访问其他页面时重定向到首页
      if (isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      // 默认允许访问
      return true;
    },
    ```

2. jwt

    每当创建 JSON Web Token（即登录时）或更新 JSON Web Token（即在客户端访问会话时）时，都会调用此回调。

    jwt 的概念这里就不赘述了，简单理解就是用户登录后生成一个加密过后的字符串，然后返回到前端，前端自行保存，每次请求携带这个字符串，服务端通过密钥来验证这个字符串是否被篡改，这样服务端就不用存储用户的登录状态了，只要jwt有效，就认为用户是登录状态。

3. session

    session 会在每次检查会话的时候被调用，比如使用：useSession 的时候，返回的值会暴露给客户端，但是 V5 版本在服务端用 auth 方法也可以获取到 session 信息，所以在源码中:

    ```ts
    // /app/(chat)/layout.tsx
    const [session, cookieStore] = await Promise.all([auth(), cookies()]);
    ```

    这样调用应该也会触发 callbacks 中的 session 钩子


#### 总结

基本上看完 `app/(auth)/auth.config.ts` 文件就能大概明白整个登录流程，我觉得最难还是配置文件的定义，接下来从需求出发进行配置文件的解析

1. 确定用户身份的验证方式，对应 `providers` 配置项
2. 确定用户登录流程的相关页面，对应 `pages` 配置项
3. 确定有哪些页面要进行用户身份的验证，对应 `callbacks` 中 `authorized` 的实现。
   1. 处理的位置在 `middleware.ts`
4. 需要给 JWT 中的 token 存放什么信息，对应 `callbacks` 中 `jwt` 的实现。
5. 需要获取用户的什么信息，对应 `callbacks` 中 `session` 的实现。

## 二. 启动项目

从 GitHub 克隆下拉的项目是无法正常运行的，启动之后会报这个错误：

```
MissingSecret: Please define a `secret`.
```

这个 secret 是用来加密 JWT 的密钥，在项目的 `.env.example` 也能找到这个环境变量的配置：

```sh
# Generate a random secret: https://generate-secret.vercel.app/32 or `openssl rand -base64 32`
AUTH_SECRET=****
```

所以只需要创建一个 `.env` 文件，并声明一下这个环境变量即可。

添加了这个文件后，还是会有其他报错，先来试试登录，登录也会失败，这是因为目前没有数据库。

### 添加数据库

  查看登录的方法：

  ```typescript
    // /app/(auth)/actions.ts 登录的关键方法
    await signIn('credentials', {
       email: validatedData.email,
       password: validatedData.password,
       redirect: false,
     });
  ```

  这个方法会触发 `/app/(auth)/auth.ts` 中配置的 `authorize` 方法，然后会报错，原因在于现在还没有配置数据库。

  查看代码可以知道，ai-chatbot 项目使用了 drizzle 作为 ORM，postgres 作为数据库。

  > 简单说，ORM 就是通过实例对象的语法，完成关系型数据库的操作的技术，是"对象-关系映射"（Object/Relational Mapping） 的缩写。
  > [ORM 实例教程](https://www.ruanyifeng.com/blog/2019/02/orm-tutorial.html)

  - 使用 docker 安装 postgres

      创建 `docker-compose.yml`

      ```yml
      # 实现一个使用 postgres 的 docker-compose 配置文件，要求环境变量读取项目中的 .env 文件
      services:
        postgres:
          container_name: ai-chatbot-postgres
          image: postgres:latest
          ports:
            - "5432:5432"
          environment:
            POSTGRES_USER: ${POSTGRES_USER}
            POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
            POSTGRES_DB: ${POSTGRES_DB}
          volumes:
            - ./postgresql/data:/var/lib/postgresql/data
      ```
      
  - `.env` 文件中添加环境变量（也可以写在 `.env.local` 中）

      ```sh
      POSTGRES_USER=数据库的用户名
      POSTGRES_PASSWORD=数据库的密码
      POSTGRES_DB=数据库的名称
      POSTGRES_URL=postgresql://数据库的用户名:数据库的密码@localhost:5432/数据库的名称
      ```

  - 如果把 POSTGRES_URL 配置到了 `.env` 文件中那么需要去 `/lib/db/migrate.ts` 修改一下env文件的地址

      ```js
      config({
        path: '.env',
      });
      ```

  - 启动 docker 容器

      ```bash
      docker-compose up -d
      ```

      启动完成通过 `docker ps -a` 查看刚刚启动容器的状态

  - 执行 Schema 的迁移

      这里我理解的 Schema 就是数据结构，比如在代码中定义了一些数据表，以及字段之间的关系，需要同步到数据库中，定义的这些东西就是 Schema。

      ```bash
      # 生成迁移文件
      pnpm db:generate
      
      # 应用迁移
      pnpm db:migrate
      ```
      
      迁移文件（Migration Files）是用于管理数据库结构变更的脚本文件。在这个项目中位于 `/lib/db/migrations` 下，点开查看可以看到这些文件的内容是一些 `sql` 语句


## 三. drizzle-orm

1. `uuid('id')`

    - 定义一个 UUID 类型的字段。
    - 字段名为 'id'
    - UUID 是一个 32 位的唯一标识符
    - 以此类推 `varchar('name')` 定义一个字符串类型的字段，`timestamp('created_at')` 定义一个时间戳类型的字段。

2. primaryKey

    - 将此字段设置为主键
    - 用于唯一标识表中的每条记录
    - 确保每条记录的 id 都是唯一的

3. notNull

    - 设置字段不允许为空

4. defaultRandom

    - 自动生成随机的 UUID 值

5. references

    - 用来定义外键关系（Foreign Key）的方法，比如：
    
        ```typescript
        userId: uuid('userId')
          .notNull()
          .references(() => user.id),
        ```
        
        它的作用是：

        1. 建立表关系 ：
           
           - 将 Chat 表的 userId 字段与 User 表的 id 字段关联
           - 表示每个聊天都属于一个用户
        2. 数据完整性 ：
           
           - 确保 userId 必须是 User 表中存在的 id
           - 防止创建指向不存在用户的聊天记录
           - 当删除用户时，可以触发相关聊天记录的处理（如级联删除）
        3. 查询优化 ：
           
           - 便于进行表连接查询
           - 数据库可以使用这个关系优化查询性能

6. 复合主键

    ```typescript
    (table) => {
        return {
          pk: primaryKey({ columns: [table.id, table.createdAt] }),
        };
      }
    ```

    这意味着：

   1. 复合主键 ：
      
      - 使用两个字段作为主键： id 和 createdAt
      - 这两个字段的组合必须是唯一的
      - 任何一个字段单独都可能重复，但组合必须唯一
   2. 用途 ：
      
      - 可以存在相同的 id ，只要 createdAt 不同
      - 可以存在相同的 createdAt ，只要 id 不同
      - 但不能同时存在相同的 id 和 createdAt

7. 外键

    - 外键是一个表中的字段，它指向另一个表的主键
    - 用于建立表之间的关联关系

        ```typescript
        // Suggestion 表中的外键定义
        documentRef: foreignKey({
          // Suggestion 表中的字段
          columns: [table.documentId, table.documentCreatedAt],
          // 关联到 Document 表的字段
          foreignColumns: [document.id, document.createdAt],
        })
        ```
    
        这表示：
    
           - 建立 Suggestion 和 Document 表的关联
           - 使用两个字段组合作为关联条件：
             - documentId 对应 Document 表的 id
             - documentCreatedAt 对应 Document 表的 createdAt
        
            - Suggestion 表的每条记录必须对应到 Document 表中的一条有效记录
            - 关联条件是 documentId 和 documentCreatedAt 必须匹配 Document 表中的 id 和 createdAt

    Suggestion 表和 Document 表的关系：

    1. 数据插入顺序 ：
        - 必须先有 Document 记录，才能创建对应的 Suggestion
        - 不需要同时插入，但 Document 必须先存在
        - 这是因为 Suggestion 表通过外键引用了 Document 表

    2. 实际场景举例 ：

        ```typescript
        // 1. 先创建一个文档
        const document = await db.insert(Document).values({
          id: 'doc-123',
          createdAt: new Date(),
          title: '示例文档',
          content: '原始内容',
          kind: 'text',
          userId: 'user-123'
        });
        
        // 2. 之后才能创建对应的建议
        const suggestion = await db.insert(Suggestion).values({
          id: 'sug-123',
          documentId: 'doc-123',              // 必须是已存在的文档ID
          documentCreatedAt: document.createdAt, // 必须匹配文档的创建时间
          originalText: '原始文本',
          suggestedText: '建议修改为...',
          userId: 'user-456',
          createdAt: new Date()
        });
        ```

以上是在项目中 `drizzle-orm` 的一些使用方法，这些都是我不太清楚的，所以做个记录。
