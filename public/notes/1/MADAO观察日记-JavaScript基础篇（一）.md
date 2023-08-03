---
title: 'MADAO观察日记-JavaScript基础篇（一）'
introduction: 'JavaScript中的作用域和闭包'
---

![banner_11.jpeg](/_next/upload/banner_11_1681466630320.jpeg "banner_11.jpeg")

## 0x00 前言

今天开始迁移之前的笔记，之前笔记的时间线就是从基础开始的，所以这个系列就从 JavaScript 的基础开始，这篇笔记的大部分内容都来自《你不知道的JavaScript（上卷）》，算是一个读书笔记吧。

## 0x01 作用域的概念

- 定义：**作用域是用于确定在何处以及如何查找变量的一套规则。**

- 作用域嵌套：**作用域和作用域之间是可以嵌套的，这种嵌套的作用域可以称为作用域链。**

    ![scope.png](/_next/upload/scope_1681443867016.png "scope.png")
    
- 作用域链的查找规则：**从当前作用域开始查找变量，如果找不到，就会去上一级的作用域查找，直到最外层的作用域（全局作用域），在全局作用域中无论是否找到，查找都会停止。**

- 查找类型：

    - LHS：**如果查找的目的是赋值，会使用LHS查询，比如：`const a = 1;`**
    - RHS：**如果查找的目的是获取变量的值，会使用RHS查询，比如：`console.log(a);`**

- 词法作用域

    **词法作用域也叫静态作用域，意思是作用域是在词法分析的时候确定的，更容易理解的说法是：作用域在写代码的时候书写的位置确定的。**
    
    JavaScript 代码在执行前都会经过编译，这里的编译并不是需要开发者手动调用编译器的那种编译，JavaScript 代码是由 JavaScript 引擎自动进行编译的，编译会经历以下三个步骤：
    
    - 词法分析
    - 语法分析
    - 代码生成


    词法作用域中的*词法*就是对应词法分析这一步骤。
    
    
    比如：
    
    ```js
    const foo = () => {
      const name = 'foo';

      const bar = () => {
        const age = 17;
        console.log(name, age);
      };

      bar();
    };

    foo(); // foo 17

    ```
    
    在上面代码中foo函数和bar函数的作用域在写代码的时候就确定了，无论它们如何调用或者在哪里调用，它们的作用域都是在声明时所处的位置确定的。
    
## 0x02 欺骗词法作用域

先说结论：*欺骗词法作用域会导致性能下降。*

- eval

    ```js
    const foo = (str) => {
      eval(str);
      const a = 1;
      console.log(a, b);
    };

    const b = 2;

    foo('var b = 3;'); // 1 3
    ```
    
    例子中使用`eval`方法欺骗了词法作用域，导致foo函数中的变量b永远不会找到外面的变量b。
    
- with

    ```js
    const foo = (obj) => {
      with(obj) {
        a = 'foo';
      }
    };

    const o1 = { a: 1 };
    const o2 = { b: 1 };

    foo(o1);
    foo(o2);

    console.log(o1.a); // foo
    console.log(o2.a); // undefined
    console.log(a); // foo
    ```
    
    with 会根据传递给它的对象创建一个新的词法作用域，比如例子中的`with(o1)`，这时候它会创建的作用域就是`o1`，`o1`中有`a`这个属性，所以赋值的时候正确的赋值到了`o1.a`上，当`with(o2)`的时候`o2`并没有`a`这个属性，所以变成了`a = 'foo'`，直接在全局作用域中创建了一个变量。
    
    
JavaScript 引擎会在编译阶段进行优化，部分优化就是预先确定变量的位置，这样在运行的时候就可以快速找到对应变量，但是遇到`eval`和`with`的时候就没法做优化了，因为不知道这两个方法会接收到什么参数，所以 JavaScript 引擎在遇到`eval`和`with`的时候就放弃优化，导致代码性能下降。

## 0x03 全局作用域和块级作用域

在 JavaScript 中作用域可以按照范围分成：

- 全局作用域
- 块级作用域

全局作用域就是在代码的任意位置都可以访问它里面的变量，块级作用域则是只能在对应的代码块中访问里面的变量。


```js
const a = 1; // 全局作用域变量

{
  var b = 2; // 全局作用域变量
  const c = 3; // 块级作用域变量
  console.log(a, b, c); // 1 2 3
}

console.log(a, b, c); // ReferenceError
```

从例子中看出，块级作用域中的变量不仅仅是写在`{}`就可以了，还需要搭配正确的关键字，但是在函数中就没有这样的限制：

```js
function foo() {
  var d = 5;
  console.log(d); // 5
};

foo()

console.log(d); // ReferenceError
```

除了`{} + const/let` 和函数可以实现块级作用域之外，`try...catch` 的catch内部，`with`创建的作用域都是块级作用域。


## 0x04 闭包

说实话闭包的定义很难描述，书中是这样写的：

> 当函数可以记住并访问所在的词法作用域时，就产生了闭包，即使函数是在当前词法作用域之外执行。

看完挺难理解的，但是只要用过闭包就能明白，它其实不复杂。

作用域有一个很重要的特性：*作用域链中外部的作用域无法访问内部作用域的变量。*

比如：

```js
const a = 1;

function foo() {
  const b = 2;
  console.log(a, b); // 1 2
};

foo(); // 1 2
console.log(b); // ReferenceError
```

如果想要外部的作用域可以访问内部作用域的变量，就需要用到闭包。

```js
const a = 1;

function foo() {
  const b = 2;
  console.log(a, b); // 1 2

  return () => b;
};

const bar = foo(); // 1 2
console.log(bar()); // 2
```

通过函数中返回函数，被返回的函数需要应用它所在的作用域中的变量，这样就能让函数外部的作用域访问到函数内部作用域的变量了。

再来看看闭包的作用：

1. 隔离作用域，避免变量命名冲突

2. 阻止变量回收，实现模块

    JavaScript 引擎会在函数执行完毕后，回收掉它作用域中的变量，但是通过闭包的方式，会让函数内部的变量在函数执行完成后不被回收。
    
    ```js
    function foo() {
      let b = 1;
      return () => b += 1;
    };

    const bar = foo();
    console.log(bar()); // 2
    console.log(bar()); // 3
    ```
    
    如例子中所示，闭包使函数记住了这个变量。用这个特性。可以实现模块，比如：
    
    ```js
    const human = () => {
      let name = 'android';
      let age = 20;

      const getName = () => console.log(name);
      const getAge = () => console.log(age);
      const changeName = newName => { name = newName; };
      const changeAge = newAge => { age = newAge };

      return {
        getName,
        getAge,
        changeName,
        changeAge,
      }
    };
    ```
