---
title: 'MADAO观察日记-Node.js篇(五)'
labels: ['Node.js']
introduction: '使用 Node.js 进行网络编程 - WebSocket'
---

![post_blog_11_cover_1654765965522.jpeg](/static/images/posts/post_blog_11_cover_1654765965522.jpeg "post_blog_11_cover_1654765965522.jpeg")

## 环境

- Node.js - v16.13.1

- Google Chrome - 版本 102.0.5005.61

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

首先需要改动一下上面例子的代码，例子中使用once监听了*data*事件，是为了完成握手，当握手完成后，还需要再监听*data*事件来获取客户端发送的信息。

```ts
// server.ts

server.on('connection', socket => {
  socket.once('data', data => {
    // ...
    socket.on('data', chunks => {
      console.log(chunks.toString());
    });
  });
});
```

这种写法看起来很奇怪，还有一种写法就是设置一个变量来标识是否完成握手。

然后在浏览器端发送一个信息：

```js
const socket = new WebSocket('ws://localhost:1111');
socket.onopen = event => console.log(event);

socket.send('hi');
```

服务端打印出来的信息是乱码...

接下来还要对数据解码，服务端和客户端交换的数据专业名称叫做数据帧，MDN 上有它的结构：

```
Frame format:
​​
      0                   1                   2                   3
      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
     +-+-+-+-+-------+-+-------------+-------------------------------+
     |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
     |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
     |N|V|V|V|       |S|             |   (if payload len==126/127)   |
     | |1|2|3|       |K|             |                               |
     +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
     |     Extended payload length continued, if payload len == 127  |
     + - - - - - - - - - - - - - - - +-------------------------------+
     |                               |Masking-key, if MASK set to 1  |
     +-------------------------------+-------------------------------+
     | Masking-key (continued)       |          Payload Data         |
     +-------------------------------- - - - - - - - - - - - - - - - +
     :                     Payload Data continued ...                :
     + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
     |                     Payload Data continued ...                |
     +---------------------------------------------------------------+
```

