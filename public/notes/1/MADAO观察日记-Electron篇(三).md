---
title: 'MADAO观察日记-Electron篇(三)'
introduction: 'Electron'
---

![banner_10.jpeg](/_next/upload/banner_10_1681380529882.jpeg "banner_10.jpeg")

## 0x00 前言

个人的Electron项目做了80%了，目前是烂尾状态，原因是这个项目没有达到我想要系统学习 *Electron Forge* 工具的目的。

我陷入了无穷无尽的样式问题和业务逻辑，做出来之后感觉也是一个玩具项目，觉得太浪费时间了，就终止了后续的开发。

虽然烂尾了，但是还是收获了很多新的知识，下面总结一下。

## 0x01 SolidJS 使用感受

1. 生态不够丰富

    这和所有新框架一样，需要时间去积累。让人感到意外的是另一个同时期的框架 *svelte*，很多第三方库都适配了 *svelte*，而我觉得 *svelte* 并不好用，难道是我还没发现*svelte*的正确使用方式？
    
2. 语法

    *SolidJS* 的语法和 *React* 很像，也使用了 JSX 语法去书写 HTML，同时它提供了一些封装好的组件，比如：`Index`、`For`、`Show`。
    
    这些组件的目的在于方便用户使用，我挺喜欢的，问题在于好多框架总是提供一些非常相似的功能，以至于你在使用的时候不得不问一下它们有什么区别，比如：`Index`和`For`组件，都用于列表渲染，但是我应该使用哪一个呢？
    
    文档中的原话是：
    
    > When the array updates, the <For> component uses referential equality to compare elements to the last state of the array. But this isn't always desired.
    > 
    > In JavaScript, primitives (like strings and numbers) are always compared by value. When using <For> with primitive values or arrays of arrays, we could cause a lot of unnecessary rendering. 
    
    翻译后只能知道当数组的值为基本类型（比如：`strings`或者`numbers`）时，`<For>`组件有可能会造成不必要的渲染。
    
    我第一次看完之后就觉得只要数组的值为基本类型时我就用 `<Index>` 组件，是引用类型时就用 `<For>` 组件。
    
    后来在开发的时候，一到列表渲染我就开始纠结我用的真的对吗？这个当时用 Vue3 的 `ref`和 `reactive`的感受一模一样，个人真的很不喜欢这样。
    
    
    这一部分的感受是和*React*差别不大，但是*React*写起来更舒服。
    
3. Reactivity
    
    Reactivity 是响应式的意思，*SolidJS*中和React最大的不同是，它的组件只执行一次，比如：
    
    ```tsx
    import { render } from "solid-js/web";
    import { createSignal } from "solid-js";

    function Counter() {
      const [count, setCount] = createSignal(0);

      setInterval(() => setCount(count() + 1), 1000);

      console.log('render');
      return <div>Count: {count()}</div>;
    }

    render(() => <Counter />, document.getElementById('app'));
    ```
    
    上面代码中的`render`只会打印一次，同样的逻辑在React中，它会每秒打印一次。
    
    而且`SolidJS`在`Effect`中会自动收集依赖，这一点我觉得要比 *React* 好很多，*React*中`Effect`的依赖很容易写的巨多，而且容易翻车（无限执行）
    
    在响应性方面我觉得 *SolidJS* 体验高于 *React*。
    
结论就是：如果 *SolidJS* 的生态能迅速发展的话，我会放弃 *React* 转向 *SolidJS*，*React*的`useEffect`太难用好了。
    
    
## 0x02 拟态风格按钮

    
拟态风格按钮指的是类似这样的样式
    

![button.png](/_next/upload/button_1681377946990.png "button.png")
    
按钮按下去阴影会消失，给人一种真实按下去的感觉。
    
要用css实现这样的样式诀窍在于：
    
1. 背景色的径向渐变
    
    渐变的方向是从左上角进行渐变，颜色为浅色到深色。比如：
    
    ```css
    background: radial-gradient(circle at top left, #2E3238, #1D1F22);
    ```
    
2. 阴影
    
    阴影需要设置两种颜色，颜色的亮度是上左浅，右下深，比如：
    
    ```css
    box-shadow: 4px 4px 12px 3px rgba(0,0,0,0.4), -3px -2px 12px #575c64; 
    ```
    
使用这种颜色搭配窍门就可以在一个深色背景下用css实现拟按钮的样式。
    
*e.g.*
    
```html
<div class='button'></div>
```
    
```css
body {
  background: #13141B;
}

.button {
  width: 100px;
  height: 100px;
  background: radial-gradient(circle at top left, #2E3238, #1D1F22);
  box-shadow: 4px 4px 12px 3px rgba(0,0,0,0.4), -3px -2px 12px #575c64; 
  border-radius: 50%;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.button:active {
  box-shadow: none;
}
```
    
## 0x03 结语
    
这个项目断断续续做了这么长时间，给我的收获就这么多了，看起来挺少的，但是成功让我吧 *Vite* 引入我的构建流程中，还是让我觉得挺值得的。
    