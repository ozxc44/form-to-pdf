#!/bin/bash
# ==============================================
# Form to PDF - 部署脚本
# 目标服务器: 腾讯云轻量应用服务器 (139.199.2.76)
# ==============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SERVER_HOST="139.199.2.76"
SERVER_USER="root"
APP_NAME="form-to-pdf"
DEPLOY_PATH="/root/apps/$APP_NAME"
PORT=3002

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. 检查本地环境
log_info "Step 1: 检查本地环境..."

if [ ! -f "package.json" ]; then
    log_error "请在项目根目录运行此脚本"
    exit 1
fi

# 测试 SSH 连接
log_info "测试 SSH 连接..."
if ! ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_HOST} "echo 'SSH 连接成功'" 2>/dev/null; then
    log_error "SSH 连接失败"
    exit 1
fi

# 2. 准备服务器环境
log_info "Step 2: 准备服务器环境..."

ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    echo "安装 PM2..."
    npm install -g pm2
fi

# 创建应用目录
mkdir -p /root/apps/form-to-pdf

ENDSSH

# 3. 上传代码
log_info "Step 3: 上传代码..."

TEMP_DIR=$(mktemp -d)
mkdir -p "$TEMP_DIR/src" "$TEMP_DIR/views"
cp package.json "$TEMP_DIR/"
cp src/*.js "$TEMP_DIR/src/"
cp views/*.html "$TEMP_DIR/views/"

scp -r "$TEMP_DIR"/* ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/
rm -rf "$TEMP_DIR"

# 4. 安装依赖
log_info "Step 4: 安装依赖..."

ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
cd ${DEPLOY_PATH}
npm install --production
ENDSSH

# 5. 配置环境变量
log_info "Step 5: 配置环境变量..."

ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
cd ${DEPLOY_PATH}

if [ ! -f .env ]; then
    cat > .env << 'EOF'
PORT=3002
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=auto_company
EOF
fi
ENDSSH

# 6. 配置 PM2
log_info "Step 6: 配置 PM2..."

ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
cd ${DEPLOY_PATH}

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'form-to-pdf',
    script: 'src/server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    autorestart: true,
    max_restarts: 10
  }]
};
EOF

mkdir -p logs
ENDSSH

# 7. 启动应用
log_info "Step 7: 启动应用..."

ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
cd ${DEPLOY_PATH}

if pm2 describe form-to-pdf &> /dev/null; then
    pm2 restart form-to-pdf
else
    pm2 start ecosystem.config.js
fi

pm2 save
pm2 status
ENDSSH

# 8. 配置 Nginx
log_info "Step 8: 配置 Nginx..."

ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'

cat > /etc/nginx/sites-available/form-to-pdf << 'EOF'
server {
    listen 80;
    server_name form.jixiejq.com;

    access_log /var/log/nginx/form-to-pdf-access.log;
    error_log /var/log/nginx/form-to-pdf-error.log;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/form-to-pdf /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

ENDSSH

# 完成
log_info "========================================"
log_info "部署完成!"
log_info "========================================"
echo ""
echo "应用信息:"
echo "  URL: http://form.jixiejq.com"
echo ""
echo "操作命令:"
echo "  SSH: ssh ${SERVER_USER}@${SERVER_HOST}"
echo "  重启: pm2 restart form-to-pdf"
echo "  日志: pm2 logs form-to-pdf"
echo ""
