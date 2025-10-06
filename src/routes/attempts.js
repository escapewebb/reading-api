import express from 'express';
import Joi from 'joi';
import Passage from '../models/Passage.js';
import Student from '../models/Student.js';
import Attempt from '../models/Attempt.js';
import { validate } from '../middleware/validate.js';
import { scoreReading, decideNextLevel } from '../utils/scoring.js';
import { attemptsToCsv } from '../utils/csv.js';

const r = express.Router();

/* Submit attempt
  Body: { classCode, username, passageId, level, seconds, transcript }
  Server can compute scores from passage text + transcript
*/
r.post('/', validate(Joi.object({
  classCode: Joi.string().required(),
  username: Joi.string().required(),
  passageId: Joi.string().required(),
  level: Joi.string().pattern(/^[A-H]$/).required(),
  seconds: Joi.number().min(1).max(600).required(),
  transcript: Joi.string().allow('').required(),
  // optionally accept precomputed metrics and trust client less:
  accuracy: Joi.number().min(0).max(100).optional(),
  wpm: Joi.number().min(0).max(600).optional()
})), async (req,res,next)=>{
  try{
    const { classCode, username, passageId, level, seconds, transcript } = req.body;
    const passage = await Passage.findById(passageId).lean();
    if(!passage) return res.status(400).json({error:'Invalid passageId'});

    // Compute scores server-side (authoritative)
    const { accuracy, wpm, pace, suggestions } = scoreReading({
      targetText: passage.text, transcript, seconds
    });
    const { move, next } = decideNextLevel(level, accuracy, wpm);

    const attempt = await Attempt.create({
      classCode, username, level, passageId, seconds,
      accuracy, wpm, pace, suggestions, move, nextLevel: next, transcript
    });

    // Update student level immediately
    await Student.findOneAndUpdate({ classCode, username }, { $set: { level: next } }, { upsert: true });

    res.status(201).json({ attempt, nextLevel: next });
  }catch(e){ next(e); }
});

// Student history
r.get('/history', validate(Joi.object({
  classCode: Joi.string().required(),
  username: Joi.string().required(),
  limit: Joi.number().min(1).max(200).default(50)
})), async (req,res,next)=>{
  try{
    const { classCode, username, limit } = req.query;
    const rows = await Attempt.find({ classCode, username }).sort({ createdAt:-1 }).limit(Number(limit)).lean();
    res.json(rows);
  }catch(e){ next(e); }
});

// Class export (CSV) — simple teacher pull by classCode
r.get('/export', validate(Joi.object({
  classCode: Joi.string().required(),
  format: Joi.string().valid('csv','json').default('csv')
})), async (req,res,next)=>{
  try{
    const { classCode, format } = req.query;
    const rows = await Attempt.find({ classCode }).sort({ createdAt:-1 }).lean();
    if(format==='json') return res.json(rows);
    const csv = attemptsToCsv(rows);
    res.setHeader('Content-Type','text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attempts-${classCode}.csv"`);
    res.send(csv);
  }catch(e){ next(e); }
});

export default r;
