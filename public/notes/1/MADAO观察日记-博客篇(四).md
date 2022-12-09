---
title: 'MADAO观察日记-博客篇(四)'
introduction: '实现有关笔记和标签的操作'
---

![banner_4.jpeg](/_next/upload/banner_4_1670576230560.jpeg "banner_4.jpeg")

## 0x00 前言

今天来记录一下有关笔记和标签相关的功能，主要涉及到增、删、改、查这几个基本的数据库操作。

在实现之前还是需要了解一下前置知识：关系（Relations）


## 0x01 Relations

指的是在关系数据库中数据表之间的关系，在关系数据库中，当其中一个表具有引用另一个表的主键的外键时，两个表之间存在关系。

- 主键：指能够通过某个（或者多个）字段唯一区分出不同的记录，这个字段被称为主键，如果主键由多个字段组成，这种主键被称为联合主键。

- 外键：可以将两个表关联起来的字段叫做外键。


比如*用户表*和*笔记表*，一个作者可以有多篇笔记，一篇笔记只能属于一个作者，所以它们之间存在一个**一对多**的关系。

关系分为：

- 一对一
- 一对多
- 多对多
- 自我关系

## 0x02 创建 Note 表

创建表之前先定义 Note 的 Model

```ts
// prisma/schema.prisma

enum Category {
  TECHNICAL
  READING
}

model Note {
  id            Int      @id @default(autoincrement())
  category      Category
  title         String
  introduction  String
  content       String
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}
```

`enum Category` 是定义枚举的意思。


前面也说过笔记和作者是一对多的关系，一个用户可以拥有多篇笔记，一篇笔记只能属于一个作者，在这个博客项目中，用户就是作者，所以需要将 Note 表和 User 表关联起来。

这是之前定义的 User Model

```ts
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

现在把它和 Note 关联起来：

```diff
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
+ notes     Note[]
}

model Note {
  id            Int      @id @default(autoincrement())
  category      Category
  title         String
  introduction  String
  content       String
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
+ author        User  @relation(fields: [authorId], references: [id])
+ authorId      Int
}
```

在一对多一的一端（User）添加 `notes     Note[]`

在一对多多的一端（Note）添加

```ts
author        User  @relation(fields: [authorId], references: [id])
authorId      Int
```
这表示 Note 表有一个外键 `authorId`，它关联的是 User 表中的 `id` 键。

接下来就创建真正的Note表。

- 迁移Model到真正的数据库

    ```bash
    yarn prisma migrate dev --name=create_note_table
    ```

- 安装`ts-node`用于测试

    ```bash
    yarn add ts-node -D
    ```
- 添加 `node.tsconfig.json` 文件，防止 `ts-node`报错


    ```json
    {
      "extends": "./tsconfig.json",
      "compilerOptions": {
          "target": "ES2017",
          "module": "CommonJS"
      }
    }
    ```
- 创建测试文件`/test/user.test.ts`

    ```ts
    import { PrismaClient } from '@prisma/client';

    const prisma = new PrismaClient();

    const createUser = async () => {
      await prisma.user.create({
        data: { username: 'test_user', password: '123456' },
      });
    };

    const getUser = async () => {
      const user = await prisma.user.findUnique({
        where: { id: 2 },
        // 重要
        include: { notes: true },
      });

      console.log(user);
    };

    createUser();
    getUser();

    ```
    
 - 执行测试文件

    ```
    yarn ts-node --project ./node.tsconfig.json test/user.test.ts
    ```
    
    结果：
    
    ```json
    {
      id: 2,
      username: 'test_user',
      password: '123456',
      createdAt: 2022-12-09T04:34:45.454Z,
      updatedAt: 2022-12-09T04:34:45.454Z,
      notes: []
    }
    ```
    
    从结果中可以看出，User 表已经和 Note 表关联起来了，能拿到 notes 字段了。
    

还有一种更简单的测试方式：

- `yarn prisma studio`

- 在自动打开的页面中找到 User 表

- 可以得到如图所示的结果：
    
    ![user_relation.png](/_next/upload/user_relation_1670561520356.png "user_relation.png")
    
## 0x03 创建 Label 表

这里的 Label 指的就是笔记的标签，用于分类，Label 表和 Note 表之间是一个多对多的关系，因为一篇笔记可以有多个标签，一个标签也可以用于多篇笔记。

多对多这样定义：


```diff

model Note {
  id            Int      @id @default(autoincrement())
  category      Category
  title         String
  introduction  String
  content       String
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
+ labels        Label[]
  author        User  @relation(fields: [authorId], references: [id])
  authorId      Int
}

+ model Label {
+  id   Int    @id @default(autoincrement())
+  name String @unique
+  notes Note[]
+}

```

把上面 Model 同步到数据库中：

```bash
yarn prisma migrate dev --name=create_label_table
```

正常来说 Label 表还需要关联一下 User 表，因为需要知道标签的创建者是谁，但是我这个项目目前没有这样的需求，未来也不会有，所以我没有做这一层的关联。

## 0x04 增、删、改、查

增、删、改、查是数据库的基本操作，在这个项目中笔记是有增、删、改、查的，标签只有增、查。

主要难点在于 `prisma` 的语法，所以下面就不记录业务代码了，只记录`prisma`的代码。

#### 1. 创建笔记

```ts
// 创建笔记的参数类型

type CreateNoteParams = {
  title: string;
  introduction: string;
  category: 'TECHNICAL' | 'READING';
  content: string;
  authorId: number;
  labels: string[];
}


const note: CreateNoteParams = {
  title: '测试',
  introduction: '测试一下',
  category: 'TECHNICAL',
  content: '这是一篇测试文章',
  authorId: 2,
  labels: ['test'],
};


