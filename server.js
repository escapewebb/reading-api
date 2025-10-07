import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';

// CORS — allow your site to call the API
const corsOrigin = process.env.CORS_ORIGIN || '*';
const app = express();
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin.split(',').map(s=>s.trim()) }));
app.use(express.json({ limit: '1mb' }));

// Mongo connect
const uri = process.env.MONGO_URI;
if (!uri) throw new Error('MONGO_URI missing');
mongoose.set('strictQuery', true);
mongoose.connect(uri).then(()=> console.log('Mongo connected')).catch(err=>{ console.error(err); process.exit(1); });

// Simple health route
app.get('/health', (req,res)=> res.json({ ok:true, time:new Date().toISOString() }));

// Models
import Passage from './src/models/Passage.js';

// Routes
import passagesRoutes from './src/routes/passages.js';
app.use('/api/passages', passagesRoutes);

// (Optional) other routes you added earlier:
// import classRoutes from './src/routes/classes.js';
// app.use('/api/classes', classRoutes);
// import studentRoutes from './src/routes/students.js';
// app.use('/api/students', studentRoutes);
// import attemptRoutes from './src/routes/attempts.js';
// app.use('/api/attempts', attemptRoutes);

// 404 fallback
app.use((req,res)=> res.status(404).json({error:'Not found'}));

// Start
const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log(`API running on ${port}`));
