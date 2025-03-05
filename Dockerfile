# 基础阶段：设置基础镜像和工作环境
FROM node:lts AS base
WORKDIR /app

# 启用 pnpm 包管理器并复制依赖文件
RUN corepack enable pnpm
RUN pnpm setup
COPY package.json pnpm-lock.yaml ./

# 生产依赖阶段：只安装生产环境需要的依赖
FROM base AS prod-deps
RUN pnpm install --prod

# 构建依赖阶段：安装所有依赖（包括开发依赖）
FROM base AS build-deps
RUN pnpm install

# 构建阶段：复制源代码并构建应用
FROM build-deps AS build
COPY . .
RUN pnpm run build

# 运行时阶段：设置生产环境
FROM base AS runtime
# 安装 PM2 进程管理器
RUN pnpm add -g pm2

# 从之前的阶段复制必要文件
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# 复制 PM2 配置文件
COPY pm2.config.js .

# 声明构建参数
ARG PORT=4321

# 配置环境变量
ENV HOST=0.0.0.0
ENV PORT=$PORT
# 暴露应用端口
EXPOSE $PORT

# 使用 PM2 启动应用
CMD ["pm2-runtime", "start", "pm2.config.js"]
