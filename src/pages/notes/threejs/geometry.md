---
layout: ../../../layouts/Markdown.astro
title: 四. 几何形状
author: Caisr
description: 3D物体的重要组成部分 -- 几何形状
createdAt: 2024-01-05T02:51:00.000Z
updatedAt: 2024-01-08T08:21:00.000Z
tags: [Three.js, Geometry]
demo: /playground/threejs/geometry
---

### # 0.1 Geometry

在 Three.js 中物体的形状是由一些顶点组成的，这些顶点中会有空间坐标的信息，将这些顶点连起来形成面，这些面就组成了几何形状。

在 Three.js 中组成几何形状的面都是由*三角形*组成的，可以通过这种写法来看到组成面的三角形：

```javascript
const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ wireframe: true }),
);
```

BoxGeometry 函数除了前三个参数：width、height、depth之外，还有三个参数：

- widthSegments
- heightSegments
- depthSegments

这三个参数就是用来控制平面上三角形的数量的，默认为：1。

[👉点击查看](/playground/threejs/geometry)

越多的三角形意味着有越多的顶点，可以对这些顶点进行一些操作从而实现复杂的几何图形，比如：山脉。

所以三角形越多意味着有更多的细节。

这个在立方体上看不出来，但是在圆形的几何形状中就很明显，三角形越多圆越光滑。

### # 0.2 自定义几何形状

几何形状是由一堆顶点组成的，所以自定义几何形状的重点就在于对这些顶点的定义，一个顶点有三个坐标(x, y, z)，假如自定义一个三角形的形状就需要3个顶点9个坐标。

```javascript
// 定义顶点坐标
const positionsArray = new Float32Array([0, 0, 0, 0, 1, 0, 1, 0, 0]);

// 将这些坐标变为 Three.js 可以接受的数据格式
const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);

// 创建一个BufferGeometry
const geometry = new THREE.BufferGeometry();

// 将顶点的位置信息填充到 BufferGeometry 中
geometry.setAttribute("position", positionsAttribute);

// 结合材质组成一个三角形
const triangle = new THREE.Mesh(
  geometry,
  new THREE.MeshBasicMaterial({
    color: "#F99417",
    wireframe: true,
  }),
);
```

[点击查看](/playground/threejs/geometry)

### # 0.3 使用简单的三角形组合出复杂的视觉效果

```javascript
const geometry = new THREE.BufferGeometry();

const triangleCounts = 300;

// 每个三角形有3个顶点，每个顶点有三个坐标，所以是乘以9
const positionsArray = new Float32Array(triangleCounts * 9);

for (let index = 0; index < triangleCounts * 9; index++) {
  positionsArray[index] = Math.random();
}

const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);

geometry.setAttribute("position", positionsAttribute);

const triangles = new THREE.Mesh(
  geometry,
  new THREE.MeshBasicMaterial({
    color: "#F99417",
    wireframe: true,
  }),
);
```

[效果](/playground/threejs/geometry)
