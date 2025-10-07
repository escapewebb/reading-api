// server.js
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';

// ---------- CORS / APP ----------
const app = express();
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin.split(',').map(s=>s.trim()) }));
app.use(express.json({ limit: '1mb' })); // <-- make sure this is before app.use('/api/...')

// ---------- DB ----------
const uri = process.env.MONGO_URI;
if (!uri) throw new Error('MONGO_URI missing');
mongoose.set('strictQuery', true);
mongoose.connect(uri)
  .then(()=> console.log('Mongo connected'))
  .catch(err=>{ console.error('Mongo error:', err); process.exit(1); });

// ---------- HEALTH ----------
app.get('/health', (req,res)=> res.json({ ok:true, time:new Date().toISOString() }));

// ---------- ROUTE IMPORTS ----------
import passagesRoutes from './src/routes/passages.js';

// 👇👇 ADD THIS IMPORT near your other route imports
import classRoutes from './src/routes/classes.js';
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// ---------- ROUTE MOUNTS ----------
app.use('/api/passages', passagesRoutes);

// 👇👇 ADD THIS MOUNT near your other app.use(...) routes
app.use('/api/classes', classRoutes);
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// (Optional later)
// import studentRoutes from './src/routes/students.js';
// import attemptRoutes from './src/routes/attempts.js';
// app.use('/api/students', studentRoutes);
// app.use('/api/attempts', attemptRoutes);

// 404
app.use((req,res)=> res.status(404).json({ error: 'Not found' }));

// ---------- START ----------
const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log(`API running on ${port}`));
