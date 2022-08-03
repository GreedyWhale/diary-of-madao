---
title: 'MADAO观察日记-Ruby和Rails的基础知识'
labels: ['Ruby', 'Rails']
introduction: '记录一下Ruby的基本语法和Rails的简单用法'
---

![post_blog_13_cover_1659522229024.jpeg](/static/images/posts/post_blog_13_cover_1659522229024.jpeg "post_blog_13_cover_1659522229024.jpeg")

## 环境

Ruby - 3.1.2
Rails - 7.0.3.1

## 前言

开发环境在上一篇笔记中已经搭建完成了，但是我还不会写Ruby，Rails也不会用，所以这一篇记录一下有关 Ruby 和 Rails 的基础知识。


## Ruby

Ruby 是一门纯粹的面向对象的编程语言，也就是常常听到的一切都是对象，在 Ruby 中字符串、布尔值、nil、数字这些看起来是基本类型的数据其实都是对象。

**e.g.**

```ruby
p '字符串'.to_sym # :字符串
p 123.to_s # "123"
p true.to_s # "true"
p nil.to_s # ""
```

Ruby 有一个我很不喜欢的地方就是好多地方不用`{}`，不知道是 JavaScript 写多了还是怎么回事，我觉得`{}`的语法对阅读代码很有帮助。


### 一. 数据类型

Ruby 中有以下几种数据类型：

1. Number
2. String
3. Ranges
4. Symbol
5. Array
6. Hash
7. true/false
8. nil

#### 1. Number

```ruby
# 基本的计算

1 + 1   # 2
5 - 1   # 4
5 * 5  # 25
15 / 5  # 3
2 ** 10  #=> 1024
5 % 2   #=> 1
```

`**`表示的是指数运算，还有一个需要注意的是，如果是除不尽的情况，比如：

```ruby
5 / 2 # 2
```

这样写Ruby不会得到浮点数，会得到一个向下取整的整数，如果想要得到浮点数需要这样写：

```ruby
5.0 / 2 # 2.5 
10.to_f / 3 # 3.3333333333333335
```

#### 2. String

String类型数据有些很有意思的语法。

- 只有双引号包裹的字符串可以插入变量

    **e.g.**
    
    ```ruby
    name = 'allen'
    
    'hello! #{name}' # "hello! \#{name}"
    "hello! #{name}" # "hello! allen"
    ```
    
- String 和 Number 类型的数据不能合并

    **e.g.**
    
    ```ruby
    'hello' + 10 # 报错
    
    'hello' + 10.to_s # "hello10"
    ```
    
    我觉得报错的设计很不错，在 JavaScript 中会进行隐式转换，经常得到一些让人意想不到的结果，隐式转换的规则又难记，面试又爱问，真的很烦。
    
- String 和 Number 相乘

    **e.g.**
    
    ```ruby
    'hello ' * 5 # "hello hello hello hello hello "
    ```
    
- String 合并

    **e.g.**
    
    ```ruby
    'hello' + ' world' # "hello world"
    
    'hello' << ' world' # "hello world"
    ```
    
#### 3. Ranges

Ranges 表示一个区间（范围），比如`1..5`就表示`1, 2, 3, 4, 5`，`1...5`表示`1, 2, 3, 4`不包括5。



**e.g.**

```ruby
(1..5).each do |n|
    p n # 1 2 3 4 5
end

(1...5).each do |n|
    p n # 1 2 3 4
end
```

#### 4. Symbol


Symbol 表示不可变对象。

**e.g**

```ruby
'name'.object_id # 70700
'name'.object_id # 72780

:name.object_id # 71708
:name.object_id # 71708

:'name'.object_id # 71708
```

看例子能看出来两个一样的字符串`name`它们的内存地址是不一样的，但是相同的Symbol内存地址一定是一样的。

所以 Symbol 更多的是当作`key`使用，可以保证这个`key`的唯一性。

#### 5. Array

```ruby
arr = [1,2,3,4]

# 获取数组的第一项
arr[0] # 1
arr.first # 1
# [0] 这种写法是语法糖，相当于调用Array对象的[]方法
arr.[] 0 # 1

# 从末尾开始获取数组的元素
arr[-1] # 4
arr.last # 4
arr.[] 3 # 4

# 下标超出数组长度
arr[10] # nil

# 截取数组，指定开始位置和长度
arr[0, 2] # [1, 2]

# 截取数组，指定范围
arr[1..3] # [2, 3, 4]

# 逆转数组
arr.reverse # [4, 3, 2, 1]
arr.reverse! # [4, 3, 2, 1]

arr.reverse! == arr # true
arr.reverse == arr # false

# 添加数组元素
arr.push(5) # [1,2,3,4,5]
arr << 6 # [1,2,3,4,5,6]

# 检查元素
arr.include?(2) # true
```

