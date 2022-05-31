---
title: 'MADAO观察日记-Node.js篇(四)'
labels: ['Node.js']
introduction: '使用 Node.js 进行网络编程 - HTTP、HTTPS'
---

![post_blog_10_cover_1653898951578.jpeg](/static/images/posts/post_blog_10_cover_1653898951578.jpeg "post_blog_10_cover_1653898951578.jpeg")

## 前言

上一篇记录了在 Node.js 中如何创建 TCP 和 UDP 的服务器，我个人目前在工作和个人项目中，遇到需要这方面知识的场景都很少，但是再往上一层，需要用到有关 HTTP 或者 HTTPS 相关知识的场景就很多了，最基础的前后端通信项目的热更新以及自己搭建 Web 服务器，都要用到这些知识，今天就来总结下Node.js 中有关 HTTP、HTTPS 的知识。

## HTTP

HTTP 协议全程叫超文本传输协议，用于在万维网上传输类似 HTML 文件、图像、视频、音频等资源的一个协议，目前的标准是 HTTP/2，但是现在大部分网站用的协议还是 HTTP/1.1。

面试中也是经常被问到 HTTP/1 和 HTTP/2 有什么区别，我是觉得这种问题很难回答，因为大部分网站仍然使用 HTTP/1.1 版本，所以这里就记录一下 HTTP/1.1 和 HTTP/2 的区别：

*1. HTTP 1.1 管道 / HTTP 2 多路复用*

   HTTP/1.1 协议有一个管道机制，允许客户端批量发送请求到服务端，但是服务端响应需要按照请求到达服务端的顺序响应，这就存在一个问题，当前一个响应处理非常的慢的时候，会影响到后续的所有响应，这种情况有一个专业术语叫做*队头阻塞*，为了解决这个问题，HTTP/2使用了一个叫做多路复用的机制，它给传输的每个数据块增加了一个用于记录这个数据块属于哪个请求的东西，叫做数据帧（frame），这样就可以让服务端在响应的时候不用按照请求的顺序进行响应了，浏览器根据数据帧里的标识来组合响应结果，这样就避免了队头阻塞的问题。
    
*2. HTTP 1.1 使用纯文本进行数据传输 / HTTP 2 使用二进制格式进行数据传输*

*3. HTTP/2 对请求头进行了压缩*

*4. HTTP/2 支持服务端推送*

*5. 目前主流浏览器只支持经TLS加密的HTTP/2，也就说想要用 HTTP/2 版本，必须要用 HTTPS 协议*



在 Node.js 中创建一个 HTTP 服务器非常简单。

**e.g.**

```ts
import http from 'http';

const server = http.createServer();

server.on('request', (req, res) => {
  res.end('hi');
});

server.listen(1111, () => console.log('listening'));
```

然后用 curl 命令发送一个请求。

![WX20220526-103339@2x_1653532460954.png](/static/images/posts/WX20220526-103339@2x_1653532460954.png "WX20220526-103339@2x_1653532460954.png")

http 模块是实现了 Stream 接口的模块，req在服务端是可读流，res 在服务端是可写流。

- req 是 request 的缩写，这个对象包含这次请求相关的方法和属性

- res 是 response 的缩写，这个对象包含了这次请求响应相关的方法和属性。


### 1. request 对象

通过 req 对象，可以对不同请求地址返回不同的响应：

**e.g.**

```ts
import http from 'http';

const server = http.createServer();

server.on('request', (req, res) => {
  console.log(req.url);
  switch(req.url) {
    case '/hi':
      res.end('hi');
      break;
    case '/bye':
      res.end('bye');
      break;
    default:
      res.end('接下来才是真正的地狱');
      break;
  }
});

server.listen(1111, () => console.log('listening'));
```

上面的代码只适用于 url 上没有携带参数的情况，假设url携带参数需要对url进行解析：


```ts
import http from 'http';
import { URL } from 'url';

const server = http.createServer();

server.on('request', (req, res) => {
  // 解析url
  const url = new URL(req.url || '', 'http://localhost:1111');
  console.log('url', url);
  
  switch(req.url) {
    case '/hi':
      res.end('hi');
      break;
    case '/bye':
      res.end('bye');
      break;
    default:
      res.end('接下来才是真正的地狱');
      break;
  }
});

server.listen(1111, () => console.log('listening'));
```

