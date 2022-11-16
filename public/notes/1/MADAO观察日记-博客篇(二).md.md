---
title: 'MADAO观察日记-博客篇(二).md'
introduction: '实现用户注册功能'
---

![banner_2.jpeg](/_next/upload/banner_2_1668613266370.jpeg "banner_2.jpeg")

## 0x00 前言

接着上一篇的笔记来实现用户的登录、登出功能。

这一次就要使用到数据库的相关知识了，所以先记录一下数据库的基础知识。

## 0x01 关系型数据库

项目采用 PostgreSQL 数据库，它是一个关系型数据库，我目前理解的关系型数据库就是数据都是以表格的形式储存的，类似于：

| id | name | age |
| --- | --- | --- |
| 1 | croak | 30 |
| 2 | goblin | 16 |

任何数据都可以用 行号 + 列号来确定，表于表之间可以通过一些特殊的字段来建立关联，也就是关系。

另一种类型则是非关系型数据库，非关系型数据库是一种不使用表格结构储存数据的数据库，我对于它的理解就止步于此了，目前还没用过，等有机会用的时候再来详细记录吧。

## 0x02 数据库设计范式

我理解的范式就是解决某类问题的模式或者思维方式，但是在数据库这里我觉得它的概念更像是*标准*的意思，就是在设计数据表的时候要满足的标准。

#### 1. 第一范式

**字段原子性（字段不可再分）**

这个很好理解，假如有下面这张表：

| id | 商品（名称/数量） |
| --- | --- |
| 1 | 笔记本/1本 |

商品这个字段它包含了两个属性，一个是商品名称，一个是商品数量，这个就不符合第一范式。

需要改成以下形式

| id | 商品名称 | 商品数量 |
| --- | --- | --- |
| 1 | 笔记本 | 1 |

#### 2. 第二范式

**字段之间没有部分函数依赖**

我理解的函数依赖指的是`y = f(x)`，也就是说只要确定了x的值就一定可以确定y。

在数据库方面首先要确保数据表的每一行数据有一个*主键（主码）*，只要确定了这个主键就能获取这一行其他字段的值。

如果数据表只有一个主键，那么它肯定是满足第二范式的。

| 学号 | 姓名 | 课程 | 分数 |
| --- | --- | --- | --- |
| 1 | croak | 数学 | 30 |
| 1 | croak | 语文 | 10 |

如果是上面这种表，它的主键就是`学号 + 课程`，因为姓名有可能重复，所以不能当主键，而分数需要`学号 + 课程`才能确定，所以主键是`学号 + 课程`。

但是姓名只需要学号就能确定了，它不需要课程这个字段，所以它不符合第二范式，需要改成：

| 学号 | 姓名 |
| --- | --- |
| 1 | croak |

| 学号 |课程 | 分数 |
| --- | --- | --- |
| 1 | 数学 | 30 |
| 1 | 语文 | 10 |

拆成两张表，这样就符合第二范式了。

#### 3. 第三范式

**字段之间没有传递函数依赖**

传递函数依赖也叫做间接依赖，比如下面这张表：

| 学号 | 姓名 | 班级 | 班主任 |
| --- | --- | --- | --- |
| 1 | croak | 四班 | 老王 |


这个表只有一个主键，它是符合第二范式的，但是班主任是和班级绑定的，也就是即便没有学号，班级和班主任也是存在的，这样就会出现间接依赖的情况，班主任间接依赖学号，班级也是的，需要将班级和班主任单独建表。

| 学号 | 姓名 | 班级id |
| --- | --- | --- |
| 1 | croak | 1 |

| id | 班级 | 班主任 |
| --- | --- | --- |
| 1 |四班 | 老王 |

这样就符合第三范式了。

以上只是最基本的三个范式，后面还有好多，我目前还不能理解以及掌握这些，网络上的其他文章也是说基本满足这三个范式就可以了，这里就告一段落。

## 0x02 创建User表

