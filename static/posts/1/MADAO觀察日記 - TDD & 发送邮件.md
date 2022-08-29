---
title: 'MADAO觀察日記 - TDD & 发送邮件'
labels: ['TDD', 'Rails']
introduction: '使用测试驱动开发的模式实现发送邮件的接口'
---

![post_blog_15_cover_1661761803214.jpeg](/static/images/posts/post_blog_15_cover_1661761803214.jpeg "post_blog_15_cover_1661761803214.jpeg")

## 前言

好早之前就接触过TDD的概念，也是在方应杭老师的课程上第一次知道的，但是一直没用过，写这个博客项目的时候甚至没有加测试，最近公司要开新项目，结合之前的开发经验，我觉得有必要写集成单元测试功能到项目里，因为之前的项目后期更新迭代的时候基本都靠记忆来排除新功能对旧功能的影响，bug出现的几率很高，我觉得用单元测试可以改变现状，正好用这个项目来练练手。


## TDD

TDD 的全称是：

> Test-driven developmen - 测试驱动开发

也就是说先写测试用例，然后再写代码，最终让代码通过测试的开发模式。

## 关于 Rails 中的命名约定

[naming-conventions](https://guides.rubyonrails.org/active_record_basics.html#naming-conventions)

总结一下就是：

1. Conroller 使用复数单词
2. Model 使用单数单词
3. 数据表的命名使用复数单词（Rails自动生成）

这里记录这个的原因是，我总是搞不清什么时候该用复数单词

## 安装依赖

- rspec_api_documentation

    rspec_api_documentation 这个库是用来生成接口文档的，它可以让你在测试的同时，生成接口文档。
    
    安装过程没有碰到意外，跟着官网文档安装即可
    
    [文档地址](https://github.com/zipmark/rspec_api_documentation)

- http-server

    这是一个 Node.js 的包，用来本地查看接口文档。
    
    因为是在容器里面开发的，接口文档生产的是一些html文件，无法直接在容器里面通过浏览器打开。
    
    rspec_api_documentation 官方推荐了两个可以通过json + Rails 自己的服务器预览的库，但是我看了下活跃度，感觉都是年久失修的库，所以这里不使用这种方案。
    

## 配置 rspec_api_documentation

因为这个项目的前后端都是使用 json 格式来交换数据的，所以配置一下 rspec_api_documentation 的全局请求头。

全局请求头配置官方并没有提供，我是通过一个 issue 找到的解决方法。

[Is it possible to define headers for all requests and filter out specific headers from generated files? ](https://github.com/zipmark/rspec_api_documentation/issues/273#issuecomment-216050458)

1. 创建 *spec/acceptance_helper.rb* 文件

    ```rb
    require 'rails_helper'
    require 'rspec_api_documentation/dsl'

    RSpec.configure do |config|
      config.before(:each) do |spec|
        if spec.metadata[:type].equal? :acceptance
          header 'Accept', 'application/json'
          header 'Content-Type', 'application/json'
        end
      end
    end
    ```

2. 修改 *spec/spec_helper.rb*

    ```rb
    # 已有的配置不要删除

    RspecApiDocumentation.configure do |config|
      config.request_body_formatter = :json
    end
    ```

## 写测试用例

创建 *spec/acceptance/api/v1/auth_codes_spec.rb* 文件

```rb
require 'acceptance_helper'

resource "Auth Codes" do
  # 接口描述
  explanation "发送邮件验证码"

  # 请求参数说明
  parameter :email, "邮箱地址", required: true, type: :string
  parameter :scene, "验证码类型", required: false, type: :string, enum: ['signIn']

  post "/api/v1/auth_codes" do
    # 声明请求参数
    let(:email) { '383911973@qq.com' }

    # :document => false 表示这个用例只测试不生成文档
    example "请求参数必须携带 email", :document => false do
      do_request(:email => '')

      expect(status).to eq 422
    end

    example "目前只支持发送用于登录的验证码", :document => false do
      do_request(:email => :email, :scene => :signUp)

      expect(status).to eq 422
      expect(JSON.parse(response_body)['errors']['scene']).not_to be_empty
    end

    example "可以正常发送邮件", :document => false do
      _email = '383911973@qq.com'
      _auth_code = '123456'
      SignInMailer.sign_in_auth_code_email(_email, _auth_code).deliver_now
      ActionMailer::Base.deliveries.last.tap do |mail|
        if !mail
          skip "正常发送的邮件不会放进 ActionMailer::Base.deliveries，所以跳过这个测试"
        end

        expect(mail.from.join('')).to eq(Rails.application.credentials[:email_account])
        expect(mail.to.join('')).to eq(_email)
        expect(mail.subject).to eq('桃子记账验证码')
        expect(mail.body.to_s.match(/<code>(\w{6})<\/code>/iom)[1]).to eq(_auth_code)
      end
    end

    example "发送验证码" do
      do_request

      expect(status).to eq 200
    end
  end
end
```

以上测试用例中只有*可以正常发送邮件*这一个用例是我先开发好才写的，因为实在是不熟悉 Rails 的各项配置，浪费了许多时间，一边看文档一边写。


## 创建接口相关文件

1. 确定验证码表结构：

    - email - 接收邮箱
    - code - 验证码内容
    - scene - 验证码使用场景，比如：登录、找回密码之类
    
2. 创建路由

    ```rb
    # config/routes.rb
    
    Rails.application.routes.draw do
      namespace :api do
        namespace :v1 do
          post '/auth_codes', to: 'auth_codes#create'
        end
      end
    end
    ```
    
3. 创建 Controller

    ```
    ./bin/rails g controller 'api/v1/authCodes'
    ```
    
    ```rb
    class Api::V1::AuthCodesController < ApplicationController
      def create

      end
    end
    ```
    
4. 创建 Model

    ```
    ./bin/rails g model auth_code
    ```
    
    ```rb
    class AuthCode < ApplicationRecord
      
    end
    ```

5. 修改 migration

    ```rb
    # db/migrate/20220826064550_create_auth_codes.rb
    
    class CreateAuthCodes < ActiveRecord::Migration[7.0]
      def change
        create_table :auth_codes do |t|
          t.string     :email, null: false
          t.string     :code, limit: 16
          t.string     :scene, limit: 64, default: :signIn
          t.timestamps
        end
      end
    end
    ```
    
    ```bash
    # 同步变更到数据库
    ./bin/rails db:migrate
    
    # 测试环境也要同步
    ./bin/rails db:migrate RAILS_ENV=test
    ```

## 编写 Model 的内容


```rb
class AuthCode < ApplicationRecord
  # 验证码类型
  @@scenes = ['signIn']

  # 验证邮箱字段，必传
  validates :email, presence: true
  # 目前只支持登录类型的验证码
  validates :scene, acceptance: { accept: @@scenes, message: "验证码类型错误，可接受的类型为：#{@@scenes.join(',')}" }

  # 创建记录之前调用 generate_code 方法
  before_create :generate_code
  # 创建记录之后调用 send_email 方法
  after_create :send_email

  # 生成随机验证码
  def generate_code
    self.code = SecureRandom.random_number.to_s[2..7]
  end

  # 发送邮件，暂未实现
  def send_email
    
  end
end
```

上面代码很简单，基本每一行代码都写了注释，`before_create`、`after_create` 这些都是 Rails 自带的功能，可以从官方文档上了解更多[Active Record Callbacks](https://guides.rubyonrails.org/active_record_callbacks.html)


## 实现发邮件的功能

1. 找到发送方邮箱的设置，这里我用QQ邮箱举例。

    - 设置 -> 账户 -> 开启 POP3/SMTP服务 和 MAP/SMTP服务
    - 设置 -> 账户 -> 勾选 MTP发信后保存到服务器
    - 保存设置
    - 点击 *生成授权码*，按照它提示的发送短信，然后可以获得一个16位的授权码，将这个授权码保存起来
    
    这里需要特别说明一下，我测试的时候用QQ邮箱发邮件，总是不成功，各种设置都是正确的，QQ邮箱就是返回账号和授权码不匹配，直到过完周末第二天再试的时候，又莫名其妙的好了，如果出现类似情况，可以等一等或者换邮箱，我用过Gmail测试，Gmail只要设置完成就立马生效了，主要是国内用Gmail发不了邮件会超时，所以这里还是选择 QQ邮箱。
    
2. 配置邮箱相关密钥

    ```
    EDITOR="code --wait" ./bin/rails credentials:edit
    ```
    
    新增邮箱相关密钥
    
    ```rb
    # 发送邮件密码
    email_key: 这里写之前得到的16位授权码
    # 发送邮件账号
    email_account: 这里写你的QQ邮箱地址
    
    # e.g.
    
    # 发送邮件密码
    # email_key: VyCZA4L1fzki0iUY
    # 发送邮件账号
    # email_account: 383911973@qq.com
    ```

3. 配置开发环境的环境变量

    ```rb
    # config/environments/development.rb
   
    # 这一项是原有的配置，当邮件发送失败的时候是否报错，这里改成true，方便调试
    config.action_mailer.raise_delivery_errors = true
    
    # 新增    
    config.action_mailer.perform_deliveries = true
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {
      address:              'smtp.qq.com',
      port:                 587,
      domain:               'smtp.qq.com',
          Rails.application.credentials[:email_account],
      password:             Rails.application.credentials[:email_key],
      authentication:       'plain',
      enable_starttls_auto: true,
      open_timeout:         5,
      read_timeout:         5
    }
    ```

4. 创建 Mailer

    ```
    .bin/rails generate mailer SignIn
    ```
    
    因为我只有登录邮件，所以这里我就命名成了 SignIn，后面感觉命名的不好。
    

5. 修改全局 Mailer 配置

    ```rb
    # app/mailers/application_mailer.rb
    
    class ApplicationMailer < ActionMailer::Base
      # 这个就是发送方邮箱地址，刚刚已经存在密钥里了
      default from: Rails.application.credentials[:email_account]
      layout "mailer"
    end
    ```
6. 完善 `sign_in_mailer.rb`

    ```rb
    class SignInMailer < ApplicationMailer
      def sign_in_auth_code_email(email, code)
        # 这里声明变量，是为了在后面的 html 模版文件中使用
        @email = email
        @code = code
        mail(to: @email, subject: '桃子记账验证码')
      end
    end
    ```
7. 创建 `sign_in_auth_code_email.html.erb`

    在 `app/views/sign_in_mailer` 目录下创建 `sign_in_auth_code_email.html.erb` 文件。
    
    ```html
    <!DOCTYPE html>
    <html>
      <head>
        <meta content='text/html; charset=UTF-8' http-equiv='Content-Type' />
      </head>
      <body>
        <h1>欢迎登录桃子记账, <%= @email %></h1>
        <p>验证码是：<code><%= @code %></code></p>
        <p>验证码有效期为 <strong>1</strong> 分钟</p>
      </body>
    </html>
    ```
    
    变量用 `<%= %>` 包起来就可以用了，这个文件就是发送到对方邮箱的内容。
    
这些步骤完成之后就可以发送邮件了：

首先打开Rails控制台

```
./bin/rails c
```

然后输入

```rb
# 同步发送邮件到 xxx@qq.com
SignInMailer.sign_in_auth_code_email('xxx@qq.com', '123456').deliver_now
```
    
## 补全 AuthCode Model

```rb
# app/models/auth_code.rb

class AuthCode < ApplicationRecord
  # 之前代码不变

  # 发送邮件
  def send_email
    SignInMailer.sign_in_auth_code_email(self.email, self.code).deliver_later
  end
end
```

## 补全 auth_codes_controller
    
```rb
# app/controllers/api/v1/auth_codes_controller.rb

class Api::V1::AuthCodesController < ApplicationController
  def create
    @auth_code = AuthCode.new(email: params[:email], scene: params[:scene])

    if @auth_code.save
      render json: { data: {}, message: '发送成功' }, status: 200
      return
    end

    if @auth_code.errors[:email].any?
      render json: { errors: @auth_code.errors, message: '发送失败，邮箱不能为空' }, status: 422
      return;
    end

    render json: { errors: @auth_code.errors, message: '发送失败' }, status: 422
  end
end
```

## 生成接口文档

```
./bin/rake docs:generate
```

上面命令会在测试的同时生成接口文档，如果测试通过的话。

生成测试文档后，还不能直接查看，因为是在容器里面开发，所以没法用浏览器打开生成的html文件

只能通过启动一个服务器，让容器外部去访问这些文件。

```
# 在容器的项目里安装 http-server
yarn add http-server

# 启动 本地服务
yarn http-server ./doc/api -d
```

启动了服务器之后，就可以访问：http://localhost:8080/ 查看生成的文档了


到这里发送邮件接口的开发 + 文档就全部完成了。

## 同步到 test 环境

上面都是在开发环境测试的，更好做法是在test环境。

要同步的有

1. 密钥：email_key, email_account
2. 环境变量

    ```rb
    # config/environments/test.rb
    
    # 发送真实的邮件
    # config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {
      address:              'smtp.qq.com',
      port:                 587,
      domain:               'smtp.qq.com',
      user_name:            Rails.application.credentials[:email_account],
      password:             Rails.application.credentials[:email_key],
      authentication:       'plain',
      enable_starttls_auto: true,
      open_timeout:         5,
      read_timeout:         5
    }
    ```
    
    注意test环境默认是不发送真实的邮件的：
    
    ```rb
    # Tell Action Mailer not to deliver emails to the real world.
    # The :test delivery method accumulates sent emails in the
    # ActionMailer::Base.deliveries array.
    config.action_mailer.delivery_method = :test
    ```
    
    它会把发送的邮件放进 `ActionMailer::Base.deliveries` 里面，所以测试的时候我是通过 `ActionMailer::Base.deliveries` 来测试邮件内容。
    
    如果想要发送真实的邮件就把这个改成：
    
    ```rb
    config.action_mailer.delivery_method = :smtp
    ```
    

## 感受

在不熟悉测试框架的语法情况下写测试代码的时间超过了写开发代码的时间，还要保证测试用例是正确的，比如就算测试通过，也要故意试一下错误的情况来验证，这个总感觉有点繁琐，可能是使用姿势不对。

再一个是 Rails 周边框架的资料真的好难找，Rails 的文档我就觉得太难看了，完全不知道怎么搜索相关内容，它周边框架的维护也是慢慢走向了不活跃状态。

Rails 让我感受到了早期 Webpack 带来的恐惧，功能确实很丰富，但是就是无从下手，很难想象这是一个诞生于 2004 年的框架，不确定这是不是好的方向，和我一开始使用 TypeScript的感受一样，类型本身的复杂程度已经超过了代码，后面我写习惯了，开始做TypeScript体操的时候，又感到各种写法很巧妙和好用，只不过写完了再去读的时候读的有点痛苦。

后面我还是会走开发完成之后再测试的模式，因为这个太消耗时间了，写起来总感觉不流畅。
