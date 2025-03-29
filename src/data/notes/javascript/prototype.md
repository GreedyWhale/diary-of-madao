---
title: '原型链'
subtitle: 'Tracing the prototype chain is like calling customer support—every level just redirects you to someone else.'
author: 'Caisr'
tags: ["JavaScript", "prototype"]
type: 'javascript'
cover: {
  image: '~/assets/images/cover/cover-5.webp',
  source: 'Ivan Bertolazzi',
  sourceUrl: 'https://www.pexels.com/photo/neon-signage-2681319/',
}
---

原型链是前端面试的高频问题，基本都会被问到，所以我个人认为理解的还算不错，直到最近看了一篇文章才发现我之前理解有点问题。

先说之前我的理解：

1. 所有对象都有一个属性指向创建该对象的函数的 `prototype` 属性，这个属性一般被称为 `__proto__`，但这不是标准里的属性，而是浏览器厂商自己实现的，推荐使用 `Object.getPrototypeOf()` 方法获取。

2. 所有函数都是由 Function 创造的，而函数也是一种对象，所以函数的`__proto__`指向 `Function.prototype`。

3. `prototype` 属性自己也是对象，所以它也有 `__proto__` 属性，这个属性指向 `Object.prototype`，因为所有对象都是由 `Object` 创造的。

4. 原型链的终点在 `Object.prototype.__proto__` 上，它指向 `null`。

这个理解有个问题：

1. `Function.prototype` 不是普通的对象，它是一个函数对象

    ```javascript
    typeof Function.prototype // 'function'
    ```

2. 并不是所有的函数的`__proto__`都指向 `Function.prototype`。

    ```javascript
    Function.prototype.__proto__ !== Function.prototype // false
    Function.prototype.__proto__ === Object.prototype // true
    ```

3. 并不是所有的函数都有 `prototype` 属性

    ```javascript
    Function.prototype.prototype // undefined
    ```

当我知道这些之后，我就有点好奇，在 JavaScript 中到底是先有的 Object 还是 Function？

通过查阅资料发现是先有的 `Object.prototype`，然后 `Object.prototype` 创造 `Function.prototype`，然后 `Function.prototype` 创造了其余的 Function、 Object、 Array 等构造函数。可以这样验证：

```javascript
Object.prototype.__proto__ // null
Function.prototype.__proto__ === Object.prototype // true
Function.__proto__ === Function.prototype // true
Object.__proto__ === Function.prototype // true
```

这个理解起来有种我创建我自己的感觉，哈哈。

### 一. 原型链有什么用

原型链的作用在于通过这种链条的方式来实现继承，当我们访问一个对象的属性时，如果该对象没有该属性，那么就会沿着原型链向上查找，直到找到该属性或者到达原型链的终点，这样及节省了内存又达到了共享属性的目的。

### 二. 如何借助原型链实现继承

知道了原型链的概念后，就能明白一点，想要一个对象继承另一个对象的关键点在于让构造当前对象的函数的`prototype` 属性的 `__proto__` 指向要继承对象的构造函数的 `prototype` 属性。

```javascript
Bar.prototype.__proto__ = Foo.prototype;
```

但是你不能直接操作 `__proto__`，因为这是一个非标准属性。

在 JavaScript 中有4种方式实现

1. 最原始版本

   ```javascript
   const Foo = function (name) {
     this.name = name;
   };
   
   Foo.prototype.sayName = function () {
     console.log(this.name);
   };
   
   const Bar = function (name, age) {
     console.log(this);
     Foo.call(this, name);
     this.age = age;
   };
   
   const emptyFn = function() {};
   
   emptyFn.prototype = Foo.prototype;
   
   Bar.prototype = new emptyFn();
   Bar.prototype.constructor = Bar;
   Bar.prototype.sayAge = function () {
     console.log(this.age);
   };
   
   const bar = new Bar('bar', 1);
   ```
   
   这里的实现借助了 new 操作符的运作机制，当你使用 new 操作符调用一个函数的时候，实际上是做了以下几件事
   
   ```javascript
   const obj = {};                     // 1. 创建新空对象
   obj.__proto__ = Bar.prototype;       // 2. 绑定原型链
   Bar.call(obj, 'a', 2);              // 3. 将 Bar 的 this 强制绑定到 obj
   return obj;                         // 4. 返回构造后的对象
   ```
   
   还有一个要注意的点在于，使用了一个空函数来避免重复的属性。
   
   ```javascript
   const emptyFn = function() {};
   
   emptyFn.prototype = Foo.prototype;
   ```
   
   如果直接这样写，会导致属性重复
   
   ```javascript
   const emptyFn = function() {};
   
   // 这里会需要传入 name 参数，同时 Bar.prototype.__proto__ 也会多一个name属性
   Bar.prototype = new Foo('name');
   ```

2. `Object.create`

    ```javascript
    const Foo = function (name) {
      this.name = name;
    };
    
    Foo.prototype.sayName = function () {
      console.log(this.name);
    };
    
    const Bar = function (name, age) {
      Foo.call(this, name);
      this.age = age;
    };
    
    Bar.prototype = Object.create(Foo.prototype);
    Bar.prototype.constructor = Bar;
    Bar.prototype.sayAge = function () {
      console.log(this.age);
    };
    
    const bar = new Bar('bar', 1);
    ```

3. 使用 extends

   ```javascript
   class Foo {
     constructor(name) {
       this.name = name;
     }
   
     sayName() {
       console.log(this.name);
     }
   }
   
   class Bar extends Foo {
     constructor(name, age) {
       super(name);
       this.age = age;
     }
     sayAge() {
       console.log(this.age);
     }
   }
   ```

4. 使用 setPrototypeOf

   ```javascript
   const Foo = function (name) {
     this.name = name;
   };
   
   Foo.prototype.sayName = function () {
     console.log(this.name);
   };
   
   const Bar = function (name, age) {
     Foo.call(this, name);
     this.age = age;
   };
   
   Object.setPrototypeOf(Bar.prototype, Foo.prototype);
   Bar.prototype.sayAge = function () {
     console.log(this.age);
   };
   
   const bar = new Bar('bar', 1);
   ```
