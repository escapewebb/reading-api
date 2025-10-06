import mongoose from 'mongoose';
const StudentSchema = new mongoose.Schema({
  classCode: { type: String, index: true, required: true },
  username: { type: String, required: true },
  displayName: { type: String },
  level: { type: String, default: 'A' }, // current adaptive level
  createdAt: { type: Date, default: Date.now }
});
StudentSchema.index({ classCode:1, username:1 }, { unique: true });
export default mongoose.model('Student', StudentSchema);
