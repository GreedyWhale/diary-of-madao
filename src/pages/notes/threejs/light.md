---
layout: ../../../layouts/Markdown.astro
title: 八. 光源
author: Caisr
description: 光源是Three.js中重要的概念之一，它能够赋予场景更加生动的视觉效果，为用户提供沉浸式的体验。
createdAt: 2024-01-13T02:12:00.000Z
updatedAt: 2024-01-15T02:48:00.000Z
tags: [Three.js, Light]
demo: /playground/threejs/light?light=all
---

光源是Three.js中重要的概念之一，它能够赋予场景更加生动的视觉效果，为用户提供沉浸式的体验。

渲染光的成本很高，如果你的场景里有太多的光源，很有可能造成性能瓶颈，光源的成本高低排名如下：

- 最低成本：
  - AmbientLight
  - HemisphereLight
- 中等成本：
  - DirectionalLight
  - PointLight
- 高成本：
  - RectAreaLight
  - SpotLight

如果想避免场景中使用过多光源，可以使用一种解决方案：bake。

> bake 的意思就是将光照的效果放进纹理中，生成带有光照效果的纹理。

### # 0.1 AmbientLight

AmbientLight 表示环境光，AmbientLight 会均匀的照亮场内的所有物体，环境光不能用于投射阴影，因为它没有方向。

```javascript
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
```

`new THREE.AmbientLight` 有两个参数：

1. 颜色
2. 光的强度

[👉点击查看效果](/playground/threejs/light?light=ambientLight)

### # 0.2 DirectionalLight

DirectionalLight 是定向光或者平行光，这种光的特点是产生的光线都是平行的，常常用于模仿太阳发出的光，定向光可以用于投射阴影。

```javascript
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
```

directionalLight 的参数和 AmbientLight 的参数一样：颜色和强度。

directionalLight 有专门的 helper 用于调试：

```javascript
const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight,
  1,
);
```

[👉点击查看效果](/playground/threejs/light?light=directionalLight)

### # 0.3 HemisphereLight

HemisphereLight 是半球光，它由两个发光点组成，看它的文档就能很好的理解这个半球的意思：

> HemisphereLight( skyColor : Integer, groundColor : Integer, intensity : Float )
>
> skyColor - (optional) hexadecimal color of the sky. Default is 0xffffff.
>
> groundColor - (optional) hexadecimal color of the ground. Default is 0xffffff.
>
> intensity - (optional) numeric value of the light's strength/intensity. Default is 1.

一看这两个参数 skyColor 和 groundColor 意思明白了，两个光源一个在上一个在下，发出的光组成了这种光，这种光不能用于投射阴影。

```javascript
const hemisphereLight = new THREE.HemisphereLight("#6420AA", "#FAA300", 1);
const hemisphereLightHelper = new THREE.HemisphereLightHelper(
  hemisphereLight,
  1,
);

hemisphereLight.position.set(-2, 5, 0);
scene.add(hemisphereLight, hemisphereLightHelper);
```

[👉点击查看效果](/playground/threejs/light?light=hemisphereLight)

### # 0.4 PointLight

PointLight 是从一个点向各个方向发射的光，类似灯泡发出的光。

PointLight 相比上面的光多出两个参数：

- 距离（distance）：灯光的最大范围
- 衰减（decay）：光沿着光的距离变暗的量

```javascript
const pointLight = new THREE.PointLight("#FC6736", 10, 0, 0.1);
const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);

pointLight.position.set(0, 8, 0);

scene.add(pointLight, pointLightHelper);
```

[👉点击查看效果](/playground/threejs/light?light=pointLight)

### # 0.4 RectAreaLight

RectAreaLight是在矩形平面上均匀地发射光线，可以想象成从窗户照进来的光。

```javascript
const rectAreaLight = new THREE.RectAreaLight("#F8E559", 1, 3, 2);
rectAreaLight.position.set(2, 0, 3);
scene.add(rectAreaLight);
```

使用 rectAreaLight 有一个小技巧，就是 rectAreaLight 可以通过 `lookAt` 方法改变光指向的方向。

[👉点击查看效果](/playground/threejs/light?light=rectAreaLight)

### # 0.5 SpotLight

SpotLight 是从一个点发射的光，光沿着圆锥体的形状传播，距离光源越远圆锥体的尺寸越大。

如果想要改变 SpotLight 的指向方向，不能用 `lookAt`，需要修改 SpotLight 的 `target` 属性，并且将 `target` 添加至场景中：

```javascript
const spotLight = new THREE.SpotLight("#5FBDFF", 10, 0, Math.PI * 0.05);
const spotLightHelper = new THREE.SpotLightHelper(spotLight);

spotLight.position.y = 10;
spotLight.target.position.set(0, 0, 0);
spotLightHelper.update();
scene.add(spotLight, spotLightHelper, spotLight.target);
```

修改完 `target` 属性记得更新一下 helper，不然 helper 的指向是错误的。

SpotLight 有这些参数：

- `color`：光源的颜色，采用十六进制表示，默认为白色 (`0xffffff`)。
- `intensity`：光源的强度，是一个数值，默认为1。这影响了光源的亮度。
- `distance`：光源的最大范围，如果为0，则表示没有限制，默认为0。
- `angle`：光锥的最大散射角度，以弧度表示，上限是 `Math.PI/2`。这个值决定了光锥的扩散程度，默认是没有限制的。
- `penumbra`：因 penumbra 引起的聚光锥内衰减的百分比。取值范围在0到1之间，默认为0。
- `decay`：光源沿着距离衰减的程度，是一个数值。它控制了光线在传播过程中的衰减，默认为1。当设置为2时，光线的强度将以距离的平方进行衰减。

其中`angle`指的就是圆锥的角度，越大圆锥的尺寸就远大，`penumbra` 指的是光投射到平面上圆（圆锥的底面）的边缘模糊还是清晰，这个值越低圆的边缘越模糊。

[👉点击查看效果](/playground/threejs/light?light=spotLight)
