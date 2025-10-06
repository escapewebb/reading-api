import { stringify } from 'csv-stringify/sync';
export function attemptsToCsv(rows){
  const header = ["timestamp","classCode","username","level","nextLevel","passageId","accuracy","wpm","pace","move"];
  const data = rows.map(a=>[
    a.createdAt.toISOString(), a.classCode, a.username, a.level, a.nextLevel, String(a.passageId),
    a.accuracy, a.wpm, a.pace, a.move
  ]);
  return stringify([header, ...data]);
}
