---
title: 'MADAO观察日记-Electron篇(二)'
introduction: '搭建项目'
---

## 0x00 前言

记录一下个人 Electron 项目的搭建，这部分我认为是 Electron 项目的难点。

一开始采用的方案是 *Electron Forge* + *SolidJS*。

当去集成 *solid-router* 的时候我遇到了这个报错：


**cleanups created outside a `createRoot` or `render` will never be run**

试过了我能找到的解决方法，还是解决不了，只好更换方案。

新的方案采用：*Vite* + *SolidJS*

*Vite* 不用多说，个人感觉影响力已经超过 *Vue 3*，虽然没有 *webpack* 那么全面，但是要好用一些，内置的模版简直就是我的救星。

*SolidJS* 我觉得是高级版的 *React*，我在做技术选型的时候也考虑过 *Svelte*，但是不喜欢 *Svelte* 的模版语法，总感觉不是在写 *JavaScript*，所以最终选择了*SolidJS*。

这里吐槽一下 *React*，如果不是 *React* 的生态太丰富了（主要是 *Next.js*），我都准备放弃 *React* 了，放弃的原因就是 `useEffect` 太难用了，而且现在版本的 *React* 如果开启了 `Strict Mode`会在开发模式下默认执行两遍`useEffect`，为的是让开发者更容易找打未清除的副作用，可能想的是好的，但是这让我开发起来非常痛苦，我得确认到底是自己写的有问题导致重复执行还是默认的重复执行。

随着 Vercel 团队和 React 团队不断靠拢，感觉 *React* 迟早得 *Next.js* 化。

我最近也使用了一下最新 *Next.js* (13版本)，有点不适应，主要不习惯服务端组件和客户端组件，感觉是*Next.js*想把 API 变成组件。

基于这些情况可能以后 *Next.js* 不再是我的主力框架了，惆怅中...

吐槽完毕，开始搭建项目：

## 0x01 搭建项目