上面只是列举了一小部分的用法，上面需要特别说明的两个地方：

1. reverse! 和 reverse

   这两个方法都是逆转数组，区别是 reverse! 是对原数组进行修改，reverse 则是直接返回一个新数组，所以会出现：
   
   ```ruby
   arr.reverse! == arr # true
   arr.reverse == arr # false
   ```
2. include?

    `?`不是什么特殊的操作符，而是 Array 对象的方法名就是 `include?`
    
个人感觉Ruby 中数组的方法比 JavaScript 的要好用许多，尤其是操作原数组只要加上`!`就可以了，而 JavaScript 则是要去记方法名，很容易搞混。


#### 6. Hash

Hash 是Ruby中表示键值对集合的数据类型，它有两种写法：

**e.g.**

```ruby
user1 = {
    'name' => 'jack',
    'age' => 20
}

user2 = {
    name: 'allen',
    age: 15
}

user1.keys # ["name", "age"]
user2.keys # [:name, :age]
```

可以看出`key: value`这种写法，hash对象的键会变成 Symbol类型。


#### 7. true\false、nil

这三种类型的数据暂时没有什么需要特别说明的地方，nil就相当于 JavaScript 中的 null，它们都是对象。


### 二. 运算符

常见的运算符这里就不说明了，这里主要记录下我从未见过的运算符。

1. <=>

    <=> 叫做组合比较运算符
    
    ```ruby
    1 <=> 10 # -1
    1 <=> -1 # 1
    1 <=> 1 # 0
    ```
    
    把进行比较的两个数称为*a*和*b*：
    
    - 当*a*小于*b*的时候返回-1
    - 当*a*大于*b*的时候返回1
    - 当*a*等于*b*的时候返回0
    
 2. ===
 
     Ruby中的===不能说是进行相等比较，它更像是包含关系的比较，比如a是否包含b。
     
     ```ruby
     (1..5) === 3 # true
     (1..5) === 6 # false
     
     String === 'name' # true
     String === 1 # false
     ```

### 三. 流程控制语句

#### 1.条件语句

```ruby
if true
  # do something
elsif false
  # do something
else
  # do something
end
```

语句要以end结尾，这也是我不喜欢的语法，我喜欢`{}`

#### 2. 循环语句

Ruby 中循环语句的写法就多了

```ruby
# 挑选数组中的偶数

origin_arr = [1,2,3,4,5,6,7,8,9,10]
even_arr = []

origin_arr.each do |item|
  if item.even?
    even_arr << item
  end
end

p even_arr # [2, 4, 6, 8, 10]

# 其他写法

[1,2,3,4,5,6,7,8,9,10].select{ |item| item.even? }

[1,2,3,4,5,6,7,8,9,10].select(&:even?)

(1..10).select(&:even?)
```

这里面的语法我就更讨厌的了。

讨厌的第一个点是`|xxx|`这种写法，我还记得python中也有类似的写法，不知为何看到大脑就停止思考了，第一时间会想不到`|xxx|`是什么意思。

`|xxx|` 就类似于 以下 JavaScript 代码中的value

```js
[1,2,3].forEach(value => console.log(value))
```

第二个讨厌的点是写法太多了，在多人协作中写法不同会很难受。


### 三. 变量

Ruby 中一共有5种类型的变量：

**e.g.**

```ruby

# 局部变量，以小写字母或者下划线开头
_var = 1
var = 1

defined? _var # "local-variable"
defined? var # "local-variable"

# 全局变量，以 $ 开头
$var = 2

defined? $var # "global-variable"

# 实例变量，以 @ 开头
@var = 3

defined? @var # "instance-variable"

# 类变量，以 @@ 开头
class User
  @@name = 'allen'
    def printName
      p defined? @@name
    end
end

User.new.printName # "class variable" 

# 常量，以大写字母开头
Var = 4

defined? Var # "constant"
```

### 四. 类

```ruby
class User
  # 构造函数
  def initialize(name, age)
    @name = name
    @age = age
  end

  # 方法
  def printNameAndAge
    p "name: #{@name}, age: #{@age}"
  end
end

# 创建实例
user1 = User.new('allen', 15)
# 调用实例方法
user1.printNameAndAge
```

以上就是最基础的一些语法了，还有很多就只能边看文档边开发了。


## Rails

Rails 是 Ruby 的一个开发Web应用的框架，历史挺久远的，但是功能很强大，它遵循的是 *MVC* 的设计模式。

