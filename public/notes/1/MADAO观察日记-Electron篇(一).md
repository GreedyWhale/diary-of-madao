---
title: 'MADAO观察日记-Electron篇(一)'
introduction: 'Electron 基础知识'
---

![banner_8.jpeg](/_next/upload/banner_8_1677060466625.jpeg "banner_8.jpeg")

## 0x00 前言

公司的新项目忙完之后终于有时间继续写笔记了，这次准备开一个 Electron 的坑，我接触到 Electron 还是在刚进公司的时候，边看文档边开发，一写就写到了现在，期间踩了不少坑，但是没有记录下来，感觉很可惜，所以这次准备写一个自己的项目，一个音乐播放器，完整的记录一下开发过程，给自己简历上再添一个项目。

开项目之前先来梳理一下基础知识。

## 0x01 Electron是什么

Electron 是一个构建*桌面应用*的框架，它内置了Chromium 和 Node.js ，并且可以构建跨平台的应用。

我个人的理解是 Electron 集成了浏览器环境和 Node.js 环境，前端在浏览器环境中通过 HTML、CSS、JavaScript 构建图形界面（页面），在 Node.js 环境进行对系统的操作，比如文件读取。


## 0x02 main、renderer、preload.js

main 和 renderer 指的是 Electron 中的进程类型，一个 Electron 程序只有一个 main 进程，在 Electron 程序中每打开一个 *BrowserWindow* ，都会创建一个 renderer 进程，renderer 进程是可以有多个的。

preload.js 则是预加载脚本，它的作用是充当 main 进程和 renderer进程之间的通道，这牵扯到一个安全性问题。

main 进程是一个可以访问操作系统权限的 Node.js 环境，renderer 进程由于安全性考虑一般是不运行 Node.js 的，renderer 进程应该只注重界面部分，需要调用操作系统 API 的操作交给 main 进程去处理，这也是 Electron 推荐的最佳实践，所以 main 进程和 renderer 进程需要一个通道进行通信，preload.js 就是用来干这个的。

这里顺便再说一下，renderer 进程也可以变得像 main 进程一样，随意的使用 Electron 提供的模块、调用 Node.js 的 API，这需要开启在 *BrowserWindow* 中配置：

```js
{
    nodeIntegration: true,
    contextIsolation: false
}
```

