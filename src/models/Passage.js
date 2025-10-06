import mongoose from 'mongoose';
const PassageSchema = new mongoose.Schema({
  level: { type: String, required: true }, // A-H (extend as needed)
  title: { type: String, required: true },
  text: { type: String, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
PassageSchema.index({ level:1, active:1 });
export default mongoose.model('Passage', PassageSchema);
