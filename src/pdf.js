import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export function generateFormPDF(form, submissionData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // 标题
      doc.fontSize(24).font('Helvetica-Bold').text(form.title, { align: 'center' });
      doc.moveDown();

      // 描述
      if (form.description) {
        doc.fontSize(12).font('Helvetica').text(form.description, { align: 'center' });
        doc.moveDown();
      }

      // 分割线
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // 字段数据
      const fields = JSON.parse(form.fields);
      const data = JSON.parse(submissionData);

      doc.fontSize(14).font('Helvetica-Bold').text('表单内容', { underline: true });
      doc.moveDown(0.5);

      fields.forEach((field, index) => {
        const value = data[field.name] || '';

        doc.fontSize(11);
        doc.fillColor('#666').text(`${field.label || field.name}:`);
        doc.fillColor('#000');

        if (field.type === 'textarea') {
          doc.text(value || '-', { width: 400 });
        } else {
          doc.text(value || '-');
        }
        doc.moveDown(0.3);
      });

      // 生成时间
      doc.moveDown();
      doc.fontSize(9).fillColor('#999').text(
        `生成时间: ${new Date().toLocaleString('zh-CN')}`,
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
