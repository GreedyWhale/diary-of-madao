---
title: 'MADAO观察日记-博客篇(一)'
introduction: '个人博客网站实现 - 项目搭建'
---

![banner_1.jpeg](/_next/upload/banner_1_1668158539220.jpeg "banner_1.jpeg")

## 0x00 前言

之前我的技术笔记都是在第三方的平台上记录，像是简书、掘金这种平台，后来国内的审核变得越来越离谱，有一次我发布完笔记后发现只有我自己能看到，别人看不到，原因是我笔记中的一张图片触发了审核机制奇怪的敏感点，我怕之后的笔记会悄无声息的消失，这对我来说是一个很大的损失，所以萌生了自己搭建平台的想法，于是就诞生了这个网站。

这个个人网站的特点有：

1. 发布笔记的同时可以同步到GitHub，双重保险。
2. 可以直接在网站上对笔记进行增删改查，在编辑的同时会保存草稿到浏览器缓存中，避免草稿丢失。
3. 完全独立开发，像怎么改就怎么改:-)

## 0x01 技术栈

1. Next.js
2. TypeScript
3. PostgreSQL
4. Docker
5. Prisma

## 0x02 项目创建

- `mkdir blog-demo` 创建项目目录

- `cd blog-demo` 进入项目目录

- `yarn create next-app --typescript .` 初始化Next.js

- `corepack enable` 启用yarn和pnpm

- `yarn -v` 检查yarn是否启用成功

- `yarn add sass -D` 支持scss

- 配置路径别名 `tsconfig.json`

  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "~/*": ["./*"]
      }
    }
  }
  ```
  
 **说明**:
 
 1. `corepack enable`

    Node.js 在高于*16.13*的版本中默认集成了`yarn`和`pnpm`，只需要执行`corepack enable`就可以开启。
    
    有时候会开始失败：`command not found: yarn`。
    
    可通过如下步骤解决：
    
    - `where npm` 获取npm执行文件的目录
    - `corepack enable --install-directory xxx`

        **e.g.**
        
        ```
        # 假设npm执行文件目录为
        # /opt/homebrew/bin/npm
        
        corepack enable --install-directory /opt/homebrew/bin/npm
        ```
        
        然后将yarn和pnpm的执行文件复制到npm执行文件的目录即可。
        
        yarn和pnpm的执行文件可以在Node.js的安装目录的*bin*目录中找到。
        
## 0x03 制作数据库的Docker容器

- `docker -v` 确保Docker已安装

- 创建PostgreSQL容器

    ```bash
    docker run -d \
    --name blog-example \
    -e POSTGRES_PASSWORD=blogExamplePassword \
    -e POSTGRES_USER=admin \
    -e POSTGRES_DB=admin \
    -v $PWD/blog-example-data:/var/lib/postgresql/data \
    -p 5432:5432 \
    postgres:latest
    ```
    
    参数说明
    
    - -d：让容器在后台运行
    - --name：容器名称
    - -e：设置环境变量
      - *POSTGRES_USER*：登录postgres的用户名
      - *POSTGRES_PASSWORD*: 登录postgres的密码
      - *POSTGRES_DB*: 首次启动时创建的默认数据库名
    - -v: 设置设置数据卷（本地目录:容器目录）
      - $PWD：表示当前目录

    - -p: 端口号映射，这里要特别注意的是假如本机的端口被占用，改的是`:`前面的端口。

- `docker ps -a` 检查容器是否创建成功（*STATUS*显示UP表示成功）。

**补充**:

如果创建失败可以使用下面命令来查看容器日志，方便定位错误
    
```bash
docker logs 容器id

# 或者

docker logs 容器id --follow # --follow表示持续输出日志
```

## 0x04 安装 Prisma

Prisma 是一个ORM库，可以方便的操作数据库而不用写SQL语句。

- `yarn add prisma -D` 安装 Prisma

- `yarn prisma init` 初始化 Prisma

执行完成后，项目根目录下会多出一个`prisma`目录和`.env`文件。

数据库的地址需要在`.env`文件里面配置：

```env
# 数据库地址
# admin 创建数据库时的用户名
# blogExamplePassword 创建数据库时的密码
# 5432 创建数据库时映射的端口
# development 要连接的数据库名，不存在会自动创建

DATABASE_URL="postgresql://admin:blogExamplePassword@localhost:5432/development?schema=public"
```

数据库的配置文件写在在**prisma/schema.prisma**文件中：

```ts
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

配置好之后就可以定义数据表了，数据表的定义仍然在**prisma/schema.prisma**文件中：

```js
// prisma/schema.prisma

model User {
  id   Int    @id              @default(autoincrement())
  name String @db.VarChar(255) @unique
}
```

语法参考：[Prisma schema reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#model-field-type-modifiers)

定义完数据表，还需要把它同步到真正的数据库中：

```bash
yarn prisma migrate dev --name test_create_table
```

当执行完成后**prisma**目录下面就会多出一个**migrations**目录，里面存放了prisma真正执行的SQL语句。


## 0x05 操作数据表

首先验证User表是否创建成功：

```bash
# 获取到所有容器的id
docker pa -a

# 进入容器
# e.g. docker exec -it 9738cf595e8f bash
docker exec -it 容器id bash

# 登录postgres
psql -U admin

# 查看所有数据库
\l

# 进入development数据库
\c development

# 查看所有数据表
\dt

# 查询User表的所有记录
SELECT * FROM "User";
```

除了进入容器查看，还可以使用 Prisma 提供的 `yarn prisma studio`来查看。

接下来使用代码进行查询：

```ts
// query.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      name: 'Alice',
    },
  });

  const allUsers = await prisma.user.findMany();
  console.log(allUsers);
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

由于是ts文件，所以不能直接用Node.js执行，这里使用ts-node这个库。

- `yarn add ts-node -D` 安装ts-node


- 配置ts-node

    ```json
    {
      "extends": "./tsconfig.json",
      "compilerOptions": {
          "target": "ES2017",
          "module": "CommonJS"
      }
    }
    ```
    
    不配置import语句会报错，[参考](https://stackoverflow.com/questions/63870080/ts-node-syntaxerror-cannot-use-import-statement-outside-a-module)
    
- `yarn ts-node --project ./node.tsconfig.json query.ts` 执行代码


## 0x05 结语

经过上面步骤，项目的基础部分就搭建完毕了，自从前端的各种框架内置了打包配置之后，搭建项目就变的非常的便捷了，让我对Webpack的恐惧也下降了许多，但是写的越多发现还是无法完全逃开Webpack这些打包工具，尤其是基于Electron的项目，配置起来让人很绝望，总有数不清的坑。