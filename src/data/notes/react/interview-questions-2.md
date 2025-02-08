---
title: 'React 面试题（二）'
subtitle: '哦，所以你是说你连最基本的 Hooks 都没搞明白，就敢来面试了？'
description: '终于来到了背 API 的环节，用好工具的前提一定是懂工具原理么 :-('
author: 'Caisr'
tags: ["React"]
type: 'react'
cover: '~/assets/images/if-banner-1.webp'
---

### 1. React Hooks 是什么

React Hooks 是 React 16.8 版本新增的功能，它允许你在函数组件中使用状态（state）和其他 React 特性（如生命周期、上下文等），而无需编写类组件。

### 2. 为什么需要 Hooks

1. 在组件之间复用状态逻辑很难
2. 复杂组件变得难以理解
3. 难以理解的 class

### 3. 你知道哪些 hook，简单介绍一下

1. useState

    创建一个变量，以及修改这个变量的方法，当变量发生变化时会触发组件更新。

    需要注意的点：

    1. 如果传入的初始值是一个函数，这个函数只会在组件初始化时，调用一次，然后存储函数返回值作为初始值，但如果传入的是一个函数调用，这个函数会在组件每次渲染都被调用。

    ```tsx
    const getState = () => 1;
    const [stateA, setStateA] = React.useState(getState); // 只会调用一次 getState
    const [stateB, setStateB] = React.useState(getState()); // 每次重新渲染都会调用 getState
    ```

    2. setState 并不会立即修改 state

    ```tsx
    const [count, setCount] = React.useState(1);

    <button
      onClick={() => {
        setCount(count + 1);
        setCount(count + 1);
        setCount(count + 1);
      }}
    >
      +3
    </button>
    ```

    这样并不会让 `count + 3`，需要改为：

    ```tsx
    <button
      onClick={() => {
        setCount(prev => prev + 1);
        setCount(prev => prev + 1);
        setCount(prev => prev + 1);
      }}
    >
      +3
    </button>
    ```

    3. 如果 state 是引用类型的值，更新的时候需要替换而不是修改

    ```tsx
    const [formData, setFormData] = React.useState({ name: 'Allen', age: 1 });

    setFormData({ ...formData, age: 2 });
    ```

2. useEffect

    