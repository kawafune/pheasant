// Googleスプレッドシート（キーワード管理シート）の読み込みと、「書いた／書かない」行の抽出。
import Papa from 'papaparse';

export type EntryStatus = 'written' | 'skip';

export interface SheetEntry {
  keyword: string;
  status: EntryStatus; // written=書いた・作業中・書く予定 / skip=「書かない」と判定済み
  label: string; // 元のステータス表記（済・作業中・書かない・公開URLあり など）
  source: string; // シート名（表示用）
}

// 画面で扱う、読み込み済み（または読み込み中）のシート
export interface SheetSource {
  url: string;
  label: string;
  state: 'loading' | 'ok' | 'error';
  message?: string;
  auto?: string; // 掲載メディアの選択で自動読み込みしたシートなら、そのメディア
  entries: SheetEntry[];
  writtenCount: number;
  skipCount: number;
}

export interface SheetLoadResult {
  entries: SheetEntry[];
  rowCount: number;
  writtenCount: number;
  skipCount: number;
}

// --- 既知のシート（共有URLを貼ると、保管タブも自動で一緒に読む） ---
interface KnownSheet {
  label: string;
  gids: string[]; // 0 = 本体タブ、641372601 = writing_archives（保管タブ）
}

const ARCHIVE_GID = '641372601';

export const KNOWN_SHEETS: Record<string, KnownSheet> = {
  '1VsDKfWygfT-Yo2DKKlK8L7e7A_VGqohSnpDTWmF2yEk': { label: 'sumigi', gids: ['0', ARCHIVE_GID] },
  '1QvbykJ_H8oucsx904xux7B-FlQNQQdfMrjRwsq-uuJo': { label: 'タビノト。', gids: ['0', ARCHIVE_GID] },
  '1nBaDivRGpSDlJJMCba4Z_GYXho08BO92GiY4qngSR-Q': { label: 'cocci', gids: ['0'] },
};

// 掲載メディアを選んだときに自動で読み込むシート
export const SHEET_URL_BY_MEDIA: Record<string, string> = {
  sumigi: 'https://docs.google.com/spreadsheets/d/1VsDKfWygfT-Yo2DKKlK8L7e7A_VGqohSnpDTWmF2yEk/edit',
  tabinoto: 'https://docs.google.com/spreadsheets/d/1QvbykJ_H8oucsx904xux7B-FlQNQQdfMrjRwsq-uuJo/edit',
  cocci3: 'https://docs.google.com/spreadsheets/d/1nBaDivRGpSDlJJMCba4Z_GYXho08BO92GiY4qngSR-Q/edit',
};

export interface ParsedSheetUrl {
  id: string;
  gid: string;
}

