#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 设置工作目录
WORK_DIR="/root/projects/oh-my-docker-greed.icu"
cd $WORK_DIR

echo -e "${GREEN}开始更新 diary-of-madao 服务...${NC}"

# 拉取最新代码（如果需要）
git pull

# 重新构建并更新服务
echo -e "${YELLOW}重新构建服务...${NC}"
docker-compose up -d --no-deps --build diary-of-madao

# 检查服务状态
echo -e "${YELLOW}检查服务状态...${NC}"
if docker-compose ps | grep -q "diary_of_madao.*Up"; then
    echo -e "${GREEN}服务更新成功！${NC}"
else
    echo -e "${RED}服务可能未正常运行，请检查日志：${NC}"
    docker-compose logs diary-of-madao
    exit 1
fi