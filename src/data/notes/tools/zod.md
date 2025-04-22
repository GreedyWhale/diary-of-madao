---
title: 'Zod'
subtitle: '一个非常好用的数据类型 & 格式验证的库'
author: 'Caisr'
tags: ["Zod", "Tools"]
type: 'tools'
cover: {
  image: '~/assets/images/cover/cover-13.jpg',
  source: 'Zachary DeBottis (Pexels.com)',
  sourceUrl: 'https://www.pexels.com/photo/silhuoette-of-a-person-2953863/'
}
---

## 一. Zod

Zod 是我在看 [ai-chatbot](https://github.com/vercel/ai-chatbot) 项目的源码时看到的，看到之后我就觉得这个库就是我一直寻找的数据格式验证的库，它可以验证数据的类型以及格式，十分适合表单的数据验证。

这是官网的介绍：

> Zod 是一个以 TypeScript 为先的模式声明和验证库。这里的"模式"广义上指代任何数据类型，从简单的字符串到复杂的嵌套对象。
>
> Zod 的设计理念是尽可能地对开发者友好。它的目标是消除重复的类型声明。使用 Zod，你只需声明一次验证器，Zod 就会自动推断出静态 TypeScript 类型。它能够轻松地将简单类型组合成复杂的数据结构。


## 二. 基础用法

```typescript
// primitive values
z.string();
z.number();
z.bigint();
z.boolean();
z.date();
z.symbol();

// empty types
z.undefined();
z.null();
z.void(); // accepts undefined

// catch-all types
// allows any value
z.any();
z.unknown();

// never type
// allows no values
z.never();
```

这里有几个类型和 TypeScript 一样，挺让人迷惑的，正好来复习一下：

```typescript
z.void();
z.unknown();
z.never();
```

- void 主要用于函数的返回类型，表示该函数不会返回任何有意义的值（即，不应该有返回值或返回 undefined）。void 只是告诉调用者不应该依赖返回值，但函数仍然可以显式返回 undefined。
- unknown 表示未知的类型，所以任何类型都可以赋值给 unknown 类型。
- never 表示不会有任何值的类型，通常用于永远不会正常结束的函数（比如抛出错误或无限循环），或者无法赋值的变量。

    never 有一个使用小技巧：

    ```typescript
    type Animal = "dog" | "cat";
    
    function handleAnimal(animal: Animal) {
      switch (animal) {
        case "dog":
          console.log("It's a dog!");
          break;
        case "cat":
          console.log("It's a cat!");
          break;
        default:
          // 这里的 `never` 确保没有遗漏任何情况
          const _exhaustiveCheck: never = animal;
          throw new Error("Unknown animal: " + animal);
      }
    }
    
    ```
    
    - const _exhaustiveCheck: never = animal;
      - 如果 Animal 未来新增类型（比如 "rabbit"），这里就会报错，提醒你更新 switch 逻辑
      - 这样可以确保 switch 语句总是处理所有可能的值，不会遗漏任何分支。

这些基本类型的用法很简单：

```typescript
import { z } from 'zod';

const schema = z.string();

schema.parse('allen'); // 'allen'
schema.parse(123); // 报错 throws ZodError
```

还有一种不报错的验证方式：

```typescript
mySchema.safeParse("allen"); // => { success: true; data: "allen" }
mySchema.safeParse(12); // => { success: false; error: ZodError }
```

## 三. 表单验证

假如现在有这样一个表单验证规则：

1. 用户名必须是字符串，长度在 3-10 之间。
2. 密码需要包含大写字母、小写字母、数字和特殊字符，长度在 8-20 之间。
3. 邮箱必须是合法的邮箱格式。
4. 生日可选，必须是 `YYYY-MM-DD` 的格式。

用 Zod 来实现：

```typescript
import { z } from 'zod';

// 用户名规则
const usernameSchema = z.string({
  required_error: "用户名不能为空",
  invalid_type_error: "用户名必须为字符串"
})
  .min(3, "用户名长度不能少于 3 个字符")
  .max(10, "用户名长度不能超过 10 个字符");

// 密码规则
const passwordSchema = z.string({
  required_error: "密码不能为空",
  invalid_type_error: "密码必须为字符串"
})
  .min(8, "密码长度不能少于 8 个字符")
  .max(20, "密码长度不能超过 20 个字符")
  .regex(/[A-Z]/, "密码必须包含至少一个大写字母")
  .regex(/[a-z]/, "密码必须包含至少一个小写字母")
  .regex(/[0-9]/, "密码必须包含至少一个数字")
  .regex(/[\W_]/, "密码必须包含至少一个特殊字符（如 !@#$%^&*）");

// 邮箱规则（Zod 内置 `email()` 方法）
const emailSchema = z.string({
  required_error: "邮箱不能为空",
  invalid_type_error: "邮箱必须为字符串"
}).email("邮箱格式不正确");

// 生日规则（可选，且必须符合 YYYY-MM-DD 格式）
const birthdaySchema = z.string().date('生日格式应为 YYYY-MM-DD').optional();

// 组合用户 Schema
const userSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  email: emailSchema,
  birthday: birthdaySchema
});

```

验证可以这样做：

```typescript
// 每一项都验证失败
const user = { username: 123, password: "weakpass", email: "notanemail", birthday: "2000-02-30" };

const result = userSchema.safeParse(user);

console.log(JSON.stringify(result.error?.format()));

// 会得到这样一个对象
{
  "_errors": [],
  "username": { "_errors": ["用户名必须为字符串"] },
  "password": {
    "_errors": [
      "密码必须包含至少一个大写字母",
      "密码必须包含至少一个数字",
      "密码必须包含至少一个特殊字符（如 !@#$%^&*）"
    ]
  },
  "email": { "_errors": ["邮箱格式不正确"] },
  "birthday": { "_errors": ["生日格式应为 YYYY-MM-DD"] }
}
```

看起来代码变多了，但是逻辑和结构非常清晰，再也不用写一些非常难懂的正则表达式了，其中：

- required_error 表示字段为空时的错误信息。
- invalid_type_error 表示字段类型不正确时的错误信息。
- min 和 max 方法用于设置字段的最小和最大长度。
- regex 方法用于设置字段的正则表达式验证规则。
- date 方法用于设置字段的日期格式验证规则。
- optional 方法用于设置字段为可选。

除此之外 Zod 还提供了其他很多的用法，甚至可以定义函数类型：

```typescript
const functionSchema = z.function()
  .args(z.number(), z.string())
  .returns(z.boolean());

// type myFunction = (args_0: number, args_1: string, ...args: unknown[]) => boolean
type myFunction = z.infer<typeof functionSchema>;
```

### 四. 自定义验证

Zod 中自定义验证的方法有两种：

1. `z.custom`

    ```typescript
    const customSchema = z.custom<number>(
      (val) => typeof val === 'number' && val > 0,
      { message: "必须大于 0" }
    );
    ```

2. `z.refine`

    ```typescript
    const refineSchema = z.number().refine((val) => val > 0, {
      message: "必须大于 0",
    });
    ```

比如你可以这样验证两次 password 是否一致：

```typescript
// 来自官网的例子
const passwordForm = z
  .object({
    password: z.string(),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
  });
```


