---
title: 'MADAO观察日记-Node.js篇(二)'
labels: ['Node.js']
introduction: 'Node.js 中有关 File、Buffer、Stream 的知识点'
---

![post_blog_8_cover_1652871084353.jpeg](/static/images/posts/post_blog_8_cover_1652871084353.jpeg "post_blog_8_cover_1652871084353.jpeg")

## 前言

今天学习 Node.js 中有关 File、Buffer、Stream 的知识，学完之后实现一个 Todo List 的命令行工具。


## 环境

- Node.js: v16.15.0
- TypeScript: 4.6.4

## File System

Node.js 中提供了很多对文件操作的 API，对文件的操作就是：创建、删除、读取、写入，除此之外 Node.js 还提供了文件相关的事件，比如可以监听文件的变化。

关于文件的操作，Node.js 提供了4个版本的 API 供开发中使用，分别是：同步、异步、回调形式、Promise 化的 API。

异步版本的 API 通常以 Sync 结尾，Promise 化的 API 需要看 `fs/promises` 模块有没有提供，如果没有，则需要开发中使用 `util` 模块中的 `promisify` 方法进行转换。

### 1. fs.read / fs.write

- fs.read 用于读取文件
- fs.write 用于写入文件

使用这两个 API 之前，需要使用 `fs.open` 先打开文件。

**e.g.**

```ts
import fs from 'fs';
import EventEmitter from 'events';
import path from 'path';

const eventHub = new EventEmitter();

// 监听错误事件
eventHub.on('error', (error: Error) => {
  console.error(error.message);
});

// 关闭文件
eventHub.on('close', (fd: number) => {
  fs.close(fd, (error) => {
    if (error) {
      eventHub.emit('error', error);
      return;
    }

    console.log('fs.close', fd);
  })
});

// 读取文件
eventHub.on('open', (fd: number) => {
  fs.read(fd, (error, bytesRead, data) => {
    if (error) {
      eventHub.emit('error', error);
      return;
    }

    console.log('fs.read', data.toString())
    eventHub.emit('write', fd);
  });
});

// 写入文件
eventHub.on('write', (fd: number) => {
  fs.write(fd, '\n什么都别说，重复是你最好的选择', (error, written, data) => {
    if (error) {
      eventHub.emit('error', error);
      return;
    }

    console.log('fs.write', data.toString());
    eventHub.emit('close', fd);
  });
});

// 打开文件
fs.open(path.join(__dirname, './demo.txt'), 'r+', (error, fd) => {
  if (error) {
    eventHub.emit('error', error);
    return;
  }

  eventHub.emit('open', fd);
});

```

例子中的文件使用`r+`方式打开，`r+`表示打开文件进行读写。如果文件不存在，则会发生异常。所以需要先创建好demo.txt文件。

打开文件其他的方式文档有详细的说明：

