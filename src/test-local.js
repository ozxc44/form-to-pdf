import PDFDocument from 'pdfkit';
import fs from 'fs';

// 测试 PDF 生成（不需要数据库）
const doc = new PDFDocument({ margin: 50 });

doc.pipe(fs.createWriteStream('/tmp/test-form.pdf'));

doc.fontSize(24).font('Helvetica-Bold').text('客户信息表', { align: 'center' });
doc.moveDown();

doc.fontSize(14).font('Helvetica-Bold').text('表单内容', { underline: true });
doc.moveDown(0.5);

const fields = [
  { label: '姓名', value: '张三' },
  { label: '邮箱', value: 'zhangsan@example.com' },
  { label: '电话', value: '13800138000' },
  { label: '备注', value: '这是测试内容' }
];

fields.forEach(field => {
  doc.fontSize(11);
  doc.fillColor('#666').text(`${field.label}:`);
  doc.fillColor('#000').text(field.value);
  doc.moveDown(0.3);
});

doc.fontSize(9).fillColor('#999').text(
  `生成时间: ${new Date().toLocaleString('zh-CN')}`,
  { align: 'center' }
);

doc.end();

console.log('PDF 已生成: /tmp/test-form.pdf');
