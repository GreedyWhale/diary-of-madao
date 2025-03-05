FROM node:lts AS base
WORKDIR /app

# 启用 pnpm
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml ./

# 只安装生产依赖
FROM base AS prod-deps
RUN pnpm install --prod

# 安装所有依赖
FROM base AS build-deps
RUN pnpm install

FROM build-deps AS build
COPY . .
RUN pnpm run build

FROM base AS runtime
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=${PORT:-4321}
EXPOSE ${PORT:-4321}
CMD node ./dist/server/entry.mjs