// 共有URLからシートIDとgidを取り出す。スプレッドシートのURLでなければ null
export const parseSheetUrl = (url: string): ParsedSheetUrl | null => {
  const m = url.match(/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!m) return null;
  const g = url.match(/[#&?]gid=(\d+)/);
  return { id: m[1], gid: g ? g[1] : '0' };
};

// 同じシートを二重に登録しないための識別キー
export const sheetKeyOf = (url: string): string => {
  const parsed = parseSheetUrl(url);
  return parsed ? `sheet:${parsed.id}` : `url:${url}`;
};

export const sheetLabel = (id: string): string => KNOWN_SHEETS[id]?.label ?? 'シート';

// --- ステータス判定 ---
const SKIP_WORDS = /^(書かない|書かず|見送り|不要|没|ボツ|対象外)$/;
const WRITTEN_EXACT = /^(済|済み|完了|公開|公開済|公開済み|納品|納品済み|入稿済み|校正中|書く)$/;
const WRITTEN_PREFIX = /^(作業中|ライティング中|執筆中|書く予定)/;

export const classifyStatus = (cell: string): EntryStatus | null => {
  const s = cell.normalize('NFKC').trim();
  if (!s || s.length > 12) return null;
  if (SKIP_WORDS.test(s)) return 'skip';
  if (WRITTEN_EXACT.test(s) || WRITTEN_PREFIX.test(s)) return 'written';
  return null;
};

const isKeywordHeader = (cell: string): boolean => {
  const s = cell.normalize('NFKC').trim();
  return s.length > 0 && s.length <= 30 && /キーワード|サジェストKW|^KW$/i.test(s);
};

// CSVの行（二次元配列）から、「書いた」「書かない」行だけを取り出す
export const parseSheetRows = (rows: string[][], source: string): SheetEntry[] => {
  if (rows.length === 0) return [];

  // 見出し行（キーワード列・URL列を探す）。見つからなければ、先頭付近で文字が多い列を使う
  let headerIdx = -1;
  let kwCol = -1;
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const col = rows[i].findIndex(isKeywordHeader);
    if (col >= 0) {
      headerIdx = i;
      kwCol = col;
      break;
    }
  }
  if (kwCol < 0) {
    const sample = rows.slice(0, 20);
    const counts = [0, 1].map((c) => sample.filter((r) => (r[c] ?? '').trim()).length);
    kwCol = counts[1] > counts[0] ? 1 : 0;
  }
  const header = headerIdx >= 0 ? rows[headerIdx] : [];
  const urlCol = header.findIndex((c) => c.trim().toUpperCase() === 'URL');

  const entries: SheetEntry[] = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    const keyword = (row[kwCol] ?? '').trim();
    // 空行・説明文（● ※ で始まる／長い文）はキーワードではない
    if (!keyword || keyword.length > 80 || /^[●※]/.test(keyword)) continue;

    let status: EntryStatus | null = null;
    let label = '';
    row.forEach((cell, c) => {
      if (c === kwCol) return;
      const st = classifyStatus(cell);
      if (!st) return;
      // 「書いた」が「書かない」より優先
      if (status === null || (st === 'written' && status === 'skip')) {
        status = st;
        label = cell.trim();
      }
    });

    // 公開URLが入っていれば「書いた」
    if (status !== 'written' && urlCol >= 0 && /^https?:\/\//.test((row[urlCol] ?? '').trim())) {
      status = 'written';
      label = '公開URLあり';
    }

    if (status) entries.push({ keyword, status, label, source });
  }
  return entries;
};

// --- 取得 ---
class SheetAccessError extends Error {}

const looksLikeHtml = (text: string): boolean => /^\s*<(!doctype|html)/i.test(text);

const PRIVATE_MESSAGE = 'シートが非公開です。共有設定を「リンクを知っている全員が閲覧可」にしてください';

// まずブラウザから直接読み、だめなら Vercel のサーバー経由（/api/sheet）で読む
export const fetchSheetCsv = async (id: string, gid: string): Promise<string> => {
  const direct = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=1&gid=${gid}`;
  let directError = '';
  try {
    const res = await fetch(direct);
    if (res.ok) {
      const text = await res.text();
      if (looksLikeHtml(text)) throw new SheetAccessError(PRIVATE_MESSAGE);
      return text;
    }
    directError = `HTTP ${res.status}`;
  } catch (e) {
    if (e instanceof SheetAccessError) throw e;
    directError = 'ブラウザから直接は読めませんでした';
  }

  try {
    const res = await fetch(`/api/sheet?id=${encodeURIComponent(id)}&gid=${encodeURIComponent(gid)}`);
    const text = await res.text();
    if (!res.ok) throw new SheetAccessError(text.slice(0, 120) || `HTTP ${res.status}`);
    if (looksLikeHtml(text)) throw new SheetAccessError(PRIVATE_MESSAGE);
    return text;
  } catch (e) {
    if (e instanceof SheetAccessError) throw e;
    throw new Error(`シートを読み込めませんでした（${directError} / サーバー経由も失敗）`);
  }
};

// URL（共有URL）から、必要なタブをすべて読み込む
export const loadSheetEntries = async (url: string): Promise<SheetLoadResult> => {
  const parsed = parseSheetUrl(url);
  if (!parsed) throw new Error('Googleスプレッドシートの共有URLではありません');
  const known = KNOWN_SHEETS[parsed.id];
  const gids = known ? known.gids : [parsed.gid];
  const label = sheetLabel(parsed.id);

  let rowCount = 0;
  const entries: SheetEntry[] = [];
  for (const gid of gids) {
    const csv = await fetchSheetCsv(parsed.id, gid);
    const rows = (Papa.parse(csv) as { data: string[][] }).data;
    rowCount += rows.length;
    const tabName = gid === ARCHIVE_GID ? `${label}（保管）` : label;
    entries.push(...parseSheetRows(rows, tabName));
  }
  return {
    entries,
    rowCount,
    writtenCount: entries.filter((e) => e.status === 'written').length,
    skipCount: entries.filter((e) => e.status === 'skip').length,
  };
};
