---
title: '实现 UnoCSS 网站的颜色渐变效果'
subtitle: 'CSS Animation: When you spend hours on keyframes, but end up making a button bounce.'
author: 'Caisr'
tags: ["CSS", "Animation"]
type: 'css'
cover: {
  image: '~/assets/images/cover/cover-1.webp',
  source: 'Lisa from Pexels (Pexels.com)',
  sourceUrl: 'https://www.pexels.com/photo/photo-of-rainbow-colored-flower-in-glass-jar-2430934/'
}
---

### 一. 原来 CSS 变量也可以用于 @keyframes

查看 [UnoCSS](https://unocss.dev/) 网站的代码，会发现这个 CSS 效果是通过 @keyframes 定义动画关键帧实现的，有一点特殊的是每次关键帧改变的是 CSS 变量。

```css
@keyframes rainbow {
    0% {
        --vp-c-brand-1: #00a98e;
        --vp-c-brand-light: #4ad1b4;
        --vp-c-brand-lighter: #78fadc;
        --vp-c-brand-dark: #008269;
        --vp-c-brand-darker: #005d47;
        --vp-c-brand-next: #009ff7
    }

    1.25% {
        --vp-c-brand-1: #00a996;
        --vp-c-brand-light: #4bd1bd;
        --vp-c-brand-lighter: #79fbe5;
        --vp-c-brand-dark: #008371;
        --vp-c-brand-darker: #005e4f;
        --vp-c-brand-next: #009dfa
    }
  ....
}
```

当我看到上面这段代码的时候才知道原来 CSS 变量也能在 @keyframes 里面使用。

接下来分析一下代码。

1. 每一帧的步长是 `1.25%`。
2. 完整的一次动画需要有5个颜色进行渐变
3. 一个颜色到另一个颜色渐变的步数是16步（16 * 1.25 = 20）
4. 到`80%`的时候会渐变至最后一个颜色，这时候需要从最后一个颜色渐变回第一个颜色。

我开始的时候也没发现这些规律，直到我让 AI 帮我把 @keyframes 中的 CSS 变量提取出来之后才发现这些规律。

长图预警！

![colors](~/assets/images/colors.png)

从图中可以很好的看出这些颜色的规律，就是从 `--vp-c-brand-1` 渐变至 `--vp-c-brand-next`。

一个颜色渐变至另一个颜色可以这样计算：

#### 步骤：

1. 计算颜色差距：

    - 计算每个颜色通道（R、G、B）的差距。

2. 每个步骤的增量：

    - 将每个颜色通道的差距除以 16，得到每一步的增量。

3. 应用增量：

    - 从起始颜色出发，每次按增量逐步增加，直到达到目标颜色。

#### 例子：

以 #9CF0F0 和 #FFC0CB 这两个颜色为例。

1. 将 #9CF0F0 和 #FFC0CB 转换成 RGB 格式

   - #9CF0F0 的 RGB 值是：

        - R = 156
        - G = 240
        - B = 240

    - #FFC0CB 的 RGB 值是：

        - R = 255
        - G = 192
        - B = 203

2. 计算颜色差距：

     - R: 255 - 156 = 99
     - G: 192 - 240 = -48
     - B: 203 - 240 = -37

3. 每个步骤的增量（除以 16）：

     - R增量：99 ÷ 16 = 6.1875
     - G增量：-48 ÷ 16 = -3
     - B增量：-37 ÷ 16 = -2.3125

4. 计算每一步的颜色：

     - 第 0 步：#9CF0F0（起始颜色）
     - 第 1 步：
       - R = 156 + 6.1875 = 162.1875 (取整)
       - G = 240 - 3 = 237
       - B = 203 - 2.3125 = 200.6875 (取整)
     - 第 2 步：
       - R = 162 + 6.1875 = 168.375 (取整)
       - G = 237 - 3 = 234
       - B = 201 - 2.3125 = 198.375 (取整)

     ……以此类推，直到第 16 步。

### 二. 实现

1. 找一个调色工具类的网站，选择5个颜色

    - [Adobe Color](https://color.adobe.com/zh/create/color-wheel)

2. 使用 [Ant Design](https://2x.ant.design/docs/spec/colors-cn) 提供的工具，可以很方便的获取到颜色的色板，这样就能获取到：

    - `--vp-c-brand-light`
    - `--vp-c-brand-lighter`
    - `--vp-c-brand-dark`
    - `--vp-c-brand-darker`

    这四个变量

3. 接下来开始排列颜色，规律是

    ![colors](~/assets/images/colors-example.png)

4. 利用 Scss 生成 @keyframes

    ```css
    @keyframes rainbow {
      @for $i from 0 through 80 {
        $keyframe: $i * 1.25 + "%";
        $colorIndex: 1 + 6 * $i;
        #{$keyframe} {
          --vp-c-brand-1: #{list.nth($colors, $colorIndex)};
          --vp-c-brand-light: #{list.nth($colors, $colorIndex + 1)};
          --vp-c-brand-lighter: #{list.nth($colors, $colorIndex + 2)};
          --vp-c-brand-dark: #{list.nth($colors, $colorIndex + 3)};
          --vp-c-brand-darker: #{list.nth($colors, $colorIndex + 4)};
          --vp-c-brand-next: #{list.nth($colors, $colorIndex + 5)};
        }
      }
    }
    ```

    `$colors` 就是第三步生成的颜色数组

5. 创建 rainbow 动画

    ```css
    .rainbow {
      animation: rainbow 40s linear infinite;
    }
    ```

    将这个类名添加到 `html` 或者 `body` 上，页面中的元素就可以使用 `@keyframes rainbow` 中的变量实现渐变效果了。


### 三. 简单的虚线渐变效果

`border-style: dashed;` 是无法实现渐变效果的，所以需要模拟一条虚线：

```css
.rainbow-border-dashed {
  background: linear-gradient(to right, transparent 50%, black 50%), linear-gradient(to right, var(--vp-c-brand-1), var(--vp-c-brand-1-next));
  background-size: 8px 2px, 100% 2px;
}
```

第一个渐变：`linear-gradient(to right, transparent 50%, black 50%)` 用来创建虚线的效果，从透明渐变到`black`, 之所以是`black`是因为我的页面背景色是`black`，这个渐变对应的是`background-size: 8px 2px`，意思就是虚线的间隔是 `8px`，高`2px`。

第二个渐变：`linear-gradient(to right, var(--vp-c-brand-1), var(--vp-c-brand-1-next))`，这是一条完整的渐变，它填充的就是第一个渐变的透明部分。