```ts
// prisma/schema.prisma

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

先不考虑其他字段，一个用户需要有的基本字段是：
- 用户名（username）
- 密码（password）
- 创建时间（createdAt）
- 更新时间（updatedAt）

至于`Int`、`@id`这些是prisma的语法，可以参考他的文档 [Prisma schema reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)。

- 同步至数据库

    ```bash
    yarn prisma migrate dev --name create_user_table
    ```
    
- 进入docker查看数据表

    ```bash
    docker ps -a # 获取容器id

    docker exec -it 容器id bash # 进入容器

    psql -U admin # 以admin的身份登录PostgreSQL

    \c development # 连接development数据库

    SELECT * FROM "User"; # 查看User表中的所有数据
    ```
    
## 0x02 实现注册功能

#### 1. 实现一个简单的提交表单的页面

```tsx
// pages/SignUp.tsx

import type { NextPage } from 'next';

import React from 'react';

const SignUp: NextPage = () => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    
    const handleSignUp = () => {
      // TODO 提交注册信息
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
    );
};

```

#### 2. 连接数据库

这里使用 prisma 官方提供的最佳实践：

[Best practice for instantiating PrismaClient with Next.js](https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices#solution)

```ts
lib/db.ts

import { PrismaClient } from '@prisma/client'

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
```

#### 2. 创建一个User的模型（Model）

这个是我从 Ruby On Rails 框架中学习到的知识，也就是常说的 MVC 架构，Model 层就专门用于数据的处理。

逻辑就是：

1. 先判断数据库中是否已经存在该用户
2. 如果存在，判断用户密码是否正确
3. 如果不存在，则创建用户

```ts
// model/user.ts

import type { User } from '@prisma/client';

import { pick } from 'lodash';

import { prisma } from '~/lib/db';


export type UserInfo = Pick<User, 'id' | 'username'>;

class UserModel {

  async create(username: string, password: string) {
    // 查找用户是否存在
    const user = await prisma.user.findUnique({ where: { username } });
    
    // 如果用户存在，则判断密码是否正确
    if (user) {
      if (user.password !== password) {
        return { status: 401, message: '密码错误' };
      }

      return {
      status: 200,
      message: '成功',
      // 使用pick的原因是不想把用户密码也一起返回给前端，所以这里进行属性筛选
      resource: pick(user, ['id', 'username']) };
    }


    // 不存在则创建用户
    const newUser = await prisma.user.create({
      data: { username, password },
      select: { username: true, id: true },
    });

    return { status: 200, message: '成功', resource: newUser };
  }
}

export default UserModel;

```

#### 3. 实现注册接口（controller）

这里我把接口看作是MVC中的controller层，也就是业务逻辑处理层。

在Next.js中接口需要定义在`pages/api`目录下。

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

这样就实现了一个的注册接口。

但是这个接口还十分简陋，它缺少：

1. 请求参数的校验。
2. 用户密码加密，这点非常重要，用户密码一定不可以明文储存。
3. 没有错误处理，比如数据库查询错误等等。

在代码层面重复的代码太多了，比如我定义的返回数据结构是：

```ts
{
  status: 200, // 状态码
  message: '', // 状态描述
  resource: {}, // 返回的数据主体
  errors: {}, // 错误信息
}
```

这个就可以封装成一个方法。

验证请求参数也会在别的接口用到，所以也需要封装成一个方法。

这些东西我准备在下一篇笔记中记录，这里先实现一下密码加密。


#### 4. 用户密码加密

用户密码一定是要加密的，因为你不能保证你的数据库永远安全。

加密方法也是写在 User 的 Model 中：

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
      resource: pick(user, ['id', 'username']) };
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

这里使用了 *crypto-js* 这个库进行密码加密，需要注意的一点就是 **process.env.USER_PASSWORD_KEY**，这是我定义的加密密钥，它是一个环境变量，放在`.env`这个文件中，具体可以参考文档[Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)。

`.env`文件不要提交到GitHub中！！！

## 0x03 结语

这个笔记是我实现完成网站后才写的，最终的代码和例子中代码差别还挺大的，如果报错了，可以参考我的完整代码：[diary-of-madao](https://github.com/GreedyWhale/diary-of-madao)

文件目录和例子中一样的，只要按照对应的文件看就可以了。

