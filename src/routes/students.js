import express from 'express';
import Joi from 'joi';
import Student from '../models/Student.js';
import { validate } from '../middleware/validate.js';

const r = express.Router();

// Upsert student on join (no password)
r.post('/join', validate(Joi.object({
  classCode: Joi.string().required(),
  username: Joi.string().min(2).max(40).required(),
  displayName: Joi.string().allow('', null),
  level: Joi.string().pattern(/^[A-H]$/).optional()
})), async (req,res,next)=>{
  try{
    const { classCode, username, displayName, level } = req.body;
    const doc = await Student.findOneAndUpdate(
      { classCode, username },
      { $setOnInsert: { classCode, username }, ...(displayName?{displayName}:{}) , ...(level?{level}:{}) },
      { upsert:true, new:true }
    );
    res.json(doc);
  }catch(e){ next(e); }
});

// Get student profile
r.get('/', validate(Joi.object({
  classCode: Joi.string().required(),
  username: Joi.string().required()
})), async (req,res,next)=>{
  try{
    const s = await Student.findOne({ classCode:req.query.classCode, username:req.query.username }).lean();
    if(!s) return res.status(404).json({error:'Student not found'});
    res.json(s);
  }catch(e){ next(e); }
});

export default r;
