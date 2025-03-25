---
title: '个人博客网站搭建全流程'
subtitle: '从零开始的博客网站搭建流程，包括部署'
author: 'Caisr'
tags: ["Astro", "Fullstack"]
type: 'fullstack'
cover: '~/assets/images/cover/cover-8.jpg'
---

### 前言

这是我个人博客网站的第四次改版了。相对于之前的版本，这次非常简陋，基本没有接口相关的内容，也没有数据库相关的东西，之所以变成这样，是因为我觉得我把之前的网站写的太过于复杂，没有必要实现完整的登录、在线编辑等功能，而且我发现我用代码编辑器反而有写作的欲望，所以进行了这次改版。

这一次我选择了 Astro 替代 Next.js 作为我个人网站的开发框架，原因在于 Next.js 的开发体验不太好，首先是开发服务启动就非常的慢，再加上 Next.js 的各种缓存的规则让人挺头疼的，总是出现莫名其妙的数据不更新问题。

选择 Astro 的原因在于它非常适合个人博客类型的网站，也不和特定框架绑定，所以想要试一下。


### 一. 给 Markdown 文件添加自定义字段

Astro 中提供了两种方式渲染 Markdown 文件，一种是直接写在 pages 目录下，另一种是使用内容集合。

直接写在 pages 目录的 Markdown 文件会被直接渲染成页面，而内容集合的方式更加灵活，类似于去通过 API 方式读取文件内容，然后由开发者去决定如何渲染。

我在这个项目中就使用了内容集合的方式去渲染 Markdown 文件，原因就是我需要给每个 Markdown 文件添加一个封面图，这个图片是项目中的图片资源，而不是外部的图片资源。

#### 第一步：创建一个用于存放 Markdown 文件的目录

我的目录结构如下：

```
|-- src
    |-- data
        |-- notes
            |-- xxx.md
            |-- yyy.md
            |-- ...
```

#### 第二步：定义 Markdown 文件的 Frontmatter 类型

```typescript
import type { ImageMetadata } from 'astro';

export interface MarkdownFrontmatter {
  title: string;
  subtitle: string;
  author: string;
  tags: string[];
  type: string;
  cover: ImageMetadata;
}
```

cover 字段就是需要添加的自定义字段，它的类型是 ImageMetadata，这个类型是 Astro 提供的，它的作用是用来表示图片的元数据。

#### 第三步：定义集合

