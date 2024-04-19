---
layout: ../../../layouts/Markdown.astro
title: 五. 调试 UI
author: Caisr
description: 使用 lil-gui 进行调试
createdAt: 2024-01-05T08:06:00.000Z
updatedAt: 2024-01-05T08:06:00.000Z
tags: [Three.js, GUI, Debug]
---

### # 0.1 GUI

由于场景內的物体都是通过`canvas`元素画出来的，不能通过前端常用的调试手段（开发者控制台）进行调试场景內的物体，所以要借助一些第三方工具进行调试，这里推荐这个工具：[lil-gui](https://lil-gui.georgealways.com/#)

这个工具调试的原理就是修改对象的属性，然后通过 `requestAnimationFrame` 不断重新渲染场景实现的。

比如我想要修改一下物体的位置，就可以这么写：

```javascript
import GUI from "lil-gui";

const gui = new GUI();

gui.add(mesh.position, "y").max(5).min(-5).step(0.01).name("物体的 Y 轴位移");
```

解释一下代码：

- add函数接受一个对象和这个对象中的属性，后续的操作就是对这个属性进行修改
- max表示最大值
- min表示最小值
- step表示每次修改的幅度
- name会显示在操作面板上

例子中的代码会在页面中展示一个可以左右拖动的控件和输入框让开发者使用。

除了例子中，GUI会根据属性的数据类型展示不同的控件，如果属性值是一个布尔值，那么就会展示一个选框，如果是一个函数，就会展示一个按钮。

还会遇到一种情况，就是当物体对象中没有对应的属性的时候，可以这样处理：

```javascript
const attributes = {
  spin: () => {
    gsap.to(mesh.rotation, {
      y: Math.PI * 2 + mesh.rotation.y,
      duration: 5,
      ease: Linear.easeNone,
    });
  },
};

gui.add(attributes, "spin").name("让物体围绕 Y 轴旋转一周");
```

### # 0.2 Color

颜色需要使用`addColor`特殊处理：

```javascript
const attributes = {
  color: "#F99417",
};

gui
  .addColor(attributes, "color")
  .name("修改物体颜色")
  .onChange(() => {
    mesh.material.color.set(attributes.color);
  });
```

### # 0.3 Group

当需要调试的属性特别多的时候，可以对属性进行分组：

```javascript
const positionGroup = gui.addFolder("Position");

positionGroup.add(mesh.position, "x");
positionGroup.add(mesh.position, "y");
positionGroup.add(mesh.position, "z");
```