WebSocket 交换的信息都是二进制的，所以FIN位指的是数据转换成二进制之后的第一位，然后[规范](https://www.rfc-editor.org/rfc/rfc6455#page-28)规定了RSV1, RSV2, RSV3这三位都必须是0，除非发送端和服务端有协商可以是非0的值。

那么如何判断FIN是否为0？

#### 1. 解码 FIN 位

Node.js 中处理二进制数据使用的是 Buffer 对象，Buffer 对象里面的每一项值都是十六进制的两位数，转换成二进制的范围在*00000000 ~ 11111111* 之间。

小提示：

- 1字节是8位：范围00000000－11111111，表示0到255。

- 一位16进制数：范围0000 - 1111，表示0到15。

    所以1字节 = 2个16进制字符

要判断第一位的值是否位0，需要用到位运算`&`。

位运算符`&`表示：两个位都为1时，结果才为1，否则为0。

那么我只需要找到二进制数中第一位为1的数，然后和Buffer 对象第一项的数据进行`&`运算，就可以判断了。

![bit_operation_1654596147546.png](/static/images/posts/bit_operation_1654596147546.png "bit_operation_1654596147546.png")

通过上图就可以知道，只要 xxx & 128 的结果不等于128，那么xxx的第一位就是0。

同理要看第二位的值是0还是1，找到一个二进制为`01000000`的数然后进行`&`运算。

以此类推可以得出：

```ts
 const FIN = (frame[0] & 0x80);
 const RSV1 = (frame[0] & 0x40);
 const RSV2 = (frame[0] & 0x20);
 const RSV3 = (frame[0] & 0x10);
```

`frame[0]` 就是客户端发送的二进制数据中的第一项的十六进制两位数（第一个字节）。

这样数据帧中的 `FIN + RSV`部分就解出来了。

#### 2. 解码 opcode

通过 MDN 的描述：

> The opcode field defines how to interpret the payload data: 0x0 for continuation, 0x1 for text (which is always encoded in UTF-8), 0x2 for binary, and other so-called "control codes" that will be discussed later. In this version of WebSockets, 0x3 to 0x7 and 0xB to 0xF have no meaning.

> 操作码字段定义了如何解释有效载荷数据。0x0表示延续，0x1表示文本（总是以UTF-8编码），0x2表示二进制，以及其他所谓的 "控制码"，将在后面讨论。在这个版本的WebSockets中，0x3到0x7和0xB到0xF没有意义。

然后查看规范发现

> *  %x0 denotes a continuation frame
>
> *  %x1 denotes a text frame
>
> *  %x2 denotes a binary frame
>
> *  %x3-7 are reserved for further non-control frames
>
> *  %x8 denotes a connection close
>
> *  %x9 denotes a ping
>
> *  %xA denotes a pong
>
> *  %xB-F are reserved for further control frames

目前opcode的有效值只有：

- `0x0`: 表示延续（将数据分为多个部分发送）
- `0x1`: 表示数据是文本类型
- `0x2`: 表示数据是二进制类型
- `0x8`: 表示关闭连接
- `0x9`: 表示ping数据帧（用于心跳检测，收到的一方需要回一个pong数据帧）
- `0xA`: 表示pong数据帧

转换成十进制是：0，1，2，8，9，10。

转换成二进制是：00000000，00000001，00000010，00001000，00001001，00001010。

那么找哪个数字进行`&`运算呢，答案是15，转换成2进制就是：00001111。

通过上面的解码，可以发现规律就是找到你想要判断的位的那一位为1的二进制数，比如opcode是第一个字节的后四位表示，那么只要找到二进制为`00001111`的数即可。

所以通过`opcode & 15`就能得到opcode的值了。

```ts
const opcode = (frame[0] & 0x0F);
```


#### 3. 解码 Mask

Mask 位表示数据是否进行掩码处理，1为进行掩码处理需要使用`Masking-key`为中的掩码键进行解码，0为没有进行掩码处理。

参考MDN的说法，客户端发送给服务端的mask位必须为1，尔服务端发送给客户端的mask位应该是0。

按照上面总结的规律，mask位在第二个字节的第一位，所以只要找到`10000000`的二进制数进行`&`运算就可以得到它的值了，`10000000`就是十进制的128。

```ts
const mask = (frame[1] & 0x80);
```

#### 4. 解码 Payload len

Payload len 也就是数据长度，这个长度解析起来也有点麻烦，它有三条规则：

1. 如果解码出来的值在0～125之间，那么这个值就是数据的长度。

2. 如果解码出来的值是126，那么后16位（2字节）的值就是数据的长度。

3. 如果解码出来的值是127， 那么后64位（8字节）的值就是数据的长度，最高位需要是0，最高位指的是最左边的那一位。

按照数据帧的结构第二个字节第一位是Mask位，剩下的7位则Payload len，如果值不是0～125之间，还要继续往后推。

那么要获取第二个字节后七位的值，需要用二进制为 `01111111` 的数进行 `&` 运算。


二进制为 `01111111` 的数转换为十进制是127。

所以payload len的值是：

```ts
let payloadLength = (frame[1] & 0x7F);
```

接下来就要判断这个值。

```ts
/**
 * 数据起始位置
 * 因为 FIN，RSV，opcode，masked，payload len 这些位总共占据2字节的位置
 */
let dataStartPosition = 2;

if (payloadLength === 126) { // 需要解后面16位（2字节）的值
  dataStartPosition += 2;
  payloadLength = frame.readUintBE(2, 2);
} else if (payloadLength === 127) { // 需要解后面64位（8字节）的值
  dataStartPosition += 8;
  // 这里不知如何处理
}
```

**注意**：上面示例中的代码是有问题的：

问题一：当payloadLength的值为127的时候不知道如何把对应的buffer处理64位的数字。

问题二：我用chrome作为客户端进行测试，当每次通信的数据长度大于65535，它就会分段发给服务端，然后导致后续的数据解码不出来，我还不知道如何处理这个问题。

然后这里面还需要知道一个字节序的知识，请参考阮一峰大神的文章[理解字节序](https://www.ruanyifeng.com/blog/2016/11/byte-order.html)


#### 5. 获取 Masking key

接下来就要获取 Masking Key 了，如果数据被掩码处理，需要用 Masking Key 进行解码。

Masking Key 是一个32位的数据，也就是4个字节。

```ts
let maskingKey = [];
if (mask === 1) {
  maskingKey = frame.slice(dataStartPosition, dataStartPosition + 4);
  dataStartPosition += 4;
}
```

#### 6. 解码数据

这是最后一步了，万幸的是MDN有给出示例代码，直接照抄：

```ts
// dataStartPosition 是数据起始位置
const payload = frame.slice(dataStartPosition, dataStartPosition + payloadLength);

if (maskingKey.length){
  for (var i = 0; i < payload.length; i++){
    payload[i] = payload[i] ^ maskingKey[i % 4];
  }
}
```

这里如果要深入研究的话，需要知道[XOR 加密简介](http://www.ruanyifeng.com/blog/2017/05/xor.html)。

完整的代码是：

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

const decodeFrame = (frame: Buffer) => {
  const frameObj: Record<string, any> = {
    isFinal: (frame[0] & 0x80) === 0x80,
    res1: (frame[0] & 0x40),
    res2: (frame[0] & 0x20),
    res3: (frame[0] & 0x10),
    opcode: (frame[0] & 0x0F),
    masked: (frame[1] & 0x80) === 0x80,
    payloadLength: (frame[1] & 0x7F),
    maskingKey: [],
  }

  /**
   * 数据起始位置
   * 因为 FIN，RSV，opcode，masked，payload len
   * 总共占据2字节的位置
   */
  let dataStartPosition = 2;
  if (frameObj.payloadLength === 126) { // 需要解后面16位（2字节）的值
    dataStartPosition += 2;
    frameObj.payloadLength = frame.readUIntBE(2, 2);
  } else if (frameObj.payloadLength === 127) { // 需要解后面64位（8字节）的值
    dataStartPosition += 8;
  }

  if (frameObj.masked) {
    frameObj.maskingKey = frame.slice(dataStartPosition, dataStartPosition + 4);
    dataStartPosition += 4;
  }

  const payload = frame.slice(dataStartPosition, dataStartPosition + frameObj.payloadLength);
  if (frameObj.maskingKey.length){
    for (var i = 0; i < payload.length; i++){
      payload[i] = payload[i] ^ frameObj.maskingKey[i % 4];
    }
  }

  return {
    frame: frameObj,
    payload,
  }
}

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
    socket.on('data', chunks => {
      const { frame, payload } = decodeFrame(chunks);
      console.log('接收到的数据', frame, payload.toString());
    });
  });
});

