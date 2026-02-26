#!/bin/bash
# 数据库备份脚本

DB_DIR="/root/.openclaw/zhbcher_txghzs/server"
BACKUP_DIR="/root/.openclaw/zhbcher_txghzs/backups"
DB_FILE="$DB_DIR/database.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/txghzs_backup_$TIMESTAMP.db"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份数据库
cp "$DB_FILE" "$BACKUP_FILE"

# 压缩备份
gzip "$BACKUP_FILE"

# 删除30天前的备份
find "$BACKUP_DIR" -name "txghzs_backup_*.db.gz" -mtime +30 -delete

echo "备份数据库: $BACKUP_FILE.gz"
echo "当前备份文件数: $(ls -1 $BACKUP_DIR/*.db.gz 2>/dev/null | wc -l)"