我在上一篇笔记中有写到 Next.js 相比 Rails感觉有点简陋，是因为我初步看了看文档，发现Rails内置了*ORM*功能，创建 *Model*、*Contorller*、*View*基本都是一个命令搞定，还会贴心的帮你把目录划分好，所以让我觉得 Next.js 有点简陋，我甚至还看到 Rails 内置了 Webpack、esbuild....

这只是初步的印象，具体好不好用，还是要看看在实践中的表现。

### 一. 创建路由

这里说的路由就是平时请求的接口地址，这个项目仍然采用 RESTful 风格的设计。

在 Rails 中路由的配置在 `/config/routes.rb` 文件配置，也有对应的命令来创建。

#### 1. resources 方式

**e.g.**

```ruby
# /config/routes.rb

Rails.application.routes.draw do
  resources :demo
end
```

然后在命令行输入：`./bin/rails routes`

`rails routes` 命令的意思是：输出所有定义的路由

删除暂时用不到的信息之后，可以得到以下信息：

```md
Verb      URI Pattern              Controller#Action

GET       /demo(.:format)          demo#index
POST      /demo(.:format)          demo#create
GET       /demo/:id(.:format)      demo#show
PATCH     /demo/:id(.:format)      demo#update
PUT       /demo/:id(.:format)      demo#update
DELETE    /demo/:id(.:format)      demo#destroy
```

上面的信息表示目前定义了一个 `/demo` 路由，它支持：

- GET
- POST
- PATCH
- PUT
- DELETE

这些请求方法。

这里再简单说下PUT 和 PATCH 的区别

- PUT 用于整体替换资源，比如我要把id为1的用户替换成另外一个用户
- PATCH 用于对资源进行部分修改，比如我要把id为1的用户的名字改成另一个名字

然后 *URI Pattern* 这一部分给你是说明路由的形式，比如：`/demo/:id` 中的 *:id* 部分就是一个占位符，意味着你可以把 *:id*，替换成任何字符串。

**e.g.**

```
/demo/1
/demo/haha
```

*Controller#Action* 部分是说明这个路由对应的Controller应该要实现的方法。

*Action* 对应方法名

`GET       /demo(.:format)          demo#index` 这一整句连起来的意思就是：

以 *GET* 方式请求 */demo* 路由，会对应 demo Controller 的 *index* 方法。

但是目前还没有对应的 Controller，需要开发者自己创建，这个后面再创建，也非常方便。

假如你只想要定义路由支持 index 方法，那么可以这样写。

```ruby
Rails.application.routes.draw do
  resources :demo only: [:index]
end
```

如果你想要除了 index 之外的方法，可以这样写：

```ruby
Rails.application.routes.draw do
  resources :demo, except: [:index]
end
```

非常灵活，而且在定义路由的时候就写清楚请求方法我觉得非常不错，Next.js 就不行，所以每次请求到来我都得去判断一下请求方法，然后再选择对应的处理方法。

写到这里的时候，我突然想到*判断请求方法，再选择处理方法*，可以写成表格编程的方式，类似这样：

```js
const handlerMap = {
  get: () => xxx,
  post: () => xxx,
  ....
};

const handler = handlerMap[req.method];

if (handler) {
  handler();
}
```

这样感觉要比我博客项目的处理方式优雅，启发 + 1 。

#### 2. 非 resources 方式

除了上面那种定义方式，还可以使用以下的方式：

```rb
Rails.application.routes.draw do
  get '/demo', to: 'demo#index'
  get '/demo:id', to: 'demo#show'
  post '/demo', to: 'demo#create'
end
```

#### 3. namespace

路由部分还需要知道的一个知识点是 *namespace* 命名空间。

当这样写：

```rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :demo
    end
  end
end
```

输入：`./bin/rails routes` 得到的结果是：

```
Verb     URI Pattern                   Controller#Action

GET      /api/v1/demo(.:format)        api/v1/demo#index
POST     /api/v1/demo(.:format)        api/v1/demo#create
GET      /api/v1/demo/:id(.:format)    api/v1/demo#show
PATCH    /api/v1/demo/:id(.:format)    api/v1/demo#update
PUT      /api/v1/demo/:id(.:format)    api/v1/demo#update
DELETE   /api/v1/demo/:id(.:format)    api/v1/demo#destroy
```

每一层namespace就相当于路由中的每一层路径，那么相应的Contorller的存放位置也也会变化，上面例子中就变成了`/api/v1/`目录下的demo

### 二. 创建Controller


Rails 中创建 Controller 的命令是：

```
rails generate controller
```

可以简写成：

```
rails g controller
```

在命令行输入：`./bin/rails g controller demo`

Rails 创建一个 `app/controllers/demo_controller.rb`文件，文件内容是：

```rb
class DemoController < ApplicationController
end
```