server.listen(1111, () => console.log('listening'));

```

在浏览器控制台输入：

```
const socket = new WebSocket('ws://localhost:1111');
socket.onopen = event => console.log('open');

socket.send('hi, server');
```

服务端的控制台就可以打印出：

![WX20220609-164248@2x_1654764239544.png](/static/images/posts/WX20220609-164248@2x_1654764239544.png "WX20220609-164248@2x_1654764239544.png")

接下来就是服务器发送消息给客户端了。

同样的服务器发送消息，也需要把数据组合成

```
Frame format:
​​
      0                   1                   2                   3
      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
     +-+-+-+-+-------+-+-------------+-------------------------------+
     |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
     |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
     |N|V|V|V|       |S|             |   (if payload len==126/127)   |
     | |1|2|3|       |K|             |                               |
     +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
     |     Extended payload length continued, if payload len == 127  |
     + - - - - - - - - - - - - - - - +-------------------------------+
     |                               |Masking-key, if MASK set to 1  |
     +-------------------------------+-------------------------------+
     | Masking-key (continued)       |          Payload Data         |
     +-------------------------------- - - - - - - - - - - - - - - - +
     :                     Payload Data continued ...                :
     + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
     |                     Payload Data continued ...                |
     +---------------------------------------------------------------+
```

这种格式。

这里我也就不处理大的数据格式了，目前还没搞清楚大的数据格式怎么处理。

```ts
const encodeFrame = (message: string) => {
  const length = Buffer.byteLength(message);
  // 数据的起始位置
  const index = 2;
  const response = Buffer.alloc(index + length);

  //第一个字节，fin位为1，opcode为1
  response[0] = 129;
  response[1] = length;

  response.write(message, index);

  return response;
};
```

服务端就可以在收到信息后进行回复了：

```ts
socket.on('data', chunks => {
    const { frame, payload } = decodeFrame(chunks);
    console.log('接收到的数据', frame, payload.toString());
    socket.write(encodeFrame('hi, client!'));
});
```

浏览器端则需要监听一下message事件：

```ts
const socket = new WebSocket('ws://localhost:1111');
socket.onopen = event => console.log(event);
socket.onmessage = event => console.log(event.data);
```

这样就完成了一次客户端和服务端相互推送消息的过程。


## 总结一下

只是一个数据帧的处理就让我手忙脚乱，最后还是没搞清楚大的数据怎么处理，有点可惜。

但是确实能感受到，如果不用第三方库来自己实现一个 WebSocket 服务器非常麻烦。

涉及到的知识有：

1. TCP 协议相关
2. HTTP 协议相关
3. 二进制、十六进制
4. Buffer
5. 位运算、字节序
6. XOR 加密
7. ....

好在是通过这次的学习，理解了字节、位这些概念，也会了一点位运算，起码能看懂`&`运算了，也算有收获。

简单总结下WebSocket的通信过程就是：握手 + 数据传输。
而数据传输中的难点就是解析数据帧。

## 参考

[编写 WebSocket 服务器](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)

[The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455)

[Protocol upgrade mechanism](https://developer.mozilla.org/en-US/docs/Web/HTTP/Protocol_upgrade_mechanism)

[XOR 加密简介](http://www.ruanyifeng.com/blog/2017/05/xor.html)

[decode continuation frame in websocket](https://stackoverflow.com/questions/15770079/decode-continuation-frame-in-websocket)

[how do you process a basic websocket frame](https://stackoverflow.com/questions/14514657/how-do-you-process-a-basic-websocket-frame)

[理解字节序](https://www.ruanyifeng.com/blog/2016/11/byte-order.html)
