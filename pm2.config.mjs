/*
 * @Description: pm2 配置
 * @Author: MADAO
 * @Date: 2025-03-05 20:04:58
 * @LastEditors: MADAO
 * @LastEditTime: 2025-03-05 22:11:07
 */
export default {
  apps: [{
    name: 'diary-of-madao',
    script: './dist/server/entry.mjs',
    instances: 'max',               // 根据 CPU 核心数启动实例
    exec_mode: 'cluster',          // 使用集群模式
    max_memory_restart: '1G',    // 内存超限时自动重启
    env: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: process.env.PORT || 4321
    }
  }]
};