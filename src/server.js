import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './db.js';
import * as formApi from './api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// 初始化数据库
await initDB();

// API 路由
app.post('/api/forms', formApi.createForm);
app.get('/api/forms', formApi.listForms);
app.get('/api/forms/:slug', formApi.getForm);
app.post('/api/forms/:slug/submit', formApi.submitForm);
app.delete('/api/forms/:id', formApi.deleteForm);

// 页面路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

app.get('/form/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/form.html'));
});

app.listen(PORT, () => {
  console.log(`Form to PDF 服务运行在 http://localhost:${PORT}`);
});
