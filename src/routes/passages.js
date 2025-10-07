import express from 'express';
import Passage from '../models/Passage.js';

const r = express.Router();

// GET /api/passages?level=A
r.get('/', async (req,res,next)=>{
  try {
    const level = (req.query.level || '').toUpperCase();
    if(!level) return res.status(400).json({error:'level is required'});
    const list = await Passage.find({ level, active:true }).sort({ createdAt:-1 }).lean();
    res.json(list);
  } catch (e) { next(e); }
});

export default r;
