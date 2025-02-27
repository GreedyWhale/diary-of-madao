---
title: 'React - Server Components'
subtitle: 'React: I’m evolving! Vercel: No, you’re becoming Next.js. I’ve got the team to prove it.'
description: '我想了解 Server Components 的原因在于我用上 Next.js 的 App 目录模式后，我竟然不知道应该在什么地方进行接口的请求了，这让我很困惑。我查阅了一些文档后对 Server Components 越来越不理解了。'
author: 'Caisr'
tags: ["React"]
type: 'react'
cover: '~/assets/images/server-components.jpg'
---

自从 Next.js 推出 App Router 后，我对 Next.js 的评价越来越差，原因就在于我不知道在 Next.js 中的什么地方进行接口的请求，再加上它那让人抓狂的缓存机制，让我越来越对它的印象越来越差。

所以我去了解了 Server Components 的一些概念，发现事情并不是我想象的那样。

> 顺便还要说下一下 Next.js 的文档，我每次搜索 Next.js 的文档都会出现牛头不对马嘴的情况，有时候是 Pages Router 有时候又是 App Router，直到我前段时间发现官方文档可以通过左上角的按钮切换不同模式的文档...

### 一. Server Components 是 React 的特性

误解一：我对 Server Components 的第一个误解就是认为它是 Next.js 的新特性，看了文档后才知道 Server Components 是 React 本身提供的新特性，严谨一点说应该叫 React Server Components (RSC)。

误解二：Server Components 就是 SSR（服务端渲染），这两个其实是两个不同的东西。

相对于 Server Components，还有一种组件叫做 Client Components（客户端组件），这让人很容易理解成 Server Components 在服务端进行渲染，Client Components 在浏览器端进行渲染，实际上不论是 Server Components 还是 Client Components 都是在客户端渲染的，只是 Server Components 里的代码可以在服务端执行，比如说访问数据库、请求接口等等，Server Components 在服务端执行完成之后就会变成一个类似这样的对象：

```javascript
J0:["$","div",null,{"className":"main","children":["Hello, world!"]}]
```
在客户端器端执行的时候，是通过反序列化JSON得到一个真正的组件，所以 Server Components 有很多限制，不能进行事件绑定这些操作，不能有自己的 state，这些无法进行 JSON 序列化。

Server Components 的优势在于 Server Components 可以直接获取好数据，不用等组件到客户端之后再去获取数据，节省了用户等待网络请求的时间，同时 Server Components 可以减少 JavaScript 的体积，比如说你要渲染一篇 Markdown 格式的内容，客户端组件需要下载相应的解析库才可以进行渲染，如果把这个 Markdown 文件放到 Server Components 中去渲染，那么第三方依赖的那些解析库代码是不会打包进 JavaScript 文件中去的，Server Components 在客户端不会重新渲染。

这里就可以看出来 Server Components 和 SSR 的区别，SSR 是直接给客户端返回有内容的HTML，而直接使用 Server Components 是无法实现 SSR 的它返回的并不是 HTML。

### 二. 我应该在什么地方进行接口的请求？

我个人非常喜欢 Next.js 的 Pages Router，我觉得 Pages Router 的 API 非常简单明了，你想要 SSG 还是 SSR 都可以直接将数据获取写在对应的函数中，但是 Pages Router 中的 SSR 有个限制：`getServerSideProps` 只能在页面级的组件工作。如果换 Server Components 就可以很好的解决这个问题。

Next.js 的渲染流程是：

1. 先执行 Server Components 获取到执行结果（Next.js 把这个叫做 RSC Payload）
2. 然后执行 Client Components，并结合 RSC Payload 生成 HTML、JS 和 CSS 等资源。
3. 将生成好的 HTML、JS 和 CSS 等资源返回给浏览器。
4. 浏览器可以理解呈现 HTML 的内容，但是页面是无法交互的
5. 重建 React 节点树、Virtual DOM树、进行事件绑定等等（这个过程叫做 hydrate，翻译成中文叫水合 -_-）

可以看到 Next.js 是把 Server Components 在浏览器渲染的步骤放在了服务端，直接生成好 HTML 返回给浏览器。

这样一来请求的位置就十分明确了，就是放在 Server Components 里面，但是在日常的使用中这种划分会让整个页面组件划分粒度非常细，而且经常是这种结构

```jsx
const App = async () => {
  const data = await fetch('xxx');

  return <ClientPage data={data}>
};
```

给人一种没有完全发挥 Server Components 优势的感觉。

最后说一下我真实遇到的坑，我在 Next.js 中使用了 Axios，开发的时候没有任何问题，可以部署上线后发现，接口数据根本不会更新，因为我只看到 Next.js 对 fetch 方法做了一系列的优化、缓存什么的，结果用 Axios 也出现了缓存问题，最后没办法只能在根布局设置：`export const dynamic = "force-dynamic";` 来解决这个问题。

