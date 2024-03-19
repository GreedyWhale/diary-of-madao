---
layout: ../../../layouts/Markdown.astro
title: 六. 纹理和材质
author: Caisr
description: 有关纹理和材质的知识点
createdAt: 2024-01-05T08:06:00.000Z
updatedAt: 2024-01-05T08:06:00.000Z
tags: [Three.js, Texture, Material]
demo: /playground/threejs/texture-and-material
---

### # 0.1 Texture

纹理专业一点的解释是：

> 纹理是计算机图形学中用来装饰物体的技术，它能够赋予一个表面以视觉上的细节、图案、颜色等效果。

我的理解纹理就是贴图或者是真实世界中的包装纸。

纹理是有不同类型的，不同类型的纹理叠加起来就可以实现更加真实的效果，常见的纹理有：

- 颜色纹理（Color Texture）： 用于给模型表面着色或者添加图案、图片等颜色信息的纹理。
- 法线纹理（Normal Texture）： 用于模拟表面的凹凸效果，常用于增加模型的细节和真实感。
- 高度图纹理（Heightmap Texture）： 用于描述表面的高度信息，通常用于创建真实感地形或者模拟表面的起伏。
- 凹凸纹理（Bump Texture）： 类似于法线纹理，用于模拟表面的凹凸效果，但通常只包含表面的高度信息而不是法线信息。
- 金属度纹理（Metalness Texture）和粗糙度纹理（Roughness Texture）： 用于描述材质的金属度和粗糙度，影响光照的反射和散射效果。
- 环境贴图（Environment Map）： 用于模拟环境光照效果，通常用于反射和折射效果的模拟。
- 光照贴图（Lightmap）： 用于存储场景的光照信息，提高渲染效率和真实感。
- 透明度纹理（Opacity Texture）： 用于描述表面的透明度信息，通常用于创建半透明效果。
- 漫反射纹理（Diffuse Texture）： 用于模拟表面的漫反射光照效果，通常用于基础的着色。
- 发光纹理（Emission Texture）： 用于模拟表面的发光效果，使得表面可以发出光线。

