import mongoose from 'mongoose';
const AttemptSchema = new mongoose.Schema({
  classCode: { type: String, index: true, required: true },
  username: { type: String, index: true, required: true },
  level: { type: String, required: true },
  passageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Passage', required: true },
  seconds: Number,
  accuracy: Number,
  wpm: Number,
  pace: String,
  suggestions: [String],
  move: { type: String, enum: ['UP','DOWN','STAY'] },
  nextLevel: String,
  transcript: { type: String }, // optional storage
  createdAt: { type: Date, default: Date.now }
});
AttemptSchema.index({ classCode:1, username:1, createdAt:-1 });
export default mongoose.model('Attempt', AttemptSchema);