1. 创建项目

    ```
    npx degit solidjs/templates/ts my-app
    ```
    
    这是一个*Vite*的ts模板，`my-app` 是项目名字，除了这个模板以外，还有很多，可以参考：
    
    [Solid Templates ](https://github.com/solidjs/templates)
    
    我就是在做的时候没有发现这些模版，导致我后面还得手动集成 *Tailwind CSS*
    
    执行完成会得到这样一个目录
    
    ```
    src
     |- assets
     |- App.module.css
     |- App.tsx
     |- index.css
     |- index.tsx
     |- logo.svg
    ```
    
    现在需要在src目录下面创建`renderer`、`main`、`preload`这三个目录，并且把 `renderer` 相关的文件放入 `renderer`目录中。
    
    ```
    src
     |- assets
     |- main
     |- preload
     |- renderer
       |- App.module.css
       |- App.tsx
       |- index.css
       |- index.tsx
       |- logo.svg
    ```
    
2. 配置*Vite*

    同样的按照目录创建对应的*Vite*配置文件：
    
    - vite.main.config.ts
    - vite.preload.config.ts
    - vite.renderer.config.ts


    分别对应 Main 进程、Renderer 进程和预加载脚本的配置。
    
    - vite.main.config.ts

      ```ts
      import { defineConfig } from 'vite';
      import { builtinModules } from 'node:module'
      import path from 'path';

      /** @type {import('vite').UserConfig} */
      export default defineConfig({
        root: path.join(__dirname, '/src/main'),
        build: {
          outDir: path.join(__dirname, '/dist/main'),
          emptyOutDir: true,
          lib: {
            entry: 'index.ts',
            formats: ['cjs'],
            fileName: 'index'
          },
          rollupOptions: {
            external: ['electron', ...builtinModules.flatMap(item => ([item, `node:${item}`]))]
          }
        },
      });
      ```
      
      Main 进程的文件打包的关键点在于要把它打包成可以在 Node.js 环境执行的代码。
      
      ```js
      external: ['electron', ...builtinModules.flatMap(item => ([item, `node:${item}`]))]
      ```
      
      这个配置是为了排除 Node.js 相关的包和 Electron，因为使用 Electron 构建完程序后，程序本身就提供 Node.js + Electron 环境。
      
    - vite.preload.config.ts

      ```ts
      import { defineConfig } from 'vite';
      import { builtinModules } from 'node:module'
      import path from 'path';

      /** @type {import('vite').UserConfig} */
      export default defineConfig({
        root: path.join(__dirname, '/src/preload'),
        build: {
          outDir: path.join(__dirname, '/dist/preload'),
          emptyOutDir: true,
          lib: {
            entry: 'index.ts',
            formats: ['cjs'],
            fileName: 'index'
          },
          rollupOptions: {
            external: ['electron', ...builtinModules.flatMap(item => ([item, `node:${item}`]))]
          }
        },
      });
      ```
      
      和Main进程的配置差不多，只是换了一下入口，所以可以写成一个公共的配置，然后像 `webpack-merge` 那样去使用。
      
    - vite.renderer.config.ts

        ```ts
        import { defineConfig } from 'vite';
        import solidPlugin from 'vite-plugin-solid';
        import path from 'path';

        /** @type {import('vite').UserConfig} */
        export default defineConfig(({ mode }) => ({
          root: path.join(__dirname, '/src/renderer'),
          base: mode === 'development' ? '/' : './',
          plugins: [solidPlugin()],
          server: {
            port: 3000,
          },
          build: {
            target: 'esnext',
            emptyOutDir: true,
            outDir: path.join(__dirname, '/dist/renderer'),
          },
        }));

        ```
        
        Renderer 进程的配置文件基本不用动，在原模版提供的文件里改一下入口和打包后文件存放的位置，然后需要注意的是要根据环境来配置`base`项，因为构建成程序后是没有服务器的，所以`/xxx/xxx.js`这种路径无法获取到对应的文件，得改成`./`让资源路径变成：`./xxx/xxx.js`。
        
3. 编写启动脚本

    把启动脚本放在项目的bin目录下面：
    
    ```
    bin
     |- startUp.js
    ```

    ```js
    // startUp.js
    
    const { spawn } = require('child_process');
    const { createServer, build, createLogger } = require('vite');
    const path = require('path');
    const electronPath = require('electron');
    const colors = require('picocolors');

    const logger = createLogger('info');
    let electronMainProcess = null;


    const main = async () => {
      logger.info(colors.green('启动renderer进程开发服务器'));
      const server = await createServer({
        mode: 'development',
        configFile: path.join(__dirname, '../vite.renderer.config.ts')
      });
      await server.listen();

      logger.info(colors.green('构建preload.js文件'));
      await build({
        configFile: path.join(__dirname, '../vite.preload.config.ts'),
        build: {
          watch: {},
        },
        plugins: [
          {
            name: 'vite-plugin-electron-hmr',
            closeBundle: () => {
              logger.info(colors.green('preload.js文件构建完成'));
              server.ws.send({ type: 'full-reload' });
            }
          }
        ]
      });

      logger.info(colors.green('构建main进程文件'));
      build({
        configFile: path.join(__dirname, '../vite.main.config.ts'),
        build: {
          watch: {},
        },
        plugins: [
          {
            name: 'vite-plugin-electron-reload',
            closeBundle: () => {
              if (electronMainProcess) {
                electronMainProcess.kill();
              }

              logger.info(colors.green('main进程文件构建完成'));
              electronMainProcess = spawn(electronPath, ['.'], { stdio: 'inherit' });
            }
          }
        ]
      });
    }

    main();

    ```
    
    启动脚本的设计思路是：
    
    1. 启动 Renderer 进程的开发服务器，就像浏览器环境下进行开发时启动的服务器一样。
    2. 打包 Preload.js 相关的文件。
    3. 打包 Main 进程相关的文件。
    4. 打包完成 Main 进程相关的文件后启动 Electron。
    5. 启动完成 Electron 后，将 Electron 程序的进程保存起来。
    6. 当 Preload.js 文件的代码发生变化后，Vite会自动重新打包，因为配置了watch项，当重新构建之后，通过这句代码`server.ws.send({ type: 'full-reload' });`通知 Renderer 进程的服务器，进行刷新。
    7. 同样的 Main 进程的代码改变后也会重新构建，只不过 Main 进程的代码重新构建后需要重启整个应用，这也是为什么需要将 Electron 程序的进程保存起来的原因，当发现已经有 Electron 程序在运行的时候，现将程序的进程杀死，然后再重新启动一个 Electron 程序。


这样一来启动脚本就完成了，接下了需要去创建 Main 进程的入口文件和 Preload.js 文件

## 0x02 测试开发流程

上面步骤都完成后就需要测试一下开发流程能不呢正常跑起来了。

首先创建 Main 进程的入口文件

- src/main/index.ts

    ```ts
    import { app, BrowserWindow } from 'electron';
    import path from 'path';

    if (require('electron-squirrel-startup')) {
      app.quit();
    }

    const createWindow = (): void => {
      const mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        webPreferences: {
          preload: path.join(__dirname, '../preload/index.js'),
        },
      });

      if (app.isPackaged) {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
      } else {
        mainWindow.loadURL('http://localhost:3000');
      }

      mainWindow.webContents.openDevTools();
    };

    app.on('ready', createWindow);


    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });

    ```
    
    这里需要注意的是这一段代码：
    
    ```ts
    if (app.isPackaged) {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    } else {
        mainWindow.loadURL('http://localhost:3000');
    }
    ```
    
    这里判断了程序的环境，当在开发环境中就加载开发服务器的地址，当打包后则需要加载对应的文件。
    
    
    
- src/preload/index.ts


  ```ts
  import { contextBridge } from 'electron';

  contextBridge.exposeInMainWorld('myAPI', {
    desktop: true,
  })

  console.log('preload');
  ```
  
创建完上面的文件后，添加一个启动开发环境的命令

- package.json

   ```json
   "scripts": {
     "dev": "node ./bin/startUp.js",
   }
   ```
   
然后在终端输入：`yarn dev`，就可以愉快的进行开发了。


## 0x03 构建 Electron 程序

由于我现在还没写完整个程序，所以构建流程我只记录一下基本思路，后续完成之后再来更新。


首先下载 `npm-run-all` 这个包用于执行多个npm命令。

`yarn add npm-run-all -D`

配置打包脚本package.json：

```json
"script": {
    "build:main": "vite build -c ./vite.main.config.ts",
    "build:renderer": "vite build -c ./vite.renderer.config.ts",
    "build:preload": "vite build -c ./vite.preload.config.ts",
    "build": "run-p build:main build:renderer build:preload",
    "dist": "run-s build package",
    "package": "electron-forge package"
}
```

```json
"build": "run-p build:main build:renderer build:preload"
```

build命令指的是以并行的方式打包程序相关的代码。

```json
"dist": "run-s build package"
```

dist命令指的是按照顺序执行 `build` 和 `package`，也就是先打包源码，再构建程序。

要注意的是：

```
electron-forge package
```

构建出来的不是可以分发的程序，需要用 `electron-forge make`，这里只做演示用。
    

## 0x04 结语

这个开发流程和我在工作中使用的完全不同，感觉这次的更好一点，vite的体验确实要比webpack好。

在搭建项目的过程中参考了以下的资料：

- [electron-vite](https://cn-evite.netlify.app/)
- [Vite 整合 Electron 总结](https://zhuanlan.zhihu.com/p/377697508)

其中 *electron-vite* 这个脚手架和我工作中使用的方案很相似，只不过他用的是 *Vite*，当我看到 *electron-vite* 项目的时候，顿时感到了差距，我花了2年多的时间都没有把自己的流程整合成可以给别人使用的工具，而且还以为是我的独创，哈哈哈。

经过自己的摸索好处就是我看*electron-vite*项目的源码不是很费劲。