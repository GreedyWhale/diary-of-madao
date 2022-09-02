---
title: 'MADAO觀察日記 - 表单验证 & JWT'
labels: ['Rails']
introduction: '有关表单验证和JWT的一些笔记'
---

![post_blog_16_cover_1662088634172.jpeg](/static/images/posts/post_blog_16_cover_1662088634172.jpeg "post_blog_16_cover_1662088634172.jpeg")

## 表单验证

Rails 中的错误数据结构是这样的：

```rb
errors = {
    name: ['xxx', 'yyy'],
    age: ['zzz']
}
```

我最早见到这种结构是在工作中开发运营后台项目的时候，公司后端同事返回这种结构。

当时我觉得这种数据结构简直莫名其妙，因为当时的表单大部分都是这样的：

![form_demo_1661934855314.png](/static/images/posts/form_demo_1661934855314.png "form_demo_1661934855314.png")

只展示一个错误信息，这种数据结构还需要前端处理，不方便。

随着我接触越来越多的表单，渐渐可以理解到这种结构的好处了，很多网站在表单错误的时候都选择以这种方式来提醒用户：

![form_demo_1_1661935114782.png](/static/images/posts/form_demo_1_1661935114782.png "form_demo_1_1661935114782.png")

可以让用户更快速的知道表单中的哪一项填的有问题。

如果是这种需求，错误信息的结构是：

```rb
errors = {
    name: ['xxx', 'yyy'],
    age: ['zzz']
}
```
就非常合理了，而且这种结构也能满足只展示一条的情况。

接下来就封装一下表单验证器，让表单验证的时候能返回这样的数据结构。


```ts
type FormData = Record<string, any>;

export type Rules<T> = {
  key: keyof T;
  message: string;
  required: boolean | ((_value: T[keyof T]) => boolean);
}[];

type Errors<T> = {
  [key in keyof T]?: string[]
};


export const validator = <T extends FormData>(formData: T, rules: Rules<T>): Errors<T> | null => {
  const errors: Errors<T> = {};

  rules.forEach(rule => {
    const value = formData[rule.key];

    if (typeof rule.required === 'boolean') {
      if (value !== 0 && !value) {
        errors[rule.key] = errors[rule.key] || [];
        errors[rule.key]?.push(rule.message);
      }

      return;
    }

    const passed = rule.required(value);
    if (!passed) {
      errors[rule.key] = errors[rule.key] || [];
      errors[rule.key]?.push(rule.message);
    }
  });

  if (Object.keys(errors).length === 0) {
    return null;
  }

  return errors;
};
```

使用方法非常简单，首先使用者需要定义规则：

```ts
const rules = [
    { key: 'email', required: true, message: '必填' },
    { key: 'email', required: email => /.+@.+/gm.test(email), message: '邮箱格式错误' },
    { key: 'code', required: true, message: '必填' }
];
```

同一个字段可以定义多个规则，required 可以是布尔值也可以是个函数。

validator 函数会循环 rules，然后对数据进行校验。

**e.g.**

```ts
const formData = { email: '', code: '' };

const rules = [
    { key: 'email', required: true, message: '必填' },
    { key: 'email', required: email => /.+@.+/gm.test(email), message: '邮箱格式错误' },
    { key: 'code', required: true, message: '必填' }
];

validator(formData, rules);

// 结果：

// {
//     "email": [""],
//     "email": ["必填", "邮箱格式错误"],
// }
```

使用这种验证方式有一个问题，比如有不在用户可见范围的字段提交，这时候这个字段报错了，要如何处理：

```ts

// 提交数据

const formData = {
    name: 'xxx',
    age: 20,
    key: 'dadasdqwadsa' // 这个字段用户不可见，但是提交数据的时候会一起提交到后端
}

// key 字段出错，后端返回

const errors = {
    key: ['无效的key'],
}
```

这时候就会出现一个问题，怎么显示这个错误，因为在表单上没有对应的表单项，没有地方显示这个错误。

我目前的处理方法就是把这种不在表单字段里的错误都合并到表单的最后一个字段，比如上面例子中，age就是表单的最后一个字段，key字段的错误就会被合并到age字段，这个用户体验不好，这不是用户造成的错误，大部分是代码问题，可是不提示就会导致开发人员无法在用户反馈信息的时候定位错误。

我能想到的另一种处理方式是用其他方式展示不在表单字段的错误，比如弹个toast、或者显示在提交按钮下方。

我在桃子记账中采用的是第一种方式，也封装了一个合并错误的函数：

```ts
export const filterErrors = <T>(errors: Errors<T>, reservedKeys: (keyof T)[], mergedKey: keyof T) => {
  const result = {} as {[key in typeof reservedKeys[number] | typeof mergedKey]: string[]};

  Object.entries(errors).forEach(item => {
    const [key, value] = item as [keyof T, string[]];
    const isReservedKey = reservedKeys.includes(key);

    if (isReservedKey) {
      result[key] = result[key] || [];
      result[key].push(...value);
    } else if (key !== mergedKey) {
      result[mergedKey] = result[mergedKey] || [];
      result[mergedKey].push(...value);
    }
  });

  return result;
};
```

