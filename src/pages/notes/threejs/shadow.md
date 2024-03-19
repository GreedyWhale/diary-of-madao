---
layout: ../../../layouts/Markdown.astro
title: 九. 阴影
author: Caisr
description: 阴影是增强场景逼真度的重要因素，记录一下如何在 Three.js 中开启阴影功能。
createdAt: 2024-01-15T02:14:00.000Z
updatedAt: 2024-01-16T02:33:00.000Z
tags: [Three.js, Shadow]
demo: /playground/threejs/shadow?step=5
---

### # 0.1 开启阴影

使用 Three.js 开启阴影功能，需要三个条件：

1. 支持阴影的光源：
   - PointLight
   - DirectionalLight
   - SpotLight
2. 支持阴影的物体，最少的情况下需要有两个物体，一个是能产生阴影的物体，另一个则是可以接收阴影的物体。
3. 支持阴影的渲染器

在 Three.js 中进行一次渲染，会对所有支持阴影的光源进行一次渲染，渲染的结果是模拟光源看到的场景，就像把光源看作是相机一样。

在模拟光源所看见的场景进行渲染的时候，Three.js 会将物体的材质都替换成 `MeshDepthMaterial`，这种材质离光源越近颜色就越浅，越远颜色就越深，通常用来渲染深度相关的效果，阴影也属于这种效果。

最终模拟光源看见的渲染结果会作为纹理储存起来，这种纹理叫做*shadow maps(阴影贴图)*。

```javascript
// 1. 将渲染器的 shadowMap 功能打开
renderer.shadowMap.enabled = true;

// 2. 决定哪些物体产生阴影，哪些物体接收阴影
// 这里的场景是一个平面 + 一个球体，平面可以看作是地面接收阴影，球体则产生阴影
plane.receiveShadow = true;
sphere.castShadow = true;

// 3. 选择能支持阴影的光源，这里使用平行光来产生阴影
directionalLight.castShadow = true;
```

[👉点击查看效果](/playground/threejs/shadow?step=1)

在例子中可以看见阴影的效果其实并不好，非常的模糊，需要优化。

### # 0.2 优化阴影

优化阴影的手段有：

1. 优化阴影贴图尺寸
2. 对阴影相机进行优化
3. 优化阴影细节
4. 修改阴影贴图算法
5. 烘焙阴影纹理

#### ## 0.2.1 优化阴影贴图尺寸

默认的阴影贴图尺寸是 `512 * 512` 的，这个值越大阴影质量越好，代价这是计算时间会变长，这个值必须是 2 的幂值，但是不必相等（512 \* 1024 也可以）。

```javascript
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
```

[👉点击查看效果](/playground/threejs/shadow?step=2)

#### ## 0.2.2 对阴影相机进行优化

在支持阴影的光源处是有一个相机存在的，甚至可以通过`helper`让这个相机显示出来，例子中的光源是 `directionalLight`，它的相机类型是**正交相机**。

```javascript
console.log(directionalLight.shadow.camera.type); // OrthographicCamera

const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(helper);
```

相机的优化是修改相机的近平面和远平面以及相机的视野范围，将这些值修改的小一点会提高阴影的清晰度，因为这个相机专门用于渲染阴影，所以在例子中只需要将相机的视野范围缩小到和产生阴影物体的尺寸大小相近的范围即可，但是要注意较小的值可能会导致物体或者远处的物体失去阴影。

[👉点击查看效果](/playground/threejs/shadow?step=3)

#### ## 0.2.3 优化阴影细节

经过上面的两项优化，阴影的效果已经非常清晰了，但现实世界中的阴影边缘没有这么清晰，为了让阴影效果更加逼真，可以给阴影加上一个模糊：

```javascript
directionalLight.shadow.radius = 10;
```

[👉点击查看效果](/playground/threejs/shadow?step=4)

#### ## 0.2.4 修改阴影贴图算法

Three.js 中阴影算法有四种：

- THREE.BasicShadowMap: 性能最好，阴影质量最低
- THREE.PCFShadowMap: 性能稍差，使用了 Percentage-Closer Filtering（PCF）算法，提供更平滑的阴影。
- THREE.PCFSoftShadowMap: 和 THREE.PCFShadowMap 基本一样，但是阴影更加柔和，适用于低分辨率的阴影贴图。
- THREE.VSMShadowMap：使用 Variance Shadow Map（VSM）算法，非常柔和的阴影，但是性能开销更大。

默认使用 `THREE.PCFShadowMap`，一般需要优化的话使用 `THREE.PCFSoftShadowMap`，如果不在意性能，使用 `THREE.VSMShadowMap` 可以得到更加逼真的阴影。

另外注意一下：`THREE.PCFSoftShadowMap`不支持模糊（radius属性）

```javascript
renderer.shadowMap.type = THREE.VSMShadowMap;
```

#### ## 0.2.5 烘焙阴影纹理

和上篇笔记提到过的`bake`概念一样，烘焙阴影纹理就是将阴影的信息保存到纹理中，通过加载纹理来模拟阴影的效果，由于阴影不是 Three.js 生成，所以在性能方面会有所提升，但相应的加载资源文件的时间就会增加。

烘焙阴影有一个需要注意的点，当产生阴影的物体不是静止状态的时候，作为展示阴影纹理的物体需要做相同的运动，透明度也需要更具运动的轨迹进行变化。
