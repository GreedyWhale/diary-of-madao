---
title: 'MADAO观察日记-Node.js篇(三)'
labels: ['Node.js']
introduction: '使用 Node.js 进行网络编程 - TCP、UDP'
---


![post_blog_9_cover_1653385047372.jpeg](/static/images/posts/post_blog_9_cover_1653385047372.jpeg "post_blog_9_cover_1653385047372.jpeg")


## 前言

Node.js 的应用场景中很重要的一个就是搭建网络服务器，Node.js 提供了*net*、*dgram*、*http*、*https* 这几个模块来构建 *TCP*、*UDP*、*HTTP*、*HTTPS*相关的服务。

今天主要记录下*TCP*和*UDP*相关的知识点。

## 环境

1. node - v16.15.0
2. ts-node - v10.7.0
3. typescript - v4.6.4
4. yarn - v1.22.15

## 一. TCP

> TCP 全称是*传输控制协议*，是一种通信标准，使应用程序和计算设备能够在网络上交换信息。它被设计用来在互联网上发送数据包，并确保数据和信息在网络上成功传递。

以上的描述引用自[What is TCP?](https://www.fortinet.com/resources/cyberglossary/tcp-ip)

我觉得这段描述比维基百科中的描述更好理解一点，通过上面的描述可以得知 TCP 协议主要用于数据传输。

我经常看到这样一句话：HTTP协议是基于TCP/IP，让我很难理解，直到我找到了这样一段描述：

> Think of IP as a sort of high-way that allows other protocols to get on and find their way to other computers. TCP and UDP are the "trucks" on the highway, and the "load" they are carrying are protocols such as HTTP, File Transfer Protocol (FTP) and more.
>
> IP is required to connect all networks;
> 
> TCP is a mechanism that allows us to transfer data safely and HTTP which utilizes TCP to transfer its data, is a specific protocol used by Web servers and clients.

google 翻译一下：

> 可以将IP其视为一种允许其他协议进入并找到通往其他计算机的方式的高速公路。TCP和UDP是高速公路上的 "卡车"，它们承载的 "货物 "是诸如HTTP、文件传输协议（FTP）等协议。
> 
> IP是连接所有网络的必要条件。
> 
> TCP是一种机制，使我们能够安全地传输数据和利用TCP来传输数据的HTTP，是网络服务器和客户使用的特定协议。

也就是说我们通过一个HTTP协议去请求一个资源，其中的数据传输是通过 TCP 协议完成的。


还有一个不得不说的 TCP 相关的知识点就是*三次握手*和*四次挥手*，这个也是面试经常被问到的问题。

但是在说*三次握手*和*四次挥手*之前需要补充一点前置知识。

- #### TCP segment

    > TCP协议从数据流中接收数据，将其分成块，并添加 TCP 标头以创建 TCP 段。
    > --- 维基百科

    这里强调 TCP segment是因为我在搜索*三次握手*和*四次挥手*相关的文章的时候，有些文章说通信两端在握手或者挥手的时候发送的是报文，有的又说发送的是包，也有说是报文段的，让人很迷惑，我一开始把这三个概念都理解成数据传输中的基本单位，后面查了一下才发现它们的意思并不是一样的，所以我这里选择使用维基百科上的描述 `TCP segment` 也就是 TCP 段。

    TCP 段由*段头* + *数据*组成

    TCP 段头中有一个需要知道的点就是它的结构中有个标识符，不同的标识符代表不同的意思，暂时先记住：

    1. SYN：同步，表示建立连接
    2. ACK：确认，确认成功接收
    3. FIN：结束，关闭连接

- #### 三次握手

    ![three_handshakes_1653101607563.png](/static/images/posts/three_handshakes_1653101607563.png "three_handshakes_1653101607563.png")

    1. 客户端向服务端发送标识为 SYN 的 TCP 段，请求连接。

    2. 服务端接收到标识符为 SYN 的 TCP 段后，向客户端响应带有 SYN 和 ACK 标识的 TCP 段，表示接收到了请求并同意建立连接。

        这时候服务器能确定的是自己的*接收*没问题，客户端的*发送*没问题。  

    3. 客户端接收到标识符为 SYN/ACK 的 TCP 段后也回复一个标识符为 ACK 的 TCP 段，表示已确认收到。

        这时候客户端能确认的是：

        - 自己的*发送*、*接收*没问题
        - 服务端的*发送*、*接收*没问题

        当标识符为 ACK 的 TCP 段被服务端接收后，服务端也能确认自己的*发送*没问题。

    经过三次握手后，通信的两端都可以确认双方的发送、接收都没问题，然后就可以开始传输数据了。

- #### 四次挥手

    ![waved_four_times_1653104708224.png](/static/images/posts/waved_four_times_1653104708224.png "waved_four_times_1653104708224.png")

    四次挥手的流程如上图所示，可以看到需要通信双方都发送`FIN` 才可以关闭。

    假如其中的一方比如服务器的数据没有传输完成，那么服务器会继续传输数据，当数据传输完成后再向客户端发送 `FIN` 表示自己可以断开了，但是发送完了需要客户端回一个 `ACK`，假如这时候客户端崩溃了一直没有响应`ACK`，那么需要给这个连接设置一个超时时间，手动关闭，避免连接长时间停留在这里。

    所以发送 `FIN` 的一方只是表示自己已经没有数据传输了，而不是直接关闭，需要双方都确认之后会关闭。


    维基百科中也说了这样一种情况：

    > 也可以通过测三次握手关闭连接。主机A发出FIN，主机B回复FIN & ACK，然后主机A回复ACK.
    > ------ 维基百科

    当客户端发送到最后一个标识符为 ACK 的 TCP 段后还会等待 `2MSL` 的时间。

    > MSL是 TCP 段可以存在于互联网络系统中的时间，不强制的定义为2分钟。


    MSL 在规范里有这样一段描述：

    > Maximum Segment Lifetime, the time a TCP segment can exist in the internetwork system.  Arbitrarily defined to be 2 minutes.

    其中有*Arbitrarily defined*让我很难理解，翻译过来是*任意定义*，实在搞不懂这什么意思，后来看到有的文章说 `windows`，`linux`，`Unix` 系统的 MSL 时常都不一样，这才理解是规范说2分钟，但是不强制，看具体的实现。

    客户端为什么要等2MSL才关闭，是因为怕最后一次的 ACK 没有到达服务端，所以等待一段时间，如果服务端重试了，客户端还可以再响应。



### 创建 TCP 服务端

```ts
import net from 'net';

const server = net.createServer(socket => {
  socket.write('hello world');
});

server.listen(5555, () => console.log('start!'));
```

用`ts-node`执行这个文件，就会启动一个TCP服务。

然后在终端就可以去连接这个服务了

![WX20220523-113050@2x_1653276689913.png](/static/images/posts/WX20220523-113050@2x_1653276689913.png "WX20220523-113050@2x_1653276689913.png")

除了用上面这种方式去连接，也可以使用`net.connect`去连接：

**e.g.**

```ts
import net from 'net';

const client = net.connect({ port: 5555 }, () => {
  console.log('Connection successful');
});

client.on('data', (data) => {
  console.log(data.toString());
});

```

#### 1. 服务器相关事件

这里说的服务器指的是`net.createServer`返回的对象，在 Node.js 文档中对应的是`net.server`。

- #### listening

    在调用`server.listen`绑定端口后触发，可以单独的监听这个事件，也可以使用简写的方式:
    
    ```ts
    server.listen(port?: number, listeningListener?: () => void): this;
    ```
    
    **e.g.**
    
    ```ts
    server.on('listening', () => console.log('start!'));

    server.listen(5555, () => console.log('start!'));
    ```
    
- #### connection

    每当有一个新的连接建立的时候触发，这个也有简写的形式:
    ```ts
    function createServer(connectionListener?: (socket: Socket) => void): Server;
    ```
    
    **e.g.**
    
    ```ts
    const server = net.createServer(socket => {
      socket.write('hi');
    });
    
    // or
    
    const server = net.createServer();

    server.on('connection', socket => {
      socket.write('hi');
    });
    ```
    
- #### close

    在服务器被关闭时触发，调用`server.close()`后，服务器就不会再接受新的连接了，如果存在连接，在所有连接断开之前不会触发这个事件。

    **e.g.**
    
    ```ts
    import net from 'net';

    let connections = 0;

    const server = net.createServer(socket => {
      socket.write('hi');
      connections++;
      if (connections === 3) {
        server.close(); // 停止接受新的连接
      }
    });

    server.on('close', () => {
      console.log('close');
    });

    server.listen(5555, () => console.log('start!'));
    ```
    
    然后开四个终端窗口`nc -v 127.0.0.1 5555`去连接这个服务，第四个就连接不上了，它会报这个错误：
    
    ```js
    Error: connect ECONNREFUSED 127.0.0.1:5555
        at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1187:16) {
      errno: -61,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 5555
    }
    ```
    
    当你把其中一个终端的连接断开后，`close`事件并不会触发，只有三个终端都断开后才会触发`close`事件。
    
    
- #### error

    服务出现异常时会触发，比如监听一个被占用的端口。
    
#### 2.socket 相关事件

socket 一般翻译成套接字，说实话只看名字完全不知道是什么东西，也不理解套接字是什么，查阅了一些资料，越看越头疼，IBM的这篇文章是我目前可以理解一点的，所以我这里也使用这篇文章对socket的定义：

> A socket can be thought of as an endpoint in a two-way communication channel. 
> ---- [What is a socket](https://www.ibm.com/docs/en/zos/2.3.0?topic=services-what-is-socket)

翻译一下：

> 可以将套接字视为双向通信通道中的端点。

这里要区分一下这里的端点指的并不是端口号。


- #### close

    当一个socket关闭时触发，它有一个参数`hadError`，表示是否由传输错误而引起的关闭，它是一个布尔值。
    
    **e.g.**
    
    ```ts
    import net from 'net';

    const server = net.createServer(socket => {
      socket.on('close', hadError => {
        console.log('close', hadError);
      });

      socket.write('hi');
      socket.end();
    });

    server.listen(5555, () => console.log('start!'));
    ```
    
    然后使用`nc -v 127.0.0.1 5555`去连接这个 TCP 服务，就可以在 TCP 服务的终端中看到`close false`的输出。
    
    还有一种情况，当关闭的socket是正在连接到这个 TCP 服务的socket时，作为服务端的socket也会触发这个事件。
    
    ```ts
    // server.ts
    import net from 'net';

    const server = net.createServer(socket => {
      // 当连接到这个服务器的客户端socket关闭，也会被触发
      socket.on('close', hadError => {
        console.log('close', hadError);
      });

      socket.write('hi');
    });

    server.listen(5555, () => console.log('start!'));
    ```
    
    ```ts
    // client.ts
    
    import net from 'net';

    const client = net.connect({ port: 5555 }, () => {
      console.log('Connection successful');
    });

    client.on('data', (data) => {
      console.log(data.toString());
      client.end();
    });
    
    client.on('close', () => {
      console.log('client close');
    });

    ```

- #### connect
    
    这个事件用于作为客户端的一方，当成功建立socket连接时触发。
    
    **e.g.**
    
    ```ts
    import net from 'net';
    
    const client = net.connect({ port: 5555 });
    
    client.on('connect', () => {
      console.log('connect');
    });
    ```
    
- #### data

    Node.js 中 net.socket 是默认实现了 Duplex 流的模块，所以不论是客户端还是服务端，都可以进行写入，当任意一端调用`socket.write()`的时候另一端会触发`data`事件。
    
    **e.g.**
    
    ```ts
    // server.ts
    
    import net from 'net';

    const server = net.createServer(socket => {
      socket.write('hi');

      socket.on('data', chunk => {
        const data = chunk.toString();

        console.log('server 收到：', data);
        socket.write('goodbye');
        server.close();
      });
    });

    server.listen(5555, () => console.log('start!'));
    ```
    
    ```ts
    // client.ts
    
    import net from 'net';

    const client = net.connect({ port: 5555 }, () => {
      console.log('Connection successful');
    });

    client.on('data', chunk => {
      const data = chunk.toString();

      console.log('client 接收到：', data);

      if (data === 'goodbye') {
        client.end();
        return;
      }

      client.write('continue');
    });
    ```
    
 - #### drain
 
     前面也提到 net.socket 实现了 Duplex 流接口的模块，所以当 `socket.write()` 返回 false 的时候就证明读取速度大于写入速度，数据发生积压，这时候就需要监听`drain` 事件来处理数据积压问题，当可以继续写入的时候，会触发 `drain` 事件。
     
     
 - #### end
 
     当连接中的任意一端调用了 `socket.end()`， 会触发该事件，`socket.end()`就相当于调用上面说的发送 `FIN` TCP 段。
     
    我在测试的时候发现，当客户端的一方调用`socket.end()`，会直接断开当前的连接，但是根据四次挥手的规则，服务端应该要回一个`FIN` TCP 段，才能断开。
    
    仔细看了文档发现，在创建 TCP 服务端或者 TCP 客户端的时候有一个参数`allowHalfOpen`，它的默认值是false，当它为false的时候，当可读端结束时，socket将自动结束可写端，如果改成true，则需要手动的调用`socket.end()`来断开连接。
    
    **e.g.**
    
    ```ts
    // server.ts
    
    import net from 'net';

    const server = net.createServer({ allowHalfOpen: true }, socket => {
      socket.on('end', () => {
        console.log('end');
        socket.end();
      });
      socket.write('hi');
    });

    server.listen(5555, () => console.log('start!'));

    ```
    
    ```ts
    // client.ts
    
    import net from 'net';

    const client = net.connect({ port: 5555, allowHalfOpen: true }, () => {
      console.log('Connection successful');
    });

    client.on('data', chunk => {
      const data = chunk.toString();

      console.log('client 接收到：', data);
      client.end();
    });

    client.on('end', () => {
      console.log('end');
    });

    ```
    
- #### error

    发生异常的时候会触发`close`事件。
    
- #### lookup

    在解析主机名后连接之前触发，不适用于 Unix socket。
    
    **e.g.**
    
    ```ts
    import net from 'net';

    const client = net.connect({ port: 5555 }, () => {
      console.log('Connection successful');
    });

    client.on('data', chunk => {
      const data = chunk.toString();

      console.log('client 接收到：', data);
    });

    client.on('lookup', (...args) => {
      console.log(args);
    });

    ```
    
    ```js
    // 结果
    
    lookup [ null, '127.0.0.1', 4, 'localhost' ]
    Connection successful
    client 接收到： hi
    ```
     
- #### ready

    socket准备好被使用时触发，在`connect`事件之后触发。
    
    **e.g.**
    
    ```ts
    import net from 'net';

    const client = net.connect({ port: 5555 }, () => {
      console.log('Connection successful');
    });

    client.on('data', chunk => {
      const data = chunk.toString();

      console.log('client 接收到：', data);
    });

    client.on('lookup', (...args) => {
      console.log('lookup', args);
    });

    client.on('ready', () => {
      console.log('ready');
    });

    ```
    
    ```js
    // 结果
    
    lookup [ null, '127.0.0.1', 4, 'localhost' ]
    Connection successful
    ready
    client 接收到： hi
    ```
    
- #### timeout

    当socket因为长时间不活跃的时候会触发，可以通过`socket.setTimeout`来设置超时时间，timeout 触发之后连接并不会断开，如果要断开需要开发者手动调用`socket.end()`或`socket.destroy()`断开。
    
    **e.g.**
    
    ```ts
    import net from 'net';

    const client = net.connect({ port: 5555 }, () => {
      console.log('Connection successful');
    });

    client.on('data', chunk => {
      const data = chunk.toString();

      console.log('client 接收到：', data);
    });

    client.on('timeout', () => {
      console.log('timeout');
    });

    client.setTimeout(3000);

    ```
    
## 二. UDP

UDP 全称叫*用户数据报协议*，它也是一个用于数据传输的协议。它和 TCP 协议最显著的区别就是：TCP 是可靠但是慢（相比UDP）的协议，UDP是一个不可靠但是速度快的协议。

TCP 会保证数据的顺序，数据包丢失会重传，还会确保数据到达接受的一端，UDP 则是有什么数据就发什么数据，也不确认数据是否到达接收端，数据丢失也不会管，当然也不会对数据排序，正是没有了这些东西，UDP 协议性能开销比 TCP 更小，更适合对性能要求高的场景。


还有一个需要说下的就是我在其他文章里总是看到这样对比这两个协议：

1. TCP 是面向连接的协议
2. UDP 是不面向连接的协议

我看到这个面向连接就很绝望，这些名词总是很晦涩。我的理解是 TCP 连接需要先建立连接（会话）后再开始传输数据，你要先准备好服务端（接受请求的一端），而 UDP 协议则不需要，不需要先建立连接，甚至都不需要服务端，直接可以发送，至于发过去有没有接收到，UDP 协议不关心这些。

简单说一下就是：UDP 是效率更高的传输协议，TCP 是可靠性更高的传输协议。
    

### 创建 UDP 服务端

```ts
import dgram from 'dgram';

const server = dgram.createSocket('udp4');

server.on('message', (message, rinfo) => {
  console.log(`服务端接收到来自：${rinfo.address}:${rinfo.port} 的 ${message.toString()}`);

  const replyMessage = Buffer.from('I am the server');

  server.send(replyMessage, rinfo.port, rinfo.address);
});

server.bind(12345, () => {
  const address = server.address();
  console.log(`server listening: ${address.address}:${address.port}`);
});

```

用 ts-node 执行这段代码后，会在终端得到类似这样的输入：`server listening: 0.0.0.0:12345`。

然后再开一个终端输入：`nc -u 0.0.0.0 12345`，然后随便输入点东西，按回车就会实时的把数据发送到*0.0.0.0:12345* 这个UDP服务器。


创建客户端也是同样的代码，只不过不用`bind`和`on('message')`，直接使用`send`方法发送数据即可。

然后再说下`udp4`和`udp6`：

- `udp4`对应IPv4
- `udp6`对应IPv6

### dgram.socket 事件

UDP Socket 不是流，它仅仅是 EventEmitter 的实例，它有以下几个事件：

- #### close

    当调用`socket.close()`后会触发close事件。
  
- #### connect

    调用`client.connect`后触发
    
- #### error

    发生异常时触发
    
- #### message
    
    当 dgram.socket 接收到数据时触发。
    
- #### listening

    当 dgram.socket 可寻址并可以接收数据时触发。
    
可以看到 dgram.socket 相关的事件要少很多，而且我还不知道用 TCP/UDP 的服务可以做什么有意思的东西，很难加深印象，这篇暂时就到这里吧。
 
## 参考

[HTTP vs TCP/IP, send data to a web server](https://stackoverflow.com/questions/23157817/http-vs-tcp-ip-send-data-to-a-web-server)

[What is TCP?](https://www.fortinet.com/resources/cyberglossary/tcp-ip)

[TCP FLAG OPTIONS - SECTION 4](https://www.firewall.cx/networking-topics/protocols/tcp/136-tcp-flag-options.html)

[rfc793](https://www.rfc-editor.org/rfc/rfc793.txt)

[What is a socket](https://www.ibm.com/docs/en/zos/2.3.0?topic=services-what-is-socket)