同时安装 [@electron/remote](https://www.npmjs.com/package/@electron/remote)。

这一部分也很好理解，renderer 进程就和浏览器环境一样，你可以用你喜欢的任何前端框架来写页面，main.js 可以看成 Node.js 环境，你在浏览器上无法完成的操作都放在这里，比如说获取系统偏好、屏幕大小、读取文件等等，而它们之间的通信就用 preload.js 完成，举个例子：


```js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

const createWindow = () => {
  // 创建一个窗口
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // 加载preload.js
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  
  // 监听事件
  ipcMain.on('sayHello', () => {
    dialog.showMessageBox({
      title: '提示',
      message: '你好'
    });
  });
  
  // 监听事件，并且返回结果给renderer进程
  ipcMain.handle('getElectronInfo', () => process.versions.electron);

  // 加载html文件
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // 打开开发者工具
  mainWindow.webContents.openDevTools();

  // 向renderer进程主动发送消息
  mainWindow.webContents.send('ping', 'ping');
};

// 当程序准备好后，创建窗口
app.on('ready', createWindow);
```

```js
// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bridgeAPI', {
  sayHello: () => ipcRenderer.send('sayHello'),
  getElectronInfo: () => ipcRenderer.invoke('getElectronInfo'),
  ping: (callback) => ipcRenderer.on('ping', callback)
});
```

```js
// renderer.js

window.bridgeAPI.ping((event, message) => console.log(message));

window.bridgeAPI.sayHello();

window.bridgeAPI.getElectronInfo().then(res => consol.log(res));
```

例子中一共有三种通信方式：

1. renderer 进程向 main 进程发送消息。
2. renderer进程向 main 进程发送消息，并且main 进程进行回复。
3. main 进程主动向 renderer 进程发送消息。

我一般都是用这三种通信方式。

从例子中可以看出 preload.js 就相当于在 renderer 进程的全局对象 window 中注入了一些方法。

## 构建 Electron 应用程序

我觉得构建 Electron 应用程序是开发 Electron 应用程序最大的难点。

我曾经遇到macOS平台构建后签名无效的问题，最终还是去看构建工具（electron-builder）的源码手动改源码才解决，然后我就去*electron-builder*的issues问：为什么要用这个证书（对于我的场景来说是无效的）进行签名，然后有个人看到我贴的源码改动，他就提了一个 `pr` 和我改的代码一样，官方维护人员居然就直接合并了，导致其他人构建出现问题。

自此之后我就感觉*electron-builder*不靠谱，这也是我这次个人项目选用*Electron Forge*的原因。

这里就记录一下我工作中的构建思路，做个备忘，当然使用的构建工具还是*electron-builder*。

**一. webpack**

因为*electron-builder*只用于程序构建，不会处理代码，所以项目还是需要 *webpack* 、*Vite*、*Rollup* 这些工具来处理代码。


我选择的是*webpack*，曾经尝试使用 *Vite*，不过遇到了这个问题：

[build --watch does not output html or css when @vitejs/plugin-legacy is used](https://github.com/vitejs/vite/issues/6133)


所以还是换回了 *webpack*。

思路是这样的：

1. loader 的配置

    在 webpack 中 loader 就是用来处理各种不同类型文件的东西。
    
    TypeScript 文件只需要一个 `ts-loader` 或是 `babel-loader` 即可，除非确实遇到了兼容问题，否则不需要配置 `babel`。因为 Electron 集成了 Chromium， JavaScript 代码在 renderer 进程下几乎没有兼容性问题。
    
    其他的loader，也只需要配置一下 css 相关的loader。
    
    
    至于图片、视频、字体这些文件，webpack 现在已经内置了处理方法，可以参考：
    
    [Asset Management](https://webpack.js.org/guides/asset-management/)
    
3. Target

    相对于 *Vite* 这种专门面向浏览器的打包工具，*webpack* 可以针对多种环境进行打包。
    
    参考：[target](https://webpack.js.org/configuration/target/)
    
    *webpack* 也提供了 *Electron* 相关的环境，按照上面分好的配置文件进行配置即可
    
3. 一些特殊的包

    我在工作中的项目需要和 c++ 的代码进行相互调用，所以使用到了 `ffi-napi` 这个包。
    
    在使用这个包的时候遇到了一个报错：
    
    `No native build was found for platform=win32 arch=x64 runtime=electron `

    最终的解决方法是配置：
    
    ```js
    externals: {
        /**
         * @see https://github.com/Level/leveldown/issues/725#issuecomment-645750649
         */
        'ffi-napi': 'commonjs ffi-napi',
    }
    ```
    
4. 热更新问题

    一般来说前端在开发的时候会使用一个本地服务来开发，这样代码修改了可以实时的看到效果，在 Electron 中也是可以用的，只要把 `mainWindow.loadFile` 换成 `mainWindow.loadURL` 即可实现。
    
    
    但是我在实际开发中发现，很多时候开发的时候好好的，但是打包过后就会出问题，比如资源路径找不到等等。
    
    所以我没有使用`mainWindow.loadURL`去实现热更新。
    
    我使用的方案是监听**打包后**的文件的变化，然后使用 Electron  提供的 `reloadIgnoringCache` API 手动刷新窗口，核心逻辑是：
    
    ```js
    let reloadTimer = -1;

    const reload = () => {
      clearTimeout(reloadTimer);
      reloadTimer = setTimeout(() => {
        console.log('reload window');
        const windows = BrowserWindow.getAllWindows();
        windows.forEach(item => {
          item.webContents.reloadIgnoringCache();
        });
      }, 50);
    };
    ```
    
    这段代码需要在 main 进程执行。
    
    这里给一个延时的原因是，我发现有时候会在文件没有变化完成之前就执行，所以给了一个延长，但是这样写有时候连续刷新两次窗口，体验还不是很好。
    
    
    以上只是针对 renderer 进程的热更新，接下来是 main 进程的热更新：
    
    ```js
    let relaunchTimer = -1;
    const relaunch = () => {
      clearTimeout(relaunchTimer);
      relaunchTimer = setTimeout(() => {
        app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
        app.exit(0);
      }, 50);
    };
    
    ```
    
    逻辑其实差不多，也可以实现修改 main 进程代码后自动重启软件，但是我在开发时接入了c++编译后的`dll`文件，每次重启`dll`文件都会报错...
    
    最终没有解决这个问题，只能手动重启。
    
    
5. 自动启动软件

    这里的自动启动指的是开发时第一次打包完成后启动软件，这里使用了 *webpack* 的插件功能:
    
    ```js
    const { spawn } = require('child_process');

    let alreadyStarted = false;

    class StartUpApp {
      apply(compiler) {
        if (process.env.APP_ENV !== 'development') {
          return;
        }

        compiler.hooks.done.tap('StartUpApp', () => {
          if (alreadyStarted) {
            return;
          }

          alreadyStarted = true;
          const childProcess = spawn('yarn electron .', { shell: true });
          childProcess.stdout.on('data', data => {
            console.log(data.toString());
          });
          childProcess.stderr.on('data', error => {
            console.log(error.toString());
          });
        });
      }
    }

    module.exports = StartUpApp;

    ```
    
webpack相关的配置思路就是这样。

**二、源码加密**

Electron 是不提供源码加密功能的，未来可能也不会提供，原因可以参考：

[Source Code Protection ](https://github.com/electron/electron/issues/3041)

我是通过 [Bytenode](https://github.com/bytenode/bytenode) 这个库进行加密的，它的加密思路很有意思，就是把代码编译成 *V8字节码*，这样 JavaScript 引擎是认识的，但是人类不可读，所以也不需要密钥之类的东西。


如果使用 **Bytenode** 这个库，那么 `preload.js` 就没有用了，因为它需要在 renderer 进程使用 Node.js 环境，意味着需要在渲染进程开启：

```js
nodeIntegration: true,
contextIsolation: false
```

开启这个之后 renderer 进程基本就和 main 进程的环境差不多了，所以`preload.js`就没用了。

使用这个库加密文件会得到一个以`.jsc`结尾的文件。

比如我们加密`index.js`，会得到`index.jsc`，然后我们需要把`index.js`的文件内容替换成：

```js
var path = require('path')
var bytenode = bytenode || require('bytenode')
require(path.join(__dirname, 'index.jsc'))
```

这样才能达到加密效果，至于直接引用`jsc`文件，我试过，会报错。我没法解决那个报错，所以最后选择用这种方式。

总结一下就是：

1. 把`.js`文件编译成`.jsc`文件
2. 替换`.js`文件内容

这两步可以使用 Node.js 写成脚本自动执行。

但是我现在不推荐进行源码加密，原因有两点：

1. Electron 官方不推荐在 renderer 进程开启：

    ```js
    nodeIntegration: true,
    contextIsolation: false
    ```
    
    理由是安全问题，因为 renderer 进程可以加载一些远程脚本，开启之后这些脚本就可以直接利用Node.js访问用户本机的文件。
    
    
2. The vm module of Node.js is deprecated in the renderer process and will be removed.


    `The vm module of Node.js is deprecated in the renderer process and will be removed.` 这是我用 **Bytenode**之后 Electron 给我的警告，我也去**Bytenode**提问了，作者给的答复是 vm 模块是必须的，他会尝试解决这个问题，不过目前为止一直没有解决。
    
    问题地址：[Warning about electron's removal of Node.js vm module](https://github.com/bytenode/bytenode/issues/107)
    
基于以上两点不推荐进行源码加密。


## 结语

Electron 个人使用体验还不错，只是遇到问题解决起来很费劲，多数都是操作系统层面的问题，有时感觉很无力，而且 Electron 不提供从开发到打包的完整流程，你需要自己去选择工具，配置工具的时间比开发还久。

还有一个是 Electron 打包出来的应用体积很大...我暂时没有进行优化处理，等我在做完这个个人项目的时候，再去学习学习这方面的优化。



