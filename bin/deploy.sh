#!/bin/bash

# 设置错误时退出
set -e

# 输出时间戳的函数
timestamp() {
    date "+%Y-%m-%d %H:%M:%S"
}

# 输出日志的函数
log() {
    echo "[$(timestamp)] $1"
}

# 检查命令是否执行成功
check_result() {
    if [ $? -eq 0 ]; then
        log "✅ $1 成功"
    else
        log "❌ $1 失败"
        exit 1
    fi
}

# 开始部署
log "开始部署 diary-of-madao..."

# 进入项目目录
cd /home/caisr/oh-my-docker-greed.icu/diary-of-madao
check_result "切换到项目目录"

# 拉取最新代码
log "拉取最新代码..."
git pull
check_result "代码拉取"

# 构建镜像
log "构建 Docker 镜像..."
docker compose build diary-of-madao
check_result "镜像构建"

# 启动服务
log "启动服务..."
docker compose up -d --no-deps diary-of-madao
check_result "服务启动"

# 检查容器状态
log "检查容器状态..."
sleep 5  # 等待容器完全启动
container_status=$(docker compose ps diary-of-madao --format json | grep -o '"State":"[^"]*"' | cut -d'"' -f4)

if [ "$container_status" = "running" ]; then
    log "🚀 容器运行状态: $container_status"
    
    # 显示容器日志
    log "最近的容器日志:"
    docker compose logs --tail=10 diary-of-madao
    
    # 显示容器信息
    log "容器详细信息:"
    docker compose ps diary-of-madao
else
    log "⚠️ 容器状态异常: $container_status"
    log "错误日志:"
    docker compose logs --tail=20 diary-of-madao
    exit 1
fi

log "部署完成！"