使用 `curl http://localhost:1111/bye\?name\=allen -v` 去请求，在服务端可以得到这样一个 URL 对象：

```ts
{
  href: 'http://localhost:1111/bye?name=allen',
  origin: 'http://localhost:1111',
  protocol: 'http:',
  username: '',
  password: '',
  host: 'localhost:1111',
  hostname: 'localhost',
  port: '1111',
  pathname: '/bye',
  search: '?name=allen',
  searchParams: URLSearchParams { 'name' => 'allen' },
  hash: ''
}
```

*search*部分就是携带的在 url 上的数据，switch 语句中*req.url*其实应该是*pathname*，但是也要注意restful 风格的 API，这种 API 的设计一般都是：

`/user/get`、`/user/update`、`/user/create/1`，直接把操作和数据写在*pathname*部分，所以还要对*pathname*进行解析，我目前想到的方案就是用正则去解析，不过一般的服务端框架都会支持这些解析，不用开发者处理。

还有一种携带数据的方式就是写在请求体里，比如 POST 请求一般会把数据写在请求体里，这种数据需要通过事件监听的方式获取。

```ts
import http from 'http';
import { URL } from 'url';

const server = http.createServer();

server.on('request', (req, res) => {
  const url = new URL(req.url || '', 'http://localhost:1111');

  const data: Buffer[] = [];

  req.on('data', chunk => {
    data.push(chunk);
  });

  req.on('end', () => {
    Buffer.concat(data);
    console.log('data', data.toString());
  });

  switch(url.pathname) {
    case '/hi':
      res.end('hi');
      break;
    case '/bye':
      res.end('bye');
      break;
    default:
      res.end('接下来才是真正的地狱');
      break;
  }
});

server.listen(1111, () => console.log('listening'));
```

然后通过 curl 命令来测试下：

```bash
curl -X POST http://localhost:1111 -H "Content-Type: application/json" -d '{"name": "allen", "age": 25}'
```


除了`req.url`之外还有一个常用的属性是`req.method`也就是请求方法，用法和`req.url`类似，都是根据方法的不同来决定处理逻辑。

### 2. response 对象

response 对象用于处理器响应相关的逻辑，它是一个可写流所以它可以用`write`写数据进去，当处理完服务端的逻辑后需要调用`res.end`方法来结束连接。

```ts
import http from 'http';

const server = http.createServer();

server.on('request', (req, res) => {
  res
    .writeHead(200, {
      'content-type': 'application/json; charset=UTF-8',
      'cache-control': 'public, max-age=60000'
    })
    .end(JSON.stringify({ message: 'Restlessness' }));
});

server.listen(1111, () => console.log('listening'));
```

例子中使用`writeHead`设置响应状态码和响应头，除了这种方式还可以单独使用`res.statusCode = xxx`来设置状态码，然后用 `res.setHeader` 来设置响应头，`res.setHeader`可以调用多次，从例子中也可以看出`res`还支持链式调用。


这里需要说一下HTTP请求中的缓存控制：

- 协商缓存：需要客户端发出请求询问服务端资源是否过期，如果过期则返回新资源，如果未过期则继续使用本地缓存。

    协商缓存通过响应头中的：*Last-Modified* 和 *ETag* 字段控制。
    
    - Last-Modified、If-Modified-Since
    
        Last-Modified表示资源最后修改的时间，当一个资源的响应头中携带该字段，浏览器在下次请求会自动带上*If-Modified-Since*请求头，然后服务端会对比这两个时间，如果没变服务器直接返回*304*状态码，浏览器就会使用缓存，如果变了则返回新的资源。
    
    - Etag、If-None-Match
    
        Etag 是文件的标识符，服务器根据资源内容生成 Etag，当资源内容发生变化时，重新生成 Etag，如果响应头中有 Etag，浏览器会在下次请求该资源的时候带上*If-None-Match*请求头，服务器就可以通过对比这两个字段的值来决定是返回304还是新的资源。

