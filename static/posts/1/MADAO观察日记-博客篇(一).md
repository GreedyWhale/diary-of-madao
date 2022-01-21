---
title: 'MADAO观察日记-博客篇(一)'
labels: ['Blog', 'Next.js']
introduction: '个人博客网站实现笔记 - 项目搭建'
---

![post_cover_1642738442151.png](/static/images/posts/post_cover_1642738442151.png "post_cover_1642738442151.png")

## 前言

博客篇主要是用来记录搭建当前博客网站的过程，基本框架使用Next.js，使用到的其他技术有：
- TypeScript
- Prisma
- PostgreSQL
- Docker

由于一些不可抗力我决定将自己的技术笔记从之前的平台迁移出来，开始是选择部署在**GitHub Pages**上，体验很不错，后来在我买的课程中正好有一部分是讲如何搭建一个博客系统，涉及到了很多我没有接触过的知识，正好就跟着课程重新搭建一个博客网站。

这一篇笔记主要记录了项目搭建的过程

## 环境

- macOS 12.1
- Node.js v16.13.2
- Yarn 1.22.11
- Docker 20.10.1

## 实现

#### 1.使用Next.js创建项目

```bash
yarn create next-app --typescript .
```

加一个`.`表示在当前目录创建
    
如果使用的Node.js是大于等于16.13版本的，就不需要自己安装yarn或者pnpm了，可以通过corepack来管理**包管理器**，使用方式：

```bash
corepack enable
yarn -v
```

如果这样不能使用，报`command not found: yarn`可以通过如下方式解决：
    
```bash
where npm
```
    
获取npm执行文件的目录。
        
**e.g.** `/opt/homebrew/bin/npm`
        
```bash
corepack enable --install-directory /opt/homebrew/bin/npm
```

将yarn和pnpm的执行文件手动复制到这个目录，这样就可以使用了
    
如果发现yarn或者pnpm的版本不是最新的，可以通过corepack prepare 命令进行升级

**e.g.** `corepack prepare yarn@1.22.11 --activate`
    
#### 2. 支持scss

```bash
yarn add sass -D
```

然后将`.css`文件后缀改为`.scss`即可

#### 3. 添加eslint

Next.js自带了一套eslint规则，如果需要添加格外的eslint规则，只需要在配置中添加`next/core-web-vitals`即可，我额外配置了[XO](https://github.com/xojs/xo)规则，[配置参考](https://github.com/GreedyWhale/diary-of-madao/blob/main/.eslintrc.js)。

#### 4. 制作数据库的docker容器

确保本机安装了docker，[下载地址](https://www.docker.com/get-started)

```bash
docker -v
```

数据库选择PostgreSQL，[官方镜像地址](https://hub.docker.com/_/postgres)

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

参数说明：

- -d: 让容器在后台运行
- --name: 容器的名字
- -e: 设置环境变量
  - POSTGRES_PASSWORD: 登录postgres的密码
  - POSTGRES_USER: 登录postgres的用户名
  - POSTGRES_DB: 首次启动时创建的默认数据库名
- -v: 设置设置数据卷（本地目录:容器目录），把本地目录挂载到容器对应的目录，`/var/lib/postgresql/data`是容器中数据存放的目录，`$PWD/blog-example-data`是本地目录，这样挂载的好处是即使容器被删除了，数据仍然存在，`$PWD`代表当前目录路径。
- -p: 端口号映射，访问本机的端口会自动转发去容器的端口，这里要注意一下5432是postgres默认的端口，假如你想要修改端口号需要这样改`5431:5432`，就是改前面而不是后面。
- postgres:latest: 指定容器的镜像为postgres最新版

检查容器是否成功创建

```bash
docker ps -a
```

如果容器的**STATUS**显示的是UP证明创建成功并且已经启动了，如果失败了，可以使用

```bash
docker logs 容器id

# 或者

docker logs 容器id --follow

# e.g. docker logs 5cf221b03e88
```

来查看日志定位出错原因

#### 5. 使用Prisma操作数据库

Prisma 是一个ORM的库，ORM的意思是：

> 简单说，ORM 就是通过实例对象的语法，完成关系型数据库的操作的技术，是"对象-关系映射"（Object/Relational Mapping） 的缩写。 --- 《ORM 实例教程》阮一峰

我自己的理解就是让开发者用操作对象的方式去操作数据库，不用去写原生SQL语句。


```bash
# 安装prisma
yarn add prisma -D

# 初始化prisma
yarn prisma init
```

执行完上面两个命令，项目目录会多出一个`prisma`目录和`.env`文件

`.env`文件里有一个`DATABASE_URL`变量，它用来保存链接数据库的地址和参数

```
# 数据库地址
# admin 创建数据库时的用户名
# blogExamplePassword 创建数据库时的密码
# 5432 创建数据库时映射的端口
# development 要连接的数据库名，不存在会自动创建

DATABASE_URL="postgresql://admin:blogExample@localhost:5432/development?schema=public"   
```

注意这里要把`.env`文件添加到`.gitignore`里面去，不要提交到github上，提交上去的话你的数据库的用户名和密码就暴漏了。

写好数据库地址后就可以进行连接了


数据库连接的配置写在**prisma/schema.prisma**文件里，同时数据表的定义也写在这里面。

定义一张数据表用来测试


```js
// prisma/schema.prisma

model User {
  id   Int    @id              @default(autoincrement())
  name String @db.VarChar(255) @unique
}
```

这样就定义了一张表结构，User是表名，id和name都是表里的字段。

Int、@id、@default、@unique这些都是Prisma的语法，他们的意思都可以在文档中找到

[Prisma schema reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#model-field-type-modifiers)


接下来就可以把这个User变成真正的数据表

```bash
yarn prisma migrate dev --name test_create_table
```

当执行完成后**prisma**目录下面就会多出一个**migrations**目录，里面存放了prisma真正执行的SQL语句。

然后去验证一下数据表是不是真实的生成了

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

还有一种更简单的方式去验证，用Prisma提供的图形界面客户端去查看，[下载地址](https://www.prisma.io/studio)

```bash
yarn add @prisma/client
```

最后一步就是安装`@prisma/client`，安装完之后，会自动调用`prisma generate`这个命令，这个命令会根据当前的**prisma/schema.prisma**文件生成一个`.client`目录，这个目录在**node_modules**里，点进去看会发现User表的类型声明。

有了`@prisma/client`就可以用js的代码来查询数据了

**e.g.**

```js
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

为了测试安装一个ts-node

```bash
yarn add ts-node -D
```

创建**node.tsconfig.json**

```
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
      "target": "ES2017",
      "module": "CommonJS"
  }
}
```

不创建这个文件的话ts-node会报错，因为源码中使用了import语句。

[参考](https://stackoverflow.com/questions/63870080/ts-node-syntaxerror-cannot-use-import-statement-outside-a-module)

执行命令

```bash
npx ts-node --project ./node.tsconfig.json query.ts

```


到了这里项目的基本环境就已经搭建完成了。






