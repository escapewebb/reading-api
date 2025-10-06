import express from 'express';
import Joi from 'joi';
import Class from '../models/Class.js';
import { validate } from '../middleware/validate.js';

const r = express.Router();

// Create class (teacher action)
r.post('/', validate(Joi.object({
  classCode: Joi.string().min(2).max(32).required(),
  name: Joi.string().min(2).max(80).required(),
  grade: Joi.string().max(20).allow('')
})), async (req,res,next)=>{
  try{
    const cls = await Class.create(req.body);
    res.status(201).json(cls);
  }catch(e){ next(e); }
});

// Verify class exists (for join screen)
r.get('/exists', validate(Joi.object({
  classCode: Joi.string().required()
})), async (req,res,next)=>{
  try{
    const cls = await Class.findOne({ classCode: req.query.classCode }).lean();
    res.json({ exists: !!cls, class: cls || null });
  }catch(e){ next(e); }
});

export default r;
