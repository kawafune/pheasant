// 合言葉を変えるときに使う: node scripts/hash-passcode.mjs 新しい合言葉
// 出力されたハッシュを src/lib/auth.ts の PASSCODE_HASH に貼り替える。
// SALT は src/lib/auth.ts の SALT と同じ値にすること。
import { createHash } from 'node:crypto';

const SALT = 'pheasant-v1';
const passcode = process.argv[2];

if (!passcode) {
  console.error('使い方: node scripts/hash-passcode.mjs <新しい合言葉>');
  process.exit(1);
}

console.log(createHash('sha256').update(`${SALT}:${passcode}`).digest('hex'));
