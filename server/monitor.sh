#!/bin/bash
# 退休规划助手后端服务启动脚本

cd /root/.openclaw/zhbcher_txghzs/server

# 检查是否已经在运行
if pgrep -f "node index.js" > /dev/null; then
    echo "服务已在运行"
    exit 0
fi

# 启动服务
nohup node index.js >> /var/log/txghzs.log 2>&1 &
echo "服务已启动"