写的不太好，有用到 `as` 关键字，这可能会造成隐患，主要实在写不出不报错的类型。

用法也很简单

**e.g.**

```ts
const errors = {
    name: ["必填"],
    age: ["年龄不能是负数"],
    key: ["无效的key"]
};

filterErrors(errors, ['name', 'age'], 'age');

/**
 * 结果：
 * {
 *   age: ['年龄不能是负数', '无效的key'],
 *   name: ['必填']
 * }
 */
```


## JWT

JWT 的全称是 *JSON Web Token*，它也是一种用于验证身份的机制。

HTTP 协议是一种无状态的协议，服务端不能判断发送请求的客户端身份，所以需要一些手段来让服务端确定客户端的身份，最常见的就是 Cookie/Session 机制了。

我的博客项目使用的就是是 Cookie/Session 机制，作为一个前端我觉得这个机制非常好，是因为Cookie由浏览器管理，前端不需要做特殊的处理，Session 则需要后端存在服务器中进行维护，基本没有前端什么事。

JWT机制和 Cookie/Session 不同的地方在于：

Cookie/Session 需要客户端保存管理Session，而JWT不需要在服务端保存管理，JWT只在客户端保存管理。

JWT由服务器加密生成，然后发送给客户端，客户端需要自己管理（前端），像是浏览器它不会帮你存JWT，而服务端完全不用存JWT，只需要客户端在请求的时候将JWT带上，然后服务端进行解密，解密成功则证明JWT没有被修改，就可以验证客户端身份了。

### 1. JWT 组成

JWT 由三部分组成

1. Header

    Header 部分主要用来描述加密使用的方法，比如：
    
    ```json
    {
        "alg": "HS256",
        "typ": "JWT"
    }
    ```
    
2. Payload

    Payload 部分放置服务端携带至客户端的数据，但是注意不要放敏感数据，因为这部分是不加密的，谁都可以看到。
    
    ```json
    {
        userId: 1,
        iat: 1422779638
    }
    ```
    
    一般来说只带一个 userId 用于身份验证
    
 3. Signature
 
     Signature 部分是加密的，它的结构是：
     
     ```
     HMAC_SHA256(
       secret,
       base64urlEncoding(header) + '.' +
       base64urlEncoding(payload)
     )
     ```
     
     - HMAC_SHA256 是加密函数，可以使用不同的加密方法
     - secret 是密钥，这个需要保存起来，不要让其他人知道，最重要的一部分。
     - base64urlEncoding(header) 就是把 Header部分进行base64编码
     - base64urlEncoding(payload) 同上，对payload进行base64编码
     
将这三部分以`.`作为分隔符组合起来就是一个符合规范的 JWT

```js
const token = base64urlEncoding(header) + '.' + base64urlEncoding(payload) + '.' + base64urlEncoding(signature)
```

一般来说生成的 JWT 会放在请求头的 `Authorization` 中，用以下的格式发送：

```
Authorization: Bearer <token>
```

### 2. JWT 的刷新

我在学到这里的时候，看到有文章说 JWT 一旦签发，在过期之前都是有效的，服务端无法废弃这个有效的 JWT，除非服务端实现额外的功能去处理。

由于以上原因，如果 JWT 泄漏就会造成很大影响，所以 JWT 一般会设置一个很短的有效期，到期了之后需要进行 JWT 的刷新以延长有效期。

刷新 JWT 的方案一般是这样的：

1. 签发两个 JWT

    - 用于身份验证的 JWT，这里简称为 AT
    - 用于刷新 AT 的 JWT，这里简称为 RT
    
    AT的有效期设置为短期，比如：15分钟，RT的有效期设置为长期的，比如：1周。
    
2. 将 AT 发送到客户端，客户端自行管理，将 RT 保存在服务端服务端进行管理

3. 当 AT 过期的时候，查看对应的 RT 是否过期，如果未过期重新生成 AT 下发至客户端以达到续期的效果。

4. AT 和 RT 都过期的情况下，认为用户已过期，需要重新登录。

这种方案的好处就是，当AT泄漏的之后，只有 15分钟的有效期，服务端可以直接把对应的 RT 删除，那么这个 AT 过期了之后就不能用了。

但是仔细想想，上面还是有问题的，如果是这样那服务端为何不直接保存AT，给AT设置一个长的有效期，然后泄漏了之后删除 AT，找不到对应AT就拒绝请求。

那这不还是变成了Cookie/Session的情况了？

再来看下为什么需要 JWT 这种方案，当你的服务器不再是一台的时候，Cookie/Session 机制就会出现需要同步 Session 的问题，同步处理起来很麻烦（我没处理过，看别人文章说的），如果是 JWT 的方案，身份信息是由客户端携带的，服务端只要进行解密即可，不需要“状态”，所以 JWT 方法也是有 “无状态” 这个特性在的，刷新 JWT 也不在规范中。

