import express from 'express';
import Class from '../models/Class.js';

const r = express.Router();

// Create class (POST /api/classes)
r.post('/', async (req, res, next) => {
  try {
    const { classCode, name, grade } = req.body || {};
    if (!classCode || !name) {
      return res.status(400).json({ error: 'classCode and name are required' });
    }
    const cls = await Class.create({ classCode, name, grade });
    res.status(201).json(cls);
  } catch (e) {
    if (e.code === 11000) {
      // duplicate classCode
      return res.status(409).json({ error: 'Class code already exists' });
    }
    next(e);
  }
});

// Check if class exists (GET /api/classes/exists?classCode=CODE)
r.get('/exists', async (req, res, next) => {
  try {
    const code = (req.query.classCode || '').trim();
    if (!code) return res.status(400).json({ error: 'classCode is required' });
    const cls = await Class.findOne({ classCode: code }).lean();
    res.json({ exists: !!cls, class: cls || null });
  } catch (e) { next(e); }
});

export default r;
