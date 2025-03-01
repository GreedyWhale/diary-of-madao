---
title: 'IF 打卡应用开发笔记（一）'
subtitle: '搭建 React Native 开发环境'
author: 'Caisr'
tags: ["React Native", "Fullstack"]
type: 'fullstack'
cover: '~/assets/images/if-banner-1.webp'
---

### 前言

这是我使用 React Native 开发打卡应用的系列笔记。开发这款应用的初衷是因为，随着年龄的增长，我发现只写代码而没有做过管理的程序员在找新工作时面临更大挑战，再加上我的学历不高，选择的余地也很小。我一直想成为独立开发者，但不知道从哪里开始，也不清楚如何实现变现，导致每天都感到焦虑。虽然不想上班，但又不敢辞职，于是我决定从一些小的改变开始，比如锻炼身体，帮助自己变得更自律。为此，我决定开发一款打卡应用，强迫自己每天坚持下去。

### 一. 环境搭建

开发环境

```bash
node -v
# Node.js 版本
# v20.11.0
brew --version
# Homebrew 版本
# Homebrew 4.4.15
sw_vers
# 系统版本
# ProductName:            macOS
# ProductVersion:         15.3
# BuildVersion:           24D60
/usr/bin/xcodebuild -version
# xcode 版本
# Xcode 16.2
# Build version 16C5032a
```

1. 安装 `Expo`

    ```bash
    npx create-expo-app@latest
    ```
    
    > [Start a new React Native project with Expo](https://reactnative.dev/docs/environment-setup)

    > Expo 是一个为 React Native 开发者提供简化工具集的开源平台，它使得开发、调试和发布跨平台移动应用变得更加简便。它特别适合那些不需要复杂原生代码的项目，开发者可以在很短的时间内搭建并开始构建应用。


2. 在模拟器上进行开发

    > [Set up your environment](https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=simulated&mode=development-build)

    选择开发平台

    1. iOS Simulator（iOS 虚拟机）
    2. Development build（需要构建开发版本）

3. 不使用 Expo 应用服务 (EAS) 进行构建

    如果勾选了**使用 Expo 应用服务 (EAS) 进行构建**这个选项，需要登录 Expo，然后构建是在云端上进行的，我个人的体验是不太好的，主要有以下两点：

    1. 构建速度很慢，我构建一个最基础的模版也需要14分钟。
    2. 构建有时效性，构建完成后超过14天就不可用了，得重新构建。

    好处就是可以看到完整的构建时间线

4. 更新（安装）xcode

    安装或者更新完成需要打开一次 xcode，xcode 会提示你安装什么平台的虚拟机，这里选择 iOS 即可。

5. 安装 Watchman

    ```bash
    brew update
    ```
    
    ```bash
    brew install watchman
    ```

6. 进入项目的根目录安装 `expo-dev-client`

    ```bash
    npx expo install expo-dev-client
    ```

7. 启动开发服务

    ```bash
    npm run ios
    ```
