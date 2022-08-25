---
title: 'MADAO观察日记-Rails的测试及密钥管理'
labels: ['Ruby', 'Rails']
introduction: '有关 Rails 框架的单元测试及密钥管理的笔记'
---

## 前言

经过快一个月的时间，终于把*桃子记账*的前端页面写完了，最终还是选择使用 React 作为前端的开发框架，我看了课程使用Vue3进行开发的过程，发现它相比 React 没什么特别吸引我去使用的特性，感觉语法糖过多也是一种负担，对 TypeScript 的支持也没有 React 那么好，唯一感到很不错的是国内的 Vue3 的组件库要比 React 多一点，React 能用的国内组件库就 ant desgin 比较让人放心，但是又是阿里系出品，很纠结。

这篇笔记记录一下 Rails 中的密钥管理和单元测试部分，后面就要开始后端的开发了，这部分的知识已经忘的差不多了，所以记录一下。


## Rails 中的单元测试

Rails 作为一个六边形战士类的框架，自己本身就带了单元测试的功能，但是这次不用 Rails 自带测试功能，使用第三方的测试框架。

在开始之前，先推荐一个网站[ruby-toolbox](https://www.ruby-toolbox.com/)，里面有很丰富的 Ruby的第三方库列表，可以方便的找到想要的库。

这里就不得不说一下，这个网站做的要比NPM官方的网站好很多：

首先它有一个分类功能，点进去 testing_frameworks 分类下，它会详细的列出各个库或者框架的参数，比如：下载量、活跃程度、GitHub 的 star 数量等等，你可以很轻松的找到健康程度较好的库或框架，用户体验极好。

按照排名和课程，这里就选择 rspec 这个框架。


### 1. 安装rspec

安装没啥说的，直接去 [rspec-rails](https://github.com/rspec/rspec-rails/tree/main) 的仓库按照文档来就可以了：

1. 在 Gemfile 中添加下面内容，注意只在 test 和 development 环境添加。

    ```ruby
    # Run against this stable release
    group :development, :test do
        gem 'rspec-rails', '~> 6.0.0.rc1'
    end
    ```

    我在做这个项目的时候，最新版本就是 `6.0.0.rc1`，如果按照文档的写法，写`~> 6.0.0`会出现找不到的问题，所以这里使用`6.0.0.rc1`。

2. 执行 `bundle install`
3. 执行 `./bin/rails generate rspec:install` 生成模版文件。

    模版文件的作用，需要看里面的注释，都是英文写的，看的头痛，先跳过。


### 2. 搭建测试环境

之前的笔记中，开发的数据库使用的是`peach_ledger_development`，并且写在了`.env`文件里面，测试服务器就和开发服务器名字不同，其他参数都一样，只需要在 `.env` 文件中添加一个：

```
TEST_POSTGRES_DB=peach_ledger_test
```

然后在 `/config/database.yml`中添加如下内容：

```yml
test:
  <<: *default
  database: <%= ENV['TEST_POSTGRES_DB'] %>
  username: <%= ENV['POSTGRES_USER'] %>
  password: <%= ENV['POSTGRES_PASSWORD'] %>
  host: peach-ledger.bd
  port: 5432
```

执行 `./bin/rails db:create RAILS_ENV=test` 就可以创建一个测试环境的数据库了。

接下来需要创建一个数据表，因为后端主要接口方面的测试也就是 *Model* 和 *Controller*，按照教程先测试 Model。


1. 创建 test_demo Model


    ```
    ./bin/rails g model TestDemo email:string:index code:string{16}
    ```
    
    当rspec-rails安装完成后创建Model的时候会自动创建一个 `/spec/models/xxx_spec.rb` 文件，这个文件就是写测试用例的文件。
    
2. 将TestDemo同步到数据库中

    ```
    ./bin/rails db:migrate RAILS_ENV=test
    ```


### 3. 写测试用例

测试相关的框架语法都很类似，一般都是*期待 xxx 等于 xxx* 这种类似自然语言的语法。

在 `/spec/models/test_demo_spec.rb` 中写入以下内容

```rb
# /spec/models/test_demo_spec.rb

require 'rails_helper'

RSpec.describe TestDemo, type: :model do
  it "含有 email 字段" do
    demo = TestDemo.new(email: '19890535@qq.com')
    expect(demo.email).to eq('19890535@qq.com') # 这一句就是期待 xxx 等于 xxx
  end
end
```

执行：`bundle exec rspec` 就可以运行测试用例。

运行结果中绿色的`.`就表示一个测试用例通过，大写的 `F` 则表示失败。

更详细文档可以参考 [RSpec Rails 5.1](https://relishapp.com/rspec/rspec-rails/v/5-1/docs/gettingstarted)

除了可以测试 Model 还可以测试 request（请求）、controller、Mailer（邮件发送）等等，测试请求的时候也不用安装请求库，直接使用请求方法 + 地址的形式即可，十分便捷，比如：

```
get '/api/v1/user/1'

expect(response).to have_http_status(200)
```

这样就可以测试 get 请求了。

## Rails 中的密钥管理

打开一个 Rails 的项目，在 config 目录下，可以找到两个文件：

1. credentials.yml.enc
2. master.key

credentials.yml.enc 是一个加密的文件，放进git进行管理没有问题，但是要注意 master.key 是用来解密的密钥，不能放进 git 中进行版本管理。

如果想要查看已有的密钥可以这样操作：

```
# 开启 Rails 控制台
./bin/rails c
```

```rb
# 查看所有的密钥
Rails.application.credentials.config
```

1. 创建/编辑 密钥

    创建和编辑密钥都是同一个命令：

    ```
    EDITOR="code --wait" ./bin/rails credentials:edit
    ```

    上面命令会使用 vscode 打开一个文件，默认会有一个 *secret_key_base* 密钥。
    
    这个密钥是 Rails 中基本的加密密钥，比如对cookie的加密，它自动生成的，不要删除。
    
    你可以按照相同的格式添加各种密钥，比如：
    
    ```rb
    # email key
    email_key: i0dZPbdyjj8eh8QjLqa4AXVt7Nm

    # 无用的密钥
    demo_key: iusKzwLMmPDK0qeJkHZT1RdVTta
    ```
    
    然后关闭这个文件，这个文件就会消失，取而代之的是，你的 config 目录下会多出 `credentials.yml.enc` 和 `master.key` 文件。
    
    如果要查看刚刚创建的密钥：
    
    1. 打开 Rails 控制台
    
    2. 在控制台输入：`Rails.application.credentials.config`
    
    3. 或者只获取单个的：
    
        ```rb
        Rails.application.credentials[:email_key]
        Rails.application.credentials[:demo_key]
        ```
        
2. 创建/编辑多环境的密钥

    创建/编辑不同环境的密钥只需要在之前命令中加上 `--environment`参数即可：
    
    **e.g.**
    
    ```
    EDITOR="code --wait" ./bin/rails credentials:edit --environment production
    ```
    
    注意这样生成的文件中没有secret_key_base，你需要自己添加，然后保存并且关闭当前文件，在`/config/credentials`目录下面就会多出两个文件：
    
    - production.yml.enc
    - production.key
    
    同样的production.key文件不要放进git中，Rails会自动帮你添加进 `.gitignore` 中。
    
    读取的时候需要将 Rails 的环境变量设置成密钥对应的即可读取：
    
    ```
    RAILS_ENV=production ./bin/rails c
    ```
    
    ```rb
    Rails.application.credentials.config
    ```
