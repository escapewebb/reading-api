// scripts/seed.js
import mongoose from 'mongoose';

// Get MONGO_URI from Render env (or local .env if run locally)
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is missing. Set it in Render → Settings → Environment.');
  process.exit(1);
}

// Minimal Passage model for seeding
const PassageSchema = new mongoose.Schema({
  level: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const Passage = mongoose.model('Passage', PassageSchema);

// Build simple passages A–Z (2 per level)
const LEVELS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // 'A'..'Z'

function buildPassage(level, index = 1) {
  const difficulty = level.charCodeAt(0) - 64; // A=1..Z=26
  const baseShort = [
    "The sun is warm and the path is clear.",
    "Birds sing softly as leaves sway.",
    "We walk together and smile at neighbors.",
    "A gentle breeze makes the trees whisper."
  ];
  const baseMedium = [
    "Across the field, the grass bends in ripples as the wind passes.",
    "Footsteps crunch on gravel, steady and calm, marking an easy pace.",
    "We trade quiet jokes, learning to listen and speak with care.",
    "New ideas bloom when we pay attention to small details."
  ];
  const baseLong = [
    "As the afternoon light drifts lower, shadows stretch long and thin, drawing patterns across the ground.",
    "We pause to notice how a simple plan grows stronger when each person adds a careful thought.",
    "The steady rhythm of our steps becomes a kind of music that keeps us moving forward together."
  ];

  const chosen = [];
  const addShort = Math.min(2 + Math.floor(difficulty / 4), baseShort.length);
  const addMedium = Math.min(1 + Math.floor(difficulty / 6), baseMedium.length);
  const addLong = Math.min(Math.floor(difficulty / 8), baseLong.length);

  for (let i = 0; i < addShort; i++) chosen.push(baseShort[i]);
  for (let i = 0; i < addMedium; i++) chosen.push(baseMedium[i]);
  for (let i = 0; i < addLong; i++) chosen.push(baseLong[i]);
  if (chosen.length < 3) chosen.push("We take a breath and keep going, step by step.");

  const titles = [
    "A Steady Walk","Notes in the Wind","Paths and Plans","Quiet Practice","Bright Morning",
    "River of Steps","Teamwork Grows","Listening Well","Small Discoveries","Light and Shadow"
  ];
  const title = `${titles[(difficulty + index) % titles.length]} (${level}-${index})`;
  return { level, title, text: chosen.join(" "), active: true };
}

async function main(){
  console.log('Connecting to Mongo…');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');

  const ops = [];
  for (const level of LEVELS) {
    for (let i = 1; i <= 2; i++) {
      const p = buildPassage(level, i);
      ops.push(
        Passage.updateOne(
          { level: p.level, title: p.title },
          { $set: p },
          { upsert: true }
        )
      );
    }
  }
  await Promise.all(ops);
  console.log(`Seed complete. Inserted/updated ${ops.length} passages.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err)=>{
  console.error(err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
