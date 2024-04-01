---
layout: ../../../layouts/Markdown.astro
title: 十一. 粒子
author: Caisr
description: 粒子是Three.js中的几何形状之一，它们是场景中的小点由两个三角形的平面组成，可以根据一定规则在三维空间中运动、旋转或发射。粒子可用于模拟各种效果，如火焰、烟雾、雨滴等，为场景增添生动感和真实感。
createdAt: 2024-03-29T06:47:48.539Z
updatedAt: 2024-04-01T08:07:56.758Z
tags: [Three.js, Particles]
demo: /playground/threejs/particles
---

### # 0.0 资源链接

- 免费的粒子纹理 - [kenney](https://www.kenney.nl/assets/particle-pack)

### # 0.1 Particles

Three.js 中可以通过这种方式创建一个由粒子组成的物体：

```typescript
const geometry = new THREE.SphereGeometry(1);
const material = new THREE.PointsMaterial({
  size: 0.01,
  sizeAttenuation: true,
});

const points = new THREE.Points(geometry, material);
```

需要用到 `PointsMaterial` 和一个几何形状组成 `Points` 物体。

粒子中 `PointsMaterial` 的参数含义是：

- size：粒子的尺寸
- sizeAttenuation：让粒子在透视相机下符合近大远小的规则

[👉点击查看效果](/playground/threejs/particles?step=sphereWithParticles)

### # 0.2 自定义几何形状

除了用 Three.js 中内置的几何形状外，粒子效果也可以用于自定义几何形状：

```typescript
const createCustomGeometryWithParticles = () => {
  const verticesLength = 1500;
  // 每个顶点有(x, y, z) 三个坐标，所以这里需要乘以三
  const vertices = new Float32Array(verticesLength * 3).map(
    () => (Math.random() - 0.5) * 10,
  );

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.02,
      sizeAttenuation: true,
    }),
  );

  scene.add(points);
};
```

[👉点击查看效果](/playground/threejs/particles?step=customParticles)

例子中效果就有点像星空了，如果将视线拉远，能发现这些粒子组成的物体外形接近一个立方体。

### # 0.3 纹理

粒子也能使用纹理，为了让上面的效果更接近星空，可以添加星星的纹理。

免费的纹理可以通过下面网站获得。

- [kenney](https://www.kenney.nl/assets/particle-pack)

```typescript
import starTexturePath from "/static/textures/particles/star_07.png?url";

const textureLoader = new THREE.TextureLoader();

const alphaTexture = textureLoader.load(starTexturePath);

const material = new THREE.PointsMaterial({
  size: 0.05,
  sizeAttenuation: true,
  alphaMap: alphaTexture,
  color: new THREE.Color("#FAEF5D"),
  transparent: true,
});
```

[👉点击查看效果](/playground/threejs/particles?step=texture)

虽然使用了透明纹理，但是将粒子方法观察还是能观察到粒子有一个黑色的背景，这个背景会挡住后面的粒子，
有3种方法可以解决这个问题。

#### ## 0.3.1 alphaTest

> `.alphaTest` 是一个用于执行 alpha 测试的属性。Alpha 测试是一种在渲染过程中确定哪些像素应该被渲染的技术。具体来说，`.alphaTest` 属性允许你设置一个阈值，如果材质的透明度低于这个阈值，相关的像素就不会被渲染，从而实现一种类似于“裁剪”的效果。

简单来说这个属性就是规定透明度低于多少就不渲染的属性，所以给这个属性一个较小的值，接可以解决粒子携带黑色背景的问题：

```typescript
const material = new THREE.PointsMaterial({
  size: 0.05,
  sizeAttenuation: true,
  alphaMap: alphaTexture,
  color: new THREE.Color("#FAEF5D"),
  transparent: true,
  alphaTest: 0.01,
});
```

[👉点击查看效果](/playground/threejs/particles?step=alphaTest)

#### ## 0.3.2 depthTest

`.depthTest` 属性用于控制在渲染材质时是否启用深度测试。深度测试是一种在渲染过程中决定哪些像素应该被绘制的技术，它基于像素在场景中的深度信息。

当这个属性设置成`false`后，在深度层面被遮挡的粒子也会进行渲染，所以就不会存在被遮挡的粒子了，但是这样会导致其他问题，比如当场景中存在其他物体的时候，这个物体也不能遮挡住粒子，导致可以看到这个物体背后的粒子。

```typescript
const material = new THREE.PointsMaterial({
  size: 0.05,
  sizeAttenuation: true,
  alphaMap: alphaTexture,
  color: new THREE.Color("#FAEF5D"),
  transparent: true,
  depthTest: false,
});
```

[👉点击查看效果](/playground/threejs/particles?step=depthTest)

#### ## 0.3.3 depthWrite

> `.depthWrite` 属性用于控制是否在渲染过程中写入深度缓冲区。深度缓冲区是用于存储像素的深度信息的图像缓冲区。

当depthWrite设置为false时，渲染的像素不会更新深度缓冲区。这意味着当前像素的深度值不会影响后续像素的深度测试结果，即当前像素会被后续像素覆盖。

[👉点击查看效果](/playground/threejs/particles?step=depthWrite)

如果设置了 `.depthWrite` 为 false, 可以加上这个属性：`blending: THREE.AdditiveBlending`，这个属性会让渲染的像素颜色会与背景颜色相加产生更亮的结果。

```typescript
const material = new THREE.PointsMaterial({
  size: 0.05,
  sizeAttenuation: true,
  alphaMap: alphaTexture,
  color: new THREE.Color("#FAEF5D"),
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
```

[👉点击查看效果](/playground/threejs/particles?step=blending)

### # 0.4 给顶点设置随机颜色

这里给顶点设置随机颜色的目的是为了让粒子更加好看，如果是立方体那种，给顶点设置颜色可以实现不同面颜色的物体。

设置顶点颜色之前，需要将材质中的颜色去除，不然会影响顶点的颜色：

```typescript
const material = new THREE.PointsMaterial({
  size: 0.05,
  sizeAttenuation: true,
  alphaMap: alphaTexture,
  // 去掉材质的颜色
  // color: new THREE.Color("#FAEF5D"),
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
// 打开顶点颜色
material.vertexColors = true;

// 颜色由 rgb 组成，所以也是每三个一组
// 颜色的取值在 0 ~ 1 之间，具体查看 https://threejs.org/docs/index.html?q=color#api/en/math/Color
const colors = new Float32Array(verticesLength * 3).map(() => Math.random());
geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
```

[👉点击查看效果](/playground/threejs/particles?step=colors)

### # 0.5 动画

Points 继承自 Object3D，所以它可以进行位移、旋转和缩放，也就是粒子支持动画，下面实现一个波浪动画。

1. 创建粒子

   ```typescript
   const verticesLength = 5000;
   const vertices = new Float32Array(verticesLength * 3).map(() => (Math.random() - 0.5) * 10);
   let wave:


   const createWave = () => {
     const alphaTexture = textureLoader.load(starTexturePath);
     const colors = new Float32Array(verticesLength * 3).map(() => Math.random());

     const material = new THREE.PointsMaterial({
       size: 0.1,
       sizeAttenuation: true,
       alphaMap: alphaTexture,
       transparent: true,
     });
     material.vertexColors = true;

     const geometry = new THREE.BufferGeometry();
     geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
     geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

     const points = new THREE.Points(geometry, material);
     scene.add(points);
   };
   ```

2. 将粒子形成一个平面

   将每个粒子的初始 Y 轴都设置为 0，让粒子形成一个平面，在顶点的数组中，每三项表示一个粒子的坐标，也就是：

   - (i \* 3) 为 X 轴坐标
   - (i \* 3) + 1 为 Y 轴坐标
   - (i \* 3) + 2 为 Z 轴坐标

   ```typescript
   const waveAnimation = () => {
     for (let index = 0; index < verticesLength; index++) {
       const i3 = index * 3;
       wave.geometry.attributes.position.array[i3 + 1] = 0;
     }

     wave.geometry.attributes.position.needsUpdate = true;
   };

   const tick = () => {
     waveAnimation();
     control.update();
     renderer.render(scene, camera);
     requestAnimationFrame(tick);
   };
   ```

3. 让粒子动起来

   这里的动画原理根据正弦函数的曲线做的。

   ```typescript
   const clock = new THREE.Clock();

   const waveAnimation = () => {
     const getElapsedTime = clock.getElapsedTime();

     for (let index = 0; index < verticesLength; index++) {
       const i3 = index * 3;
       const x = wave.geometry.attributes.position.array[i3];
       wave.geometry.attributes.position.array[i3 + 1] = Math.sin(
         getElapsedTime + x,
       );
     }

     wave.geometry.attributes.position.needsUpdate = true;
   };
   ```

[👉点击查看效果](/playground/threejs/particles?step=animation)
