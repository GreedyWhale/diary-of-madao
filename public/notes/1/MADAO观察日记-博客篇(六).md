---
title: 'MADAO观察日记-博客篇(六)'
introduction: '部署'
---

![banner_6.jpeg](/_next/upload/banner_6_1670984220106.jpeg "banner_6.jpeg")

## 0x00 前言

终于来到了部署阶段，部署阶段踩的坑就更多了，好多都是一些不可抗力，比如ICP备案、公安备案等等，幸运的是我都顺利的完成了，但是以我自己的经历，还是建议能购买国外的服务器就购买国外的服务器吧。

## 0x01 搭建部署环境

#### 1. 购买服务器

我自己购买的是腾讯云的服务器，腾讯云的服务器有一个问题就是默认把 GitHub 墙了，所以购买前需要确认好这些信息，避免买了之后发现都没法拉代码到本地（我就是这样的）。

GitHub无法访问解决方案也很简单，就是改host文件。

具体可参考：[GitHub520](https://github.com/521xueweihan/GitHub520)

#### 2. 登录远程服务器

在购买完成服务器后，你会得到服务器的ip地址和密码（密码有自动生成的，也有手动设置的）。

除了ip地址和密码之外，还需要知道初始登录名，初始登录名一般可以在服务器商的控制台找到。

有了ip、密码和登录名后，在终端输入：

```bash
ssh 用户名@ip地址 # 比如: ssh ubuntu@12.34.56.78
```

然后输入密码即可，输入的时候终端不会有变化，只要输入就行，输入完敲击回车就可以登录了。

#### 3. 简化登录流程

每次登录记住ip和输入密码显然很麻烦，所以需要简化一下流程。

##### 1. 给服务器ip取个名字

```bash
sudo vim /etc/hosts # 打开本机的hosts文件

# 在hosts文件末尾添加 

12.34.56.78     venus # 前面为服务器ip地址，后面为服务器ip名字，名字可随意输入
```

##### 2. 配置ssh密钥

```bash

cd ~/.ssh # 进入密钥存放目录

ls -a # 查看是否存在 id_ed25519.pub或者id_rsa.pub 文件

# 如果没有 id_ed25519.pub或者id_rsa.pub 文件

ssh-keygen -t ed25519 -C "your_email@example.com" # 生成密钥，邮箱替换为自己的邮箱

ssh-copy-id ubuntu@venus # 将ssh密钥添加到服务器中，ubuntu为登录用户名，venus为为服务器名，这两个根据实际情况修改

# 然后输入登录密码，看到 "Number of key(s) added: 1" 信息表示添加成功
```

生成密钥可参考 [生成新 SSH 密钥](https://docs.github.com/cn/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key)

当上面两步都完成之后，登录服务器就只需要：

```bash
ssh ubuntu@venus
```

#### 4. 在服务器上创建一个新用户

初始登录用户权限很大，好多都是管理员（root）身份，这对于部署一个应用来说它的权限太大了，不安全，好一点的做法是专门创建一个用于部署应用的账号。

```bash
whoami # 确认用户身份

# 如果不是root，使用`su - root`切换到root用户

adduser app # 创建app用户，然后根据提示完成后续操作

su - app # 切换到app用户

```

然后将ssh密钥也添加到*app*用户中：

```bash
ssh-copy-id app@venus
```

#### 5. 在服务器上安装docker

安装教程：[Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)

这里注意的一点是，我是以管理员身份（root）去安装的，因为我想让所有用户都能用docker，如果以管理员身份（root）去安装，那么在敲命令的时候就可以不用带`sudo`了。

```bash
su - root # 切换到root用户

cat /etc/group # 查看当前所有的分组

usermod -a -G docker blog # 将blog用户添加到docker组

su - blog # 切换回blog用户

docker -v # 测试是否可以使用docker
```

#### 6. 在服务器上生成ssh密钥

按照[教程](https://docs.github.com/cn/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)在服务器上生成ssh密钥，然后将代码克隆到服务器上。

```bash
mkdir blog_app # 创建存放blog应用的目录

cd blog_app # 进入该目录

git clone 仓库地址 # 克隆代码
```

#### 7. 配置环境变量

克隆完代码后，需要配置一些环境变量，比如登录数据库的用户名、密码等等，这些东西都不能上传至GitHub，所以需要手动创建一下。

需要创建的文件有：

1. `.env` 文件

    ```bash
    # .env文件

    # DATABASE_URL - 数据库地址
    # USER: 用户名
    # PASSWORD: 密码
    # PORT: 数据库服务器运行的端口
    # DATABASE: 数据库名称
    # SCHEMA: https://www.postgresql.org/docs/12/ddl-schemas.html
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA"

    # cookie 加密密钥
    COOKIE_PASSWORD=cookie
    # 用户密码 加密密钥
    USER_PASSWORD_KEY=password
    # 管理员名称
    ADMIN_NAME=admin
    ```
    
2. `.env.database` 文件

    ```bash
    # .env.database文件

    # 登录数据库用户名
    POSTGRES_USER=username
    # 登录数据库密码
    POSTGRES_PASSWORD=password
    # 首次启动时创建的默认数据库名
    POSTGRES_DB=username

    ```

## 0x02 配置docker-compose文件

使用docker在创建容器的时候，参数有很多，如果不想记这些参数就可以写一个`docker-compose.yml`配置文件，避免每次敲很长的命令。

[docker compose文档](https://docs.docker.com/get-started/08_using_compose/)

配置分为三部分：

- *nginx*：用于请求转发
- *node*： Next.js 环境
- *postgres*：数据库环境


按照一般流程来说，不需要*nginx*，但是这里因为需要实现图片上传功能，所以需要*nginx*进行请求的转发。

其次是一个服务器就部署一个应用也太浪费了，我后续会再部署一些我自己的个人项目，这也需要*nginx*。

配置如下：

```yml
version: "3.8"
services:
  db: # 数据库容器
    image: postgres:latest # 数据库版本
    container_name: diary-of-madao.db # 容器名字
    volumes:
      - "../database/diary-of-madao:/var/lib/postgresql/data" # 设置数据卷，用户数据持久化
    ports:
      - "5432:5432" # 端口映射
    env_file:
      - .env.database # 环境变量

  app: # 前端环境容器
    image: node:18
    container_name: diary-of-madao.app
    working_dir: /code # 容器的工作目录
    command: > # 容器启动后执行的命令，详细的后面解释
      sh -c "./bin/wait-for-if.sh diary-of-madao.db:5432 -- npm config set registry http://mirrors.cloud.tencent.com/npm/
      && yarn global add yarn@1.22.19
      && yarn install
      && yarn migrate:prod
      && yarn build
      && yarn start"
    ports:
      - "3000:3000"
    volumes:
      - ".:/code" # 把当前目录映射到容器中，前端代码
      - "/home/app/.ssh:/root/.ssh" # 映射.ssh目录，这样才能使用git接口同步到GitHub
    depends_on: # 依赖关系，先启动db，再启动app
      - db

  nginx:
    image: nginx:latest
    container_name: diary-of-madao.nginx
    ports:
      - "8080:80"
    volumes:
      - "./nginx.conf:/etc/nginx/conf.d/default.conf" # nginx配置映射
      - "./.next:/usr/share/nginx/html/_next" # 静态资源映射
      - "./public/upload:/usr/share/nginx/static/_next/upload" # 上传文件目录映射
    depends_on:
      - app


networks: # 指定容器网络，external表示预先存在
  default:
    external:
      name: greed-apps-network
```

先来解释下`app`容器的command配置：

1. `> sh -c ""`

    这种写法是为了执行多个命令，我也是在网络上抄的。
    
2. `./bin/wait-for-if.sh diary-of-madao.db:5432`

    这个是用`wait-for-if.sh`脚本去检测数据库是否可以访问了，当数据库可以访问之后再启动前端应用，这样就可以避免前端报找不到数据库的错误。
    
    `wait-for-if.sh`脚本源码在：[wait-for-it](https://github.com/vishnubob/wait-for-it)
    
3. `npm config set registry http://mirrors.cloud.tencent.com/npm/`

    设置npm的腾讯云镜像，我之前部署的时候是不用设置的，后来重写项目之后再部署，就没有办法访问npm的服务了，不知道腾讯云抽什么疯。
    
4. `yarn global add yarn@1.22.19`

    为了更新`yarn`，这也是腾讯云突然抽疯，导致无法使用`corepack enable`命令，详情可以查看：[Error when performing the request while installing yarn](https://stackoverflow.com/questions/70580425/error-when-performing-the-request-while-installing-yarn) 。
    
    初步估计是证书问题，不知道如何解决，所以只能这样写，如果`corepack enable`可以正常执行，那么这一句可以换成：
    
    ```bash
    corepack enable && corepack prepare yarn@1.22.19 --activate
    ```
    
5. `yarn install`：安装依赖
6. `yarn migrate:prod`：数据库迁移（实际执行的命令是：prisma migrate deploy）
7. `yarn build`：构建文件
8. `yarn start`：启动Next.js服务


可以看出docker配置前端环境的时候，和我们平时在自己的电脑配置差不多。

需要注意的是：

1. 数据库持久化目录需要提前创建，比如例子中的`database`目录。
2. 需要提前写好`wait-for-if.sh`脚本。

## 0x05 创建nginx.conf文件

```bash
server {
  listen                     80; # 监听80端口
  server_name                localhost;

  # 转发Next.js静态文件的请求
  location ~ ^/_next/static/  {
    root    /usr/share/nginx/html/;
    expires 30d;
  }

  # 转发访问上传文件的请求
  location ~ ^/_next/upload/  {
    root    /usr/share/nginx/static/;
    expires 30d;
  }

  # 将其他请求代理到Next.js启动的服务上
  location / {
    proxy_pass   http://diary-of-madao.app:3000;
  }
}
```

这里主要是做一些请求的转发，比如之前提到过的上传文件的访问，Next.js是不允许访问的，只需要用nginx把这个请求代理到自己的资源中即可，前提是用docker做了对应的目录映射。

这里没有配置https证书相关的东西，因为我想再创建一个nginx项目做请求的转发，证书会在那里配置。

## 0x04 创建oh-my-docker项目

创建这个项目的目的是我想在我的服务器中部署多个应用，比如:

当前这个博客项目是：https://greed.icu

我还有一个记账的个人项目部署的域名是：https://peach.greed.icu

为了能达到这种效果，所以创建了这个项目。

完整配置参考我的这个仓库：[oh-my-docker-greed.icu](https://github.com/GreedyWhale/oh-my-docker-greed.icu)

这里主要说下https证书的设置：

#### 1. 去服务器商申请证书

一般10分钟就申请好了

#### 2. 上传申请好的证书到服务器

由于我的docker的映射是：

```
"/usr/local/nginx/cert:/usr/share/nginx/cert"
```

所以我上传到服务器的`/usr/local/nginx/cert`目录。

上传好之后配置nginx.conf：

```bash
server {
  listen                     443 ssl;
  server_name                greed.icu www.greed.icu;
  resolver                   127.0.0.11 valid=5s; # Local Docker DNS

  ssl_certificate            /usr/share/nginx/cert/1_greed.icu_bundle.crt;
  ssl_certificate_key        /usr/share/nginx/cert/2_greed.icu.key;
  ssl_session_timeout        5m;
  ssl_protocols              TLSv1 TLSv1.1 TLSv1.2;
  ssl_ciphers                ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
  ssl_prefer_server_ciphers  on;

  include gzip.shared.conf;

  location / {
    proxy_pass http://diary-of-madao.nginx:80;
  }
}

server {
  listen       80;
  server_name  *.greed.icu;
  return       301 https://$host$request_uri;
}
```

假如说你还有一个应用，那么就可以这样写：

```bash
# 应用1
server {
  listen                     443 ssl;
  server_name                greed.icu www.greed.icu;
  resolver                   127.0.0.11 valid=5s; # Local Docker DNS

  ssl_certificate            /usr/share/nginx/cert/1_greed.icu_bundle.crt;
  ssl_certificate_key        /usr/share/nginx/cert/2_greed.icu.key;
  ssl_session_timeout        5m;
  ssl_protocols              TLSv1 TLSv1.1 TLSv1.2;
  ssl_ciphers                ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
  ssl_prefer_server_ciphers  on;

  include gzip.shared.conf;

  location / {
    proxy_pass http://diary-of-madao.nginx:80;
  }
}

# 应用2
server {
  listen                     443 ssl;
  server_name                peach.greed.icu;
  resolver                   127.0.0.11 valid=5s; # Local Docker DNS

  ssl_certificate            /usr/share/nginx/cert/peach.greed.icu_bundle.crt;
  ssl_certificate_key        /usr/share/nginx/cert/peach.greed.icu.key;
  ssl_session_timeout        5m;
  ssl_protocols              TLSv1 TLSv1.1 TLSv1.2;
  ssl_ciphers                ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
  ssl_prefer_server_ciphers  on;

  include gzip.shared.conf;

  location / {
    proxy_pass http://peach-ledger.nginx:80;
  }
}

server {
  listen       80;
  server_name  *.greed.icu;
  return       301 https://$host$request_uri;
}
```

这些都完成之后，就按照之前的步骤，把这个项目也克隆到服务器上。

## 0x05 一键部署

整理一下现在的情况。

1. 项目情况：

    - 博客项目
    - oh-my-docker 项目
    - 确保这两个项目都在服务器上

2. 服务器情况

    - 有登录用户的ssh密钥，可通过`ssh user@server` 形式登录
    - 数据库持久化的目录存在（database目录）
    - https证书存在
    - github 的ssh密钥存在
    - docker已安装


上述条件都满足后。


- 登录服务器，并创建`greed-apps-network` 网络

    ```bash
    # 创建 greed-apps-network
    docker network create greed-apps-network

    # 查看现有的网络

    docker network ls
    ```
    
- 进入博客项目目录
- 执行 `docker-compose up -d`

    `-d` 的意思是保持容器在后台运行
    
- 查看容器状态

    ```bash
    # 查看所有容器状态
    docker ps -a
    
    # 持续输出某个容器的日志
    
    docker logs 容器id --follow
    ```
    
只要所有容器的状态都是`up`表示成功，一般这里Node容器出错的几率大一点，我遇到的有：

1. 无法安装sharp包（Next.js 旧版本需要）

    解决方法：`sudo docker-compose up -d`
    
2. 无法访问github

    解决方法：修改hosts文件
    
3. 无法访问npm服务

    解决方法：设置npm的国内镜像


确保容器都正常启动之后，进入`oh-my-docker`项目，然后输入：

```bash
docker-compose up -d
```

有时候所有容器都正常，但是就是无法访问，是因为Next.js应用没有打包完成。

所以可以通过下面命令，查看Next.js应用的打包状态，等打包成功后再启动`oh-my-docker`容器

```bash
docker logs 容器id --follow
```

等这次部署成功后，就可以写脚本进行自动部署了：

```bash
# deploy.sh

cd /home/app/diary-of-madao &&
git reset --hard &&
git pull &&
docker-compose down &&
docker-compose up -d &&
echo 'OK!'
```

自动部署脚步很简单，就是平时启动项目的流程。

执行方法是：

```bash
ssh username@servername 'bash -s' < bin/deploy.sh
```

可以把上面命令写进`package.json`中，比如：

```json
"script": {
    "deploy": "ssh blog@venus 'bash -s' < bin/deploy.sh",
}
```

后续部署就直接 `yarn deploy`即可。

## 0x06 结语

部署这一块主要还是docker的使用，我第一次部署的时候是多个项目分开部署的，当第一个项目占用了`80`和`443`端口之后，后续的项目就只能使用其他端口了，这导致访问的时候，必须加上端口号，这显然很奇怪，所以就改成了现在的这种方式。

虽然成功达到了想要的效果，但是我对docker的使用还是一知半解，尤其是docker网络的那一块，还没有熟练掌握，需要加强。
