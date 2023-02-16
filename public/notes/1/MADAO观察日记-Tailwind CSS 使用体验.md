---
title: 'MADAO观察日记-Tailwind CSS 使用体验'
introduction: '个人使用Tailwind CSS的体验'
---

![banner_7.jpeg](/_next/upload/banner_7_1676541262996.jpeg "banner_7.jpeg")

## 0x00 前言

距离上一次写笔记已经过去了**64**天，过年前有非常多想要记录的东西，一过完年就对任何事情提不起兴趣，也忘记了之前想要记录什么。

最近公司的新项目也开发完了，趁着还没完全忘记，来总结下使用 Tailwind CSS 这个 CSS 框架的体验。

## 0x01 从 Next.js 说起

好早之前就听说过原子化 CSS 的概念，关于它的定义可以参考下这篇文章

> [重新构想原子化 CSS](https://antfu.me/posts/reimagine-atomic-css-zh)

我刚开始接触原子化 CSS 的时候是一名坚定的反对者，因为它提倡小巧且单一的类名，比如：

```css
.text-black {
    color: rgb(0,0,0);
}

.bg-black {
    background-color: rgb(0 0 0);
}
```

如果采用这种方案，可以预想到的事情就是你的 HTML 标签上会存在一大堆的类名，想想上线后的维护就觉得头痛。

基于以上的原因我就没有过多的关注原子化 CSS。

直到我在写公司新项目的官网的时候，我习惯性的打开了 Next.js 的官网，想要查看下它新版本有哪些改变，看到了这一篇文档：

[With Tailwind CSS](https://nextjs.org/docs/basic-features/font-optimization#with-tailwind-css)

才发现原来原子化 CSS 已经这么火了。

由于我是 Next.js 的脑残粉，所以我从坚定的反对态度变成了想要尝试一下的态度，于是就在公司新项目的官网进行了尝试。

接下来就总结一下使用体验。


## 0x01 项目搭建

- 创建项目

    ```
    yarn create next-app --typescript
    ```
    
- 按照 Tailwind CSS 官网教程进行配置

    [Install Tailwind CSS with Next.js](https://tailwindcss.com/docs/guides/nextjs)
    
- 配置编辑器

    我使用的是 vscode 所以这里按照官方教程配置即可
    
    [Editor Setup](https://tailwindcss.com/docs/editor-setup#intelli-sense-for-vs-code)
    

- 安装 `prettier-plugin-tailwindcss` 插件

    这个插件用于类名排序，因为使用 Tailwind CSS 会导致元素上有很多类名，所以官方推荐了一个插件用来对类名排序。
    
    教程：[prettier-plugin-tailwindcss
](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)

    安装好之后可以手动格式化，也可以在保存的时候自动格式化，格式化方法搜索 "vscode prettier keyboard shortcut" 关键字就行。
    
    
## 0x02 使用体验

**一. 配置**

从项目搭建过程来说，配置并不算复杂，每一步都有对应的官方教程可以看，我自己配置下来也没有踩什么坑，正常的跑起来了。

唯一遇到的问题是 vscode 的问题，在配置了保存后自动使用prettier格式化之后，需要连续保存文件好几次，所以我现在使用手动格式化。

**二、代码提示**

代码提示这一块我的体验结果是不好，虽然安装了官方提供的插件，但是会遇到以下的问题：

1. 需要输入一个空格才能进行提示：

    假如现在有以下代码：
    
    ```tsx
    export default function TailwindCSS() {
      return <div className="text-red-100 text-xs">测试</div>;
    }
    ```
    
    想要修改一下`text-sm`，直接对这个类名进行修改是没有提示的，需要删除整个类名然后输入一个空格才有提示。
    
    
2. 假如在输入过程中不小心写错了，进行删除也不会有提示。


**三、太多类名了**

初次使用对类名不熟悉，基本上开发效率是很低的，再加上上面说的代码提示的问题，会让人写的十分烦躁。

Tailwind CSS的类名好多都是`py-5、mr-4`这种，需要你进行一下计算，后来我发现它的单位是`4px`，`py-5`表示:

```css
padding-top: 20px;
padding-bottom: 20px;
```

这里没有办法，只能多些，好在是它的类名都符合视觉的语义化，写一天左右基本就可以掌握。


**四、背景图片**

在Tailwind CSS中它并不支持使用动态导入的图片：

```tsx
// 这样是不支持的
import bg from '~/bg.png'

export default function TailwindCSS() {
  return <div className={`bg-[url('${bg.src}')]`}></div>;
}
```

可以写成这样：

```html
<div
  className='bg-cover bg-no-repeat bg-center'
  style={{ backgroundImage: `url('${bg.src}')` }}
>
</div>
```

我在实际的项目里没有采用这种方案，我还是写了CSS代码，给需要背景的元素给一个类名，这种体验并不好，应该采用`style`的方式。

**五、类名数量过多**

类名数量过多不用说都能想到，尤其是写伪元素的时候，类名数量多到到突破天际。

我的解决办法是借助第三方库: [clsx](https://www.npmjs.com/package/clsx)。

举个例子：

```html
<!-- 没有使用 clsx 之前 -->

<div className='flex items-center text-lg text-green-400 before:content-["*"] before:mr-1 before:text-red-500'>
    必填
</div>
```

```html
<!-- 使用 clsx  -->

<div
  className={clsx(
    'flex items-center text-lg text-green-400',
    'before:content-["*"] before:mr-1 before:text-red-500'
  )}
>
  必填
</div>
```

使用*clsx*进行拆分后，长度会大大缩减，而且维护起来也不至于头晕眼花。


**六、调试困难**

原子化 CSS的一大特性就是，假如你有一个 `text-[32px]`的类名，那么它就会创建一个全局的类名，你页面中所有用到的这个类名都是同一个，这样就大大减少了CSS的重复率，同样的这也带了调试的问题。

比如我喜欢在调试的时候用浏览器的控制台来勾选元素的某一个元素的CSS样式来定位问题，假如我好多地方都用到了`flex`布局，那么我在控制台取消某个元素的`flex`布局，会导致我整个页面所有用到`flex`布局的元素失效。

**七、标签选择器**

标签选择器问题是我自己学的不全面导致的，其实是没有这个问题的，写下来用于警示自己。

一般遇到这种结构

```html
<ul>
    <li>一</li>
    <li>二</li>
    <li>三</li>
    <li>四</li>
</ul>
```

我都是给`ul`一个类名，然后通过标签选择器`ul>li`写`li`元素的样式。

我在写项目的时候没有仔细看文档，就莫名其妙的认为 Tailwind CSS 不支持标签选择器，其实Tailwind CSS是支持的：

```html
<ul className="[&>li]:bg-white [&>li]:text-red-500">
    <li>1</li>
    <li>2</li>
    <li>3</li>
    <li>4</li>
</ul>
```

**八、和原生CSS语法混淆**

Tailwind CSS 的类名写多了之后，感觉非常顺手，以至于我在切换回正常写CSS的项目里，老是写错。

我总是在写CSS的项目里把`align-items: center;`写成`items-center;`

**九、不用命名**

再也不用为了类名命名而头痛了，爽翻！

但是随之带来的就是不能通过类名来确定元素的用途了。

    
## 0x03 结语

总体使用下来并没有出现我预想的类名过多导致无法维护的问题，只有在刚开始写的时候有点烦躁，一度想放弃，写着写着莫名出现一种爽快的感觉。

不过写完了之后看整体的HTML结构，还是有一种头皮发麻的感觉。


虽然体验都是不太好的，但是如果让我再选一次，我还是会选 Tailwind CSS，总之就是越写越爽，值得试用一番。