所以在 JWT 的方案中：

1. 无法确定“使用者”的身份
2. 无法以无状态的方式注销，也就是无法立即结束会话
3. JWT 是重要的，不要泄漏！

结论：虽然 JWT 是重要的，但是你无法保证客户端可以做到不泄漏，所以需要一些额外的手段保证，导致了我的疑惑。


### 3. 使用 Rails 实现 JWT

1. 安装依赖 

    - 在 `Gemfile` 添加 `gem 'jwt'`
    
    - 执行 `bundle install`
    
2. 打开控制台测试

    - `./bin/rails c`
    - 输入
    
        ```ruby
        require 'jwt'
        
        payload = { user_id: 10, exp: (Time.now + 7.days).to_i }
        
        # 加密
        token = JWT.encode(payload, Rails.application.credentials[:secret_key_base], 'HS256')
        
        # 解密
        JWT.decode（token, Rails.application.credentials[:secret_key_base], true, { algorithm: 'HS256' }）
        ```
        
        HS256 是加密的方法，密钥采用了Rails自己生成的 `secret_key_base`，也可以自己重新添加一个，添加过程就不再赘述了。
        
3. 可以在浏览器中直接转译JWT的Header和Payload部分

    复制token第一段（用`.`做分割）
        
    在浏览器控制台中输入：
    
    ```js
    window.atob(第一段内容) # Header 部分
    window.atob(第二段内容) # Payload 部分
    ```
    
4. 实现 sessions 接口于自动生成 JWT

    - 创建路由
    
        ```rb
        # config/routes.rb
        
        post '/sessions', to: 'sessions#create'
        ```
        
    - 创建 controller
    
        ```
        ./bin/rails g controller api/v1/sessions
        ```
        
    - 创建 UserModel
    
        因为需要把user_id写进 JWT 中，所以需要先有一个user才行。
        
        ```
        ./bin/rails g model user
        ```
        
    - 给 UserModel 添加 generate_jwt 方法
    
        ```rb
        # app/models/user.rb
        
        require 'jwt'

        class User < ApplicationRecord
          def generate_jwt
            payload = { user_id: self.id, exp: (Time.now + 7.days).to_i }
            JWT.encode(payload, Rails.application.credentials[:secret_key_base], 'HS256')
          end
        end
        ```

     - 修改 user migrate
     
         ```rb
         # db/migrate/20220901064722_create_users.rb
         
         class CreateUsers < ActiveRecord::Migration[7.0]
           def change
             create_table :users do |t|
               t.string     :email, null: false, unique: true
               t.timestamps
             end
           end
         end
         ```
         
         其他字段还没有想好，所以先定一个 email 字段。
         
     - 同步修改到数据库
     
         ```
         ./bin/rails db:migrate
         ```
     - 修改 SessionsController
     
         ```rb
         # app/controllers/api/v1/sessions_controller.rb
         class Api::V1::SessionsController < ApplicationController
           def create
             if params[:code] == '123456'
               return send_response({}, :unauthorized, 401) unless Rails.env.test?
             else 
               auth_code = AuthCode.find_by(email: params[:email], code: params[:code], used: false)
               return send_response({}, :unauthorized, 401) unless auth_code

               send_response({}, :'Internal Server Error', 500, auth_code.errors) unless auth_code.update(used: true)
             end

             user = User.find_or_create_by(email: params[:email])
             send_response({ token: user.generate_jwt })
           end
         end
         ```
         
         写到这里突然意识到之前的验证码缺一个字段：`used`，如果没有这个字段，用户可以用同一个验证码一直登录....
         
     - 补充验证码字段
     
         ```
         # 创建 migration
         ./bin/rails g migration add_userd_field_to_auth_code
         ```
         
         ```rb
         # db/migrate/20220901075633_add_userd_field_to_auth_code.rb
         
         class AddUserdFieldToAuthCode < ActiveRecord::Migration[7.0]
           def change
             change_table :auth_codes do |t|
               t.column :used, :boolean, default: false
             end
           end
         end
         ```
         
         ```
         # 同步修改到数据库
         ./bin/rails db:migrate
         ```
         
5. 测试一下sessions接口，顺便生成接口文档

    ```rb
    # spec/acceptance/api/v1/sessions_spec.rb
    
    require 'acceptance_helper'

    resource "Sessions" do
      # 接口描述
      explanation "创建用户登录会话"

      # 请求参数说明
      parameter :email, "邮箱地址", required: true, type: :string
      parameter :code, "验证码", required: true, type: :string

      post "/api/v1/sessions" do
        let(:email) { 'test@qq.com' }
        let(:code) { '123456' }

        example "创建会话" do
          do_request
          expect(status).to eq 200

          json = JSON.parse(response_body)
          expect(json["data"]["token"]).to be_a(String)
        end
      end
    end
    ```
