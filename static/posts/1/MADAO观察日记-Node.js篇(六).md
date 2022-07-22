---
title: 'MADAO观察日记-Node.js篇(六)'
labels: ['Node.js']
introduction: 'child_process 模块'
---

![post_blog_11_cover_1658479303289.jpeg](/static/images/posts/post_blog_11_cover_1658479303289.jpeg "post_blog_11_cover_1658479303289.jpeg")

## 环境

- node - v16.15.0

## 前言

时隔59天我终于又有时间写笔记了，最近真的是忙坏了，为了填以前留下的坑，疯狂加班。

进程是一个我之前很少接触到的东西，当我了解了 Node.js 的子进程功能后，在项目构建方面我的视野打开了不少，我在工作中做前端项目构建自动化的时候就顺手很多。

## 进程和线程

进程和线程是操作系统的概念，我在这方面的知识很贫瘠，所以这里的我记录的定义有可能是错误的，但是这是我能找到的最能让我理解的定义了：

- 进程：一个正在执行的程序，一个进程可以创建其他进程来执行多个任务，被创建的进程被称为子进程，进程与进程之间不共享资源。

- 线程：线程在进程中运行，一个进程可以有多个线程，一个进程中的线程共享该进程的资源。

进程让操作系统并发执行程序，线程则可以让程序并发执行任务。


## child_procsss


Node.js 中使用 child_procsss 模块来创建子进程，child_procsss 模块提供了7种方法来创建子进程：

1. spawn/spawnSync
2. exec/execSync
3. execFile/execFileSync
4. fork

从命名上就可以看出带有Sync的是同步的。

#### 1. spawn/spawnSync

spawn 方法会启动一个子进程来执行命令，执行结果需要使用事件监听的方式获得。

**e.g.**

```ts
import { spawn } from "child_process";

const p = spawn('ls', ['-a']);

p.stdout.on('data', (chunks) => console.log(`p spawn stdout: ${chunks.toString()}`));
p.stderr.on('data', (chunks) => console.log(`p spawn stderr: ${chunks.toString()}`));

```

如果是同步形式（spawnSync），则不需要通过事件监听来获取执行结果：

**e.g.**

```ts
import { spawnSync } from "child_process";

const p1 = spawnSync('pwd');
console.log(`p1 ${p1.stdout.toString()}`);
console.log(`p1 ${p1.stderr.toString()}`);
```

`spawn`方法不仅仅可以命令行里的命令，去执行一个文件，或者打开其他应用程序，比如我的QQ应用程序可执行文件的位置是：`/Applications/QQ.app/Contents/MacOS/QQ`，可以直接用 `spawn('/Applications/QQ.app/Contents/MacOS/QQ')`打开QQ的客户端。

#### 2. exec/execSync

exec 方法和 spawn 方法类似，也是启动一个子进程来执行命令，不同的是它的执行结果需要传入回调函数来获取，而且执行命令的参数传递方式也不同。

**e.g.**

```ts
import { exec, execSync } from 'child_process';

exec('ls -a', (error, data) => {
  if (error) {
    throw error;
  }

  console.log(data.toString());
});
```

从例子中可以看出 exec 方法中命令和命令参数是写在一起的，和 spawn 通过第二参数以数组的方式传递是不同的。


#### 3. execFile/execFileSync

execFile 会启动一个子进程来执行可执行文件，也是通过回调函数的方式获取执行结果。


```bash
#!/usr/bin/env bash

echo "Hello World !"
```

```ts
import { execFile } from 'child_process';

execFile('./echo.sh', (error, data) => {
  if (error) {
    throw error;
  }

  console.log(data.toString());
});

```

需要注意的一点是可执行文件的开头需要加上*shebang*，也就是例子中的`#!/usr/bin/env bash`，不同类型的文件需要加的*shebang*也不同，如果使用 Node 去执行，需要写成`#!/usr/bin/env node`。


execFile也是可以执行命令的：

```ts
execFile('node', ['--version'], (error, data) => {
  if (error) {
    throw error;
  }

  console.log(data.toString());
});
```

#### 4. fork

fork 方法也是启动一个子进程来执行命令，不同的是 fork 启动的子进程它是 Node 环境的子进程。

**e.g.**

```ts
import { fork } from 'child_process';

fork('./index.js');
```

例子中的

```ts
fork('./index.js')
```

就相当于

```ts
spawn('node', ['./index.js']);
```

如果执行同一个文件，对比一下这几种方法：

```ts
spawn('node', './index.js');

exec('node ./index.js', () => {});

execFile('./index.js', () => {});

fork('./index.js');
```


## 最后

Node.js 篇的笔记我就准备在这里结束了，准备开启新篇章，因为我发现我确实对网络编程不感兴趣，我入门前端的原因也是因为写前端可以所见即所得，但是当你学的越多就会发现仍然逃不开需要学习计算机基础，网络通信，服务器部署，项目构建这些东西，我觉得这些东西太消耗我对编程的热情了。

所以我要中断我的 Node.js 之旅，找找我感兴趣的方向。

希望可以在准备跳槽之前找到 Orz。
