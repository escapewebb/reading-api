import express from 'express';
const app = express();
app.get('/health', (req,res)=> res.json({ ok:true, time:new Date().toISOString() }));
const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log(`API running on ${port}`));
