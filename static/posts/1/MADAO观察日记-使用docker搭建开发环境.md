---
title: 'MADAO观察日记-使用docker搭建开发环境'
labels: ['docker']
introduction: '使用docker搭建开发环境'
---

![post_blog_12_cover_1659093840101.jpeg](/static/images/posts/post_blog_12_cover_1659093840101.jpeg "post_blog_12_cover_1659093840101.jpeg")

## 环境

- macOS - 12.5 （M1 芯片）
- docker - 20.10.17, build 100c701
- Visual Studio Code

## 前言

最近开始看方应杭老师的山竹记账课程，我也准备边看课程边实现这个项目，算是给简历上添点可写的东西吧。

我接触docker的时间也算长了，但是只有我的这个博客项目用到了docker，是在部署的时候，这次课程里有讲到怎么搭建开发环境，因为我的开发机器是 macOS 系统，芯片是 M1 的，所以课程上的配置好多都不能用，只能自己配置，配置的过程很艰辛，基本上是一步一个坑，所以记录一下这次的配置过程，避免以后重复踩坑。


## 项目技术栈

这个记账项目是前后端都有的项目，使用到的技术有：

1. Vue || React + ts

    我暂时还不确定用Vue还是React，因为我之前把项目都换成React了，然后我在开发的过程中，对`useEffect`这个API的使用总是把握不住精髓，写着写着就变成一堆依赖，然后调试起来很痛苦，然后 Vue3 + jsx 的组合风评很不错，所以想要尝试一下。
    
2. Ruby + Rails

    本来我是觉得如果不出意外的话 Next.js 就是我之后的主力开发框架了，但是我在看了课程里面关于 Rails 的一些简单用法之后，突然觉得 Next.js 有点简陋...
    
    Rails难道是我的本命？
    
3. PostgreSQL

    因为我没有用过其他数据库，所以这块没什么自己的见解，就按照课程选择的来用。
    


## 思路

构建开发环境的思路其实和拿到一台新电脑差不多，都是装各种环境，用docker的好处就是不会把你电脑的环境搞得一团糟，我就经常把自己的电脑搞得乱七八糟。

1. 选择系统

我选择的是 Ubuntu 系统，因为它用的人够多，出了问题好解决，也支持 M1 芯片。

2. 需要安装的工具

    - git
    - oh my zsh
    - curl
    - vim
    - nvm
    - rvm
    
3. 使用 nvm 管理 Node，使用 rvm 管理 Ruby

没错，就只要三步就可以搭建好基本的开发环境了，不过我在做的时候几乎没有顺利的完成某一步，每一步都要卡好久，要注意很多细节问题。

## 配置基本开发环境Dockerfile

1. 创建一个 github 仓库

    我建议是用一个专门的仓库来存放这些配置，方便复用
    
2. 将仓库克隆到本地，并创建如下文件：


    ```
    |- .gitignore  // git忽略配置
    |- DockerFile  // docker 配置文件
    |- LICENSE     // 版权说明
    |- README.md   // 项目说明
    |- sources.list // 国内镜像地址，后面会详细说明
    ```
    
