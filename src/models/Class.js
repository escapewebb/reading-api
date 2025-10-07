import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
  classCode: { type: String, unique: true, index: true, required: true },
  name: { type: String, required: true },
  grade: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Class', ClassSchema);