// 创建笔记
const createNote = async () => {
  const { labels, authorId, ...rest } = note;

  const newNote = await prisma.note.create({
    data: {
      ...rest,
      // 关联User
      author: {
        connect: { id: authorId },
      },
      labels: {
        // 创建或者关联已存在的标签
        connectOrCreate: labels.map(label => ({
          create: { name: label },
          where: { name: label },
        })),
      },
    },
    include: {
      labels: true,
      author: {
        select: { username: true },
      },
    },
  });

  console.log(newNote);
};

```

使用`ts-node`执行一下上面代码，可以得到结果：

```json
{
  id: 9,
  category: 'TECHNICAL',
  title: '测试',
  introduction: '测试一下',
  content: '这是一篇测试文章',
  createdAt: 2022-12-09T07:21:02.858Z,
  updatedAt: 2022-12-09T07:21:02.858Z,
  authorId: 2,
  labels: [ { id: 1, name: 'test' } ],
  author: { username: 'test_user' }
}
```

#### 2. 更新笔记

更新笔记的参数和创建笔记的一样，额外需要一个`id`，因为要知道更新哪一篇笔记。

```ts
type CreateNoteParams = {
  title: string;
  introduction: string;
  category: 'TECHNICAL' | 'READING';
  content: string;
  authorId: number;
  labels: string[];
};

// 更新笔记的参数类型
type UpdateNoteParams = CreateNoteParams & {
  id: number;
};

const updateParams: UpdateNoteParams = {
  id: 9,
  title: '测试1',
  introduction: '测试一下1',
  category: 'TECHNICAL',
  content: '这是一篇测试文章1',
  authorId: 2,
  labels: ['test', 'test1'],
};

const updateNote = async () => {
  const { id, labels, authorId, ...rest } = updateParams;

  const newNote = await prisma.note.update({
    // 需要先找到对应笔记
    where: { id },
    data: {
      ...rest,
      authorId,
      labels: {
        connectOrCreate: labels.map(label => ({
          create: { name: label },
          where: { name: label },
        })),
      },
    },
    include: {
      labels: true,
      author: {
        select: { username: true },
      },
    },
  });

  console.log(newNote);
};

updateNote();
```

#### 3. 删除笔记

删除就更简单了，只需要一个id即可

```ts
const deleteNote = async (id: number) => {
  await prisma.note.delete({
    where: { id },
  });
};

deleteNote(9);
```

#### 4. 查询笔记

查询笔记有两种，一种给出条件查询单个笔记，比如：

```ts
// 知道笔记id
const id = 8;

// 通过id查询
prisma.note.findUnique({
    where: { id },
    include: {
      labels: true,
      author: {
        select: { username: true },
      },
    },
})
```

第二种则是查询列表，比如知道标签id，查询这一标签下的所有笔记，查询列表就牵扯到一个分页的问题，分页在 `Prisma` 中可以这样写：

```ts
// 查询参数类型
type QueryParams = {
  pageSize: number; // 每页条数
  page: number; // 当前页
  labelId: number;
};

const queryParams: QueryParams = {
  pageSize: 10,
  page: 1,
  labelId: 1,
};

const getNotes = async () => {
  const notes = await prisma.note.findMany({
    // 跳过的数量
    skip: queryParams.page === 1 ? 0 : (queryParams.page - 1) * queryParams.pageSize,
    // 拿取的数量
    take: queryParams.pageSize,
    where: {
      // 笔记的标签中至少有一个标签id和参数中的标签id相同
      labels: { some: { id: queryParams.labelId } },
    },
    include: {
      author: {
        select: { username: true },
      },
      labels: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(notes);
};

getNotes();
```

除了分页以外，一般接口还会返回一个数据的总数，这样方便前端计算一共有多少页。

这种场景就非常适合一种叫做**事务**的操作：

> 把多条语句作为一个整体进行操作的功能，被称为数据库事务
>
> ----《[事务](https://www.liaoxuefeng.com/wiki/1177760294764384/1179611198786848)》

用 `Prisma` 是这样写的：

```ts
// 查询参数类型
type QueryParams = {
  pageSize: number; // 每页条数
  page: number; // 当前页
  labelId: number;
};

const queryParams: QueryParams = {
  pageSize: 10,
  page: 1,
  labelId: 1,
};

const getNotes = async () => {
  // prisma.$transaction 用来执行事务操作
  const notes = await prisma.$transaction([
    // 语句一
    prisma.note.findMany({
      skip: queryParams.page === 1 ? 0 : (queryParams.page - 1) * queryParams.pageSize,
      take: queryParams.pageSize,
      where: {
        labels: { some: { id: queryParams.labelId } },
      },
      include: {
        author: {
          select: { username: true },
        },
        labels: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

    // 语句二
    prisma.note.count({
      where: {
        labels: { some: { id: queryParams.labelId } },
      },
    }),
  ]);

  console.log(notes);
};

getNotes();
```

使用`prisma.$transaction`得到的结果是一个数组。

以上就是笔记的增、删、改、查操作，用了 `Prisma` 之后的还是挺简单的，标签相关的操作类似，这里就不再记录了。

## 0x05 结语

我当时写到这一部分的时候就感受到前后端巨大的差异化。

首先是数据库字段类型的定义，后端可以会非常在意字段的长度这些。比如：`varchar`、`text`、`bigint`等等，我一开始看到这些头都大了，然后又不知道用那个类型最合适，非常纠结。

第二个是复杂无比的数据库操作太让我不能适应了，虽然在写笔记的时候感觉并不是很复杂，可是我在实现的时候，对数据表结构设计，要怎么建立联系，需不需要中间表这些问题考虑了好久，总有一种万一这样不是最优方案的担心，写的胆战心惊的。

我想我还是不喜欢后端编程，比起前端编程要枯燥无味多了。