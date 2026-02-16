import { v4 as uuidv4 } from 'uuid';
import pool from './db.js';
import { generateFormPDF } from './pdf.js';

// 创建表单
export async function createForm(req, res) {
  try {
    const { title, description, fields } = req.body;

    if (!title || !fields || !Array.isArray(fields)) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 生成唯一 slug
    let slug;
    let attempts = 0;
    do {
      slug = uuidv4().substring(0, 8);
      const [existing] = await pool.query('SELECT id FROM forms WHERE slug = ?', [slug]);
      if (existing.length === 0) break;
      attempts++;
    } while (attempts < 10);

    const [result] = await pool.query(
      'INSERT INTO forms (slug, title, description, fields) VALUES (?, ?, ?, ?)',
      [slug, title, description || '', JSON.stringify(fields)]
    );

    res.json({
      success: true,
      form: {
        id: result.insertId,
        slug,
        title,
        description,
        fields
      }
    });
  } catch (error) {
    console.error('Create form error:', error);
    res.status(500).json({ error: '创建表单失败' });
  }
}

// 获取表单（通过 slug）
export async function getForm(req, res) {
  try {
    const { slug } = req.params;
    const [forms] = await pool.query('SELECT * FROM forms WHERE slug = ?', [slug]);

    if (forms.length === 0) {
      return res.status(404).json({ error: '表单不存在' });
    }

    const form = forms[0];
    form.fields = JSON.parse(form.fields);

    res.json({ form });
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({ error: '获取表单失败' });
  }
}

// 获取所有表单列表
export async function listForms(req, res) {
  try {
    const [forms] = await pool.query(
      'SELECT id, slug, title, description, created_at FROM forms ORDER BY created_at DESC'
    );

    res.json({ forms });
  } catch (error) {
    console.error('List forms error:', error);
    res.status(500).json({ error: '获取表单列表失败' });
  }
}

// 提交表单并生成 PDF
export async function submitForm(req, res) {
  try {
    const { slug } = req.params;
    const data = req.body;

    // 获取表单
    const [forms] = await pool.query('SELECT * FROM forms WHERE slug = ?', [slug]);

    if (forms.length === 0) {
      return res.status(404).json({ error: '表单不存在' });
    }

    const form = forms[0];

    // 保存提交
    const [result] = await pool.query(
      'INSERT INTO submissions (form_id, data) VALUES (?, ?)',
      [form.id, JSON.stringify(data)]
    );

    // 生成 PDF
    form.fields = JSON.parse(form.fields);
    const pdfBuffer = await generateFormPDF(form, JSON.stringify(data));

    // 设置响应头
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${form.title}-${result.insertId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Submit form error:', error);
    res.status(500).json({ error: '提交表单失败' });
  }
}

// 删除表单
export async function deleteForm(req, res) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM forms WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({ error: '删除表单失败' });
  }
}