3. 完善 Dockerfile

    这个仓库根目录下的 Dockerfile 就是构建基本镜像的配置，后面还会基于这个镜像制作专属于项目的镜像。
    
    
    1. 安装镜像的基本环境
    
        ```docker
        # 系统环境
        FROM ubuntu:latest
        ```
        
    2. 修改apt-get的源为国内镜像
    
        apt-get是ubuntu系统中一个包管理的工具，像是`git`、`zsh`这些工具都用它来下载。
        
        如果你的网络本身就不畏惧高墙，这一步是可以省略的，我本来也不愿意用镜像，无奈墙太高。
        
        ```docker
        # 更新 apt 储存库，不更新会报找不到包的错误
        RUN apt-get update
        RUN apt-get install -y ca-certificates apt-transport-https

        # 备份原文件
        RUN cp /etc/apt/sources.list /etc/apt/sources.list.backup
        # 用本机的sources.list文件替换镜像里的sources.list文件
        COPY ./sources.list /etc/apt/sources.list
        # 更新apt 储存库
        RUN apt-get update
        ```
        
        使用 `apt-get` 之前需要先 `apt-get update` 一下，不然会报找不到包的错误。
        
        然后我用 `apt-get` 安装了 `ca-certificates apt-transport-https` 这两个包，为什么要安装这两个包，这是第一个坑。
        
        **坑1**：
        
        - 出现条件：ubuntu版本为 22.04。
        
           通过docker安装的ubuntu（22.04）不知道为何没有证书验证相关的依赖，而国内的镜像源都是https协议的，这就会导致用国内源安装包的时候报`Certificate verification failed: The certificate is NOT trusted`错误，所以需要安装`ca-certificates`这个包。
           
           `apt-transport-https`这个包是镜像的文档说需要安装：
           
           > 使用 HTTPS 可以有效避免国内运营商的缓存劫持，但需要事先安装 apt-transport-https
           
           [Ubuntu Ports 源使用帮助](https://mirrors.ustc.edu.cn/help/ubuntu-ports.html)
           
           我的国内镜像选择的是中科大的源，因为只有他说了为什么镜像使用`https`协议，这点让我对他的好感度直线上升，他的文档也是有很多有用的提示，非常不错。
       
    3. 补全本机的`sources.list`文件
    
        文件内容就是中科大文档里的，只不过要把版本替换成当前ubuntu的版本代号
        
        ```bash
        # 默认注释了源码仓库，如有需要可自行取消注释
        deb https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy main restricted universe multiverse
        # deb-src https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy main main restricted universe multiverse
        deb https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-updates main restricted universe multiverse
        # deb-src https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-updates main restricted universe multiverse
        deb https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-backports main restricted universe multiverse
        # deb-src https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-backports main restricted universe multiverse
        deb https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-security main restricted universe multiverse
        # deb-src https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-security main restricted universe multiverse

        # 预发布软件源，不建议启用
        # deb https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-proposed main restricted universe multiverse
        # deb-src https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-proposed main restricted universe multiverse
        ```
        这里的配置其实有个悖论，就是你在设置国内源之前需要先用原来的源安装包，假如第一步就失败的话，可以尝试把https替换成http，或者用其他国内源，直接换成http会有风险，所以不到实在没办法不建议替换。
        
    4. 安装基本的工具
    
    
        ```docker
        # 安装开发时的工具，-y 表示在安装时自动回答 yes
        RUN apt-get install -y git zsh curl vim iputils-ping locales
        ```
        
        -y 在注释里已经解释了，如果不写 -y 的话构建镜像的时候执行到这里会中断。
        
        
        locales 这个包是用来设置语言环境的，不安装的话没有办法设置字符集，会导致中文字符在zsh里面显示`<ffffffff>`
    
    5. 安装 oh my zsh
    
        安装这个是因为我自己的开发环境就一直用 oh my zsh 非常好用。
        
        ```docker
        # 安装 oh my zsh
        RUN /bin/zsh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
        # 替换on my zsh 主题为 ys
        RUN sed -i 's/robbyrussell/ys/g' ~/.zshrc
        ```
        
        上面换主题的方法有可能是错的，因为我按照网上能查到的方法都失败了，所以这里就直接改原文件了，如果不想用`ys`这个主题，可以把`ys`改成你想要的任何主题，这里算是第二个坑，花费了很多时间才成功。
        
        
    6. 安装 nvm
    
    
        本来想把nvm移到项目的Docker里面，后来想了想我基本所有的环境都需要Node，所以就直接把nvm装到基本Docker配置里面了
        
        
        ```docker
        # 安装 nvm
        RUN /bin/zsh -c "$(curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash)"
        RUN echo 'export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"\n[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm' >> ~/.zshrc
        ```
        
     7. 更新shell的配置
     
         ```docker
         # 避免zsh中文乱码
         RUN /bin/zsh -c "locale-gen en_US.UTF-8"
         RUN echo 'export LC_ALL=en_US.UTF-8' >> ~/.zshrc
         RUN echo 'export LANG=en_US.UTF-8' >> ~/.zshrc
         # 因为默认的sh没有source命令，所以这里使用 zsh 去执行 "source ~/.zshrc"
        RUN /bin/zsh -c "source ~/.zshrc"
        # 注意这里需要双引号，否则会报找不到命令的错误
        CMD ["zsh"]
        ```
    
        上面注释也写了注意双引号，这是第三个坑，我一开始用单引号，一直报找不到命令，让我以为zsh没有成功安装，查了半天才发现这里需要用双引号。
        
4. 构建基本环境的docker镜像

    完整的配置如下：
    
    ```docker
    # 系统环境
    FROM ubuntu:latest


    # 更新 apt 储存库，不更新会报找不到包的错误
    RUN apt-get update
    RUN apt-get install -y ca-certificates apt-transport-https

    # 修改 apt 源为国内源
    RUN cp /etc/apt/sources.list /etc/apt/sources.list.backup
    COPY ./sources.list /etc/apt/sources.list

    RUN apt-get update

    # 安装开发时的工具，-y 表示在安装时自动回答 yes
    RUN apt-get install -y git zsh curl vim iputils-ping locales

    # 安装 oh my zsh
    RUN /bin/zsh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
    # 替换on my zsh 主题为 ys
    RUN sed -i 's/robbyrussell/ys/g' ~/.zshrc

    # 安装 nvm
    RUN /bin/zsh -c "$(curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash)"
    RUN echo 'export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"\n[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm' >> ~/.zshrc

    # 避免zsh中文乱码
    RUN /bin/zsh -c "locale-gen en_US.UTF-8"
    RUN echo 'export LC_ALL=en_US.UTF-8' >> ~/.zshrc
    RUN echo 'export LANG=en_US.UTF-8' >> ~/.zshrc

    # 因为默认的sh没有source命令，所以这里使用 zsh 去执行 "source ~/.zshrc"
    RUN /bin/zsh -c "source ~/.zshrc"
    # 注意这里需要双引号，否则会报找不到命令的错误
    CMD ["zsh"]

    ```
    在构建之前需要有一个docker hub的账号，我的账号名叫 madao1994 所以我镜像名就是`madao1994/oh-my-docker`，oh-my-docker 可以替换成随意的名字。
    
    在当前目录执行：
    
    ```bash
    docker build -t madao1994/oh-my-docker:base -f ./DockerFile .
    ```
    
    - -t 用来指定镜像名和标签，例子中容器名就是`madao1994/oh-my-docker`，标签是`base`。
    
    - f 用来指定 Dockerfile 的路径。
    
    
    最后的`.`不要忘了，这个参数表示构建时的环境，`.`表示当前目录。
    
    构建过程中又可能会卡在下载oh my zsh 或者 nvm 的阶段，因为是从github下载（墙高到已经连github都不能打开了），可以中断重试几次。
 
 
    构建完成后可以进这个容器里面看看环境对不对：
    
    ```
    docker run --rm -it madao1994/oh-my-docker:base
    ```
    
5. 将构建好的镜像上传至docker hub

    ```
    docker push madao1994/oh-my-docker:base
    ```
    
    这里遇到的坑就是我第一次构建镜像时没有携带docker hub 的用户名，导致上传失败。
    
    
## 配置桃子记账的Dockerfile

在配置桃子记账项目的Dockerfile之前需要先做一些准备工作。

1. 在vscode中下载 *Remote - Containers* 扩展。

2. 执行 `docker network create peach-ledger-network`

    为这个项目的容器创建一个网络，方便容器之间的通信，可参考：[Docker 容器连接](https://www.runoob.com/docker/docker-container-connection.html)
    
3. 在github上面创建项目仓库 peach-ledger

4. 将 peach-ledger 仓库克隆到本地后，在项目根目录创建`.devcontainer`目录，在`.devcontainer`目录中创建`devcontainer.json`和`Dockerfile` 文件

目前的目录结构是：

```
|.devcontainer
    |- devcontainer.json
    |- Dockerfile
```

在终端执行`docker network ls`如果显示刚刚创建的网络，则表示准备工作已经完成。


#### 1. devcontainer.json

`devcontainer.json` 文件是*Remote - Containers* 扩展的配置文件，它会根据这个json配置去构建一个容器。


```json
{
  "name": "peach-ledger.dev",
  "dockerFile": "./Dockerfile",
  "runArgs": [
    "--name=peach-ledger.dev",
    "--network=peach-ledger-network",
    "--privileged"
  ],
  "remoteUser": "root",
  "context": "..",
  "mounts": [
    "source=peach-ledger.root,target=/root,type=volume",
    "source=peach-ledger.repos,target=/root/repos,type=volume",
    "source=peach-ledger.ssh,target=/root/.ssh,type=volume"
  ]
}
```

解释下上面的配置：

1. 我本来以为 name 就是容器的名字，但是我自己测试后发现就算写了 name 构建出来的容器名字还是随机字符串，所以暂时还不知道这个name有啥用。

2. dockerFile用来指定构建容器的dockerFile路径

3. runArgs 表示构建时的参数：

    - --name=peach-ledger.dev 这一句用来设置容器名字
    
    - --network=peach-ledger-network 用来设置容器的网络环境
    
    - --privileged 表示容器里的root用户拥有真正的root权限，还可以在容器里面启动docker
    
4. remoteUser 表示容器的用户


5. context 对应手动执行 `docker build`命令中的`.`，这里的`..`表示上级目录，也就是项目根目录

6. mounts 和 docker 的 mounts 一样，都是用来做持久化的，写在这里面的文件会被持久化，即使容器被删除被mount的文件也不会被删除，除非手动的删除这些文件。

#### 2. Dockerfile

接下来就要配置桃子记账的开发环境了


1. 设置基本环境

    ```docker
    # 依赖于上面创建的基本开发环境镜像
    FROM madao1994/oh-my-docker:base

    # 用来设置工作目录，后面代码会放进这个目录里
    WORKDIR /root/repos
    ```
    
2. 安装依赖

    ```docker
    RUN apt-get update
    # 不安装 libpq-dev 会导致 Could not find gem 'pg (~> 1.1)' in locally installed gems. 的报错
    RUN apt-get install -y gnupg2 libpq-dev
    ```
    
    这里出现了**坑2**：
    
    出现条件不清楚，大概率是因为 `ubuntu 22.04` arm64 版本 + Ruby 3.1.2 版本的原因，为什么用 Ruby 3.1.2 后面会说到。
    
    如果不安装 `libpq-dev` 这个包，在后面使用 rails 启动服务的时候会报 `Could not find gem 'pg (~> 1.1)' in locally installed gems.` 这个错误。
    
    
3. 安装rvm 并 修改 rvm 源为国内源

    ```docker
    # 安装rvm
    RUN gpg2 --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
    RUN /bin/zsh -c 'curl -sSL https://get.rvm.io | bash -s stable'
    # 修改rvm源为国内镜像
    RUN echo "ruby_url=https://cache.ruby-china.com/pub/ruby" > /usr/local/rvm/user/db
    RUN echo 'source /usr/local/rvm/scripts/rvm' >> ~/.zshrc
    RUN /bin/zsh -c "source ~/.zshrc"
    ```
    
4. 切换容器shell模式

    ```docker
    # see https://stackoverflow.com/questions/25899912/how-to-install-nvm-in-docker/60137919#60137919
    SHELL ["/bin/zsh", "--login", "-i", "-c"]
    ```
    
    **坑3**：基础开发镜像里面安装了nvm，上面的步骤安装了rvm，理论上在当前镜像里面可以使用这两个包了，但是我在构建过程中发现 *nvm* 和 *rvm* 都不能用。
    
    经过大量的搜索发现要用 `["/bin/zsh", "--login", "-i", "-c"]` 这种模式的shell才可以。
    
    参考：https://stackoverflow.com/questions/25899912/how-to-install-nvm-in-docker/60137919#60137919
    
    
5. 安装 Node 和 Ruby

    ```docker
    # 安装Node
    RUN nvm install --lts
    RUN nvm use --lts
    RUN corepack enable

    # 安装Ruby
    # see https://stackoverflow.com/a/72216805
    RUN rvm install ruby-3.1.2
    RUN rvm --default use ruby-3.1.2
    ```
    
    **坑4**：Ruby 版本的问题，本来是想用 Ruby 3.0.0 的，但是 Ruby 3.0.0 在 Ubuntu 22.04 版本下安装不了！！！
    
    会报：`Error running '__rvm_make -j4'` 的 错误。
    
    具体原因参考：https://stackoverflow.com/a/72216805
    
    所以只能安装 3.1.x 以上的版本。
    
    
6. 修改 gem 和 bundle 的源


    ```docker
    # 修改gem和bundle源为国内源
    RUN gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/
    RUN bundle config mirror.https://rubygems.org https://gems.ruby-china.com
    RUN gem update --system
    ```
    
    
    gem 和 bundle 都是 Ruby 中管理包的工具，我试图区分它们之间的区别，但是失败了，我搜了好多帖子都是讲实现的，我目前的理解是：
    
    1. gem 用于全局安装包
    2. bundle 用于在项目内根据 Gemfile 安装包，便于版本管理。
    
    写到这里就有点头疼了，虽然 Node.js 的包管理工具很多，但是关于用法基本不会出现歧义，而且项目安装、全局安装都可以用一个工具完成，不知道Ruby为何需要用两个。
    
    
7. 安装 Rails 和 bundler

    ```docker
    # see： https://teratail.com/questions/614nlzx9v4oa4l
    RUN gem install rails bundler
    ```
    
    没错！这里安装bundler也是为了解决一个坑
    
    **坑5**：
    
    本来是不需要安装 bundler 的，但是我在用 Rails 初始化项目的时候会报：`(defined?(@source) && @source) || Gem::Source::Installed.new` 错误。
    
    参考这篇帖子 https://teratail.com/questions/614nlzx9v4oa4l ，用 gem 安装一下bundler即可。
    
8. 将shell切换回原来的模式

    ```docker
    # 为了让 vscode 容器默认使用配置好的 oh my zsh
    ENV SHELL /bin/zsh
    SHELL ["/bin/zsh", "--login", "-c"]
    ```
    
项目的基本配置就搞定了，完整配置：
 
```docker
FROM madao1994/oh-my-docker:base

WORKDIR /root/repos

RUN apt-get update
# 不安装 libpq-dev 会导致 Could not find gem 'pg (~> 1.1)' in locally installed gems. 的报错
RUN apt-get install -y gnupg2 libpq-dev

# 安装rvm
RUN gpg2 --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
RUN /bin/zsh -c 'curl -sSL https://get.rvm.io | bash -s stable'
# 修改rvm源为国内镜像
RUN echo "ruby_url=https://cache.ruby-china.com/pub/ruby" > /usr/local/rvm/user/db
RUN echo 'source /usr/local/rvm/scripts/rvm' >> ~/.zshrc
RUN /bin/zsh -c "source ~/.zshrc"

# see https://stackoverflow.com/questions/25899912/how-to-install-nvm-in-docker/60137919#60137919
SHELL ["/bin/zsh", "--login", "-i", "-c"]
# 安装Node
RUN nvm install --lts
RUN nvm use --lts
RUN corepack enable

# 安装Ruby
# see https://stackoverflow.com/a/72216805
RUN rvm install ruby-3.1.2
RUN rvm --default use ruby-3.1.2

# 修改gem和bundle源为国内源
RUN gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/
RUN bundle config mirror.https://rubygems.org https://gems.ruby-china.com
RUN gem update --system
# see： https://teratail.com/questions/614nlzx9v4oa4l
RUN gem install rails bundler

# 为了让 vscode 默认使用 zsh
ENV SHELL /bin/zsh
SHELL ["/bin/zsh", "--login", "-c"]
```

## 使用 vscode 构建开发容器

安装了 *Remote - Containers* 扩展之后，用vscode打开当前项目，输入`command + shift + p` 
找到`Reopen in Container` 命令执行

![reopen-in-container_1659088455463.png](/static/images/posts/reopen-in-container_1659088455463.png "reopen-in-container_1659088455463.png")

然后点击右下角的show log可以查看过程。

第一次有点慢，后面就会快很多。


等到左下角出现：*Dev Container: xxx*的时候就表示成功了。

然后在 Docker 的桌面端可以找到这个容器和它对应的Volumes：

![vscode-docker-container_1659089972685.png](/static/images/posts/vscode-docker-container_1659089972685.png "vscode-docker-container_1659089972685.png")

![vscode-docker-volumes_1659089980944.png](/static/images/posts/vscode-docker-volumes_1659089980944.png "vscode-docker-volumes_1659089980944.png")

volumes 里面的数据会被持久化

然后在vscode 中 新建一个终端

![vscode-new-terminal_1659090196899.png](/static/images/posts/vscode-new-terminal_1659090196899.png "vscode-new-terminal_1659090196899.png")

这个终端就是容器内的环境了。

可以看到目录是 `/workspaces/peach-ledger` 这个目录对应的就是项目根目录，在里面的任何操作都会同步到容器外的项目根目录。

但是不在这里进行开发，在之前设置的'/root/repos'目录下进行开发。

```
cd ~/repos

code .
```

执行上面两句命令就可以使用vscode 打开repos目录。


# 创建数据库容器

我一开始是想把数据库也一起放进开发容器里的，后来想了想如果开发容器挂了，会导致数据库也一起挂了，岂不是很不妙，所以还是分开吧。

数据库的容器创建在我写这个博客项目的时候就用过了，本想没啥问题，结果还是出了一点小问题。

回到本机的终端（不要在vscode容器里执行）执行：

```
docker run -d \
--name peach-ledger.bd \
-e POSTGRES_PASSWORD=BA7YN1NDWdmAEyHUYf5c \
-e POSTGRES_USER=admin \
-e POSTGRES_DB=peach_ledger_development \
-v $PWD/database/peach-ledger:/var/lib/postgresql/data \
-p 5432:5432 \
--network peach-ledger-network \
postgres:latest
```

上面就是创建数据库容器的命令了，和我之前不同的是我这次初始化时创建的数据库名字叫 `peach_ledger_development`，以前都是`admin`，就是这点不同导致出现了一些问题。

首先我创建好之后，就进去容器看一下，输入 `psql -U admin` 登录用户，结果发现登录不了，报：`database "admin" does not exist`。

解决方案，还是Google大法，找到了这样一个帖子：https://stackoverflow.com/a/32660772

```
psql -d <first database name> -U <first database user name>
```

那么只要输入：`psql -d peach_ledger_development -U admin` 就可以正常登录了。


## 使用 Rails 初始化项目

回到 vscode 容器中，确保当前目录为`root/repos`, 然后执行

```
rails new --api --database=postgresql --skip-test peach-ledger
```

上面的命令是让 rails 创建一个只提供api的应用，`--skip-test` 表示跳过测试，因为课程里有单独的测试，所以这里就照搬课程里面的。


然后进入 `peach-ledger` 目录里面，找到`config/database.yml` 文件。

这个文件就是配置数据库的地方，找到：

```yml
development:
  <<: *default
  database: peach_ledger_development
```

跟在这上面的代码后面写上：

```yml
username: admin
password: BA7YN1NDWdmAEyHUYf5c
host: peach-ledger.bd
port: 5432
```

完整版：

```yml
development:
  <<: *default
  database: peach_ledger_development
  username: admin
  password: BA7YN1NDWdmAEyHUYf5c
  host: peach-ledger.bd
  port: 5432
```

一般来说这些东西都用环境变量来实现，不然你的代码提交到github后，密码什么的都泄漏了，

所以改用环境变量

在 `~/repos/peach-ledger` 创建`.env`文件：

```
POSTGRES_USER=admin
POSTGRES_PASSWORD=BA7YN1NDWdmAEyHUYf5c
POSTGRES_DB=peach_ledger_development
```

然后修改`/root/repos/peach-ledger/config/database.yml`为：

```yml
development:
  <<: *default
  database: <%= ENV['POSTGRES_DB'] %>
  username: <%= ENV['POSTGRES_USER'] %>
  password: <%= ENV['POSTGRES_PASSWORD'] %>
  host: peach-ledger.bd
  port: 5432
```

再找到 `Gemfile` 文件添加：

```
gem 'dotenv-rails'
```

不要忘了把 `.env` 添加到 `.gitignore` 里面

然后执行：`rails s` 启动服务～

然后会报错：

```
rescue in create_default_data_source': tzinfo-data is not present. Please add gem 'tzinfo-data' to your Gemfile and run bundle install (TZInfo::DataSourceNotFound)
```

我遇到这个错误的时候内心是绝望的，真的想放弃了。

我是在一个youtube的视频里找到解决办法的：https://www.youtube.com/watch?v=nmhuePCqN9s

解决办法就是在`Gemfile` 文件里找到：

```
gem "tzinfo-data", platforms: %i[ mingw mswin x64_mingw jruby ]
```

把这个改成：

```
gem "tzinfo-data"
```

然后执行：

```
bundle update

bundle install
```

执行完了之后，再执行：`./bin/rails s`

打开浏览器，输入：`http://127.0.0.1:3000/`

当你看到


![rails-init_1659093276679.png](/static/images/posts/rails-init_1659093276679.png "rails-init_1659093276679.png")

页面的时候，表示成功了。

完整代码参考：

- [oh-my-docker](https://github.com/GreedyWhale/oh-my-docker)

- [oh-my-env.peach-ledger](https://github.com/GreedyWhale/oh-my-env.peach-ledger)

## 感受

比起复杂的配置我觉得更打击我积极性的是网络的高墙，你不仅要配置一堆的镜像，还要能用Google去搜索，这些问题我用百度的话一辈子也解决不了。

配置的过程十分的困难，这只是前两节课的内容，而我花了快一周的时间才搞定。

不过我觉得是值得的，我因为环境问题重装系统的次数也不少了，mac重装系统下载起来更是绝望。

期待没有墙的那天可以早点到来。