详细的步骤可以查询文档 [Content collections](https://docs.astro.build/en/guides/content-collections/)


```typescript
import type { CollectionConfig } from 'astro:content';

import { defineCollection, z } from "astro:content";
import { glob } from 'astro/loaders';

/*
  * 首先定义好集合的分类，比如说笔记按照内容进行分类，我目前有 4 个分类，分别是 'react', 'javascript', 'css', 'fullstack'
  * as const 的意思是将数组中的元素转换成字面量类型。
**/
const NOTES_TYPE = [
  'react',
  'javascript',
  'css',
  'fullstack'
] as const;

/**
  * 获取 Markdown 文件的路径
  * 我的文件路径是这样
  * src/data/notes/react/xxx.md
  * src/data/notes/javascript/xxx.md
  * src/data/notes/css/xxx.md
  * src/data/notes/fullstack/xxx.md
  * 所以我需要根据 type 参数来拼接路径
*/
const getNotesCollectionPath = (type?: typeof NOTES_TYPE[number]) => {
  return type ? `./src/data/notes/${type}` : './src/data/notes'
};

/**
  * 定义集合
*/
const createNoteCollection = (type?: typeof NOTES_TYPE[number]) => defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: getNotesCollectionPath(type) }),
  schema: ({ image }) => z.object({
    title: z.string(),
    subtitle: z.string(),
    author: z.string(),
    tags: z.array(z.string()),
    type: z.string(),
    // 这里就是图片类型的定义方式
    cover: image(),
  }),
});

/**
  * 最后导出集合
  * 这样集合中就包含了不同分类的 Markdown 文件，后续可以通过 getCollection 获取某一种分类的 Markdown 文件，比如:
  * const notes = await getCollection('react');
*/
const notes: Partial<Record<typeof NOTES_TYPE[number] | 'all', CollectionConfig<unknown>>> = {
  all: createNoteCollection()
};

NOTES_TYPE.forEach(type => {
  notes[type] = createNoteCollection(type);
});

export const collections = {
  ...notes
};
```

#### 第四步：生成类型文件

定义完集合之后，需要生成类型文件，这样才能在后续的代码中使用，生成的方式是执行一下这个命令：

```bash
pnpm astro sync
```

如果用不同的包管理器，自行替换即可。

这一步不是必须的，当你执行：`astro dev`, `astro build` 或者 `astro check` 会自动执行 sync 命令，但是我在开发的时候遇到过类型没有更新的问题，所以这里还是说一下。

#### 第五步：创建 Markdown 文件并使用 cover

创建 Markdown 文件

```md
---
title: '实现 UnoCSS 网站的颜色渐变效果'
subtitle: 'CSS Animation: When you spend hours on keyframes, but end up making a button bounce.'
author: 'Caisr'
tags: ["CSS", "Animation"]
type: 'css'
cover: '~/assets/images/cover/cover-1.webp'
---

内容
```

这样定义完成后就可以直接去用 assets 目录下的图片了。甚至可以用路径别名。使用方法如下：

```typescript
// 获取单个 Markdown 文件内容
const note = await getEntry('react', 'server-components');
// cover: {
//   src: '/@fs/E:/caisr/code/diary-of-madao/src/assets/images/cover/cover-4.jpg?origWidth=3456&origHeight=5184&origFormat=jpg',
//   width: 3456,
//   height: 5184,
//   format: 'jpg'
// }
const cover = note.data.cover;
```
cover 可以直接传给 `<Image />` 组件。

```tsx
<Image src={cover} alt="notes cover" />
```

### 二. 给 Markdown 文件添加更新时间

这个功能也是属于自定义字段，但是是通过插件的方式进行添加的，官方文档有详细介绍：

[modified-time](https://docs.astro.build/en/recipes/modified-time/)

我也用了这种方式实现，不过我是添加了2个时间字段，一个是更新时间，一个是创建时间。

```typescript
import { statSync } from "fs";

export function remarkModifiedTime() {
  return function (tree, file) {
    const filepath = file.history[0];
    const result = statSync(filepath);
    file.data.astro.frontmatter.lastModified = result.mtime.toISOString();
    file.data.astro.frontmatter.birthtime = result.birthtime.toISOString();
  };
};
```

添加完成之后记得要更新类型文件：

```typescript
export interface MarkdownFrontmatter {
  title: string;
  subtitle: string;
  birthtime: string;
  lastModified: string;
  author: string;
  tags: string[];
  type: string;
  cover: ImageMetadata;
}
```

用法需要用一些日期的库进行处理：

```typescript
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
// frontmatter 就是获取到的 markdown 文件的 frontmatter
const birthtime =  dayjs(frontmatter.birthtime).format("YYYY-MM-DD HH:mm:ss")
```

到这里前端的部分基本没有什么问题了，剩下的问题看文档基本都能解决，接下来就是部署了。

### 三. 部署至服务器

我个人感觉部署到服务器最大的难题是网络问题，配置之类的东西基本问 AI 都能搞定，前置条件：

1. 一台自己的服务器
   - 买国内的要提前确认好能不能访问 npm、docker、github
   - Linux 系统
2. 一个域名并解析到服务器
3. 服务器的初始账号和密码

这些东西准备好之后，就可以开始写配置文件了。

我这次采用的仍然是 docker 的方式进行部署，整体架构是：

1. 一个管理所有容器的 docker-compose 配置
2. 一个 nginx 容器，用于反向代理到不同的应用（有可能同一台服务器上要部署多个应用）
3. 每个项目构建属于自己的镜像。

所以需要一个这样的目录结构：

```
|- projects
    |- diary-of-madao (具体的项目)
    |- nginx （nginx 的配置，要管理所有项目，所以也写在这里）
    |- docker-compose.yml （管理其他容器的配置）
```

#### 配置 diary-of-madao 项目的 Dockerfile

这个配置基本可以照抄官方提供的配置：[多层构建（使用 SSR）](https://docs.astro.build/zh-cn/recipes/docker/#%E5%A4%9A%E5%B1%82%E6%9E%84%E5%BB%BA%E4%BD%BF%E7%94%A8-ssr)

```dockerfile
# 基础阶段：设置基础镜像和工作环境
FROM node:lts AS base
WORKDIR /app

# 启用 pnpm 包管理器并复制依赖文件
RUN corepack enable pnpm
RUN pnpm config set registry https://mirrors.cloud.tencent.com/npm/
COPY package.json pnpm-lock.yaml ./

# 生产依赖阶段：只安装生产环境需要的依赖
FROM base AS prod-deps
RUN pnpm install --prod

# 构建依赖阶段：安装所有依赖（包括开发依赖）
FROM base AS build-deps
RUN pnpm install

# 构建阶段：复制源代码并构建应用
FROM build-deps AS build
COPY . .
RUN pnpm run build

# 运行时阶段：设置生产环境
FROM base AS runtime

# 从之前的阶段复制必要文件
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# 复制 PM2 配置文件
COPY pm2.config.cjs ./pm2.config.cjs

# 配置环境变量
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production
# 暴露应用端口
EXPOSE 4321

# 使用 PM2 启动应用
CMD ["pnpm", "run", "start:pm2"]

```

简单来说，这个配置将整个项目分成了 4 个阶段，分别是：
1. base：设置基础镜像和工作环境
2. prod-deps：只安装生产环境需要的依赖
3. build-deps：安装所有依赖（包括开发依赖）
4. build：复制源代码并构建应用

这里面的坑在于使用 `pnpm` 和 `pm2`。

一开始我是用 `pm2` 官网的教程进行按照，也就是全局安装，但是在 docker 的环境中，执行 `pnpm install -g` 会报这样的一个错误：

```
ERR_PNPM_NO_GLOBAL_BIN_DIR  Unable to find the
global bin directory

Run "pnpm setup" to create it automatically,
or set the global-bin-dir setting, or the
PNPM_HOME env variable. The global bin
directory should be in the PATH.E env variable. The global bin directory should be in the PATH.
```

也就是没有全局目录，按照提示执行 `pnpm setup` 之后还是会报错一个环境的错误，大概意思就是执行命令的终端不是 bash 环境，然后也没有 `PNPM_HOME` 这个变量。

通过询问 AI，给出的代码是这样的：

```dockerfile
# 设置 SHELL 和 PNPM_HOME 环境变量
ENV SHELL=/bin/bash
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

# 初始化 pnpm
RUN pnpm setup
RUN corepack enable pnpm
```

再次尝试确实没有问题了，但是 `pm2` 又报错了。

我在第一次尝试用 `pm2` 启动项目的时候是这样写的：

```dockerfile
CMD ["pm2-runtime", "start", "pm2.config.js"]
```

然后我在 diary-of-madao 项目的根目录下创建了`pm2.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'diary-of-madao',
    script: './dist/server/entry.mjs',
    instances: 'max',               // 根据 CPU 核心数启动实例
    exec_mode: 'cluster',          // 使用集群模式
    max_memory_restart: '1G',    // 内存超限时自动重启
    env: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: process.env.PORT || 4321
    }
  }]
};
```

第一次启动报：`module` 不存在，这个一看就是 `esm` 和 `cjs` 的问题，然后我就把 `pm2.config.js` 改成了 `pm2.config.mjs` 就可以了。

```javascript
// pm2.config.mjs
export default {
  // 内容不变
}
```


接下来的报错就是 `script` 执行的文件不存在，也就是 `dist/server/entry.mjs` 这个文件不存在，我用了我能想到的所有办法，检查了文件的路径，发现配置上没问题的，于是我就用 node 去启动了这个项目，结果 node 可以正常启动，那么证明文件路径是对的，于是我就想着是不是全局安装的问题，就改成了局部安装，并写了`start:pm2` 的命令：

```json
"start:pm2": "pm2-runtime start ./pm2.config.cjs"
```

同时把 `pm2.config.mjs` 改回 `pm2.config.cjs`：

```javascript
// pm2.config.cjs
module.exports = {
  // 内容不变
}
```

直接这样去启动项目：`CMD ["pnpm", "run", "start:pm2"]` 就完全没问题了。

就这样一个问题，我调试了两个多小时 :-(

#### 配置 nginx

这个是用来管理多个项目的 nginx，所以需要写在 `projects` 目录中

```
|- nginx
  |- conf.d
    |- default.conf （默认的配置）
  |- shared  （共享的配置）
  |- ssl      (这里是放证书的地方)
```

这里的配置就不写的，可以直接去我的仓库看 [oh-my-docker-greed.icu
](https://github.com/GreedyWhale/oh-my-docker-greed.icu/tree/v2)

这些配置也是 AI 帮我写出来的，在这方面问 AI 比自己搜索快多了。

#### 配置管理所有项目的 `docker-compose.yml`

这个配置也需要写在 `projects` 目录中

```yaml
# 定义服务列表
services:
  # Nginx 服务，用于反向代理和统一管理各个子域
  nginx:
    image: nginx:latest            # 使用最新版本的 nginx 镜像
    container_name: nginx_proxy    # 指定容器名称
    ports:                        # 端口映射，格式为 "主机端口:容器端口"
      - "80:80"                   # HTTP 端口
      - "443:443"                 # HTTPS 端口
    volumes:                      # 挂载本地文件到容器
      # 挂载本地 Nginx 配置文件，供反向代理和 SSL 使用
      - ./nginx/conf.d:/etc/nginx/conf.d:ro # 只读挂载 Nginx 配置
      - ./nginx/shared:/etc/nginx/shared:ro # 只读挂载 Nginx 共享文件夹
      - ./nginx/ssl:/etc/nginx/ssl:ro       # 未来支持 HTTPS
    depends_on:                   # 依赖关系，确保在 diary_of_madao 服务启动后再启动
      - diary-of-madao
    networks:                     # 将容器加入指定网络
      - greed_icu

  # 个人博客应用
  diary-of-madao:
    build: ./diary-of-madao       # 指定 Dockerfile 所在目录
    container_name: diary_of_madao # 指定容器名称
    environment:                   # 环境变量配置
      - PORT=4321                 # 设置应用运行端口
    expose:                       # 暴露容器端口，仅用于容器间通信
      - "4321"
    networks:                     # 将容器加入指定网络
      - greed_icu

# 定义自定义网络
networks:
  greed_icu:                    # 网络名称
    driver: bridge                # 使用 bridge 驱动，用于同一主机上的容器间通信

```

没错这个配置也是 AI 帮我写出来的。


这些准备完毕之后，就可以去部署了。

#### 登录服务器

登录服务器需要有：

1. 用户名
2. 密码
3. 服务器ip地址

这三个都可以在你购买服务器的控制台中获取到。

接下来进行简化配置登录过程：

1. 给服务器取名

    ```bash
    sudo vim /etc/hosts # 打开本机的hosts文件
    
    # 在hosts文件末尾添加
    
    12.34.56.78     venus # 前面为服务器ip地址，后面为服务器ip名字，名字可随意输入
    ```

2. 配置ssh密钥

    ```bash

    cd ~/.ssh # 进入密钥存放目录
    
    ls -a # 查看是否存在 id_ed25519.pub或者id_rsa.pub 文件
    
    # 如果没有 id_ed25519.pub或者id_rsa.pub 文件
    
    ssh-keygen -t ed25519 -C "your_email@example.com" # 生成密钥，邮箱替换为自己的邮箱
    
    ssh-copy-id ubuntu@venus # 将ssh密钥添加到服务器中，ubuntu为登录用户名，venus为为服务器名，这两个根据实际情况修改
    
    # 然后输入登录密码，看到 "Number of key(s) added: 1" 信息表示添加成功
    ```

配置完成就可以这样登录了：

```bash
ssh ubuntu@venus
```

#### 搭建服务器环境

登录上服务器先看一下自己用户身份，如果不是 `root` 要切换至 `root` 用户，然后有些服务器不支持用 `root` 身份登录，比如腾讯云的服务器，要按照官方文档进行修改才行：

[Ubuntu 系统如何使用 root 用户登录实例？](https://cloud.tencent.com/document/product/1207/44569#ubuntu-.E7.B3.BB.E7.BB.9F.E5.A6.82.E4.BD.95.E4.BD.BF.E7.94.A8-root-.E7.94.A8.E6.88.B7.E7.99.BB.E5.BD.95.E5.AE.9E.E4.BE.8B.EF.BC.9F)

切换用户的方法：

```bash
whoami # 确认用户身份

# 如果不是root，使用`su - root`切换到root用户
su - root
```

安装 docker 和 docker-compose，安装教程按照官网提供的即可：[Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)

安装好之后还要检查一下 docker 能不能正常的安装镜像，因为 docker 也被墙啦。

还好腾讯云提供了镜像的配置：[安装 Docker 并配置镜像加速源](https://cloud.tencent.com/document/product/1207/45596)。

配置好之后创建一个用户用于负责管理这些项目（也可以一个项目创建一个）：

```bash
whoami # 确认用户身份

# 如果不是root，使用`su - root`切换到root用户

adduser admin # 创建 admin 用户，然后根据提示完成后续操作

cat /etc/group # 查看当前所有的分组

usermod -a -G docker admin # 将admin用户添加到docker组

su - admin # 切换回admin用户

docker -v # 测试是否可以使用docker
```

#### 下载代码到服务器

因为我使用 GitHub 所以给服务器创建一个 ssh 密钥添加到账号中就可以克隆整个项目到服务器，这里唯一需要注意的是，有可能服务器连不上 GitHub 的服务器，我部署第一版的时候遇到过，是通过修改 hosts 解决的，这一次没有遇到，应该是腾讯云优化了。

代码的目录结构仍然是这样的：

```
|- projects
    |- diary-of-madao
    |- nginx
    |- docker-compose.yml
```

#### 上传 ssl 证书到服务器

证书可以免费申请，上传的位置就是 `projects/nginx/ssl` 目录下，证书可以免费申请，上传的文件是`.crt`和`.key`结尾的文件。

#### 启动项目

进入 `projects` 目录，执行：`docker-compose up -d --build`

执行完毕后，就会进行镜像的构建，构建完成就会启动容器，可以通过以下两个命令进行查看：

```bash
# 查看所有容器状态
docker ps -a

# 持续输出某个容器的日志

docker logs 容器id --follow
```

如果想要进入某个容器的内部，可以执行：

```bash
docker exec -it 容器id bash # 进入容器内部
```

如果启动正常，现在直接通过域名访问就可以看到正常的页面了。

#### 自动部署项目

自动部署我目前还是用的 `bash` 脚本，而且只能在上传了 ssh 密钥的设备上执行，所以不是很方便，后面再看看还有什么其他方式。

首先添加在 `package.json` 中添加一个命令：

```json
"scripts": {
  "deploy": "ssh 用户名@服务器地址 'bash -s' < bin/deploy.sh"
},
```

这个命令添加了之后，就来实现 `deploy.sh` 脚本

```bash
#!/bin/bash

# 设置错误时退出
set -e

# 输出时间戳的函数
timestamp() {
    date "+%Y-%m-%d %H:%M:%S"
}

# 输出日志的函数
log() {
    echo "[$(timestamp)] $1"
}

# 检查命令是否执行成功
check_result() {
    if [ $? -eq 0 ]; then
        log "✅ $1 成功"
    else
        log "❌ $1 失败"
        exit 1
    fi
}

# 开始部署
log "开始部署 diary-of-madao..."

# 进入项目目录
cd /home/caisr/oh-my-docker-greed.icu/diary-of-madao
check_result "切换到项目目录"

# 拉取最新代码
log "拉取最新代码..."
git pull
check_result "代码拉取"

# 构建镜像
log "构建 Docker 镜像..."
docker compose build diary-of-madao
check_result "镜像构建"

# 启动服务
log "启动服务..."
docker compose up -d --no-deps diary-of-madao
check_result "服务启动"

# 检查容器状态
log "检查容器状态..."
sleep 5  # 等待容器完全启动
container_status=$(docker compose ps diary-of-madao --format json | grep -o '"State":"[^"]*"' | cut -d'"' -f4)

if [ "$container_status" = "running" ]; then
    log "🚀 容器运行状态: $container_status"
    
    # 显示容器日志
    log "最近的容器日志:"
    docker compose logs --tail=10 diary-of-madao
    
    # 显示容器信息
    log "容器详细信息:"
    docker compose ps diary-of-madao
else
    log "⚠️ 容器状态异常: $container_status"
    log "错误日志:"
    docker compose logs --tail=20 diary-of-madao
    exit 1
fi

log "部署完成！"
```

然后给这个脚本执行权限 `chmod +x 文件路径`。

这个脚本也是 AI 帮我写的，自从有了 AI 后确实极大的改变了我的开发方式，也许应该去学学其他技能了，感觉这些都是过时的知识了 (ㆆᴗㆆ)
