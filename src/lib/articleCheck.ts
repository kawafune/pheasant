// 出力前の点検（seo-rules.md §7）のうち、AIを使わずコードで確認する部分。

export type CheckStatus = 'ok' | 'warn';

export interface CheckItem {
  id: string;
  label: string;
  status: CheckStatus;
  reason: string;
  source: 'code' | 'ai';
}

interface ArticleSection {
  tag: 'h1' | 'h2' | 'h3';
  text: string;
  content?: string;
}

// seo-rules.md §5「表現の禁止」のNG語句
export const NG_PHRASES = [
  '治る',
  '防げる',
  '完全に除去',
  '必ず効果がある',
  '医学的に証明',
  '健康に効果',
  '改善する',
  '予防',
] as const;

export const H1_MIN = 28;
export const H1_MAX = 40;

export const checkH1Length = (structure: ArticleSection[]): CheckItem => {
  const label = 'H1は28〜40字前後';
  const h1 = structure.find((s) => s.tag === 'h1');
  if (!h1) return { id: 'h1_length', label, status: 'warn', reason: 'H1が見つかりません', source: 'code' };
  const len = Array.from(h1.text.trim()).length;
  const ok = len >= H1_MIN && len <= H1_MAX;
  return {
    id: 'h1_length',
    label,
    status: ok ? 'ok' : 'warn',
    reason: ok ? `${len}字（範囲内）` : `${len}字です（目安は${H1_MIN}〜${H1_MAX}字）`,
    source: 'code',
  };
};

export const checkNgPhrases = (structure: ArticleSection[]): CheckItem => {
  const label = 'NG表現（§5）が含まれていない';
  const hits: string[] = [];
  structure.forEach((s) => {
    const body = `${s.text}\n${s.content ?? ''}`;
    NG_PHRASES.forEach((phrase) => {
      if (body.includes(phrase)) hits.push(`「${phrase}」（${s.tag.toUpperCase()}：${s.text}）`);
    });
  });
  return hits.length === 0
    ? { id: 'ng_phrases', label, status: 'ok', reason: '該当する語句はありません', source: 'code' }
    : {
        id: 'ng_phrases',
        label,
        status: 'warn',
        reason: `${hits.join('、')}。健康・効果の断定になっていないか確認してください`,
        source: 'code',
      };
};

export const runCodeChecks = (structure: ArticleSection[]): CheckItem[] => [
  checkH1Length(structure),
  checkNgPhrases(structure),
];
