---
title: '源码阅读のai-chatbot（一）'
subtitle: '登录流程的实现'
author: 'Caisr'
tags: ["AI", "Source Code"]
type: 'ai'
cover: '~/assets/images/cover/cover-10.webp'
---

[ai-chatbot](https://github.com/vercel/ai-chatbot) 是一个开源的 AI 聊天机器人网站模板，这个项目有从登录到对话以及 AI SDK 交互的完整流程，非常适合用来学习。

### 从 NextAuth.js 开始

[NextAuth.js] (https://next-auth.js.org/getting-started/introduction) 是一个适用于 Next.js 应用的身份验证库，它支持很多种身份认证方式。

从这个 `app/(auth)/auth.ts` 文件可以看出 ai-chatbot 项目选择了凭证登录的方式，需要用户去提供用户名和密码，由服务器进行验证。

#### 1. `app/(auth)/auth.config.ts`

这个文件是 NextAuth.js 的配置文件，里面一共有三项：

- pages
- providers
- callbacks

