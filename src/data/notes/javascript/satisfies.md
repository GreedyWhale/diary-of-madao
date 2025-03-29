---
title: 'TypeScript - satisfies'
subtitle: '我在 JavaScript 分类中放一些 TypeScript 的笔记大家没意见吧'
author: 'Caisr'
tags: ["JavaScript", "prototype"]
type: 'javascript'
cover: {
  image: '~/assets/images/cover/cover-9.jpg',
  source: 'lexi lauwers',
  sourceUrl: 'https://www.pexels.com/photo/blue-fluorescent-jelly-fish-floating-in-dark-water-17876381/',
}
---

使用过 TypeScript 的人一定遇到过以下情况：

```typescript

type Item = {
  amount: number | string;
};

const item: Item = {
  amount: '3.14',
};

// 会报错
// Argument of type 'string | number' is not assignable to parameter of type 'string'.
//  Type 'number' is not assignable to type 'string'.
console.log(parseFloat(item.amount));
```

原因是 TypeScript 认为这个字段有可能是 string 类型，也有可能是 number 类型，而 parseFloat 方法只接受 string 类型，所以你不得不进行一次类型转换或者用 `as`。

```typescript
console.log(parseFloat(`${item.amount}`));
console.log(parseFloat(item.amount as string));
```

这也是很多人觉得 TypeScript 麻烦的地方，为了类型正确不得写很多看起来多此一举的代码，但是我个人觉得是保证程序正常运行的必要手段，虽然我有时候也会偷懒用 `as`。

现在不一样了 satisfies 可以完美解决上述问题，satisfies 可以让 TypeScript 自适应类型。

```typescript
type Item = {
  amount: number | string;
};

const item = {
  amount: '3.14',
} satisfies Item;

// 这里不会报错
console.log(parseFloat(item.amount));
```

假如你改变了 amount 的类型：

```typescript
const item = {
  amount: 3.14,
} satisfies Item;

console.log(Math.floor(item.amount));
```

TypeScript 也能推断出 amount 是 number 类型。

### MADAO开花观察日记

说来好笑，我是在探索 [ai-chatbot](https://github.com/vercel/ai-chatbot) 项目源码的时候偶然发现这个语法的。以前我是"源码恐惧症"重度患者，一看到源码就头大，觉得那就是天书（其实是我太菜了）。但是不得不说，读源码简直就像挖宝藏一样，每次都能发现新的知识瑰宝。所以...我正式宣布：我要叛变了！从今天起，我是“阅读源码星人”了，哈哈哈哈