如果这样写：`./bin/rails g controller demo index`

Rails 在创建`app/controllers/demo_controller.rb`文件的同时，还会在 `/config/routes.rb` 文件中添加：

```
get 'demo/index'
```

`app/controllers/demo_controller.rb`文件的内容也会变成：

```
class DemoController < ApplicationController
  def index
  end
end
```

index 指的就是 `DemoController` 中的方法。

非常的贴心吧，假如你不想让 Rails 帮你写路由，可以使用 *--skip-routes* 参数。

**e.g.**

```
rails g controller demo index --skip-routes
```

这里说一下为什么笔记中的rails命令都要写成`./bin/rails`。

因为 Rails 是通过gem安装的，Rails 安装完成后，它自己又执行了一次 `bundle install` 在项目内安装了一个 Rails，`./bin/rails` 就表示项目内的Rails。

有点像前端项目中全局TypeScript和项目里的TypeScript，肯定优先使用项目里的，因为它最适配项目环境。


用路由中的demo作为例子，来实现一个 *DemoController*。

首先让*DemoController*的目录层级和路由保持一致：

```
./bin/rails g controller 'api/v1/demo'
```

这样写Rails就会在 `/app/controllers/api/v1/` 目录下创建文件。

```rb
# /app/controllers/api/v1/demo_controller.rb

class Api::V1::DemoController < ApplicationController
  def index
    render json: {
      data: [
        { id: 1, name: 'user1', age: 17 },
        { id: 2, name: 'user2', age: 18 },
        { id: 3, name: 'user3', age: 19 },
      ]
    }
  end

  def create
    render json: { data: {}, message: 'created' }, status: 201
  end

  def show
    render json: { data: {}, message: "id: #{params[:id]}, method: #{request.request_method}" }
  end

  def update
    render json: { data: {}, message: "id: #{params[:id]}, method: #{request.request_method}" }
  end

  def destroy
    render json: { data: {}, message: "id: #{params[:id]}, method: #{request.request_method}" }
  end
end
```

启动服务：

```
./bin/rails s
```

使用 curl 去测试

```sh
curl http://127.0.0.1:3000/api/v1/demo -v # get

curl -X POST http://127.0.0.1:3000/api/v1/demo -v # post

curl -X PUT http://127.0.0.1:3000/api/v1/demo/1 -v # put

curl -X PATCH http://127.0.0.1:3000/api/v1/demo/1 -v # patch

curl -X DELETE http://127.0.0.1:3000/api/v1/demo/1 -v # delete
```

### 三. 创建Model

Rails 中创建 Model 的命令是：

```
rails generate model model_name field_name:type
```

**e.g.**

```
rails generate model user name:string age:integer
```

就按照上面的命令创建一个 demo 的 Model

```
./bin/rails g model demo name:string age:integer
```

执行完成后会得到2个文件：

```
db/migrate/20220803073002_create_demos.rb

app/models/demo.rb
```

*20220803073002_create_demos.rb* 这个文件是迁移文件，Rails会根据这个文件的内容操作数据库。

在操作数据库之前务必看一下文件内容，当内容确认无误之后，就可以执行：

```sh
./bin/rails db:migrate # 将迁移内容应用到数据库
```

然后通过vscode的PostgreSQL插件连接到数据库，就可以看到刚刚创建的demos表

![rails_models_demo_1659513133385.png](/static/images/posts/rails_models_demo_1659513133385.png "rails_models_demo_1659513133385.png")

还可以使用回滚功能撤销操作：

```
./bin/rails db:rollback 
```

可以添加一个 *STEP=xxx* 来指定回滚的次数。

Model 创建好之后，就可以在 Controller 中使用了。

**e.g**

```rb
# app/controllers/api/v1/demo_controller.rb

class Api::V1::DemoController < ApplicationController
  def create
    @requeset_body = JSON.parse(request.body.string)
    @demo = Demo.new(name: @requeset_body['username'], age: @requeset_body['age'])

    if @demo.save
      render json: { data: @demo, message: 'created' }, status: 201
    else
      render json: { data: {}, message: 'failed' }, status: 500
    end
  end
end
```

用 curl 测试

```
curl -H "Content-Type: application/json" --data '{"username":"allen","age":15}' -X POST http://127.0.0.1:3000/api/v1/demo -v
```

返回结果中就会有创建的记录，数据库中也会有对应的记录

```json
{"data":{"id":5,"name":"allen","age":15,"created_at":"2022-08-03T10:01:21.882Z","updated_at":"2022-08-03T10:01:21.882Z"},"message":"created"}
```

简单的用法就记录到这里了，最后再推荐一个好用的Ralis文档

[Railsドキュメント](https://railsdoc.com/)
