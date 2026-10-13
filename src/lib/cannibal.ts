// カニバリ（同じキーワードの記事の重複）判定。AIは使わない。
import type { SheetEntry } from './sheetKeywords';

export type CannibalLevel = 'written' | 'skip' | 'near';

export interface CannibalAlert {
  level: CannibalLevel; // written=赤（書いた・作業中） / skip=黄（書かない判定） / near=黄（近い記事あり）
  keyword: string; // シート側のキーワード
  label: string; // 状態（済・作業中・書かない など）
  source: string; // どのシートか
}

// 「書く予定」（まだ書いていないが予定に入っている）かどうか。表示の文言を変えるために使う
export const isPlanned = (alert: CannibalAlert): boolean =>
  alert.level === 'written' && /^書く(予定)?/.test(alert.label.normalize('NFKC').trim());

// 全角半角・大文字小文字・スペース・記号の違いをならす
const normalize = (s: string): string =>
  s.normalize('NFKC').toLowerCase().replace(/[\s・、。,.\-_+＋/／]+/g, '');

const sortedTokens = (s: string): string =>
  s.normalize('NFKC').toLowerCase().split(/\s+/).filter(Boolean).sort().join('|');

const tokenCount = (s: string): number => s.normalize('NFKC').split(/\s+/).filter(Boolean).length;

// 近いと見なす最低文字数（「旅行」のような短い語で誤検知しないため）
const NEAR_MIN_LENGTH = 4;
const MAX_NEAR = 5;

export const findCannibals = (
  keyword: string,
  entries: SheetEntry[],
  legacyKeywords: string[] = [],
): CannibalAlert[] => {
  const key = normalize(keyword);
  if (!key) return [];
  const tokens = sortedTokens(keyword);
  const multiToken = tokenCount(keyword) >= 2;

  const exact: CannibalAlert[] = [];
  const near: { alert: CannibalAlert; gap: number }[] = [];
  const seen = new Set<string>();

  const consider = (entry: SheetEntry) => {
    const entryKey = normalize(entry.keyword);
    if (!entryKey) return;
    const dedupe = `${entry.status}|${entryKey}|${entry.source}`;
    if (seen.has(dedupe)) return;

    const isExact =
      entryKey === key || (multiToken && tokenCount(entry.keyword) >= 2 && sortedTokens(entry.keyword) === tokens);

    if (isExact) {
      seen.add(dedupe);
      exact.push({
        level: entry.status === 'written' ? 'written' : 'skip',
        keyword: entry.keyword,
        label: entry.label,
        source: entry.source,
      });
      return;
    }

    // 近い記事は「書いた・作業中」のものだけを対象にする
    if (entry.status !== 'written') return;
    const [shorter, longer] = entryKey.length <= key.length ? [entryKey, key] : [key, entryKey];
    if (shorter.length >= NEAR_MIN_LENGTH && longer.includes(shorter)) {
      seen.add(dedupe);
      near.push({
        alert: { level: 'near', keyword: entry.keyword, label: entry.label, source: entry.source },
        gap: longer.length - shorter.length,
      });
    }
  };

  entries.forEach(consider);
  legacyKeywords.forEach((kw) =>
    consider({ keyword: kw, status: 'written', label: '記事あり', source: '過去記事管理' }),
  );

  // 赤を先に、次に「書かない」、最後に近い記事（近い順）
  const order = (a: CannibalAlert) => (a.level === 'written' ? 0 : 1);
  exact.sort((a, b) => order(a) - order(b));
  near.sort((a, b) => a.gap - b.gap);
  return [...exact, ...near.slice(0, MAX_NEAR).map((n) => n.alert)];
};
