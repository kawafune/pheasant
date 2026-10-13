// 合言葉（パスコード）によるログイン。
// ブラウザ側だけの簡易ロックで、外部サービスやキーは使わない。
// 合言葉を変えるときは: node scripts/hash-passcode.mjs <新しい合言葉> の出力を PASSCODE_HASH に貼る。
const SALT = 'pheasant-v1'; // scripts/hash-passcode.mjs の SALT と同じ値
const PASSCODE_HASH = '59d918f7abc5bee323837cae044cf8afb895064762e8d1a959c6bfed27b54b8b';
const STORAGE_KEY = 'pheasant_auth';

export const hashPasscode = async (passcode: string): Promise<string> => {
  if (!globalThis.crypto?.subtle) throw new Error('crypto.subtle unavailable');
  const data = new TextEncoder().encode(`${SALT}:${passcode}`);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

// 合言葉が合っていれば true を返し、この端末にログイン状態を保存する
export const login = async (passcode: string): Promise<boolean> => {
  const hash = await hashPasscode(passcode.trim());
  if (hash !== PASSCODE_HASH) return false;
  try {
    localStorage.setItem(STORAGE_KEY, hash);
  } catch {
    // 保存できなくても、この画面では続行できる
  }
  return true;
};

// 保存済みのログイン状態が、いまの合言葉と一致しているか（合言葉を変えると全員ログアウトになる）
export const isLoggedIn = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === PASSCODE_HASH;
  } catch {
    return false;
  }
};

export const logout = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 無視
  }
};
