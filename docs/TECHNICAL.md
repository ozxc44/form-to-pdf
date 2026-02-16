# Form to PDF — 技术文档

## 概述

极简的表单构建器，用户创建表单后分享链接，填写者提交后自动下载 PDF。

## 架构

单体架构，遵循 DHH 哲学：一个服务器、一个数据库、一份代码。

```
form-to-pdf/
├── src/
│   ├── server.js      # Express 服务器
│   ├── db.js          # MySQL 连接池
│   ├── pdf.js         # PDF 生成模块
│   └── api.js         # REST API 路由
├── views/
│   ├── index.html     # 表单构建器
│   └── form.html      # 表单填写页
├── deploy.sh          # 一键部署脚本
└── ecosystem.config.js # PM2 配置
```

## 技术栈

| 组件 | 技术 |
|------|------|
| Runtime | Node.js 20+ |
| Framework | Express.js |
| Database | MySQL 8.0 |
| PDF | PDFKit |
| Frontend | HTML + Tailwind CSS (CDN) |
| Process Manager | PM2 |
| Web Server | Nginx |

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/forms | 创建表单 |
| GET | /api/forms | 获取表单列表 |
| GET | /api/forms/:slug | 获取表单详情 |
| POST | /api/forms/:slug/submit | 提交并下载 PDF |
| DELETE | /api/forms/:id | 删除表单 |

## 数据库表

### forms
```sql
CREATE TABLE forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  fields JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### submissions
```sql
CREATE TABLE submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NOT NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);
```

## 部署

1. 配置 `.env` 文件
2. 运行 `./deploy.sh`
3. 访问 `http://form.jixiejq.com`

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 3002 | 服务端口 |
| DB_HOST | localhost | 数据库地址 |
| DB_USER | root | 数据库用户 |
| DB_PASSWORD | - | 数据库密码 |
| DB_NAME | auto_company | 数据库名称 |
