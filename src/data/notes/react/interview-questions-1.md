---
title: 'React - Fiber, Virtual DOM, Diffing Algorithm'
subtitle: 'React Fiber: Re-renders everything because one prop changed.'
author: 'Caisr'
tags: ["React"]
type: 'react'
cover: {
  image: '~/assets/images/cover/cover-2.jpg',
  source: 'Isaque Pereira',
  sourceUrl: 'https://www.pexels.com/photo/gray-feather-on-tree-stem-394376/',
}
---

### 1. 什么是 Fiber

Fiber 是 React 16 引入的新协调器，它使得更新过程变得异步且可中断。在 React 中，Fiber 是一个 JavaScript 对象，代表一个基本的工作单元，工作指的是任何需要执行的计算，例如组件的 state 和 props 更新、生命周期函数的执行或 DOM 的更新。

Fiber 的特点包括：

- 暂停工作，稍后继续处理。
- 为不同类型的工作分配优先级。
- 可以重用已完成的工作。
- 如果不再需要，可以中止工作。

Fiber 将整个更新过程分为两个阶段：`render` 和 `commit`。其中：

render 阶段：异步且可中断，负责任务的分配，识别需要更新的 Virtual DOM 部分。
commit 阶段：同步且不可中断，负责将更新同步到真实 DOM 中。

### 2. 为什么需要 Fiber

在 React 16 之前，React 使用的是同步且无法中断的更新机制。这样，浏览器中的 JavaScript 执行如果超过 16ms，用户就会感到页面卡顿（因为渲染引擎和 JavaScript 引擎是互斥的）。这导致在处理复杂或大型组件更新时，页面容易出现卡顿现象。Fiber 的引入就是为了解决这一问题，使得 React 的更新更流畅，避免界面阻塞。

### 3. Fiber 如何实现任务的中断

React 通过 MessageChannel 实现了类似 requestIdleCallback 的功能。每当 React 处理完一个 Fiber 节点后，会检查当前时间。如果剩余时间充足，继续处理下一个任务；如果时间不足，则中断当前任务，将控制权交还给浏览器，以处理其他优先级更高的事件。这种机制使得 React 的渲染过程具备了可中断性和恢复性。

### 4. 讲一下你对 Virtual DOM 的理解？

Virtual DOM（虚拟 DOM）是一种编程概念，其核心思想是在内存中维护一个轻量级的 JavaScript 对象，模拟真实 DOM 的结构，从而减少直接操作真实 DOM 的次数，提升渲染效率。

通过使用 Virtual DOM，开发者可以专注于数据和业务逻辑，而无需关心 DOM 操作的细节，从而提高开发效率。

此外，Virtual DOM 提供了更好的跨平台能力。由于 Virtual DOM 是对渲染内容的抽象描述，不依赖于特定平台，只要实现了相应的渲染器，不同平台即可使用 Virtual DOM，例如 React Native。

### 5. Diff 算法是什么

Diff 算法用于计算将一棵树转换成另一棵树所需的最小操作数。React 并没有采用现有的最先进算法，因为这些算法的时间复杂度通常是 O(n³)，对于 React 来说，效率无法接受。因此，React 基于以下两个假设，采用了启发式算法，将时间复杂度优化为 O(n)：

- 不同类型的元素会生成不同的树：React 会通过元素类型的变化来判断是否需要重新渲染整个子树。
- 开发者可以通过 key 属性来提示哪些子元素在不同渲染之间可能保持不变：key 属性帮助 React 识别哪些元素可以复用，从而避免不必要的重新渲染，提升性能。

另外不要用数组的下标作为 `key`，如果 `key` 也是动态变化的，那么 `key` 和对应元素的关系就会不可控，比如:

```javascript
const oldList = ['a', 'b', 'c'];
// 对应关系为
// 0 -> a
// 1 -> b
// 2 -> c

const newList = ['d', 'a', 'b', 'c'];
// 对应关系为
// 0 -> b
// 1 -> a
// 2 -> b
// 3 -> c
```

这样在对比的时候就会发现整个列表都需要更新，因为：

- `key = 0` 的元素从 `a` 变成 `d`
- `key = 1` 的元素从 `b` 变成 `a`
- ...

动态 `key` 除了无法提升性能，还有可能造成组件状态错乱，所以 `key` 应该稳定可预测且唯一。