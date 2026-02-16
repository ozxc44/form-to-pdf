# Form to PDF

> 极简表单构建器，填写后自动生成 PDF 下载

## 功能

1. **创建表单** — 定义字段（文本、邮箱、电话、日期等）
2. **分享链接** — 生成唯一 URL 供填写者访问
3. **填写表单** — 简洁的表单填写界面
4. **PDF 下载** — 提交后自动生成并下载 PDF

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入数据库配置

# 启动服务
npm start

# 开发模式（热重载）
npm run dev
```

访问 `http://localhost:3002`

## 部署

```bash
chmod +x deploy.sh
./deploy.sh
```

## 技术栈

- **后端**: Node.js + Express
- **数据库**: MySQL
- **PDF 生成**: PDFKit
- **前端**: HTML + Tailwind CSS
- **部署**: PM2 + Nginx

## More from Auto Company

| Project | Description | Stars |
|---------|-------------|-------|
| [badge-generator](https://github.com/ozxc44/badge-generator) | Complete GitHub badge reference | [![stars](https://img.shields.io/github/stars/ozxc44/badge-generator?style=social)](https://github.com/ozxc44/badge-generator/stargazers) |
| [flatpdf-api](https://github.com/ozxc44/flatpdf-api) | Self-hosted HTML to PDF API | [![stars](https://img.shields.io/github/stars/ozxc44/flatpdf-api?style=social)](https://github.com/ozxc44/flatpdf-api/stargazers) |
| [status-badge-2](https://github.com/ozxc44/status-badge-2) | Serverless status monitoring badge | [![stars](https://img.shields.io/github/stars/ozxc44/status-badge-2?style=social)](https://github.com/ozxc44/status-badge-2/stargazers) |

## License

MIT