- 强制缓存：客户端不发出请求询问服务端，在未到达设置的过期时间内，直接使用本地缓存。

    强制缓存通过*Expires*和*Cache-Control*响应头控制。
    
    - Expires：资源过期时间，在这个时间之前表示本地缓存都是有效的。
    
    - Cache-Control：Cache-Control也是表示资源过期时间，只不过这个时间是相对时间，相对于上一次请求该资源经过的秒数，比如设置max-age=3600表示该资源的缓存在距离上次请求的3600秒之内都是有效的。


### 3. HTTP服务端事件

当使用 HTTP 模块创建服务端的时候有以下几个事件：

- checkContinue

- checkExpectation

- clientError

- close

- connect

- connection

- request

- upgrade

#### 1. checkContinue

如果客户端请求头部携带了`Expect: 100-continue`字段，服务端就会触发`checkContinue`这个事件，如果没有监听，Node.js 会自动响应 `100 Continue`，客户端在接收到带有这个响应后会继续发起请求，当`checkContinue`事件触发时，`request` 事件是不会触发的。

**e.g.**

```ts
import http from 'http';

const server = http.createServer();

server.on('checkContinue', (req, res) => {
  console.log('checkContinue 触发');
  res.writeContinue();
  res.end('hi');
});

server.listen(1111, () => console.log('listening'));

```

使用 curl 测试：

```
curl -H 'Expect: 100-continue' http://localhost:1111 -v
```

得到结果：

```bash
*   Trying 127.0.0.1:1111...
* Connected to localhost (127.0.0.1) port 1111 (#0)
> GET / HTTP/1.1
> Host: localhost:1111
> User-Agent: curl/7.79.1
> Accept: */*
> Expect: 100-continue # 请求携带 Expect
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 100 Continue # 响应 100 Continue
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< Date: Fri, 27 May 2022 08:53:18 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5
< Content-Length: 2
< 
* Connection #0 to host localhost left intact
hi%                           
```


#### 2. checkExpectation

如果客户端请求头部携带了`Expect`请求头，但是值不是`100 Continue`的时候会触发这个事件，如果不监听 Node.js 会默认响应 `417 Expectation Failed`。

还是用`checkContinue`的例子，直接用curl测试：

```
curl -H 'Expect: hhh' http://localhost:1111 -v
```

会得到：

```bash
*   Trying 127.0.0.1:1111...
* Connected to localhost (127.0.0.1) port 1111 (#0)
> GET / HTTP/1.1
> Host: localhost:1111
> User-Agent: curl/7.79.1
> Accept: */*
> Expect: hhh # Expect请求头
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 417 Expectation Failed # 默认响应
< Date: Fri, 27 May 2022 09:08:42 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5
< Transfer-Encoding: chunked
< 
* Connection #0 to host localhost left intact
```

#### 3. clientError

当客户端连接发出`error`事件时会被传递到服务端触发`clientError`事件，但是我不知道如何模拟这种情况，注意的一点是文档上的这段话。

> When the 'clientError' event occurs, there is no request or response object, so any HTTP response sent, including response headers and payload, must be written directly to the socket object. Care must be taken to ensure the response is a properly formatted HTTP response message.

> 当'clientError'事件发生时，没有请求或响应对象，所以发送的任何HTTP响应，包括响应头和有效载荷，必须直接写入套接字对象。必须注意确保响应是一个正确格式的HTTP响应消息。


#### 4. close

服务关闭的时候触发改事件。

**e.g.**

```ts
import http from 'http';

const server = http.createServer();

server.on('close', () => {
  console.log('close 触发了');
});

server.on('request', (req, res) => {
  if (req.url === '/bye') {
    server.close();
    res.end('bye');
    return;
  }

  res.end('hi');
})

server.listen(1111, () => console.log('listening'));
```

#### 5. connect

当客户端发送方法为`CONNECT`的请求时，会触发该事件。

```ts
// server.ts

import http from 'http';

const server = http.createServer();

server.on('connect', (req, socket, head) => {
  console.log('connect 触发');
});

server.listen(1111, () => console.log('listening'));
```

```ts
// client.ts

import http from 'http';

const req = http.request({
  method: 'CONNECT',
  host: 'localhost',
  port: 1111,
  path: 'http://www.baidu.com',
});

req.end();
```

执行`client.ts`就会触发这个事件，这只是一个很简单的例子，官网上有一个详细的例子。

