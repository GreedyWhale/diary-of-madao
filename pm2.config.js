module.exports = {
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