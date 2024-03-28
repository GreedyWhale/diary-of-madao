---
layout: ../../../layouts/Markdown.astro
title: 十. 鬼屋
author: Caisr
description: 利用目前所学到的知识，实现一个鬼屋的场景
createdAt: 2024-01-17T09:36:22.000Z
updatedAt: 2024-03-28T08:53:43.178Z
tags: [Three.js, Haunted House]
demo: /playground/threejs/hauntedHouse
---

今天利用目前学到的知识，实现一个鬼屋的效果：

[👉点击查看效果](/playground/threejs/hauntedHouse)

首先分析一下组成场景的物体都有哪些：

1. 地面
2. 鬼屋
3. 鬼屋外的环境（草地、墓碑这些）

这些只是大致的划分，细分的话鬼屋是由更小的物体组成的，比如房子、墙壁、窗户、门等等。

接下来就一步一步的实现整个场景。

### # 0.0 纹理资源：

- 草地：[Ground 037](https://ambientcg.com/view?id=Ground037)
- 墙壁：[Bricks060](https://ambientcg.com/view?id=Bricks060)
- 屋顶：[Roofing Tiles 011 B](https://ambientcg.com/view?id=RoofingTiles011B)
- 门：[door wood 001](https://3dtextures.me/2019/04/16/door-wood-001/)
- 窗户：[window 001](https://3dtextures.me/2020/11/13/window-001/)
- 玻璃：[glass frosted 001](https://3dtextures.me/2020/08/27/glass-frosted-001/)
- 门口的石头平面：[Rock028](https://ambientcg.com/view?id=Rock028)
- 围墙：[stone wall 005](https://3dtextures.me/2018/01/22/stone-wall-005/)

### # 0.1 搭建基础场景

#### ## 0.1.1 初始化相机、场景、渲染器

```javascript
import * as THREE from "three";

const root = document.querySelector(".app");
const canvas = document.createElement("canvas");
root.appendChild(canvas);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// 初始化相机
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 20;
camera.position.y = 20;

// 初始化场景
const scene = new THREE.Scene();
scene.add(camera);

// 初始化渲染器

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.shadowMap.enabled = true;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.render(scene, camera);
```

#### ## 0.1.2 开启沉浸模式并添加 `Controls`

```javascript
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// 初始化 controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.update();

const bindListeners = () => {
  window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // 更新相机;
    if (camera) {
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix(); // 修改完相机参数后需要更新一下相机的投影矩阵
    }

    // 更新渲染器
    if (renderer) {
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.render(scene, camera);
    }
  });

  window.addEventListener("dblclick", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      canvas.requestFullscreen();
    }
  });
};

const tick = () => {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};

tick();
bindListeners();
```

这里指贴出了js代码，要想获得更好的沉浸体验，还需要修改css，具体代码参考：[沉浸式体验](/notes/threejs/immersion) 这篇笔记。

### # 0.2 创建地面

地面采用 Three.js 内置的 `PlaneGeometry` 实现，默认情况下 `PlaneGeometry` 放进场景中是整个面朝向用户的，所以还要进行旋转让面朝上，再添加上草地的纹理，这样地面就完成了。

```javascript
import grassColorTexturePath from "/static/textures/hauntedHouse/grass/Ground037_1K-JPG_Color.jpg?url";
import grassAmbientOcclusionTexturePath from "/static/textures/hauntedHouse/grass/Ground037_1K-JPG_AmbientOcclusion.jpg?url";
import grassRoughnessTexturePath from "/static/textures/hauntedHouse/grass/Ground037_1K-JPG_Roughness.jpg?url";
import grassNormalTexturePath from "/static/textures/hauntedHouse/grass/Ground037_1K-JPG_NormalGL.jpg?url";
import grassDisplacementTexturePath from "/static/textures/hauntedHouse/grass/Ground037_1K-JPG_Displacement.jpg?url";

const initFloor = () => {
  const colorTexture = textureLoader.load(grassColorTexturePath);
  const ambientOcclusionTexture = textureLoader.load(
    grassAmbientOcclusionTexturePath,
  );
  const roughnessTexture = textureLoader.load(grassRoughnessTexturePath);
  const normalTexture = textureLoader.load(grassNormalTexturePath);
  const displacementTexture = textureLoader.load(grassDisplacementTexturePath);

  [
    colorTexture,
    ambientOcclusionTexture,
    roughnessTexture,
    normalTexture,
    displacementTexture,
  ].forEach((texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
  });

  const geometry = new THREE.PlaneGeometry(
    40,
    40
    256,
    256,
  );
  const material = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    map: colorTexture,
    aoMap: ambientOcclusionTexture,
    roughnessMap: roughnessTexture,
    normalMap: normalTexture,
    displacementMap: displacementTexture,
  });

  geometry.setAttribute(
    "uv2",
    new THREE.BufferAttribute(geometry.attributes.uv.array, 2),
  );

  const plane = new THREE.Mesh(geometry, material);

  plane.rotateX(-Math.PI / 2);
  plane.position.y = -0.55;
  scene.add(plane);
};
```

例子中的代码有一个需要说明的地方：`plane.position.y = -0.55;`，加这句代码的原因是当应用了位移纹理之后，地面有了高度的视觉效果，但是物理高度并没有发生改变，如果不进行向下位移，放置在地面上的物体就会出现穿过地面的情况。

不确定这种问题是不是这样解决的，我尝试搜索这类问题的解决方法，但是没有找到更好的解决方法。

[👉点击查看效果](/playground/threejs/hauntedHouse?step=floor)

### # 0.3 创建鬼屋

鬼屋是由多个物体组合而成的，我将它分为：

- 墙壁
- 门
- 窗户
- 屋顶
- 其他细节（门口的灯之类的物体）

这些组成鬼屋的物体可以划分成一个组方便管理：

```javascript
const houseGroup = new THREE.Group();
```

#### ## 0.3.1 创建墙壁

我一开始打算使用 `BoxGeometry` 实现墙壁，但是遇到了一个问题：

当使用位移贴图的时候出现了物体的顶点被推开的情况（立方体的每个面之间存在间隙），具体的情况可以参考：[Displacement map causing gaps on edges of the box](https://discourse.threejs.org/t/displacement-map-causing-gaps-on-edges-of-the-box/59977)

后来我尝试使用 `ExtrudeGeometry` 自己画一些形状，然后应用位移纹理，仍然会出现这种问题，所以只能放弃使用位移纹理。

不过最终我还是选择使用 `ExtrudeGeometry` 去实现墙壁，因为我在后面实现屋顶的时候遇到了无法避免的纹理被拉伸的情况，所以干脆全部使用`ExtrudeGeometry`自己画出来。

房屋的墙壁由四面墙组成，其中：

- 前后两边墙壁相同，由矩形组成
- 左右两边的墙壁相同，由矩形 + 三角形组成

[👉点击查看效果](/playground/threejs/hauntedHouse?step=walls)

`ExtrudeGeometry` 可以通过路径来实现几何形状，路径可以理解为用画笔画的形状所经过的路径。

绘制路径的关键点在于计算出几何形状顶点的坐标，比如我想画一个长5，宽4的矩形，需要有四个顶点，假如从(0, 0) 开始，这些顶点的坐标分别是：

- (0, 0)
- (0, 4)
- (5, 4)
- (5, 0)

坐标的组成是(x, y)，用代码写出来是：

```javascript
const rectangle = new THREE.Shape()
  .moveTo(0, 0)
  .lineTo(0, 4)
  .lineTo(5, 4)
  .lineTo(5, 0)
  .lineTo(0, 0);
```

掌握了这点就能画一些简单的形状，也就能实现墙壁了。

```javascript
import wallsColorTexturePath from "/static/textures/hauntedHouse/walls/Bricks060_1K-JPG_Color.jpg?url";
import wallsAmbientOcclusionTexturePath from "/static/textures/hauntedHouse/walls/Bricks060_1K-JPG_AmbientOcclusion.jpg?url";
import wallsRoughnessTexturePath from "/static/textures/hauntedHouse/walls/Bricks060_1K-JPG_Roughness.jpg?url";
import wallsNormalTexturePath from "/static/textures/hauntedHouse/walls/Bricks060_1K-JPG_NormalGL.jpg?url";

const createWalls = () => {
  const createMesh = (shape: THREE.Shape) =>
    new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.1,
        bevelEnabled: false,
      }),
      new THREE.MeshStandardMaterial({
        map: wallsColorTexture,
        aoMap: wallsAmbientOcclusionTexture,
        roughnessMap: wallsRoughnessTexture,
        normalMap: wallsNormalTexture,
      })
    );

  const wallsColorTexture = textureLoader.load(wallsColorTexturePath);
  const wallsAmbientOcclusionTexture = textureLoader.load(
    wallsAmbientOcclusionTexturePath
  );
  const wallsRoughnessTexture = textureLoader.load(wallsRoughnessTexturePath);
  const wallsNormalTexture = textureLoader.load(wallsNormalTexturePath);
  [
    wallsColorTexture,
    wallsAmbientOcclusionTexture,
    wallsRoughnessTexture,
    wallsNormalTexture,
  ].forEach((texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.5, 0.5);
  });

  const wallSizes = {
    front: {
      width: 10,
      height: 4,
    },
    left: {
      width: 6,
      height: 4,
      triangleHeight: 1.5,
    },
  };

  const frontWallShape = new THREE.Shape()
    .moveTo(0, 0)
    .lineTo(0, wallSizes.front.height)
    .lineTo(wallSizes.front.width, wallSizes.front.height)
    .lineTo(wallSizes.front.width, 0)
    .lineTo(0, 0);

  const leftWallShape = new THREE.Shape()
    .moveTo(0, 0)
    .lineTo(0, wallSizes.left.height)
    .lineTo(
      wallSizes.left.width * 0.5,
      wallSizes.left.height + wallSizes.left.triangleHeight
    )
    .lineTo(wallSizes.left.width, wallSizes.left.height)
    .lineTo(wallSizes.left.width, 0)
    .lineTo(0, 0);

  const frontWall = createMesh(frontWallShape);
  const backWall = createMesh(frontWallShape);
  const leftWall = createMesh(leftWallShape);
  const rightWall = createMesh(leftWallShape);

  frontWall.geometry.center();
  backWall.geometry.center();
  leftWall.geometry.center();
  rightWall.geometry.center();

  leftWall.position.set(
    (-wallSizes.front.width - 0.1) * 0.5,
    (wallSizes.left.height + wallSizes.left.triangleHeight) * 0.5,
    0
  );

  rightWall.position.set(
    (wallSizes.front.width + 0.1) * 0.5,
    (wallSizes.left.height + wallSizes.left.triangleHeight) * 0.5,
    0
  );

  leftWall.rotateY(Math.PI * 0.5);
  rightWall.rotateY(Math.PI * 0.5);

  frontWall.position.set(
    0,
    wallSizes.front.height * 0.5,
    (wallSizes.left.width - 0.1) * 0.5
  );
  backWall.position.set(
    0,
    wallSizes.front.height * 0.5,
    (-wallSizes.left.width + 0.1) * 0.5
  );

  houseGroup.add(frontWall, backWall, leftWall, rightWall);
};
```

在组合成房屋的形状的时候有可能出现 [Z-fighting](https://en.wikipedia.org/wiki/Z-fighting) 问题，为了避免这个问题，可以给偏移值多加一点。

代码中对几何形状进行了居中操作：

```javascript
frontWall.geometry.center();
backWall.geometry.center();
leftWall.geometry.center();
rightWall.geometry.center();
```

这是为了方便计算偏移的值，如果不居中的话例子中的几何形状默认是不在物体的中心的。

#### ## 0.3.2 创建屋顶

屋顶是由两个立方体组成的，用 `BoxGeometry` 或者 `ExtrudeGeometry` 实现，思路和实现墙壁的思路一样：

1. 画路径
2. 创建几何形状
3. 创建材质，并添加纹理
4. 将几何形状和材质组合成物体
5. 对物体进行偏移、旋转，让其在场景中的位置正确（这一步需要注意 Z-fighting 的问题）

代码就省略了，直接看效果。

[👉点击查看效果](/playground/threejs/hauntedHouse?step=roof)

在做屋顶物体旋转的时候，注意要根据墙面的三角形边长进行角度的计算，然后还要注意一下旋转的中心默认是不在几何形状的中心，这些都会影响旋转是否正确。

#### ## 0.3.2 创建门窗

门窗使用 `PlaneGeometry` 来实现，门之前实现过就不多说了。

窗户的实现也是和门类似，只不过我在找到的免费纹理中没有找到自带玻璃的纹理，这导致透过窗户能看到墙壁，我的解决方法是给窗户后面再添加一个平面，在这个平面上使用磨砂玻璃的纹理，这样就可以遮盖住墙面。

除了门窗之外，我还添加了一个小的围墙和门灯，不过效果不是很理想，找不到合适的纹理，也画不出想要的形状。

[👉点击查看效果](/playground/threejs/hauntedHouse?step=door)

### # 0.4 创建墓碑

墓碑的视觉效果没有什么复杂的，用最基本的立方体就能实现，难的是墓碑的分布：

1. 墓碑需要随机分布在 `40 x 40` 的地面上。
2. 墓碑不能出现在鬼屋的范围内，需要围着鬼屋进行随机分布。

这种随机分布的思路是：

1. 实现一个能生成在`40 x 40`的范围内的点的函数

```typescript
const generateRandomPoint = (radius: number) => ({
  x: (Math.random() - 0.5) * radius,
  y: (Math.random() - 0.5) * radius,
});
```

因为`40 x 40`的范围用坐标表示就是`-20`到`20`，所以需要这样计算：`(Math.random() - 0.5) * radius`。

2. 判断生成的点是否在鬼屋的区域内

```typescript
type Point = Record<"x" | "y", number>;

const isInsideArea = (point: Point, area: Record<"max" | "min", Point>) =>
  point.x >= area.min.x &&
  point.x <= area.max.x &&
  point.y >= area.min.y &&
  point.y <= area.max.y;
```

3. 保证每个点之间有一定的间距，这是为了保证墓碑不重合

要计算两个点之间的距离其实就是算三角形的斜边长度，这个在 js 中可以使用 `Math.hypot` 获得。

```typescript
const isDistanceGreaterOrEqual = (
  point1: Point,
  point2: Point,
  distance: number,
) => Math.hypot(point1.x - point2.x, point1.y - point2.y) >= distance;
```

有了这些方法就可以获得符合要求的坐标了：

```typescript
export function generatePoints(
  pointNumber: number,
  excludedArea: Record<"max" | "min", Point>,
  radius: number,
  minDistance: number,
) {
  const points: Point[] = [];

  while (points.length < pointNumber) {
    const newPoint = generateRandomPoint(radius);

    if (
      !isInsideArea(newPoint, excludedArea) &&
      points.every((point) =>
        isDistanceGreaterOrEqual(point, newPoint, minDistance),
      )
    ) {
      points.push(newPoint);
    }
  }

  return points;
}
```

**注意：上面的计算方式有个问题，就是当规定的范围内没有那么多符合要求的点时会造成无限循环，导致页面卡死。我还没想好怎么解决这个问题。**

```typescript
import graveColorTexturePath from "/static/textures/hauntedHouse/grave/Slate_Rock_001_COLOR.jpg?url";
import graveAmbientOcclusionTexturePath from "/static/textures/hauntedHouse/grave/Slate_Rock_001_OCC.jpg?url";
import graveRoughnessTexturePath from "/static/textures/hauntedHouse/grave/Slate_Rock_001_ROUGH.jpg?url";
import graveNormalTexturePath from "/static/textures/hauntedHouse/grave/Slate_Rock_001_NORM.jpg?url";

const initGraves = () => {
  if (!isGreaterOrEqual(currentStep, steps.graves)) {
    return;
  }

  const colorTexture = textureLoader.load(graveColorTexturePath);
  const ambientOcclusionTexture = textureLoader.load(
    graveAmbientOcclusionTexturePath,
  );
  const roughnessTexture = textureLoader.load(graveRoughnessTexturePath);
  const normalTexture = textureLoader.load(graveNormalTexturePath);

  const houseGroupBoundingBox = new THREE.Box3().setFromObject(houseGroup);
  const area = {
    max: { x: houseGroupBoundingBox.max.x, y: houseGroupBoundingBox.max.z },
    min: { x: houseGroupBoundingBox.min.x, y: houseGroupBoundingBox.min.z },
  };

  const points = generatePoints(30, area, 39, 0.5);
  const geometry = new THREE.BoxGeometry(0.5, 1, 0.2);
  const material = new THREE.MeshStandardMaterial({
    map: colorTexture,
    aoMap: ambientOcclusionTexture,
    roughnessMap: roughnessTexture,
    normalMap: normalTexture,
  });

  points.forEach((point) => {
    const grave = new THREE.Mesh(geometry, material);
    grave.position.set(point.x, 0.3, point.y);
    grave.rotation.z = (Math.random() - 0.5) * 0.4;

    scene.add(grave);
  });
};
```

[👉点击查看效果](/playground/threejs/hauntedHouse?step=graves)

### # 0.5 调试光源

现在的光源太亮了，不符合鬼屋场景的环境，所以需要调整一下光源，调整光源的思路就是，降低环境光的亮度，然后增加一个点光源，位于场景的上方，这个点光源用来模拟月亮发出的光，光的颜色也需要调整为冷色调。

```typescript
const initAmbientLight = () => {
  const ambientLight = inew THREE.AmbientLight('#b9d5ff', 0.1);
  scene.add(ambientLight);
};

const initPointLight = () => {
  const pointLight = new THREE.PointLight('#b9d5ff', 1, 0, 0.1);
  pointLight.position.set(4, 10, -5);
  scene.add(pointLight);
};
```

[👉点击查看效果](/playground/threejs/hauntedHouse?step=light)

### # 0.6 增加幽灵

幽灵使用点光源实现，效果是围绕着房子进行圆周运动。

```typescript
import { gsap } from "gsap";

const initGhost = () => {
  const ghost = new THREE.PointLight("#4CCD99", 10);
  scene.add(ghost);

  gsap.to(ghost.position, {
    duration: 5,
    repeat: -1,
    onUpdate: () => {
      ghost.position.z = Math.cos(clock.getElapsedTime()) * 16;
      ghost.position.x = Math.sin(clock.getElapsedTime()) * 16;
      ghost.position.y = Math.sin(clock.getElapsedTime()) * 5;
    },
  });
};
```

[👉点击查看效果](/playground/threejs/hauntedHouse?step=ghost)

### # 0.7 添加雾气和阴影效果

#### ## 0.7.1 添加雾气效果

```typescript
const initFog = () => {
  const fog = new THREE.Fog("#262837", 1, 40);
  scene.fog = fog;
};
```

#### ## 0.7.2 添加阴影

1. 产生阴影的物体

   - 房屋
   - 墓碑
   - 月光
   - 幽灵

2. 接收阴影的物体

   - 地面
   - 墓碑
   - 房屋

```typescript
// 对鬼屋组的所有物体进行阴影的设置
houseGroup.traverse((child) => {
  child.castShadow = true;
  child.receiveShadow = true;
});

// 对每个墓碑进行设置
grave.castShadow = true;
grave.receiveShadow = true;

// 对月光进行设置
pointLight.castShadow = true;

// 对幽灵进行设置
ghost.castShadow = true;

// 对地面进行设置
plane.receiveShadow = true;

// 对渲染器进行设置
renderer.shadowMap.enabled = true;
```

[👉点击查看效果](/playground/threejs/hauntedHouse)
