---
title: '个人博客网站搭建全流程'
subtitle: '从零开始的博客网站搭建流程，包括部署'
author: 'Caisr'
tags: ["Astro", "Fullstack"]
type: 'fullstack'
cover: '~/assets/images/cover/cover-8.jpg'
---

### 前言

这是我个人博客网站的第四次改版了。相对于之前的版本，这次非常简陋，基本没有接口相关的内容，也没有数据库相关的东西，之所以变成这样，是因为我觉得我把之前的网站写的太过于复杂，没有必要实现完整的登录、在线编辑等功能，而且我发现我用代码编辑器反而有写作的欲望，所以进行了这次改版。

这一次我选择了 Astro 替代 Next.js 作为我个人网站的开发框架，原因在于 Next.js 的开发体验不太好，首先是开发服务启动就非常的慢，再加上 Next.js 的各种缓存的规则让人挺头疼的，总是出现莫名其妙的数据不更新问题。

选择 Astro 的原因在于它非常适合个人博客类型的网站，也不和特定框架绑定，所以想要试一下。


### 一. 给 Markdown 文件添加自定义字段

Astro 中提供了两种方式渲染 Markdown 文件，一种是直接写在 pages 目录下，另一种是使用内容集合。

直接写在 pages 目录的 Markdown 文件会被直接渲染成页面，而内容集合的方式更加灵活，类似于去通过 API 方式读取文件内容，然后由开发者去决定如何渲染。

我在这个项目中就使用了内容集合的方式去渲染 Markdown 文件，原因就是我需要给每个 Markdown 文件添加一个封面图，这个图片是项目中的图片资源，而不是外部的图片资源。

#### 第一步：创建一个用于存放 Markdown 文件的目录

我的目录结构如下：

```
|-- src
    |-- data
        |-- notes
            |-- xxx.md
            |-- yyy.md
            |-- ...
```

#### 第二步：定义 Markdown 文件的 Frontmatter 类型

```typescript
import type { ImageMetadata } from 'astro';

export interface MarkdownFrontmatter {
  title: string;
  subtitle: string;
  author: string;
  tags: string[];
  type: string;
  cover: ImageMetadata;
}
```

cover 字段就是需要添加的自定义字段，它的类型是 ImageMetadata，这个类型是 Astro 提供的，它的作用是用来表示图片的元数据。

#### 第三步：定义集合

详细的步骤可以查询文档 [Content collections](https://docs.astro.build/en/guides/content-collections/)


```typescript
import type { CollectionConfig } from 'astro:content';

import { defineCollection, z } from "astro:content";
import { glob } from 'astro/loaders';

/*
  * 首先定义好集合的分类，比如说笔记按照内容进行分类，我目前有 4 个分类，分别是 'react', 'javascript', 'css', 'fullstack'
  * as const 的意思是将数组中的元素转换成字面量类型。
**/
const NOTES_TYPE = [
  'react',
  'javascript',
  'css',
  'fullstack'
] as const;

/**
  * 获取 Markdown 文件的路径
  * 我的文件路径是这样
  * src/data/notes/react/xxx.md
  * src/data/notes/javascript/xxx.md
  * src/data/notes/css/xxx.md
  * src/data/notes/fullstack/xxx.md
  * 所以我需要根据 type 参数来拼接路径
*/
const getNotesCollectionPath = (type?: typeof NOTES_TYPE[number]) => {
  return type ? `./src/data/notes/${type}` : './src/data/notes'
};

/**
  * 定义集合
*/
const createNoteCollection = (type?: typeof NOTES_TYPE[number]) => defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: getNotesCollectionPath(type) }),
  schema: ({ image }) => z.object({
    title: z.string(),
    subtitle: z.string(),
    author: z.string(),
    tags: z.array(z.string()),
    type: z.string(),
    // 这里就是图片类型的定义方式
    cover: image(),
  }),
});

/**
  * 最后导出集合
  * 这样集合中就包含了不同分类的 Markdown 文件，后续可以通过 getCollection 获取某一种分类的 Markdown 文件，比如:
  * const notes = await getCollection('react');
*/
const notes: Partial<Record<typeof NOTES_TYPE[number] | 'all', CollectionConfig<unknown>>> = {
  all: createNoteCollection()
};

NOTES_TYPE.forEach(type => {
  notes[type] = createNoteCollection(type);
});

export const collections = {
  ...notes
};
```

#### 第四步：生成类型文件

定义完集合之后，需要生成类型文件，这样才能在后续的代码中使用，生成的方式是执行一下这个命令：

```bash
pnpm astro sync
```

如果用不同的包管理器，自行替换即可。

这一步不是必须的，当你执行：`astro dev`, `astro build` 或者 `astro check` 会自动执行 sync 命令，但是我在开发的时候遇到过类型没有更新的问题，所以这里还是说一下。

#### 第五步：创建 Markdown 文件并使用 cover

创建 Markdown 文件

```md
---
title: '实现 UnoCSS 网站的颜色渐变效果'
subtitle: 'CSS Animation: When you spend hours on keyframes, but end up making a button bounce.'
author: 'Caisr'
tags: ["CSS", "Animation"]
type: 'css'
cover: '~/assets/images/cover/cover-1.webp'
---

内容
```

这样定义完成后就可以直接去用 assets 目录下的图片了。甚至可以用路径别名。使用方法如下：

```typescript
// 获取单个 Markdown 文件内容
const note = await getEntry('react', 'server-components');
// cover: {
//   src: '/@fs/E:/caisr/code/diary-of-madao/src/assets/images/cover/cover-4.jpg?origWidth=3456&origHeight=5184&origFormat=jpg',
//   width: 3456,
//   height: 5184,
//   format: 'jpg'
// }
const cover = note.data.cover;
```
cover 可以直接传给 `<Image />` 组件。

```tsx
<Image src={cover} alt="notes cover" />
```
