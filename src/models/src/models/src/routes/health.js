import express from 'express';
const r = express.Router();
r.get('/', (req,res)=> res.json({ ok:true, time:new Date().toISOString() }));
export default r;
