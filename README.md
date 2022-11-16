## 项目介绍

一个使用 Next.js 搭建的个人网站，主要用于学习笔记，做这个项目的原因是因为国内平台丧心病狂的审核机制，所以想自己搭建一个写笔记的平台。


## 坑

1. Error when performing the request

  本来部署的docker配置应该是

  ```
  corepack enable && corepack prepare yarn@1.22.11 --activate
  ```

  符合Node.js文档描述，之前的部署也是没有问题的。

  但是坑爹的腾讯云，不知道突然抽什么疯，无法使用corepack命令

  根据[Error when performing the request while installing yarn](https://stackoverflow.com/questions/70580425/error-when-performing-the-request-while-installing-yarn) 这个帖子的描述，应该是证书问题。

  所幸Node.js镜像安装好之后可以直接使用yarn，用yarn自己更新一下自己就可以了。

  也尝试过用pnpm，但是总是有些包的类型文件找不到，尝试了我能找到的所有办法都失败了，所以最终只能用yarn更新自己的办法来部署。

  血的教训，能不买国内的服务器就别买！！！