源码：[HTTP connect](https://nodejs.org/api/http.html#event-connect)

```ts
import http from 'http';
import { URL } from 'url';
import net from 'net';

const proxy = http.createServer();

proxy.on('connect', (req, clientSocket, head) => {
  const { host, port } = new URL(`http://${req.url!}`);
  const serverSocket = net.connect(Number(port || 80), host, () => {
    clientSocket.write(
      'HTTP/1.1 200 Connection Established\r\n' +
      'Proxy-agent: Node.js-Proxy\r\n' +
      '\r\n'
    );

    serverSocket.write(head);
    clientSocket.pipe(serverSocket);
    serverSocket.pipe(clientSocket);
  });
});

proxy.listen(1111, () => {
  const req = http.request({
    port: 1111,
    host: 'localhost',
    method: 'CONNECT',
    path: 'www.baidu.com:80'
  });

  req.on('connect', (res, socket, head) => {
    console.log('got connected!');

    socket.write(
      'GET / HTTP/1.1\r\n' +
      'Host: www.baidu.com:80\r\n' +
      'Connection: close\r\n' +
      '\r\n'
    );
    socket.on('data', (chunk) => {
      console.log(chunk.toString());
    });
    socket.on('end', () => {
      proxy.close();
    });
  });

  req.end();
});

```

这个确实例子确实可以代理成功，其中让我最难理解的代码是这部分：

```ts
serverSocket.write(head);
clientSocket.pipe(serverSocket);
serverSocket.pipe(clientSocket);
```

`serverSocket` 和 `clientSocket` 都是双工流，所以既可以写入也可以读取。

`serverSocket.write(head)` 这句代码最让人迷惑的地方在于head，文档上只写了一个Buffer类型就没有其他描述了，其实这个head是请求数据，但是不知道为什么用head命名，也就是说首次和最终的服务器（例子中是www.baidu.com）建立 TCP 连接的时候，将客户端携带的请求数据发送给最终的服务器。

`clientSocket.pipe(serverSocket);` 这一句是将客户端发送的请求传输到最终的服务器，用上面例子的情况就是将：

```ts
socket.write(
  'GET / HTTP/1.1\r\n' +
  'Host: www.baidu.com:80\r\n' +
  'Connection: close\r\n' +
  '\r\n'
);
```

这个请求发送到`www.baidu.com`。


`serverSocket.pipe(clientSocket);` 则和上面相反，是将服务端的响应传输到客户端。


从这个例子也能看出来，有时候需要开发者使用`socket.write`自己构造请求报文和响应报文，不能很方便的用`requset`或者`response`对象，这也就说明了为什么很多面试题都喜欢问请求报文或者响应报文的结构，我曾经认为在浏览器控制台可以很清晰的看到这些，所以不需要特别去记，学到这里才发现这些知识还是得掌握。


#### 6. connection

在开始处理 HTTP 请求之前，客户端和服务器需要先建立 TCP 连接，当连接建立成功时会触发这个事件。 

#### 7. request

当有 HTTP 请求时触发。

#### 8. upgrade

当客户端要求升级（更改？）协议时触发该事件。


```ts
import http from 'http';

const server = http.createServer();

server.on('upgrade', (req, socket, header) => {
  console.log('upgrade 触发了', req, socket, header);
});
```

客户端要发出升级协议的请求需要在请求头中增加*Connection*和*Upgrade*字段：

```bash
curl -H "Connection:Upgrade" -H "Upgrade:websocket" http://localhost:1111
```

可参考 MDN 的文档 [协议升级机制](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Protocol_upgrade_mechanism)


## HTTPS

HTTPS 协议是 HTTP 协议的加密版本，它使用了 TLS 协议对通信内容进行加密，有的地方还有说 SSL 协议，目前 SSL 协议已经弃用了，采用的是标准化之后的 SSL 协议，被称作 TLS 协议（传输层安全性协议）。



## 参考

[协议升级机制](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Protocol_upgrade_mechanism)

[HTTP event connect](https://nodejs.org/api/http.html#event-connect)

[关于队头阻塞（Head-of-Line blocking），看这一篇就足够了](https://zhuanlan.zhihu.com/p/330300133)