网络上有很多免费的纹理资源下载，推荐 [3D TEXTURES](https://3dtextures.me/)。

如果你下载了其中某一个纹理，就会发现下载下来的纹理有好多张图片，这些图片就是这一种纹理的不同类型，想要有更真实的效果就需要组合这些纹理。

### # 0.2 使用纹理

在 Three.js 中有三种方式加载纹理，分别是：

1. 以图片的形式加载

   ```javascript
    import * as THREE from "three";
    // 加载图片路径
    import colorTexture from "/static/textures/door/Door_Wood_001_basecolor.jpg?url";

    let mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;
    let texture: THREE.Texture;

    const initTexture = () => {
      const image = new Image();
      image.onload = () => {
        texture.needsUpdate = true;
      };

      texture = new THREE.Texture(image);
      image.src = colorTexture;
    };

    const initMesh = () => {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.5, 1),
        new THREE.MeshBasicMaterial({ map: texture }),
      );
    };

    initTexture();
    initMesh();
   ```

   [👉点击查看效果](/playground/threejs/texture-and-material-1)

2. 使用 `TextureLoader` 加载纹理

   ```javascript
   import colorTexture from "/static/textures/door/Door_Wood_001_basecolor.jpg?url";

   const textureLoader = new THREE.TextureLoader();

   const texture = textureLoader.load(
     colorTexture,
     (texture) => console.log("loaded", texture),
     // onProgress 已经不支持
     undefined,
     (error) => console.log("error", error),
   );

   const mesh = new THREE.Mesh(
     new THREE.BoxGeometry(1, 1, 1),
     new THREE.MeshBasicMaterial({ map: texture }),
   );
   ```

3. 使用 `LoadingManager` 来加载

   ```javascript
   import colorTexture from "/static/textures/door/Door_Wood_001_basecolor.jpg?url";
   // 创建 LoadingManager
   const manager = new THREE.LoadingManager();
   manager.onStart = (...args) => {
     console.log("onStart", args);
   };

   manager.onProgress = (...args) => {
     console.log("onProgress", args);
   };

   manager.onLoad = (...args) => {
     console.log("onLoad", args);
   };

   manager.onError = (...args) => {
     console.log("onError", args);
   };

   const textureLoader = new THREE.TextureLoader(manager);
   const colorTexture = textureLoader.load(colorTexturePath);

   const mesh = new THREE.Mesh(
     new THREE.BoxGeometry(1, 1, 1),
     new THREE.MeshBasicMaterial({ map: texture }),
   );
   ```

一般使用 `TextureLoader` 或者 `LoadingManager` 的方式去加载纹理，这样可以更好的处理一些加载过程中的事件。

### # 0.3 UV unwrapping

> UV unwrapping 是计算机图形学中的一个概念，用于将三维模型的表面映射到二维图像的过程。

在不同形状的三维模型上使用同一个纹理，会得到不同的效果，有些是完美适配纹理，有些则会显示出怪异的效果，纹理是否正确地映射到三维模型的表面上取决于三维模型的 `UV坐标`，`UV` 的意思是二位坐标。

在 Three.js 中所有内置的几何形状都有 UV 坐标的信息，可以通过 `geometry.attributes.uv` 查看。

如果想要自定义一个几何形状，不要忘记指定 UV 坐标。

[👉点击查看效果](/playground/threejs/texture-and-material-2)

### # 0.4 纹理的变换

纹理可以进行位移、旋转、重复的操作的，比如要渲染草地就可以用让纹理重复。

纹理在重复的时候需要注意一下重复的方式，Three.js 默认重复的方式是: `THREE.ClampToEdgeWrapping`, 默认纹理的最后一个像素延伸到网格的边缘。

[👉点击查看效果](/playground/threejs/texture-and-material-3)

可选的值有：

- `THREE.ClampToEdgeWrapping`：默认方式，纹理的最后一个像素延伸到网格的边缘。
- `THREE.RepeatWrapping`：纹理将重复出现。
- `THREE.MirroredRepeatWrapping`：纹理将镜像重复。

```javascript
// 水平方向
texture.wrapS = THREE.RepeatWrapping;
// 垂直方向
texture.wrapT = THREE.RepeatWrapping;
```

纹理的变换操作中还需要注意的一点是纹理的旋转：

1. 纹理的旋转使用弧度作为单位，正值为逆时针方向。
2. 纹理的旋转中心，并不是物体的中心，如果发现纹理旋转的效果有问题，尝试修改旋转中心。

   ```javascript
   texture.center.x = 0.5;

   texture.center.y = 0.5;

   texture.rotation = Math.PI / 4;
   ```

### # 0.5 Mipmapping and Filter

> Mipmapping 是一种为提高渲染性能和减少纹理映射时的锯齿状边缘效应的技术，它会把纹理按照当前尺寸的一半进行缩小，直到尺寸为 1 x 1

在 Three.js 中有时会发现物体的纹理离相机越远就越模糊，就是因为 Mipmapping 技术导致的。

GPU 会选择最合适的纹理，当物体远离相机时，GPU使用较小尺寸的纹理，所以会显得有些模糊。当靠近相机时，GPU使用使用尺寸较大的纹理呈现更精致的画面。

如果不想使用 Mipmapping[minFilter](https://threejs.org/docs/index.html#api/en/textures/Texture.minFilter)属性可以关闭它：

```javascript
texture.minFilter = THREE.NearestFilter;
texture.generateMipmaps = false;
```

关于 Filter 的概念也挺复杂，可以参考这篇文章: [What is a texture filter](https://www.gamedevelopment.blog/texture-filter/)

我暂时还搞不懂，但是从上面的文章中可以知道一个结论：

> 性能最好的过滤器是：NearestFilter
>
> 兼顾美观和性能的最佳过滤器是：MipmapLinearNearest

所以如果有这方面的改动，可以优先考虑一下这两个过滤器。

除了 [minFilter](https://threejs.org/docs/index.html#api/en/textures/Texture.minFilter) 属性外，纹理对象还有一个[magFilter](https://threejs.org/docs/index.html#api/en/textures/Texture.magFilter)属性，它们用于定义在渲染时如何处理纹理的缩小（minification）和放大（magnification）过程中的像素。

1. minFilter属性定义了当渲染的纹理比实际纹理尺寸小时（即缩小时）的采样方式。常见的选项包括：

   - THREE.NearestFilter：使用最近邻采样，即使用距离采样点最近的纹理像素的值。
   - THREE.LinearFilter：使用线性插值，即使用采样点周围四个最近的纹理像素的加权平均值。

2. magFilter属性定义了当渲染的纹理比实际纹理尺寸大时（即放大时）的采样方式。常见的选项包括：

   - THREE.NearestFilter：同样使用最近邻采样。
   - THREE.LinearFilter：同样使用线性插值。

通常情况下，如果纹理被缩小了，可以使用NearestFilter来获得更好的性能和更快的渲染速度。而如果纹理被放大了，通常会使用LinearFilter来获得更平滑的结果。

这两个属性的组合可以影响纹理在不同情况下的质量和性能。

一旦使用了 minFilter 或者 magFilter，就不需要 Mipmapping 了，可以将纹理的 Mipmapping 关闭提高性能：

```javascript
texture.generateMipmaps = false;
```

### # 0.5 Material

材质决定了物体的外观，Three.js 的材质中有一些常用的属性

- color：用于设置材质的颜色
- map：用于设置颜色纹理
  - 不同类型的纹理对应的属性是不同的，比如法线纹理就需要设置到材质的`normalMap`属性上
  - 纹理和颜色可以同时存在
- wireframe：以线框的方式显示组合成几何图形的三角形
- opacity：透明度

  - 设置透明度相关的属性时，需要将 `transparent` 属性设置为 `true`，例如：

    ```javascript
    material.transparent = true;

    material.opacity = 0.5;
    ```

- side：用于设置物体的哪一面是可见的，默认是前面，可以设置的值有：

  ```javascript
  material.side = THREE.FrontSide; // 前面

  material.side = THREE.BackSide; // 后面

  material.side = THREE.DoubleSide; // 前后两面都可以显示
  ```

[👉点击查看效果](/playground/threejs/texture-and-material-4)

#### ## 0.5.1 材质的类型

不同类型的材质渲染出的物体外观也不同，这里记录几种我用过的材质类型。

[👉点击查看不同纹理的效果](/playground/threejs/texture-and-material-5)

1. MeshBasicMaterial

   最基础的材质，不受光的影响

2. MeshNormalMaterial

   将法线向量映射到 RGB 颜色的材质。这种材质一般用于调试法线，不同的颜色表示法线指向的方向：红色表示 x 轴的正方向，绿色表示 y 轴的正方向，蓝色表示 z 轴的正方向。

   当旋转物体的时候就可以观察到颜色的变化。

3. MeshMatcapMaterial

   `MeshMatcapMaterial` 是一种使用 MatCap（或 Lit Sphere）纹理定义的材质。

   > MatCap（Material Capture）是一种捕捉材质和光照的技术。MatCap 纹理通常是一个预先渲染的球体，捕捉了包括高光在内的各种光照信息。这样，将 MatCap 纹理应用到物体上，就能够赋予物体一种看似具有高级光照和材质的效果，而实际上它只是一个平面上的纹理。

   简单来说：这种材质不受光源的影响，因为光照效果已经包含在 MatCap 纹理中。

   MatCap 类型的纹理可以在：https://github.com/nidorx/matcaps 中找到，但是使用需要确认版权。

4. MeshStandardMaterial

   这种材质是一种遵循PBR标准（原理）的材质，PBR是基于物理的渲染（Physically Based Rendering）的意思，简单来说这种材质更加符合现实世界的物理规律，能够提供更真实、细致的效果，同时这种材质的计算成本也更高。

   MeshStandardMaterial材质受到光的影响，如果使用这种材质，场景中必须存在光源，否则看不见物体。

   MeshStandardMaterial 材质有两个常用的属性：

   1. roughness

      roughness属性定义了材质表面的粗糙程度。粗糙度越高，表面越粗糙，反射光会更加散射，表现为更模糊、柔和的高光。相反，粗糙度越低，表面越光滑，反射光的方向性更强，表现为更明亮、锐利的高光。在PBR中，roughness通常是一个介于0到1之间的值，0表示完全光滑，1表示完全粗糙。

   2. metalness

      metalness属性定义了材质的金属特性。金属材质具有自己的反射率，光会直接反射出去，而非被表面吸收。在PBR中，非金属材质通常具有固定的漫反射率和镜面反射率，而金属材质则会根据金属度属性来确定反射光的比例。metalness属性的取值通常也是介于0到1之间的值，0表示非金属，1表示完全金属。

   用这两个属性可以模拟出非常真实的效果。

### # 0.6 Environment Map

[👉点击查看效果](/playground/threejs/texture-and-material-6)

> 环境贴图（Environment Map）是一种特殊的纹理，用于模拟物体周围的环境光线和反射。它通常是一个球形或立方体贴图，捕捉了物体周围的环境，包括天空、周围的物体和光源等。环境贴图可以用来增强渲染效果，使物体看起来更真实、更具有光照和反射的效果。

想要在 Three.js 中使用环境贴图，首先需要找到环境贴图资源，这里推荐一个网站：[HDRIHaven](https://hdri-haven.com/)

找到资源后，还需要对环境贴图进行切分，切分成：CubeMap，这个也有一个非常好用的工具：[HDRI-to-CubeMap](https://matheowis.github.io/HDRI-to-CubeMap/)

切分的时候要注意一下，是要切成6张单独的贴图。

```javascript

// 加载环境贴图路径
import pxTexturePath from "/static/textures/envMap/px.png?url";
import nxTexturePath from "/static/textures/envMap/nx.png?url";
import pyTexturePath from "/static/textures/envMap/py.png?url";
import nyTexturePath from "/static/textures/envMap/ny.png?url";
import pzTexturePath from "/static/textures/envMap/pz.png?url";
import nzTexturePath from "/static/textures/envMap/nz.png?url";

// 创建 CubeTextureLoader 加载纹理
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  pxTexturePath,
  nxTexturePath,
  pyTexturePath,
  nyTexturePath,
  pzTexturePath,
  nzTexturePath,
]);

// 创建物体
const material = new THREE.MeshStandardMaterial({ envMap: texture });
// 让材质可以反射光
material.roughness = 0;
material.metalness = 1;
const sphere = new THREE.Mesh(new THREE.SphereGeometry(1), material);

// 创建灯光
const ambientLight = new THREE.AmbientLight(0xffffff);

// 创建场景
const scene = new THREE.Scene();
const scene.add(camera, sphere, ambientLight);
const scene.background = texture;
```

### # 0.7 渲染一个门

之前有说过不同类型的纹理进行组合可以显示出一个更加真实的物体，实际上的效果如何，并没有直观的感受，
下面就实现一个门，可以通过右上角的控件一步一步添加纹理，直观的感受一下不同纹理的作用。

[👉点击查看效果](/playground/threejs/texture-and-material)

实现例子中的这种效果，一共用到了7种纹理，分别是：

#### ## 0.7.1 颜色纹理

> 最基本的纹理类型，包含了模型表面的颜色信息。

在 Three.js 中使用颜色纹理的方式是：

```javascript
import doorColorTexturePath from "/static/textures/door/Door_Wood_001_basecolor.jpg?url";

const loader = new THREE.TextureLoader();
const texture = loader.load(doorColorTexturePath);

const door = new THREE.Mesh(
  new THREE.PlaneGeometry(1.8, 2.5, 100, 100),
  new THREE.MeshStandardMaterial({ map: texture }),
);
```

#### ## 0.7.2 遮挡纹理

> 用于模拟物体表面不同部分之间的遮挡关系，增强渲染的阴影效果。

当物体应用了遮挡纹理后能明显的看到阴影效果了，这种纹理在 Three.js 中使用的时候需要第二组`UV`。

```javascript
import doorAoTexturePath from "/static/textures/door/Door_Wood_001_ambientOcclusion.jpg?url";

const loader = new THREE.TextureLoader();
const texture = loader.load(doorAoTexturePath);

const geometry = new THREE.PlaneGeometry(1.8, 2.5, 100, 100);
const material = new THREE.MeshStandardMaterial({ aoMap: texture });

geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(door.geometry.attributes.uv.array, 2),
);

const door = new THREE.Mesh(geometry, material);
```

#### ## 0.7.3 粗糙度纹理

> 用于描述物体表面的粗糙度变化，在三维渲染中，粗糙度是指表面的光滑程度或不规则程度。

粗糙度纹理纹理一般会和金属度纹理和法线纹理一起使用，使用这种纹理后就能看到物体对光的反射效果了，在 Three.js 中这样使用：

```javascript
import doorRoughnessTexturePath from "/static/textures/door/Door_Wood_001_roughness.jpg?url";

const loader = new THREE.TextureLoader();
const texture = loader.load(doorRoughnessTexturePath);

const geometry = new THREE.PlaneGeometry(1.8, 2.5, 100, 100);
const material = new THREE.MeshStandardMaterial({ roughnessMap: texture });

const door = new THREE.Mesh(geometry, material);
```

#### ## 0.7.3 金属度纹理

> 用于描述物体表面金属属性的纹理图像。在三维渲染中，金属度是指物体表面的金属性质程度，即表面是金属还是非金属。

在 Three.js 中这样使用：

```javascript
import doorMetalnessTexturePath from "/static/textures/door/Door_Wood_001_metallic.jpg?url";

const loader = new THREE.TextureLoader();
const texture = loader.load(doorMetalnessTexturePath);

const geometry = new THREE.PlaneGeometry(1.8, 2.5, 100, 100);
const material = new THREE.MeshStandardMaterial({ metalnessMap: texture });

const door = new THREE.Mesh(geometry, material);
```

#### ## 0.7.3 法线纹理

> 包含了表面法线的信息，用于模拟表面的微小凹凸，从而增强光照效果。

当添加了粗糙度纹理、金属度纹理、法线纹理和光源之后，就可以发现物体的凹凸不平处变得很真实，尤其是在光照的情况下，在 Three.js 中这样使用：

```javascript
import doorNormalTexturePath from "/static/textures/door/Door_Wood_001_normal.jpg?url";

const loader = new THREE.TextureLoader();
const texture = loader.load(doorNormalTexturePath);

const geometry = new THREE.PlaneGeometry(1.8, 2.5, 100, 100);
const material = new THREE.MeshStandardMaterial({ normalMap: texture });

const door = new THREE.Mesh(geometry, material);
```

#### ## 0.7.3 透明度纹理

> 定义纹理图像中哪些部分是透明的

这种纹理看上去是黑白的，应用到物体上之后黑色的部分不显示，只显示白色的部分，当使用了透明度纹理之后，门的尺寸就正常了。

使用的时候注意要将材质的`transparent`属性设置为`true`。

```javascript
import doorOpacityTexturePath from "/static/textures/door/Door_Wood_001_opacity.jpg?url";

const loader = new THREE.TextureLoader();
const texture = loader.load(doorOpacityTexturePath);

const geometry = new THREE.PlaneGeometry(1.8, 2.5, 100, 100);
const material = new THREE.MeshStandardMaterial({
  alphaMap: texture,
  transparent: true,
});

const door = new THREE.Mesh(geometry, material);
```

#### ## 0.7.3 位移纹理

> 位移纹理影响网格顶点的位置。与其他纹理不同，它不仅影响材质的光线和阴影，而且可以使被扰动的顶点产生阴影、阻挡其他对象，并且在视觉上表现为真实的几何形状。位移纹理是一种图像，其中每个像素的值（白色为最高）与网格的顶点进行映射和重新定位。
>
> 使用位移纹理，您可以根据贴图中的像素值来调整网格的顶点位置，从而实现类似于几何形变的效果。例如，如果贴图中的像素值较高，则相应的顶点将被向外移动，而较低的像素值则会导致相应的顶点向内移动。这种技术可用于在网格表面上创建凹凸不平的效果，使其看起来更加逼真和具有细节。

在例子中我使用了是`PlaneGeometry`实现的门，这是一个平面，所以在没有使用位移纹理的时候，他是没有厚度的，当使用了位移纹理后，物体的顶点产生位移就会有厚度。

使用这种纹理的时候，有两个需要注意的地方：

1. 顶点的数量

   在 Three.js 中几个形状基本都可以指定组成某个面的三角形数量，三角形越多意味着顶点越多，假如例子中的`PlaneGeometry`没有使用参数`100`来指定三角形数量（注意这里的100并不是指三角形有100个，指的是水平和垂直方向上分割成的矩形面片的数量，这些矩形面片则是由三角形组成），位移纹理根本不会生效。

   所以如果发现位移纹理没有生效，请检查几何形状的顶点数量是否足够。

2. displacementScale

   材质的 `displacementScale` 属性表示材质的顶点的位移比例，有时候位移程度太大，那么就需要修改这个属性的值。

   当物体的位移程度太大，请检查物体材质的`displacementScale`的值。

```javascript
import doorHeightTexturePath from "/static/textures/door/Door_Wood_001_height.png?url";

const loader = new THREE.TextureLoader();
const texture = loader.load(doorHeightTexturePath);

const geometry = new THREE.PlaneGeometry(1.8, 2.5, 100, 100);
const material = new THREE.MeshStandardMaterial({
  displacementMap: texture,
  displacementScale: 0.1,
});

const door = new THREE.Mesh(geometry, material);
```
