---
title: 一. Three.js 简介
author: Caisr
description: 了解 Three.js 的基础信息
createdAt: 2023-10-23T06:23:00.000Z
updatedAt: 2023-12-29T07:09:00.000Z
tags: [Three.js]
demo: /playground/threejs/basic-information
---

### # 0.1 Hello Three.js

Three.js 是一个 3D 图形库，不要把它和 WebGL 搞混了，Three.js 和 WebGL 的区别有：

- Three.js 是一个 3D 图形库，WebGL 是一种 3D 图形 API。

- Three.js 是在建立在 WebGL 上的 3D 图形库，相当于是对 WebGL 的一个更高级的封装，简化了 3D 图形编程。

- WebGL 是一种基于 JavaScript 的 Web 图形 API，可以不依赖任何第三方库，直接与浏览器的图形硬件交互。

### # 0.2 环境准备

```bash
# node 版本
node -v
v20.11.0

# npm 版本
npm -v
10.2.4

# yarn 版本
yarn -v
1.22.19

# pnpm 版本
pnpm -v
8.6.2

# 安装 Three.js
yarn add three
0.161.0
```

### # 0.3 场景

在 Three.js 中场景就像是一个容器，用于放置 3D 物体、相机、光源和其他元素。

```javascript
import * as THREE from "three";

const scene = new THREE.Scene();
```

想要展示一个最简单的场景，则需要以下几个条件：

1. 3D物体
2. 相机
3. 渲染器

### # 0.4 渲染一个简单的场景

首先在场景添加 3D 物体，3D 物体有两个必要的条件：

- 材质
- 几何形状

```javascript
// 几何形状
const geometry = new THREE.BoxGeometry(1, 1, 1);
// 材质
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// 材质 + 物体组成物体
const mesh = new THREE.Mesh(geometry, material);

// 添加至场景
scene.add(mesh);
```

将物体添加至场景后，还需要添加一个相机才可以看到物体。

注意: **如果物体的材质受光线影响还需要在场景中添加光源才可以看到物体**。

```javascript
// 渲染的尺寸
const sizes = {
  width: 800,
  height: 600,
};

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  2000,
);

scene.add(camera);
```

在 Three.js 中有 5 种相机类型，分别是：

- [ArrayCamera](https://threejs.org/docs/index.html?q=camera#api/en/cameras/ArrayCamera)
- [CubeCamera](https://threejs.org/docs/index.html?q=camera#api/en/cameras/CubeCamera)
- [OrthographicCamera](https://threejs.org/docs/index.html?q=camera#api/en/cameras/OrthographicCamera)
- [PerspectiveCamera](https://threejs.org/docs/index.html?q=camera#api/en/cameras/PerspectiveCamera)
- [StereoCamera](https://threejs.org/docs/index.html?q=camera#api/en/cameras/StereoCamera)

例子中使用 PerspectiveCamera 类型的相机，这种叫**透视相机**，它最大的特点就是看到的物体符合近大远小的规律，就像是人类的眼睛一样。

PerspectiveCamera 相机有四个参数，分别是：

- `fov` — 相机*垂直*方向的视场角度，也就是相机在垂直方向上能够看到的景象范围，默认：`50`。
- `aspect` — 宽高比是渲染画面的比例，如果渲染区域是正方形的，宽高比就是 1，默认：`1`。
- `near` — 近平面是相机能够看到的最近的距离。任何离相机比这个距离更近的物体都将被剪裁掉，不会显示在渲染的画面中，默认：`0.1`。
- `far` — 远平面是相机能够看到的最远的距离，任何离相机比这个距离更远的物体也将被剪裁掉，不会显示在渲染的画面中，默认：`2000`。

将相机添加到场景中之后，还需要调整一下相机的位置，因为物体和相机被添加至场景中后，默认的位置在场景的中心，这会导致相机和物体重叠了，而物体是有长宽高属性的立体物体，所以相机其实是在物体的内部，这样会导致相机看不到任何物体。

需要将相机的位置这样修改：

```javascript
camera.position.z = 3;
```

这么修改的原因是在 Three.js 中坐标系为右手坐标系：

- X轴正方向指向右方
- Y轴正方向指向上方
- Z轴正方向指向屏幕外（可以理解为指向用户面向屏幕的眼睛）

```javascript
camera.position.z = 3;
```

这句代码其实就是将相机朝屏幕外的方向移动3个单位，如果是负值，相机移动的方向就是屏幕内部，这样会导致物体在相机的后方，这样也是看不到物体的。

最后需要一个渲染器将场景渲染到页面中，渲染需要用到`<canvas>`元素。

```javascript
const canvas = document.createElement("canvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

document.body.appendChild(canvas);
```
