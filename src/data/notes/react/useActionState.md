---
title: 'React - useActionState'
subtitle: '一个我从来没有用过的 React Hook'
author: 'Caisr'
tags: ["React"]
type: 'react'
cover: '~/assets/images/cover/cover-11.jpg'
---


这个 hook 是我在看 [ai-chatbot](https://github.com/vercel/ai-chatbot) 项目的源码时看到的，我从来没有用过这个 hook。而且看了下文档还是没看太懂，所以有必要记录一下。

首先来看下官网对它的描述：

> useActionState 是一个可以根据某个表单动作的结果更新 state 的 Hook。

```javascript
const [state, formAction, isPending] = useActionState(action, initialState, permalink?)
```

useActionState 接收三个参数：
- action：一个用户处理表单提交逻辑的函数。
- initialState：初始状态。
- permalink：这个参数不知道有什么用，我自己测试也没测试出来。

useActionState 返回三个值：
- state：当前状态。
- formAction：一个函数，用于触发表单的 action。
- isPending：一个布尔值，用于表示 action 是否正在执行。

从使用的方式来看：


```typescript
const [state, formAction] = useActionState<RegisterActionState, FormData>(
  register,
  {
    status: 'idle',
  },
);

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: 'user_exists' } as RegisterActionState;
    }
    await createUser(validatedData.email, validatedData.password);
    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};
```

useActionState 接收的函数的第一个参数是当前表单的状态，也就是上面代码中的 `status`，这个是可以自定义的。第二个参数才是提交的内容。

用useActionState的好处在于，不用开发者再去单独定义一个 pending 的状态了，然后表单提交的逻辑也能单独写在组件之外，可以更好的组织代码。

可以根据提交的结果返回不同的状态，这些值通过 state 来获取，目前的疑问也就是 `permalink` 参数到底有什么用，暂时还不知道。
