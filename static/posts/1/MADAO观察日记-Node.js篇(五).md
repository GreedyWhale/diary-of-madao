---
title: 'MADAO观察日记-Node.js篇(五)'
labels: ['Node.js']
introduction: '使用 Node.js 进行网络编程 - WebSocket'
---

## 参考

[编写 WebSocket 服务器](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)

[The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455)

[Protocol upgrade mechanism](https://developer.mozilla.org/en-US/docs/Web/HTTP/Protocol_upgrade_mechanism)

## 前言

第一次听说 WebSocket 是在面试中被问到 HTML5 的新特性的时候，时至今日我仍然没有在工作中使用过这个特性。

每次有需要服务端推送给客户端的需求，都采用的是轮询的方案，我也提出过可以使用 WebSocket，但是后端同事都会说他们那边实现起来很麻烦，正好 Node.js 可以实现 WebSocket 服务端，记录一下实现过程，争取早日用到:-)。

## 实现一个 WebSocket 服务端

WebSocket 和平时常用的 AJAX 最明显的区别是 WebSocket 可以让服务端主动推送数据到服务端，AJAX 则是由客户端发起请求，服务端进行响应。

通过查看文档 Node.js 并没有现成的 API 支持 WebSocket，第三方库倒是有几个，用库实现就不用写笔记了，文档肯定要详细的多，所以这里尝试使用原生 API 实现。

WebSocket 协议数据传输也是用的 TCP 协议，所以参照之前写的笔记，先搭建一个简单的 TCP 服务器。

```ts
// server.ts

import net from 'net';

const server = net.createServer();

server.on('connection', socket => {
  socket.once('data', data => {
    console.log(data.toString());
  });
});

server.listen(1111, () => console.log('listening'));
```

客户端就用浏览器，在控制台输入：

```js
const socket = new WebSocket('ws://localhost:1111');
```

然后在服务端的终端可以看到如下输出：

```
GET / HTTP/1.1
Host: localhost:1111
Connection: Upgrade
Pragma: no-cache
Cache-Control: no-cache
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36
Upgrade: websocket
Origin: https://www.google.com
Sec-WebSocket-Version: 13
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Sec-WebSocket-Key: uOVGP/18nFfLH6qtpWVW4A==
Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits
```

这明显是一个 HTTP 请求的请求报文，通过请求头中的几个字段可以判断这是一个 WebSocket 请求，分别是：

- Upgrade: websocket

    表示需要升级成 websocket 协议

- Sec-WebSocket-Version: 13

    指定 websocket 协议的版本
    
- Sec-WebSocket-Key: uOVGP/18nFfLH6qtpWVW4A==

    这个值是一段随机Base64编码的字符串，服务端在接收到这个字段后需要把这个字段里的值和*258EAFA5-E914-47DA-95CA-C5AB0DC85B11*字符串相连，然后使用*sha1*算法进行计算，把计算结果再进行Base64编码返回客户端。
    
    *258EAFA5-E914-47DA-95CA-C5AB0DC85B11*字符串是协议规定的。
    
    可参考[The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455)
    
- Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits

    这个字段表示服务端可以使用 WebSocket 的扩展，比如例子中的 permessage-deflate 指的就是对 WebSocket 中的消息进行压缩，分号后面的值是扩展的参数。

根据之前的笔记，当请求头的字段中有 *Connection: Upgrade*，表示这是一个协议升级的请求，服务端应该响应一个 `101 Switching Protocols` 状态码。

想要响应 `101 Switching Protocols` 首先得算出 `Sec-WebSocket-Key` 的值，所以要把请求报文从字符串格式解析成对象拿到原始的`Sec-WebSocket-Key`值。

```ts
// server.ts

const parseHeaders = (headerStr: string) => {
  const headers: Record<string, string> = {};
  headerStr
    .split('\r\n')
    .slice(1) // 把 GET / HTTP/1.1 这一行去掉，因为它不是 key: value 的格式
    .filter(item => item) // 去掉空行
    .forEach(item => {
      const [key, value] = item.split(':');
      headers[key.trim()] = value.trim(); // 去除无用空格
    });

  return headers;
};

// 原来代码不变
```

然后计算`Sec-WebSocket-Key`的值并进行响应：

```ts
// server.ts

server.on('connection', socket => {
  socket.once('data', data => {
    const requestHeaders = parseHeaders(data.toString());
    const key = crypto
      .createHash('sha1')
      .update(`${requestHeaders['Sec-WebSocket-Key']}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
      .digest('base64');

    const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${key}`,
      '',  // 增加空行
      ''   // 增加空行
    ]

    // 立即传输数据
    socket.setNoDelay(true);
    socket.write(headers.join('\r\n'));
  });
});

```

上面代码有两个点需要注意一下：

1. 响应需要以`\r\n`结尾，这个是响应报文的结构。

    > 当服务器收到握手请求时，它应该发回一个特殊的响应，表明协议将从 HTTP 变为 WebSocket。（记住每个请求头以 \r\n结尾，并在最后一个之后放置一个额外的 \r\n）
    >
    > ----- [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)
    
2. socket.setNoDelay(true);

    TCP 协议有一个针对网络中的小数据包的算法：*Nagle算法*，它会让数据达到一定数量或者到达一定时间后再发出来优化网络，Node.js 中默认启用了这种算法，`socket.setNoDelay(true)`表示关闭这个算法，让数据立即进行传输。


这是目前服务端的完整代码：

```ts
import net from 'net';
import crypto from 'crypto';

const server = net.createServer();
const parseHeaders = (headerStr: string) => {
  const headers: Record<string, string> = {};
  headerStr
    .split('\r\n')
    .slice(1)
    .filter(item => item)
    .forEach(item => {
      const [key, value] = item.split(':');
      headers[key.trim()] = value.trim();
    });

  return headers;
};

server.on('connection', socket => {
  socket.once('data', data => {
    const requestHeaders = parseHeaders(data.toString());
    const key = crypto
      .createHash('sha1')
      .update(`${requestHeaders['Sec-WebSocket-Key']}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
      .digest('base64');

    const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${key}`,
      '',
      ''
    ]

    socket.setNoDelay(true);
    socket.write(headers.join('\r\n'));
  });
});

server.listen(1111, () => console.log('listening'));

```

使用ts-node执行这份代码，然后再浏览器的控制台中输入以下代码：

```js
const socket = new WebSocket('ws://localhost:1111');
socket.onopen = event => console.log(event);
```

可以发现`open`事件触发了，而且在network界面，请求已变成101状态，接下来就可以相互发送数据了。


## 传输数据

经过上面的步骤，客户端和服务端已成功握手，接下来就实现服务端和客户端相互传输数据的功能。


