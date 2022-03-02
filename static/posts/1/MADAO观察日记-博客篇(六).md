---
title: 'MADAO观察日记-博客篇(六)'
labels: ['Blog', 'Docker']
introduction: '个人博客网站实现 - 部署'
---

![post_blog_6_cover_1646189348967.jpeg](/static/images/posts/post_blog_6_cover_1646189348967.jpeg "post_blog_6_cover_1646189348967.jpeg")

## 前言

[MADAO观察日记-博客篇(五)](https://greed.icu/posts/7)

前几篇笔记基本上完成了个人博客网站除了评论功能之外的核心功能，今天来记录下部署的过程。


## 购买服务器和域名

关于购买服务器和域名我的建议是能买国外的尽量买国外的，我的域名和服务器买的是腾讯云的，经历了实名，ICP备案，公安部备案才让我的网站可以正常的访问，而后两步的备案时间巨长，而且容易失败，需要提交很多资料，总之就是很麻烦。

购买服务器注意的一点就是在操作系统那个配置中选择Ubuntu系统。

将应用部署在[vercel](https://vercel.com/?utm_source=github.com&utm_medium=referral&utm_campaign=deployment)也是一个不错的选择，这个平台是Next.js团队做的，所以有很多针对Next.js应用的优化。

## 远程登录服务器

购买好服务器之后，可以获得该服务器的公网ip地址，有了这个ip地址就可以在本地登录远端的服务器了。

```
ssh 用户名@ip地址
```
然后输入密码即可，密码一般是在购买服务器时设置的或者是自动生成的。

**e.g.**

```
ssh ubuntu@12.34.56.78
```

用户名根据不同的供应商是有不同的名字的，有些是root，腾讯云是ubuntu。

每次登录输入ip地址很麻烦，可以修改一下hosts文件，给这个ip地址起一个名字。

**e.g.**

```bash
# /etc/hosts

# 已有的文件内容保留不变

12.34.56.78     venus
```

添加了之后就可以直接用名字登录了

**e.g.**

```
ssh ubuntu@venus
```

每次输入密码也很麻烦，输入密码这一步也是可以优化掉的。

1. 查看本机是否已经有ssh密钥

    ```
    cd ~/.ssh
    
    ls -a
    ```
    
    如果`.ssh`目录里面有`id_ed25519.pub`或者`id_rsa.pub`中的任意一个，那么证明你已经有ssh密钥了。
    
    如果没有，则需要生成
    
    > ```
    > ssh-keygen -t ed25519 -C "your_email@example.com"
    > ```
    > 注：如果您使用的是不支持 Ed25519 算法的旧系统，请使用以下命令：
    > ```
    > ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
    > ```
    > -----  [生成新 SSH 密钥](https://docs.github.com/cn/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key)
    
    
2. 将ssh密钥添加到服务器中

    **e.g.**

    ```bash
    ssh-copy-id ubuntu@venus
    ```
    
    然后需要输入密码，当终端提示：
    
    
    ![WX20220228-140855@2x_1646031264046.png](/static/images/posts/WX20220228-140855@2x_1646031264046.png "WX20220228-140855@2x_1646031264046.png")
   
   就表示成功了。
   
3. 不用密码进行登录

    ```bash
    ssh ubuntu@venus
    ```

    登录之后查看`cat .ssh/authorized_keys`，这个文件的内容就是本机的ssh密钥中的公钥，也就是刚刚上传的内容。
    
## 在服务器上创建用户

一般情况下，不会用root用户去部署应用，因为root用户的权限太大了，比较推荐的做法是给每个应用创建对应的用户，然后分配这个应用所需的权限。

**e.g.**
   
```bash
whoami # 确认用户身份

# 如果不是root，使用`su - root`切换到root用户

adduser blog # 创建blog用户，然后根据提示完成后续操作

su - blog # 切换到blog用户

```

这样blog用户就创建好了，后面要部署blog应用的时候就直接登录这个用户就好了，但是使用blog用户仍然需要输入密码，按照上面写的，把ssh密钥也添加到blog用户里。

**e.g.**

```bash
ssh-copy-id blog@venus

ssh blog@venus
```

## 在服务器上安装docker

docker文档中有很详细的在Ubuntu系统中安装docker教程，只要跟着教程敲命令就好了。

[文档地址](https://docs.docker.com/engine/install/ubuntu/)

这里我选择使用root用户安装docker，因为docker教程中它的所有命令都是加了`sudo`的，也就是要用root权限进行安装，切成root用户就不用在每个命令前加sudo了。

docker安装完成后，需要将blog用户添加进docker组，否则会因为权限问题导致blog用户无法使用docker

**e.g.**

```bash
su - root # 切换到root用户

cat /etc/group # 查看当前所有的分组

usermod -a -G docker blog # 将blog用户添加到docker组

su - blog # 切换回blog用户

docker -v # 测试是否可以使用docker
```

## 克隆代码到服务器

在服务器上创建ssh密钥并添加到GitHub上面

[教程](https://docs.github.com/cn/authentication/connecting-to-github-with-ssh)

然后将代码克隆至服务器

**e.g.**

```bash
mkdir blog_app # 创建存放blog应用的目录

cd blog_app # 进入该目录

git clone 仓库地址 # 克隆代码
```

克隆完成之后需要在项目目录下手动创建一些`env`文件，这些文件包含重要的密码，没有上传到GitHub，需要创建的文件有`.env`、`.env.database`、`.env.local` 这三个文件。

**e.g.**

```
# 项目需要的环境变量
# .env相关文件需要手动创建

# .env文件

# DATABASE_URL - 数据库地址
# USER: 用户名
# PASSWORD: 密码
# PORT: 数据库服务器运行的端口
# DATABASE: 数据库名称
# SCHEMA: https://www.postgresql.org/docs/12/ddl-schemas.html
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA"

# .env.database文件

# 登录数据库用户名
POSTGRES_USER=username
# 登录数据库密码
POSTGRES_PASSWORD=password
# 首次启动时创建的默认数据库名
POSTGRES_DB=username

# .env.local文件

# cookie 密码
COOKIE_PASSWORD=cookie

```

## 定义docker-compose.yml文件

部署思路是：

1. 先克隆代码到服务器
2. 创建数据库容器
3. 创建Node容器用于运行Blog应用，并设置数据卷，将克隆下来的代码目录映射到容器中，然后在容器中进行npm包的安装。
4. 创建Nginx容器用于优化静态资源的访问和SSL证书的设置。

按照上面的思路服务器上得运行3个docker容器，docker创建容器的命令又特别长，每次部署重新一个一个敲命令显然不符合程序员的工作方式，所以这里用docker compose来避免每次都要敲很长命令的情况。


[docker compose文档](https://docs.docker.com/get-started/08_using_compose/)

> Compose 是用于定义和运行多容器 Docker 应用程序的工具。通过 Compose，您可以使用 YML 文件来配置应用程序需要的所有服务。然后，使用一个命令，就可以从 YML 文件配置中创建并启动所有服务。
> --- 菜鸟教程


在项目根目录创建docker-compose.yml文件，并写入以下内容：

```yml

version: "3.8"
services:
  # 定义数据库服务
  db:
    image: postgres:latest # 容器依赖的镜像
    container_name: diary-of-madao.postgres # 容器名字
    volumes:
      - "../blog-data:/var/lib/postgresql/data" # 数据卷，可以让数据库中的数据持久化
    ports:
      - "5432:5432" # 端口映射
    env_file:
      - .env.database # 环境变量

  # 定义node容器
  app:
    image: node:16
    container_name: diary-of-madao.app
    working_dir: /code # 工作目录，相当于容器里的根目录
    command: > # 容器启动后执行的命令，详细的后面解释
      sh -c "./bin/wait-for-if.sh db:5432 -- corepack enable
      && corepack prepare yarn@1.22.11 --activate
      && yarn install
      && yarn migrate:prod
      && yarn generate
      && yarn build
      && yarn start"
    ports:
      - "3000:3000"
    volumes:
      - ".:/code" # 把当前目录映射到容器中
      - "/home/blog/.ssh:/root/.ssh" # 映射.ssh目录，这样才能使用git接口同步到GitHub
    depends_on: # 依赖关系，先启动db，再启动app
      - db

  nginx:
    image: nginx:latest
    container_name: diary-of-madao.nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "./nginx.conf:/etc/nginx/conf.d/default.conf" # nginx配置映射
      - "./.next:/usr/share/nginx/html/_next" # Blog应用静态资源映射
      - "/usr/local/nginx/cert:/usr/share/nginx/cert" # SSL证书映射
    depends_on:
      - app

```

解释下配置需要注意的地方：

1. 启动顺序是 db -> app -> nginx，但是这个不会等上一个服务启动完毕了才会启动下一个服务，也就是说有可能node服务以及启动了，数据库服务还没启动完成，这样会无法连接数据库，导致报错，为了解决这个问题我在网上找到了一个脚本

    [wait-for-it](https://github.com/vishnubob/wait-for-it)
    
    这个脚本会测试服务是否可用，等服务可用了之后执行后续的命令，对应上面配置中的这一句`./bin/wait-for-if.sh db:5432 -- corepack enable ....`
    
2. 关于数据库的地址，一开始部署我是用localhost:5432去访问的发现怎么都访问不到，这是两个docker容器之间的访问，目前我还是没有弄的很清楚，据我对的文档的理解，只要把数据库的地址改为它服务的名字+端口就行了，比如将`localhost:5432`改为`db:5432`，同样node容器里面运行的Next.js应用的访问地址也变成了`http://app:3000`

3. node容器里command的解释

    - ./bin/wait-for-if.sh db:5432
    
        等待数据库可以访问
        
    - corepack enable
    
        启用corepack，corepack是Node内置的包管理器，默认与 Node.js 14.19.0 和 16.9.0 一起分发，用的时候要注意一下Node的版本
        
    - corepack prepare yarn@1.22.11 --activate
    
        更新yarn到最新版本，1.22.11对应yarn的版本
        
    - yarn install
    
        安装依赖
        
    - yarn migrate:prod
    
        这是我写在package.json中的命令，实际是：
        
        `prisma migrate deploy`
        
        这是prisma的命令，把代码中对数据库的修改迁移到真正的数据库中
        
     - yarn generate
     
         这也是在package.json中的命令，实际是：
         
         `prisma generate`
         
         用于生成prisma client，比如改了表结构，不执行这个命令的话，代码中表相关的类型声明就不会更新，这样就导致Next.js在build的时候类型检查失败
         
      - yarn build
      
          构建Next.js应用
          
      - yarn start
      
          启动Next.js服务

## 设置SSL证书


SSL证书有免费的，我用的是通过腾讯云申请的免费证书，申请成功后会得到：

- xxx.crt  证书文件
- xxx.key  私钥文件

把这两个文件上传到服务器的`/usr/local/nginx/cert`目录下，如果目录不存在，手动创建一下。

然后就可以写nginx的配置了：

```yml
# nginx.conf

server {
  # SSL 访问端口号为 443
  listen                     443 ssl; 
  # 绑定证书的域名
  server_name                greed.icu;
  # 证书文件位置
  ssl_certificate            /usr/share/nginx/cert/1_greed.icu_bundle.crt;
  # 私钥文件位置
  ssl_certificate_key        /usr/share/nginx/cert/2_greed.icu.key;
  # @see https://cloud.tencent.com/document/product/400/35244
  # 抄腾讯云文档的
  ssl_session_timeout        5m;
  ssl_protocols              TLSv1 TLSv1.1 TLSv1.2;
  ssl_ciphers                ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
  ssl_prefer_server_ciphers  on;

  # @see https://www.cnblogs.com/xzkzzz/p/9224358.html
  # @see https://github.com/h5bp/server-configs-nginx/blob/main/h5bp/web_performance/compression.conf
  # 开启gzip
  gzip on;
  gzip_comp_level 5;
  gzip_min_length 256;
  gzip_proxied any;
  gzip_vary on;
  gzip_types
    application/atom+xml
    application/geo+json
    application/javascript
    application/x-javascript
    application/json
    application/ld+json
    application/manifest+json
    application/rdf+xml
    application/rss+xml
    application/vnd.ms-fontobject
    application/wasm
    application/x-web-app-manifest+json
    application/xhtml+xml
    application/xml
    font/eot
    font/otf
    font/ttf
    image/bmp
    image/svg+xml
    text/cache-manifest
    text/calendar
    text/css
    text/javascript
    text/markdown
    text/plain
    text/xml
    text/vcard
    text/vnd.rim.location.xloc
    text/vtt
    text/x-component
    text/x-cross-domain-policy;


  # 处理静态资源请求
  location ~ ^/_next/static/  {
    root    /usr/share/nginx/html/;
    expires 30d;
  }
  # 处理页面请求
  location / {
    proxy_pass   http://app:3000;
  }
}

# 将http请求重定向至https请求
server {
  listen       80;
  server_name  greed.icu;
  return       301 https://$host$request_uri;
}
```

nginx的配置就是这些了。

结合docker-compose的配置，思路就是将证书文件上传至服务器，然后让nginx容器的数据卷映射到该目录，然后nginx容器中就可以拿到证书了，然后自定义nginx的配置，把这个配置同样映射到nginx容器中，替换容器的默认配置。

## 一键部署

在一键部署之前，先去服务器创建一个目录 `/blog_app/blog-data`，这个目录对应docker-compose.yml中数据库容器的数据卷映射位置。

然后就可以写一键部署的脚本了：

```bash
# /bin/deploy.sh

cd /home/blog/blog_app/diary-of-madao &&
git reset --hard &&
git pull &&
docker-compose down &&
docker-compose up -d &&
echo 'OK!'
```

流程就是：

1. 切换到代码存放目录
2. 回退没有提交的改动，这一步待优化，这一步是为了避免出现冲突
3. 获取最新的代码
4. 关闭正在运行的docker容器
5. 启动新的docker容器

写好脚本后，在package.json中就可以定义一条部署的命令：

```json
"script": {
    "deploy": "ssh blog@venus 'bash -s' < bin/deploy.sh",
}
```

这个命令的意思就是远程执行脚本。

写好之后可以执行下：

`chmod +x ./bin/deploy.sh`给这个脚本执行权限。

然后提交代码，提交完之后需要手动的去服务器上更新下代码，保证脚本存在，之后每次需要部署的时候，执行一下`yarn deploy`即可。

**部署时遇到的问题**:

1. 无法访问GitHub

    解决办法：修改服务器的hosts文件，参考[GitHub520](https://github.com/521xueweihan/GitHub520)
    
2. 无法安装sharp

    sharp是Next.js推荐安装的一个依赖。用于优化图片，我遇到了无法下载和下载后无法安装的问题，无法下载就是通过修改hosts文件解决的，无法安装问题我是通过添加权限执行docker-compose命令解决的
    
    ```
    sudo docker-compose up -d
    ```