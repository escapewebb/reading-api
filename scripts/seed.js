import 'dotenv/config';
import mongoose from 'mongoose';
import Passage from '../src/models/Passage.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/reading_coach';

// Levels A–Z
const LEVELS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // 'A'...'Z'

// Simple difficulty scaler (longer sentences at higher levels)
function buildPassage(level, index = 1) {
  const difficulty = level.charCodeAt(0) - 64; // A=1 ... Z=26
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

  // Compose text length by level
  const chosen = [];
  const addShort = Math.min(2 + Math.floor(difficulty / 4), baseShort.length);
  const addMedium = Math.min(1 + Math.floor(difficulty / 6), baseMedium.length);
  const addLong = Math.min(Math.floor(difficulty / 8), baseLong.length);

  for (let i = 0; i < addShort; i++) chosen.push(baseShort[i]);
  for (let i = 0; i < addMedium; i++) chosen.push(baseMedium[i]);
  for (let i = 0; i < addLong; i++) chosen.push(baseLong[i]);

  // Ensure minimum length for early levels
  if (chosen.length < 3) chosen.push("We take a breath and keep going, step by step.");

  const titleBank = [
    "A Steady Walk",
    "Notes in the Wind",
    "Paths and Plans",
    "Quiet Practice",
    "Bright Morning",
    "River of Steps",
    "Teamwork Grows",
    "Listening Well",
    "Small Discoveries",
    "Light and Shadow"
  ];
  const title = `${titleBank[(difficulty + index) % titleBank.length]} (${level}-${index})`;

  const text = chosen.join(" ");
  return { level, title, text, active: true };
}

async function main() {
  console.log(`Seeding passages A–Z into ${MONGO_URI} ...`);
  await mongoose.connect(MONGO_URI);
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

  const res = await Promise.all(ops);
  const upserts = res.filter(r => r.upsertedId || r.upsertedCount).length;
  console.log(`Seed complete. Upserted/updated ${res.length} passages (${upserts} upserted).`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error(err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
