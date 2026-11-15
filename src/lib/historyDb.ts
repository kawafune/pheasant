// IndexedDB ユーティリティ（Pheasant 生成履歴用）
// アプリ起動時にはDBを開かず、操作時のみ非同期でアクセスする軽量設計

const DB_NAME = 'pheasant_history_db';
const DB_VERSION = 2; // v2：生成ログ（genLogs）を追加。既存の articles はそのまま
const STORE_NAME = 'articles';
const LOG_STORE = 'genLogs';

export interface HistoryRecord {
  id?: number;
  createdAt: string;
  mainKeyword: string;
  plainText: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
      // 生成ログ（タスク13）。gen_id は自動の通し番号
      if (!db.objectStoreNames.contains(LOG_STORE)) {
        db.createObjectStore(LOG_STORE, { keyPath: 'gen_id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveArticle(record: Omit<HistoryRecord, 'id'>): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add(record);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function getAllArticles(): Promise<HistoryRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      db.close();
      // 新しい順にソート
      const results = (request.result as HistoryRecord[]).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      resolve(results);
    };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

export async function deleteArticle(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

// --- 生成ログ（記事を1本生成するごとに1行。CSVで書き出す） ---
// url と publish_date は、公開後に人が（または別ツールが）追記する。Pheasantは自動で取得・送信しない。
export interface GenLog {
  gen_id?: number;
  gen_date: string;
  rules_version: string;
  media: string;
  main_kw: string;
  focus_kws: string;
  intent_label: string;
  stance: string;
  after_change: string;
  cash_point: string;
  inputs_used: string;
  title: string;
  url: string;
  publish_date: string;
}

export const GEN_LOG_COLUMNS: (keyof GenLog)[] = [
  'gen_id', 'gen_date', 'rules_version', 'media', 'main_kw', 'focus_kws', 'intent_label',
  'stance', 'after_change', 'cash_point', 'inputs_used', 'title', 'url', 'publish_date',
];

export async function saveGenLog(log: Omit<GenLog, 'gen_id'>): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LOG_STORE, 'readwrite');
    const req = tx.objectStore(LOG_STORE).add(log);
    tx.oncomplete = () => { db.close(); resolve(req.result as number); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function getAllGenLogs(): Promise<GenLog[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LOG_STORE, 'readonly');
    const request = tx.objectStore(LOG_STORE).getAll();
    request.onsuccess = () => {
      db.close();
      resolve((request.result as GenLog[]).sort((a, b) => (a.gen_id ?? 0) - (b.gen_id ?? 0)));
    };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

// CSV（Excel・スプレッドシートで文字化けしないよう、先頭にBOMを付ける）
const csvCell = (v: unknown): string => {
  const t = v === undefined || v === null ? '' : String(v);
  return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

export const genLogsToCsv = (logs: GenLog[]): string =>
  '\uFEFF' + [GEN_LOG_COLUMNS.join(','), ...logs.map((l) => GEN_LOG_COLUMNS.map((c) => csvCell(l[c])).join(','))].join('\r\n') + '\r\n';
