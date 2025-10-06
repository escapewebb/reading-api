// Same logic as client (optional to verify on server)
function normalize(s){ return s.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g,' ').trim(); }
function editDistance(a,b){
  const dp = Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
  for(let i=0;i<=a.length;i++) dp[i][0]=i;
  for(let j=0;j<=b.length;j++) dp[0][j]=j;
  for(let i=1;i<=a.length;i++){
    for(let j=1;j<=b.length;j++){
      const cost = a[i-1]===b[j-1]?0:1;
      dp[i][j]=Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
    }
  }
  return dp[a.length][b.length];
}
export function scoreReading({targetText, transcript, seconds}){
  const tgt = normalize(targetText).split(' ').filter(Boolean);
  const hyp = normalize(transcript||'').split(' ').filter(Boolean);
  const dist = editDistance(tgt, hyp);
  const correct = Math.max(0, tgt.length - dist);
  const accuracy = tgt.length ? Math.round((correct / tgt.length) * 100) : 0;
  const minutes = Math.max(seconds/60, 1/60);
  const wpm = Math.max(0, Math.round(hyp.length / minutes));
  const paceTarget = {low: 70, high: 160};
  let pace = "Just Right";
  if (wpm < paceTarget.low) pace = "Too Slow";
  else if (wpm > paceTarget.high) pace = "Too Fast";
  const suggestions = [];
  if (accuracy < 95) suggestions.push("Practice tricky words; try echo reading.");
  if (pace === "Too Slow") suggestions.push("Group words into phrases; glance ahead.");
  if (pace === "Too Fast") suggestions.push("Honor commas and periods with short pauses.");
  if (accuracy >= 95 && pace === "Just Right") suggestions.push("Excellent! Try a harder passage.");
  return {accuracy,wpm,pace,suggestions};
}
export function decideNextLevel(currentLevel, accuracy, wpm){
  const LEVELS = ["A","B","C","D","E","F","G","H"];
  const idx = LEVELS.indexOf(currentLevel);
  const up = (accuracy>=96 && wpm>=80 && wpm<=170);
  const down = (accuracy<90);
  const move = up ? "UP" : down ? "DOWN" : "STAY";
  const next = move==="UP" ? LEVELS[Math.min(idx+1, LEVELS.length-1)]
             : move==="DOWN" ? LEVELS[Math.max(idx-1,0)]
             : currentLevel;
  return {move,next};
}