[File system flags](https://nodejs.org/api/fs.html#file-system-flags)

还有一点要注意的是例子中的代码使用了*事件发布/订阅模式*来写的，这是因为用回调模式，很容易写出回调中嵌套回调，就是常说的回调地狱。

为了避免出现回调地狱，采用了*事件发布/订阅模式*


Node.js 还提供了同步版本的`fs.read`和`fs.write`，分别是：

- fs.readSync
- fs.writeSync

Promise版本则需要使用`util.promisify`进行转换

**e.g**

```ts
import util from 'util';

const fsRead = util.promisify(fs.read);
const fsWrite = util.promisify(fs.read);
```

### 2. fs.readFile / fs.writeFile

fs.readFile 和 fs.writeFile 也是用于读取和写入文件，它们和 fs.read / fs.write 不同的地方在于，使用时不需要先用`fs.open`打开文件，可以直接传入文件路径进行读取，就好像 `fs.open` + `fs.read/fs.write` 的结合版。

**e.g.**

```ts
import fs from 'fs';
import path from 'path';


fs.readFile(path.join(__dirname, './demo.txt'), 'utf8', (error, data) => {
  if (error) {
    throw error;
  }

  console.log('fs.readFile', data);
});

fs.writeFile(path.join(__dirname, './demo.txt'), '\n什么都别说，重复是你最好的选择', { flag: 'a' }, (error) => {
  if (error) {
    throw error;
  }

  console.log('fs.write');
});

```

当`fs.readFile`传人字符编码的时候，返回的内容就是字符串，否则返回Buffer。

这两个方法也提供了同步版本：

- fs.readFileSync
- fs.writeFileSync

Promise版本可以直接从`fs/promises`中导入。

### 3. fs.unlink

fs.unlink 用于删除文件，传入文件路径即可，它也有同步版本和 Promise 版，Promise 版从`fs/promises`中导入，同步版是：`fs.unlinkSync`。


以上就是文件的基本操作相关的 API，这里推荐两个第三方的库：

1. [fs-extra](https://www.npmjs.com/package/fs-extra)

    提供更好用的对文件、目录操作的 API
    
2. [chokidar](https://www.npmjs.com/package/chokidar)

    监听文件变化，当你在构建项目的时候有可能会用到。
    
    我曾经遇到过一个vite的bug，当使用`@vitejs/plugin-legacy` 插件的时候，vite 在 `build --watch` 模式下只输出`js`文件，所以我不得不自己监听文件变化，然后再打包。
    
    
    [bug详情](https://github.com/vitejs/vite/issues/6133)


## Buffer

Buffer 是用于处理二进制数据的对象，它的结构类似数组，里面的值是十六进制的两位数，即0～255。

**e.g.**

```ts
const buffer = Buffer.from('hello world', 'utf8');
console.log(buffer); // <Buffer 68 65 6c 6c 6f 20 77 6f 72 6c 64>
```

假如Buffer里面元素的值不在0~255之间：

1. 小于0的元素会逐次加256，直到得到一个0到255之间的整数。

2. 如果大于255，就逐次减256，直到得到0~255区间内的数值。

3. 如果是小数，则会舍弃小数部分。

**e.g.**

```ts
const buffer = Buffer.from('hello world', 'utf8');
buffer[0] = -1;
buffer[1] = 256;
buffer[2] = 3.14;
console.log(buffer); // <Buffer ff 00 03 6c 6f 20 77 6f 72 6c 64>
```

### 1. Buffer 和 字符串相互转换

- *Buffer.from(string[, encoding])* 将字符串转换为 Buffer

- *buffer.toString()*，将 Buffer 转换为字符串

**e.g**

```ts
const buffer = Buffer.from('男人变态有什么错', 'utf8');
const str = buffer.toString();

console.log(str);
```

### 2. Buffer 的拼接

当一长段 Buffer 被多次读取时，有可能会出现乱码的情况。

**e.g.**

demo1.txt 的内容是：*在虚构的故事当中寻求真实感的人脑袋一定有问题*

```ts
import fs from 'fs';
import path from 'path';

let chunks = '';
const rs = fs.createReadStream(path.join(__dirname, './demo1.txt'), { highWaterMark: 10 });

rs.on('data', (chunk) => {
  chunks += chunk;
});

rs.on('end', () => {
  console.log(chunks.toString()); // 在虚构���故事��中寻求真实感���人脑��一定有问题
});

```

以*流*的形式读取文件，*流*的概念后面说，这里就理解为没有一次性读取完文件，而是每次读取文件的一部分，分多次读取，例子代码中设置了每次读取的长度是10。

由于限制了每次读取的长度，有可能会导致 Buffer 在截断的部分无法正确编码，所以会显示`�`表示乱码。

例子中使用字符串拼接的方式将 Buffer 拼在一起，最终结果仍然有乱码，这里需要用 Buffer 对象提供的 `concat` 方法来进行拼接，每段 Buffer 需要存在数组中。

**e.g.**

```ts
const chunks: Buffer[] = [];
const rs = fs.createReadStream(path.join(__dirname, './demo1.txt'), { highWaterMark: 10 });

rs.on('data', (chunk) => {
  chunks.push(chunk as Buffer);
});

rs.on('end', () => {
  console.log(Buffer.concat(chunks).toString()); // 在虚构的故事当中寻求真实感的人脑袋一定有问题
});

```


## Stream

在 Node.js 中 Stream 是处理*流*数据的接口。

可以这样理解*流*数据：

假如有一个200MB大小的文件，但是我们不一次性全部读取完这个文件，而是每次读取一小部分，分多次读取，然后把每次读取到的数据拼接起来，得到完整的文件。每次读取的数据就是*流*数据，就好像在需要数据的一端和数据源之间连通了一个管道，让数据以水流的方式源源不断的从数据源流向需要数据的一端。

![blog_stream_1652243964611.png](/static/images/posts/blog_stream_1652243964611.png "blog_stream_1652243964611.png")

Stream 在处理大文件（大量数据）的时候十分有用。

**e.g.**

生成一个200MB左右的文件

```ts
// generateLargeFiles.ts

import fs from 'fs';
import path from 'path';

const main = () => {
  let counts = 1;

  const ws = fs.createWriteStream(path.join(__dirname, './largeFile.txt'));
  while (counts < 10000000) {
    ws.write(`这是第 ${counts} 行\n`);
    counts += 1;
  }

  ws.end();
  console.log('文件生成完毕');
};

main();

```

创建一个简单的 HTTP 服务器

```ts
import http from 'http';
import fs from 'fs';
import path from 'path';

const server = http.createServer();

server.on('request', (request, response) => {
  fs.readFile(path.join(__dirname, './largeFile.txt'), (error, data) => {
    if (error) {
      throw error;
    }

    response.end(data);
  })
});


server.on('listening', () => console.log('start'));
server.listen(5555);
```

启动这个服务

目前内存的使用情况


![WX20220511-171506@2x_1652675862279.png](/static/images/posts/WX20220511-171506@2x_1652675862279.png "WX20220511-171506@2x_1652675862279.png")


然后请求*curl http://localhost:5555*

这时候的内存使用：


![WX20220511-171652@2x_1652675872281.png](/static/images/posts/WX20220511-171652@2x_1652675872281.png "WX20220511-171652@2x_1652675872281.png")

改成Stream的形式

**e.g.**

```ts
const http = require('http');
const fs = require('fs');
const path = require('path');


const server = http.createServer();

server.on('request', (request, response) => {
  const ws = fs.createReadStream(path.join(__dirname, './largeFile.txt'));
  ws.pipe(response);
});


server.on('listening', () => console.log('start'));
server.listen(5555);

```

![WX20220516-123125@2x_1652675897382.png](/static/images/posts/WX20220516-123125@2x_1652675897382.png "WX20220516-123125@2x_1652675897382.png")

测试了几次，内存使用基本不会超过25MB。

这就是 Stream 的强大之处。

### Stream 的类型

Node.js 中 Stream 分为四种类型：

- Writable: 可写流
- Readable: 可读流
- Duplex: 即可读又可写的流
- Transform: 转换流

Node.js 中的很多模块都实现了 Stream 接口，比如上面例子中的 `response` 对象，这就是一个可写流，所以我们可以将读到的数据写进去。

#### 1. pipe

可读流可以发出两种事件：data、end

只要监听这两种事件，就可以把可读流里的数据写入可写流中。

**e.g.**

```ts
import { Readable, Writable } from 'stream';

const readable = new Readable();

readable.push('其实长谷川先生只是运气不好罢了');
readable.push('MADAO 总会开花的');
readable.push(null); // 数据填充完毕

const writable = new Writable({
  write (chunks, encoding, callback) {
    console.log(chunks.toString());
    callback();
  }
});

readable.on('data', (chunks) => {
  writable.write(chunks);
});
readable.on('end', () => {
  writable.end();
});
```

运行上面代码会依次打印出

```
其实长谷川先生只是运气不好罢了

MADAO 总会开花的
```

如果把上面用pipe来写：

**e.g.**

```ts
import { Readable, Writable } from 'stream';

const readable = new Readable();

readable.push('其实长谷川先生只是运气不好罢了');
readable.push('MADAO 总会开花的');
readable.push(null);

const writable = new Writable({
  write (chunks, encoding, callback) {
    console.log(chunks.toString());
    callback();
  }
});

readable.pipe(writable);
```

pipe 就相当于：

```ts
readable.on("data", chunk => {
  writable.write(chunk);
});

readable.on("end", () => {
  writable.end();
});
```

pipe 可以链式调用

```ts
a.pipe(b).pipe(c).pipe(d);

// 相当于

a.pipe(b)
b.pipe(c)
c.pipe(d)
```

这个方法和它的名字很像，就是在可读流和可写流之间开一个管道。

#### 2. Readable

Node.js 中默认实现的可读流模块的有：

- HTTP responses, on the client
- HTTP requests, on the server
- fs read streams
- zlib streams
- crypto streams
- TCP sockets
- child process stdout and stderr
- process.stdin

除了像上面例子中使用`push`添加数据之外，还可以在读数据的时候产生数据。

**e.g.**

```ts
import { Readable } from 'stream';

let charCode = 65;

const readable = new Readable({
  read(size) {
    const chunk = String.fromCharCode(charCode++);
    this.push(chunk);
    if (charCode >= 70) {
      this.push(null);
    }
  }
});

readable.pipe(process.stdout);
```

#### 静止态 & 流动态

1. 可读流默认情况下是静止态，静止态下可通过 `readable.read()` 读取数据。

2. 可读流可通过以下方式切换到流动态

    - 添加`data`事件
    - 调用`readable.resume`方法
    - 调用`readable.pipe`方法，将数据发送到可写流 

3. 可读流通过以下方式可从流动态切换到静止态

    - 调用`readable.pause`方法
    - 如果可读流有`pipe`连接，调用`readable.unpipe`
    
需要注意的是，当可读流处于流动状态的时候，需要有处理数据的对象，否则数据会丢失。


### 3. Writable

Node.js 中默认实现的可写流模块的有：

- HTTP requests, on the client
- HTTP responses, on the server
- fs write streams
- zlib streams
- crypto streams
- TCP sockets
- child process stdin
- process.stdout, process.stderr

结合可读流，可以实现一个重复用户输入的小脚本：

```ts
import { Writable } from 'stream';

const writable = new Writable({
  write: (chunk, encoding, callback) => {
    console.log(`你输入的是：${chunk.toString()}`);
    callback();
  }
});

process.stdin.pipe(writable);
```

Writable 有一个需要注意的地方是，当调用 `writable.write()` 的时候，有时候会返回`false`，当返回`false`的时候，表示数据发生积压，无法写入，需要监听`drain`事件，等`drain`事件触发才可以继续写入。


### 3. Duplex

Node.js 中默认 Duplex 流的模块有：

- TCP sockets
- zlib streams
- crypto streams

Duplex 是实现了*Readable*和*Writable*的流，一般翻译成双工流。

Duplex 流的读和写是独立的，互不干扰。


**e.g.**

```ts
import { Duplex } from 'stream';

let charCode = 65;

const duplex = new Duplex({
  read () {
    const chunk = String.fromCharCode(charCode);
    console.log(`读取 ${chunk}`);
    this.push(chunk);
    charCode++;
    if (charCode > 70) {
      this.push(null);
    }
  },
  write (chunk, encoding, callback) {
    console.log(`写入 ${chunk}`);
    callback();
  }
});

duplex.pipe(duplex);
```

一个双工流可以即写入又读取，这样不会报错，但是我不知道这样的使用姿势是否是正确的，只是用来举个例子。

### 4. Transform

Node.js 中默认实现了 Transform 流的模块有：

- zlib streams
- crypto streams


Transform 流可以将写入的数据进行转换再输出，所以它和双工流一样也支持即写入又读取。

**e.g.**

```ts
import { Transform } from 'stream';

const transform = new Transform({
  transform(chunk, encoding, callback) {
    console.log(`输入 ${chunk}`);
    const transformedChunk = chunk.toString().toUpperCase();
    console.log(`输出 ${transformedChunk}`);
    callback();
  }
});

process.stdin
  .pipe(transform)
  .pipe(process.stdout);
```

例子是一个可以将小写字母转换成大写字母的脚本，将 `process.stdin` 可读流中的数据输入进 `transform` 转换流，最后再将转换后的数据写入 `process.stdout` 输出流。


Stream 也是有 Promise 版本的，只要从 `stream/promises` 模块导出即可。

## Todo List

学习完了以上的基础知识后，做一个 Todo List 的命令行工具。

需要实现的功能有：

1. 查看所有的待办事项。
2. 添加、编辑、删除一个新的待办事项。
3. 批量添加、编辑、删除待办事项。
4. 清楚本地数据文件。
5. 展示帮助信息。


### 1. 项目简介

虽然是个很小的工具，但是还是要正规一点进行项目的搭建。

- 开发语言：TypeScript
- 打包工具：esbuild
- 主要依赖：

    - [commander](https://www.npmjs.com/package/commander)
    
      commander 是一个构建 Node.js 命令行工具的库，比如我们在用类似 `yarn --help` 这种命令的时候，会在终端输出大量的帮助信息，这种功能用 commander 可以很轻松的实现。
    
    
    - [inquirer](https://www.npmjs.com/package/inquirer)
    
      inquirer 是一个构建交互式命令行工具的库，比如我们在用 Vite 构建一个项目的时候，Vite 会问用户一些问题来初始化项目，这个库就是实现这种功能的。
      
- 项目目录
 
   ```
   |- lib // 存放 JavaScript 代码的目录
   |- bin // 存放可执行文件的目录
   |- config // 存放项目打包相关配置的目录
   |- docs // 存放文档的目录
   |- package.json
   ```
     
 - 功能
 
     1. 展示版本信息
     2. 展示所有待办事项
     3. 创建、更新、删除一个待办事项
     4. 批量创建待办事项
     5. 清理本地数据
     6. 输出帮助信息
     
### 2. 项目配置

- #### esbuild配置

    由于选择了 TypeScript 作为开发语言，所以需要打包工具来转换成 JavaScript，我选择了 esbuild 这个工具，主要是因为没用过，所以试试水。
    
    ```js
    // config/esbuild.js
    
    const esbuild = require('esbuild');
    const path = require('path');
    const { nodeExternalsPlugin } = require('esbuild-node-externals');

    esbuild.build({
      entryPoints: [
        path.join(__dirname, '../lib/cli.ts'),
      ],
      outfile: path.join(__dirname, '../bin/cli.js'),
      bundle: true,
      minify: true,
      platform: 'node',
      target: 'node16',
      plugins: [
        nodeExternalsPlugin(),
      ],
    });

    ```
    
    配置项说明：
    
    1. entryPoints - 入口
    2. outfile - 打包后的文件名
    3. bundle - 将所有文件打包成一个文件
    4. minify - 压缩代码
    5. platform - 代码运行环境
    6. target - 兼容性
    7. plugins - 插件
    8. nodeExternalsPlugin - 不打包 node_modules 中的模块。
    
    
- #### TypeScript 配置

    因为 esbuild 不进行 TypeScript 的类型检查，所以需要使用 TypeScript 自己来检查类型。
    
    ```bash
    yarn add typescript -D
    
    yarn tsc --init // 创建 TypeScript 配置文件
    ```
    
    创建配置文件之后，修改以下几项：
    
    ```json
    {
        "compilerOptions": {
            "declaration": "true",
            "emitDeclarationOnly": "true",
            "resolveJsonModule": true,
        },
        "include": [
            "./**/*.ts"
        ],
        "exclude": [
            "node_modules"
         ]
    }
    ```
    
    这样配置了之后 *tsc* 就只会检查类型 + 生成 *d.ts* 类型声明文件。
    
- #### 打包命令配置 和 可执行文件路径

    在 package.json 中添加打包命令

    ```json
    
    "scripts": {
      "es:build": "node ./config/esbuild.js",
      "ts:check": "tsc --p ./tsconfig.json",
      "build": "yarn ts:check && yarn es:build"
    },
    "bin": {
        "t": "./bin/cli.js"
    }
    ```
    
### 3. 功能实现


#### 1. 获取工具的版本信息

```ts
#!/usr/bin/env node

// lib/cli.ts

import { program } from 'commander';

import { version } from '../package.json';

program
  .name('todo-list')
  .description('一个简单的待办事项命令行工具')
  .version(version);

program.parse();

```

注意的是文件第一行需要有 *shebang* 信息。

可以选择执行打包之后的js文件，也可以使用 ts-node 直接执行原文件，这里我用ts-node举例。

```bash
yarn ts-node ./lib/cli.ts --version  // 1.0.0
```

执行得到的结果就是*package.json*文件中的*version*字段。

如果执行

```hash
yarn ts-node ./lib/cli.ts --help
```

则会得到以下结果：

```
Usage: todo-list [options]

一个简单的待办事项命令行工具

Options:
  -V, --version  output the version number
  -h, --help     display help for command
```

#### 2. 添加待办事项

```ts
// lib/cli.ts

program
  .command('add')  // 命令名称
  .description('添加一个待办事项') // 命令名称描述
  .argument('[name]', '待办事项的名称') // 待办事项名称，可选参数
  .argument('[description]', '待办事项的简短描述') // 待办事项描述，可选参数
  .option('-m, --multiple <number>', '添加多个') // 添加多个待办事项，需要传入添加的数量
  .action((name: string, description?: string, option?: { multiple: string }) => {  // 添加待办事项的实现方法
    console.log(name, description, option);
  });
```

- 在文档中：
    - `<>`包裹起来的参数代表必传参数
    - `[]`包裹起来的参数代表可选参数

上面就是添加待办事项命令的代码，接下来实现具体添加待办事项的代码。


```ts
// lib/action.ts

import inquirer from 'inquirer';

export const addTodoItems = (name?: string, description?: string, option?: { multiple: string }) => {
  // 不通过问答的方式添加
  if (name) {
    return;
  }

  // 问答式
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: '请输入待办事项的名字（必传）：',
        validate: (name: string) => {
          if (!name) {
            return '请输入待办事项的名字';
          }

          return true;
        },
      },
      { type: 'input', name: 'description', message: '请输入待办事项的描述（可选）：', default: '' },
      { type: 'number', name: 'number', message: '请输入添加的数量（可选）：', default: 1 },
    ])
    .then((value: {
      name: string;
      description?: string;
      number: number;
    }) => {
      console.log(value)
    })
};
```

问答式的效果就和常用的一些脚手架工具一样，会让你输入或者进行选择，就不用记那么多的命令参数了。

![WX20220517-171524@2x_1652779003581.png](/static/images/posts/WX20220517-171524@2x_1652779003581.png "WX20220517-171524@2x_1652779003581.png")

接下来实现具体的添加方法

```ts
// lib/db.ts

import fsPromises from 'fs/promises';
import os from 'os';
import path from 'path';

// 待办事项的类型
export type TodoList = {
  name: string;
  description: string;
  done: boolean;
  updatedAt: string;
  createdAt: string;
  completedAt: string;
}[];

// 存在本地的文件路径
export const storagePath = path.join(process.env.HOME || os.homedir(), '.todo_list');

export const write = async (todoItem: Partial<TodoList[number]>, length = 1) => {
  const timestamp = new Date().toLocaleDateString();
  const data = new Array(length).fill({
    ...todoItem,
    done: false,
    updatedAt: timestamp,
    createdAt: timestamp,
    completedAt: '',
  });
  return fsPromises.writeFile(storagePath, JSON.stringify(data));
};
```

```ts diff
// lib/action.ts
import inquirer from 'inquirer';
import ora from 'ora';

import { write } from './db';

export const addTodoItems = async (name?: string, description?: string, option?: { multiple: string }) => {
  spinner.info('添加待办事项');
  try {
    // 不通过问答的方式添加
    if (name) {
      spinner.start('添加中...');
      await write({ name, description }, option?.multiple ? parseInt(option.multiple, 10) : undefined);
      spinner.succeed('添加成功!');
      return;
    }

    // 问答式
    await inquirer
      .prompt([
        {
          type: 'input',
          name: 'name',
          message: '请输入待办事项的名字（必传）：',
          validate: (name: string) => {
            if (!name) {
              return '请输入待办事项的名字';
            }

            return true;
          },
        },
        { type: 'input', name: 'description', message: '请输入待办事项的描述（可选）：', default: '' },
        { type: 'number', name: 'number', message: '请输入添加的数量（可选）：', default: 1 },
      ])
      .then((value: { name: string; description: string; number: number; }) => {
        spinner.start('添加中...');
        return value;
      })
      .then(value => write({ name: value.name, description: value.description }, value.number))
      .then(() => spinner.succeed('添加成功!'));
  } catch (error) {
    spinner.fail(`添加失败: ${(error as Error).message}`)
  }
};
```

action.ts 中除了引入`write`方法，还增加了*ora*这个库，它是一个用于在终端上展示信息的一个库，但是有一个坑就是你如果用 `ora@v6.x` 版本，在 `TypeScript@4.6.x` 版本上是无法使用的，需要使用`ora@5.x`版本。

详情[Can't compile from typescript](https://github.com/sindresorhus/ora/issues/207)。

现在看一下效果：

![WX20220518-113401@2x_1652844859910.png](/static/images/posts/WX20220518-113401@2x_1652844859910.png "WX20220518-113401@2x_1652844859910.png")

但是现在存在一个问题：

- 每次添加都会把之前添加的任务覆盖

因为我存的是JSON格式的数据，我搜了一下好像没有特别好的办法使用*追加模式*写入文件，都是先读出来，然后修改数据再添加进去，所以现在就需要一个读取数据的方法。


#### 3. 展示待办事项

现在要实现读取待办事项的方法，顺便也将展示的功能一起实现。

```ts
// lib/db.ts

// 之前代码不变

import fs from 'fs';

// 检查本地文件是否存在
const checkFile = async () => {
  const isExisted = await fsPromises.stat(storagePath)
    .then(stats => stats.isFile())
    .catch(() => false);

  return isExisted;
};


// 用Stream的方式读取文件
export const read = async () => {
  const isExisted = await checkFile();

  if (!isExisted) {
    return [];
  }

  return new Promise<TodoList>((resolve, reject) => {
    const readable = fs.createReadStream(storagePath);
    let chunks: Buffer[] = [];
    readable.on('error', (error) => {
      reject(error);
    });

    readable.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    readable.on('end', () => {
      resolve(JSON.parse(Buffer.concat(chunks).toString()));
    });
  });
};
```

```ts
// lib/db.ts

// 修改write方法

export const write = async (todoItem: Partial<TodoList[number]>, length = 1) => {
  const oldData = await read();
  const timestamp = new Date().toLocaleDateString();
  const data = new Array(length).fill({
    ...todoItem,
    done: false,
    updatedAt: timestamp,
    createdAt: timestamp,
    completedAt: '',
  });
  return fsPromises.writeFile(storagePath, JSON.stringify(oldData.concat(data)));
};
```

这样改完之后新添加的待办事项就不会覆盖之前的了。

接下来是展示待办事项列表

```ts
// lib/action.ts

// 之前代码不变

import { write, read } from './db';

export const showTodoList = () => {
  spinner.start('查询中...');
  read()
    .then(todoList => {
      if (todoList.length) {
        spinner.succeed('所有待办事项');
        todoList.forEach(todoItem => {
          console.log("=".repeat(20));
          console.log(`待办事项：${todoItem.name}`);
          console.log(`描述：${todoItem.description || ""}`);
          console.log(`状态：${todoItem.done ? "完成" : "未完成"}`);
          console.log(`创建日期：${todoItem.createdAt}`);
          console.log(`更新日期：${todoItem.updatedAt}`);
          console.log(`完成日期：${todoItem.completedAt}`);
        });
        return;
      }

      spinner.prefixText = '🍙';
      spinner.text = '暂无待办事项';
      spinner.stopAndPersist();
    })
    .catch(error => spinner.fail(`查询异常: ${error.message}`));
};
```

```ts
// lib/cli.ts

// 之前代码不变
import { addTodoItems, showTodoList } from './action';

program
  .command('list')
  .description('展示待办事项')
  .action(showTodoList);
```

测试一下：

![WX20220518-142545@2x_1652855187758.png](/static/images/posts/WX20220518-142545@2x_1652855187758.png "WX20220518-142545@2x_1652855187758.png")


#### 4. 编辑待办事项

编辑待办事项用问答的方式进行编辑，也是很简单。

首先写好选项

```ts
// lib/action.ts

// 之前的代码不变

export const editTodoList = async () => {
  spinner.info('编辑待办事项');
  try {
    const todoList = await read();
    inquirer
      .prompt([{
        name: 'index',
        type: 'rawlist',
        message: '请选择你要操作的待办事项',
        choices: todoList.map((todoItem, index) => ({
          name: `${todoItem.name}-${todoItem.done ? '已完成' : '未完成'}`,
          value: index
        }))
      }])
      .then(value => console.log(value))
  } catch (error) {
    spinner.fail(`编辑异常: ${(error as Error).message}`);
  }
};
```

然后添加`edit`命令

```ts
// lib/cli.ts

import { addTodoItems, showTodoList, editTodoList } from './action';

program
  .command('edit')
  .description('编辑待办事项')
  .action(editTodoList);
```

现在的效果是：


![WX20220518-151517@2x_1652858165341.png](/static/images/posts/WX20220518-151517@2x_1652858165341.png "WX20220518-151517@2x_1652858165341.png")

可以上下键进行选择，也可以输入数字进行选择。

接下来还需要写一个问题列表，因为编辑可以改标题、描述、状态也可以进行删除，所以需要用户进行选择。

```ts
// lib/action.ts

const askForAction = () => inquirer
  .prompt([{
    name: 'action',
    type: 'list',
    choices: [
      { name: '返回', value: 'goBack' },
      { name: '修改标题', value: 'changeTitle' },
      { name: '修改描述', value: 'changeDesc' },
      { name: '已完成', value: 'done' },
      { name: '未完成', value: 'undone' },
      { name: '删除', value: 'delete' },
    ],
  }])
  .then(value => value.action);

export const editTodoList = async (isRepeated: boolean = false) => {
  if (!isRepeated) {
    spinner.info('编辑待办事项');
  }

  try {
    const todoList = await read();
    let index = -1;
    inquirer
      .prompt([{
        name: 'index',
        type: 'rawlist',
        message: '请选择你要操作的待办事项',
        choices: todoList.map((todoItem, index) => ({
          name: `${todoItem.name}-${todoItem.done ? '已完成' : '未完成'}`,
          value: index
        }))
      }])
      .then(value => {
        // 保存选中的index，并询问用户下一步操作
        index = value.index;
        return askForAction();
      });
  } catch (error) {
    spinner.fail(`编辑异常: ${(error as Error).message}`);
  }
};

```

`askForAction` 中有一个返回选项，我在*inquirer*的文档里找了半天没找到相关的说明，我这里的做法就是如果用户选择返回，我就再调一遍`editTodoList`，同时添加一个`isRepeated`参数来控制文案的显示。

然后实现获取新待办事项的方法

```ts
// lib/action.ts

// 其他代码保持不变

const getNewTodoItem = async (params: {
  action: 'changeTitle' | 'changeDesc' | 'done' | 'undone' | 'delete',
  index: number,
}) => {
  const item = (await read(params.index))[0];
  const timestamp = new Date().toLocaleDateString();
  item.updatedAt = timestamp;
  switch (params.action) {
    case 'changeTitle':
      const name = await inquirer.prompt([{
        name: 'name',
        type: 'input',
        message: '请输入新的标题',
        default: item.name
      }]).then(value => value.name);
      return {
        ...item,
        name
      };

    case 'changeDesc':
      const description = await inquirer.prompt([{
        name: 'desc',
        type: 'input',
        message: '请输入新的描述',
        default: item.description
      }]).then(value => value.desc);
      return {
        ...item,
        description,
      };

    case 'done':
      return {
        ...item,
        done: true,
        completedAt: timestamp,
      };

    case 'undone':
      return {
        ...item,
        done: true,
        completedAt: '',
      };

    case 'delete':
      return null;

    default:
      break;
  }
}

export const editTodoList = async (isRepeated: boolean = false) => {
  if (!isRepeated) {
    spinner.info('编辑待办事项');
  }

  try {
    const todoList = await read();
    let index = -1;
    inquirer
      .prompt([{
        name: 'index',
        type: 'rawlist',
        message: '请选择你要操作的待办事项',
        choices: todoList.map((todoItem, index) => ({
          name: `${todoItem.name}-${todoItem.done ? '已完成' : '未完成'}`,
          value: index
        }))
      }])
      .then(value => {
        index = value.index;
        return askForAction();
      })
      .then(action => {       // 新增部分
        if (action === 'goBack') {
          editTodoList(false);
          return;
        }

        return getNewTodoItem({ index, action })
      });
  } catch (error) {
    spinner.fail(`编辑异常: ${(error as Error).message}`);
  }
};
```

最后一步就是更新待办事项了，之前写的`write`方法只能添加，不能更新，需要改成支持更新的方法：

```ts
// lib/db.ts

export const write = async (todoItem: Partial<TodoList[number]> | null, length = 1, index?: number) => {
  const oldData = await read();
  const timestamp = new Date().toLocaleDateString();
  const isUpdate = index !== undefined;
  let data = [];
  if (isUpdate) {
    if (todoItem === null) {
      oldData.splice(index, 1);
    } else {
      oldData.splice(index, 1, todoItem as TodoList[number]);
    }
  } else {
    data = new Array(length).fill({
      ...todoItem,
      done: false,
      updatedAt: timestamp,
      createdAt: timestamp,
      completedAt: '',
    });
  }

  return fsPromises.writeFile(storagePath, JSON.stringify(isUpdate ? oldData : oldData.concat(data)));
};
```

然后实现 `updateTodoList` 方法

```ts
// lib/action.ts

import type { TodoList } from './db';

const updateTodoList = (params: {
  index: number;
  item: TodoList[number] | null | undefined;
}) => {
  if (params.item === undefined) {
    return;
  }

  return write(params.item, 1, params.index);
};

export const editTodoList = async (isRepeated: boolean = false) => {
  if (!isRepeated) {
    spinner.info('编辑待办事项');
  }

  try {
    const todoList = await read();
    let index = -1;
    inquirer
      .prompt([{
        name: 'index',
        type: 'rawlist',
        message: '请选择你要操作的待办事项',
        choices: todoList.map((todoItem, index) => ({
          name: `${todoItem.name}-${todoItem.done ? '已完成' : '未完成'}`,
          value: index
        }))
      }])
      .then(value => {
        index = value.index;
        return askForAction();
      })
      .then(action => {
        if (action === 'goBack') {
          editTodoList(false);
          return;
        }

        return getNewTodoItem({ index, action })
      })
      .then(item => updateTodoList({ index, item })) // 新增部分
      .then(() => { // 新增部分
        spinner.succeed('操作完成');
        editTodoList(false);
      })
  } catch (error) {
    spinner.fail(`编辑异常: ${(error as Error).message}`);
  }
};
```

这样核心功能就完成了。

再加一点小功能：

1. 显示本地存储路径


```ts
// lib/action.ts

import { write, read, storagePath, remove } from './db';

export const printStoragePath = () => {
  spinner.info(`储存路径: ${storagePath}`);
};
```

```ts
// lib/cli.ts
import { addTodoItems, showTodoList, editTodoList, printStoragePath } from './action';

program
  .command('path')
  .description('显示本地储存路径')
  .action(printStoragePath);
```

2. 清除本地数据

```ts
// lib/db.ts

export const remove = async () => {
  const isExisted = await checkFile();

  if (!isExisted) {
    return true;
  }

  return fsPromises.unlink(storagePath);
};
```

```ts
// lib/action.ts

export const clearTodoList = async () => {
  spinner.start('清除中...');
  try {
    await remove()
    spinner.succeed('清除成功');
  } catch (error) {
    spinner.fail(`清除失败: ${(error as Error).message}`);
    spinner.fail(`请手动删除: ${storagePath}`);
  }
}
```

```ts
// lib/cli.ts

import {
  addTodoItems,
  showTodoList,
  editTodoList,
  printStoragePath,
  clearTodoList,
} from './action';

program
  .command('clear')
  .description('清除本地数据')
  .action(clearTodoList);
```

到这里所有功能就完成了，如果发布到npm，使用的时候就直接用 `t` 命令就可以了，这个也是在package.json中配置的。

[完整代码](https://github.com/GreedyWhale/code-examples/tree/main/node/chapter2/todo-list)


![WX20220518-184427@2x_1652870838129.png](/static/images/posts/WX20220518-184427@2x_1652870838129.png "WX20220518-184427@2x_1652870838129.png")

## 参考

[File system flags](https://nodejs.org/api/fs.html#file-system-flags)

[stream](https://nodejs.org/api/stream.html#stream)

[Node’s Streams](https://jscomplete.com/learn/node-beyond-basics/node-streams)

