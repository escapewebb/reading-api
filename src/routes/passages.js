import express from 'express';
import Joi from 'joi';
import Passage from '../models/Passage.js';
import { validate } from '../middleware/validate.js';

const r = express.Router();

// Teacher: create passage
r.post('/', validate(Joi.object({
  level: Joi.string().pattern(/^[A-H]$/).required(),
  title: Joi.string().min(2).max(120).required(),
  text: Joi.string().min(20).required(),
  active: Joi.boolean().optional()
})), async (req,res,next)=>{
  try{ const p = await Passage.create(req.body); res.status(201).json(p); }
  catch(e){ next(e); }
});

// List passages by level (active only by default)
r.get('/', validate(Joi.object({
  level: Joi.string().pattern(/^[A-H]$/).required(),
  includeInactive: Joi.boolean().default(false)
})), async (req,res,next)=>{
  try{
    const q = { level: req.query.level, ...(req.query.includeInactive?{}:{active:true}) };
    const list = await Passage.find(q).sort({ createdAt:-1 }).lean();
    res.json(list);
  }catch(e){ next(e); }
});

// Toggle or update passage
r.patch('/:id', validate(Joi.object({
  level: Joi.string().pattern(/^[A-H]$/),
  title: Joi.string().min(2).max(120),
  text: Joi.string().min(20),
  active: Joi.boolean()
})), async (req,res,next)=>{
  try{
    const p = await Passage.findByIdAndUpdate(req.params.id, req.body, { new:true });
    if(!p) return res.status(404).json({error:'Not found'});
    res.json(p);
  }catch(e){ next(e); }
});

export default r;
