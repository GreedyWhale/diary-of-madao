---
layout: ../../../layouts/Markdown.astro
title: 十二. 星系
author: Caisr
description: 实现一个粒子组成的星系效果
createdAt: 2024-04-19T07:00:49.315Z
updatedAt: 2024-04-19T07:00:49.315Z
tags: [Three.js, Galaxy, Particles]
demo: /playground/threejs/galaxy
---

这次来实现一个粒子组成的星空效果，这个场景难点我认为也在于基础的数学应用，因为这个场景需要用到旋转，这是我的弱项:-(

[👉最终效果](/playground/threejs/galaxy)

### # 0.1 用粒子组成一条线

实现星系的第一步是让粒子组成一条线，让粒子组成线的关键点在于粒子的坐标：

- x轴为随机的值
- y轴坐标为0
- z轴坐标为0

这样设置可以保证粒子都是在x轴上进行分布的，从而形成一条线。

```javascript
const config = {
  count: 500,
  radius: 10,
};

const geometry = new THREE.BufferGeometry();
const material = new THREE.PointsMaterial({
  size: 0.01,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true,
});
const galaxy = new THREE.Points(geometry, material);

const position = new Float32Array(config.count * 3);

for (let index = 0; index < config.count; index++) {
  // 一个粒子3个坐标
  const i3 = index * 3;

  position[i3] = Math.random() * config.radius;
  position[i3 + 1] = 0;
  position[i3 + 2] = 0;
}

galaxy.geometry.setAttribute(
  "position",
  new THREE.BufferAttribute(position, 3),
);
scene.add(galaxy);
```

### # 0.2 分支

星系是由多条线进行旋转组成的，所以要将现在的一条线变成多条，因为现在的线是由粒子组成的，所以首先第一点是确定当前的粒子属于哪一条线。

确定当前的粒子属于哪一条线用余数可以很方便的获得：

```javascript
// 假如现在有3条分支

0 % 3; // 0
1 % 3; // 1
2 % 3; // 2
3 % 3; // 0
```

```javascript
const config = {
  count: 500,
  radius: 5,
  branches: 3,
};

const position = new Float32Array(config.count * 3);

for (let index = 0; index < config.count; index++) {
  // 一个粒子3个坐标
  const i3 = index * 3;
  // 当前的粒子所在的分支
  const currentBranch = index % config.branches;

  position[i3] = Math.random() * config.radius;
  position[i3 + 1] = 0;
  position[i3 + 2] = 0;
}
```

确定好分支之后就需要对粒子进行偏移，这里的算法也很简单，还是以三个分支举例：

- 第一个分支不需要偏移
- 第二个分支需要偏移120度
- 第三个分支需要偏移240度

用代码描述就是：

```javascript
// 当前分支 / 总分支 * 360度
(currentBranch / totalBranches) * (Math.PI * 2);
```

需要偏移的坐标轴是X轴和Z轴，理由是根据单位圆的概念和需要组成圆的平面是水平面，在单位圆中：

```
cos(t) = x
sin(t) = y
```

水平面则是由X轴和Z轴组成，那么将坐标轴进行替换（z轴看成y轴）

```javascript
// X轴
const radius = Math.random() * config.radius;

position[i3] = Math.cos(branchAngle) * radius;
// Y轴
position[i3 + 1] = 0;
// Z轴
position[i3 + 2] = Math.sin(branchAngle) * radius;
```

来解释一下为什么需要乘以`radius`。

一个点在平面上的位置可以通过直角坐标系 (x, y) 表示，但在处理圆周运动时，使用极坐标系会更直观。极坐标系由一个角度和一个半径来定义一个点的位置：

半径 (r): 点到圆心的距离。
角度 (θ): 从圆心到点的射线与x轴正方向之间的夹角。

在代码中的 `Math.cos(branchAngle)` 和 `Math.sin(branchAngle)` 得出的两个坐标，只是表示一个单位圆上的点的位置，不同的点对应的半径是不同的：`const radius = Math.random() * config.radius;`，那么通过很简单的一次代入，当半径为1的时候点的坐标为`Math.cos(branchAngle)` 和 `Math.sin(branchAngle)`，当半径为`const radius = Math.random() * config.radius;`的时候，坐标就是：`Math.cos(branchAngle) * radius` 和 `Math.sin(branchAngle) * radius`。

### # 0.3 旋转

当分支创建好后，就要对这些分支进行旋转，让它们形成一个螺旋状，螺旋的特点是离中心越远，旋转的角度越大。

```javascript
const config = {
  count: 1500,
  radius: 5,
  branches: 3,
  spin: 1,
};

const spinAngle = radius * config.spin;

// X轴
position[i3] = Math.cos(branchAngle + spinAngle) * radius;
// Y轴
position[i3 + 1] = 0;
// Z轴
position[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius;
```

这里的代码没什么难点，就是先根据半径确定一个值，这个值的特点就是半径越大它越大，可以用 `radius * config.spin;` 也可以用 `radius + config.spin;`，然后把这个值放进需要旋转的轴线里。

### # 0.4 扩散

现在点都是聚集在一条线上的
