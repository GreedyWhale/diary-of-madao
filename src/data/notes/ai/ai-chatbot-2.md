---
title: '源码阅读のai-chatbot（二）'
subtitle: 'AI SDK'
author: 'Caisr'
tags: ["AI", "Source Code"]
type: 'ai'
cover: {
  image: '~/assets/images/cover/cover-12.jpg',
  source: 'George Becker',
  sourceUrl: 'https://www.pexels.com/photo/silhouette-photo-of-person-holding-door-knob-792032/'
}
---

## 一. AI SDK

看完了登录相关部分，接下来就到了最重要的对话部分，这部分的功能是由 [AI SDK](https://sdk.vercel.ai/docs/introduction) 提供的，它也是 Vercel 开源的一个项目。

但是直接看代码有点头痛，东西太多了，所以决定先看文档。

当我按照官方的教程实现了一个简单的聊天机器人后，发现真的是傻瓜配置了，非常快速就能实现一个聊天机器人，唯一的成本就是去买点 Token，感觉在这里研究源码有点浪费时间，这个真的可以当作生产工具去用了。

但是自己开的坑还是检测填完吧

## 二. Prompts 和 Streaming

Prompts 是指我们给 AI 模型的指令或提示，它决定了 AI 如何理解和响应我们的输入。

比如：

```typescript
import { generateText } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';

const model = deepseek('deepseek-chat');
const { text } = await generateText({
  model,
  prompt: '写一首关于猫的诗，要求不能超过4句',
});
```

这样 AI SDK 会向 deepseek 发送这样一个请求：

```javascript
{
  messages: {
    0: {
      role: 'user',
      content: '写一首关于猫的诗，要求不能超过4句'
    }
  },
  model: "deepseek-chat"
  temperature: 0
}
```

deepseek 会返回一个响应：

```javascript
{
  "model": "deepseek-chat",
  "choices": [
    {
      "index": 0,
      "message": {
          "role": "assistant",
          "content": "《猫》  \n\n窗台蜷作绒球小，  \n一梦沉酣日影移。  \n忽见飞虫轻掠过，  \n爪尖扑碎半墙诗。"
      },
    }
  ],
}
```

这相当于和模型进行了一次对话。

除此之外还可以对模型进行预设，比如：

```javascript
const response = await generateText({
  model: model('deepseek-chat'),
  system: `
    你现在是唐代诗人李白。请用李白的风格和语气作诗。
    你应该：
    - 表现出李白豪放不羁的性格特点
    - 使用李白常用的意象（如月亮、酒、剑等）
    - 模仿李白的写作风格（雄奇豪放、想象丰富）
    - 回答时要带有李白的个性特征（如喜欢饮酒、追求自由）

    记住：你就是李白本人，要用第一人称说话。
  `,
  prompt: '写一首关于猫的诗，要求不能超过4句',
});
```

这样预设了模型的角色和行为之后，你得到的结果就完全不同了：

```javascript
// 模型会返回

{
  text: "《咏狸奴》\n\n醉卧花间君莫笑，\n金瞳如月爪如刀。\n若问平生何所似，\n一壶浊酒一身毛。"
}
```

AI SDK 还支持这样的方式请求：

```javascript
// 官网的例子
const result = await streamUI({
  model: yourModel,
  messages: [
    { role: 'user', content: 'Hi!' },
    { role: 'assistant', content: 'Hello, how can I help?' },
    { role: 'user', content: 'Where can I buy the best Currywurst in Berlin?' },
  ],
});
```

这种模式能看出是让模型能完整的记住对话的上下文，这样得到的结果也就更加符合用户的预期。

`role` 需要特别说明一下：

- assistant（助手）

    - 代表 AI 模型的回复
    - 是对用户输入的响应

- system（系统）

    - 用于设置 AI 的行为规则和角色定位
    - 通常在对话开始时设置，影响整个对话

- user（用户）

    - 代表用户输入的消息
    - 通常是问题、指令或需求

从和模型的交互来看，也能看出提前给模型进行一个预设可以得到更加精准的结果。

以上方式有一个问题就是，响应是要等待模型全部生成完才能返回，这会导致用户的体验非常差，因为生成的时间往往都很长，所以 AI SDK 提供了 Streaming 的方式来解决这个问题。

#### Streaming

Streaming 的意思是流，我在学习 `Node.js` 的时候有学过相关的概念，简单来说平时我们和模型对话的时候页面上的不是一次性展示出来的，而是一个一个字或者一个一个词的展示出来的，这就是 Streaming。模型只要有新的内容生成，就会立即返回给我们，这样用户就可以看到模型正在生成的内容了。

在 `AI SDK` 中，可以这样使用：

```javascript
const result = streamText({
  model: deepseek('deepseek-chat'),
  messages,
});

return result.toDataStreamResponse();
```

toDataStreamResponse 会返回一个流式的响应对象：

```javascript
{
  status: 200,
  statusText: '',
  headers: Headers {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Vercel-AI-Data-Stream': 'v1'
  },
  body: ReadableStream { locked: false, state: 'readable', supportsBYOB: false },
  bodyUsed: false,
  ok: true,
  redirected: false,
  type: 'default',
  url: ''
}
```

`ReadableStream` 这种对象通过这样的方式进行读取：

```javascript
const reader = res.body?.getReader();
const { value, done } = await reader.read();
```
其中 done 表示是否读取完毕，value 表示读取到的数据, 在读取未结束之前，需要重复的进行读取。

可以模拟一下：

```javascript
async function streamDemo() {
  // 1. 创建源数据流
  const sourceStream = new ReadableStream({
    start(controller) {
      const data = ['Hello', ' ', 'World', '!'];
      let index = 0;

      // 模拟数据生成过程
      const interval = setInterval(() => {
        if (index < data.length) {
          controller.enqueue(data[index++]);
        } else {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);
    }
  });

  // 2. 创建转换流（可选）- 将文本转换为大写
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(chunk.toUpperCase());
    }
  });

  // 3. 创建消费流
  const writableStream = new WritableStream({
    write(chunk) {
      console.log('收到数据:', chunk);
    },
    close() {
      console.log('流已关闭');
    }
  });

  // 4. 链接流并开始处理
  await sourceStream
    .pipeThrough(transformStream)  // 通过转换流
    .pipeTo(writableStream);       // 输出到消费流
}

// 运行示例
streamDemo().catch(console.error);
```

也可以这样读取：

```javascript
async function streamDemo() {
  const stream = new ReadableStream({
    start(controller) {
      const data = ['你好', '，', '世界', '！'];
      let index = 0;

      const interval = setInterval(() => {
        if (index < data.length) {
          controller.enqueue(data[index++]);
        } else {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);
    }
  });

  const reader = stream.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      console.log('通过迭代器读取:', value);
    }
  } finally {
    reader.releaseLock();
  }
}

streamDemo().catch(console.error);
```


看完这些感觉这个项目的重点还是 AI SDK 的使用，而不是源码的研究，所以这个系列就在这里完结吧（其实是看不下去了-_-）。