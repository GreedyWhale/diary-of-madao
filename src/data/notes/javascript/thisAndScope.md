---
title: '作用域和 This'
subtitle: 'JavaScript scope: Where a variable lives. this: Where your sanity dies.'
author: 'Caisr'
tags: ["JavaScript", "scope", "this"]
type: 'javascript'
cover: {
  image: '~/assets/images/cover/cover-6.jpg',
  source: 'Furknsaglam',
  sourceUrl: 'https://www.pexels.com/photo/city-street-with-cars-and-buildings-at-night-3109671/'
}
---

### 一. 作用域

作用域指的是一套确定变量位置以及如何查找的规则，在 JavaScript 中作用域在写代码的时候（词法分析阶段）就确定了，这种类型的作用域叫做静态作用域，与之对应的还有动态作用域。

> 词法分析指的是 JavaScript 引擎在解析代码时，将代码分解成一个个 token（词法单元）的过程。

可以对比下静态作用域和动态作用域的区别：

```javascript
// 这是 javascript 代码
var scope = 'global';
const foo = () => {
  console.log(scope);
};

const bar = () => {
  var scope = 'local';
  foo();
};

bar(); // 'global';
```

```bash
# bash 代码
scope=1

function foo () {
  echo $scope
}
function bar () {
    local scope=2
    foo
}

bar # 2
```

### 二. 全局作用域和块级作用域

全局作用域中的变量在整个程序的任何地方都可以访问到，而块级作用域中的变量只能在特定的代码块中访问。

比如：

```javascript
const a = 'hello'; // 全局作用域中的变量

const foo = () => {
  const b = 'world'; // 块级作用域中的变量
  console.log(a, b); // 'hello', 'world'
};

{
  const c = 'block';
  console.log(c); // 'block'
}

foo(); // 'hello', 'world'
console.log(a); // 'hello'
console.log(b); // 报错，b 是块级作用域中的变量，只能在 foo 函数中访问
console.log(c); // 报错，c 是块级作用域中的变量，只能在块级作用域中访问
```

在 JavaScript 中有两种方法欺骗作用域 `eval` 和 `with`。

```javascript
var a = 1;

const foo = (str) => {
  eval(str);
  console.log(a);
};

foo('var a = 2;'); // 2

function bar() {
  var c = 2;
  with(window) {
    console.log(c);
  }
}

var c = 1;

bar();   // 1
```

但是不要用 `eval` 和 `with`，因为 JavaScript 引擎不会对 `eval` 和 `with` 代码进行优化。

### 三. 变量提升

使用 `var` 声明的变量会被提升至代码头部，比如：

```javascript
console.log(a); // 可以在变量没声明之前使用

var a = 1;
```

但是使用 `let` 和 `const` 声明的变量无法在声明之前使用：

```javascript
console.log(b); // 报错

const b = 2;
```

这种现象被称为 *暂时性死区*

### 四. 闭包

提到作用域就不得不说一下闭包了，闭包是一种常用来模拟块级作用域的技术。它的具体表现形式是函数中返回一个引用了函数内部变量的函数。比如:

```javascript
const foo = () => {
  const a = 1;
  return () => {
    return a;
  };
};

console.log(foo()()); // 1
```

这样做的好处在于，变量只存在于 foo 函数的内部，不会污染全局作用域。起到了一个作用域隔离的作用。

但是这样做会有一个问题就是函数内部的变量不会被回收，会一直存在于内存中，有人说这算是内存泄漏，但是我觉得如果你需要用闭包的形式去声明一些变量，那么证明这个变量是你所需要的，不需要被回收，所以我觉得这不算内存泄漏。

### this

this 在 JavaScript 中是一个非常难记的概念，它的指向是不确定的，它的指向取决于函数的调用方式。比如我就经常记不住在事件处理函数中 this 的指向是触发事件的元素还是绑定事件的元素。

我觉得 this 之所以这么难记是因为它是函数的一个隐藏参数，而函数的参数只有在调用的时候才能确定，它又是隐藏的所以才会这么难记，如果 JavaScript 所有的函数调用都是通过 `call` 和 `apply` 来调用的，那么 this 就会很容易记了。

这里还要说明两个非常容易混淆的概念：

1. this 不指向函数本身
2. this 不指向函数的作用域

this 指向的东西是函数在运行时所需要的环境，比如：

```javascript
function foo() {
  const a = 1;
  console.log(this.a);
}

foo(); // undefined
```
这里的 this 指向的是全局对象，浏览器环境是 window，Node 环境是 global。

这样就十分不直观，但是如果这样写:

```javascript
foo.call(window)
```

一眼就能看出 this 的指向。

还有一些经典的面试题，比如：

```javascript
const obj = {
  foo: function() {
    console.log(this);
  }
};

const bar = obj.foo;
bar(); // window
```

这样指向的还是 window，因为 this 只看函数调用的方式。但是如果这样调用：

```javascript
obj.foo(); // obj
```

那么它就指向了 `obj` 对象。所以我觉得 JavaScript 把 this 设计成隐藏的参数是一个不好的设计。

this 还有一个特殊的指向，就是箭头函数，箭头函数本身没有 this，它的 this 指向的是它定义时它外层函数的的 this，如果它外层没有函数，那么就指向全局对象，严格模式是 undefined

我个人的感受是 JavaScript 还不如把 this 设计成一个显式的参数，我想用什么 this 就直接传什么，这样不是更直观吗？

