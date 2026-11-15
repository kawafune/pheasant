// 出力前の点検（seo-rules.md §7）のうち、AIを使わずコードで確認する部分。
import { KURAMIKKE_KEY, hasKuramikkeDisclaimer } from './mediaProfiles';
import { hasAdNotice } from './articleDesign';
import type { ArticleDesign } from './articleDesign';

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
  '必ず',
  '絶対',
  '100%',
  '100％',
  '誰でも稼げる',
  '業界No.1',
  '業界No1',
  '業界ナンバーワン',
  '一番おすすめ',
] as const;

// クラミッケ（健康・介護・終活）で追加するNG語句。診断・断定・煽り・金銭的な痛みにつながる表現
export const KURAMIKKE_NG_PHRASES = [
  '診断します',
  '診断できます',
  '完治',
  '確実に',
  '間違いなく',
  '今だけ',
  '放置すると',
  '損をする',
  '損します',
  '儲かる',
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

export const checkNgPhrases = (structure: ArticleSection[], extraPhrases: readonly string[] = []): CheckItem => {
  const label = 'NG表現（§5）が含まれていない';
  const hits: string[] = [];
  structure.forEach((s) => {
    const body = `${s.text}\n${s.content ?? ''}`;
    [...new Set([...NG_PHRASES, ...extraPhrases])].forEach((phrase) => {
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

// クラミッケ：最後のセクションに免責文が入っているか
export const checkKuramikkeDisclaimer = (structure: ArticleSection[]): CheckItem => {
  const label = '免責文が記事の最後に入っている';
  const last = structure[structure.length - 1];
  const ok = !!last?.content && hasKuramikkeDisclaimer(last.content);
  return {
    id: 'disclaimer',
    label,
    status: ok ? 'ok' : 'warn',
    reason: ok ? '入っています' : '最後のセクションに免責文がありません（まとめを書き直すと自動で付きます）',
    source: 'code',
  };
};

// --- 見出しの形（seo-rules.md §2）：H2・H3は25字以内、先頭に番号なし、階層を飛ばさない ---
export const HEADING_MAX = 25;
const NUMBERED_HEADING = /^\s*([0-9０-９]+\s*[.．、。:：)）-]|[①-⑳]|[(（][0-9０-９]+[)）]|第[0-9０-９一二三四五六七八九十]+[章節回]|STEP\s*[0-9０-９]+|Q[0-9０-９]+)/i;

export const checkHeadingLength = (structure: ArticleSection[]): CheckItem => {
  const label = 'H2・H3は25字以内';
  const over = structure
    .filter((s) => s.tag !== 'h1')
    .map((s) => ({ s, len: Array.from(s.text.trim()).length }))
    .filter(({ len }) => len > HEADING_MAX);
  return over.length === 0
    ? { id: 'heading_length', label, status: 'ok', reason: 'すべて25字以内です', source: 'code' }
    : { id: 'heading_length', label, status: 'warn', reason: over.map(({ s, len }) => `「${s.text}」（${len}字）`).join('、'), source: 'code' };
};

export const checkHeadingNumbers = (structure: ArticleSection[]): CheckItem => {
  const label = '見出しの先頭に番号が付いていない';
  const hits = structure.filter((s) => s.tag !== 'h1' && NUMBERED_HEADING.test(s.text));
  return hits.length === 0
    ? { id: 'heading_number', label, status: 'ok', reason: '番号付きの見出しはありません', source: 'code' }
    : { id: 'heading_number', label, status: 'warn', reason: hits.map((s) => `「${s.text}」`).join('、'), source: 'code' };
};

export const checkHeadingHierarchy = (structure: ArticleSection[]): CheckItem => {
  const label = '見出しの階層を飛ばしていない';
  const problems: string[] = [];
  const h1Count = structure.filter((s) => s.tag === 'h1').length;
  if (h1Count !== 1) problems.push(`H1が${h1Count}個あります（1個にする）`);
  if (structure[0] && structure[0].tag !== 'h1') problems.push('最初の見出しがH1ではありません');
  let prev: ArticleSection['tag'] | null = null;
  structure.forEach((s) => {
    if (s.tag === 'h3' && prev === 'h1') problems.push(`H1の直後にH3「${s.text}」があります`);
    prev = s.tag;
  });
  return problems.length === 0
    ? { id: 'heading_hierarchy', label, status: 'ok', reason: '問題ありません', source: 'code' }
    : { id: 'heading_hierarchy', label, status: 'warn', reason: problems.join('、'), source: 'code' };
};

// --- リンクの本数（seo-rules.md §3・§4）：内部リンク最大4本、発リンク（出典）最大2本 ---
export const INTERNAL_LINK_MAX = 4;
export const EXTERNAL_LINK_MAX = 2;
const INTERNAL_LINK_PATTERN = /【内部リンク[^】]*】/g;
const EXTERNAL_LINK_PATTERN = /[（(]出典[：:][^）)]*[）)]/g;
const URL_PATTERN = /https?:\/\/[^\s）)】」]+/g;

export const checkLinkCounts = (structure: ArticleSection[], sourceText: string = ''): CheckItem => {
  const label = '内部リンク4本以内・発リンク2本以内（URLを作っていない）';
  const body = structure.map((s) => s.content ?? '').join('\n');
  const internal = body.match(INTERNAL_LINK_PATTERN)?.length ?? 0;
  const external = body.match(EXTERNAL_LINK_PATTERN)?.length ?? 0;
  // 参考データ・共通データベースにないURLが本文にあれば、AIが作った可能性がある
  const unknownUrls = (body.match(URL_PATTERN) ?? []).filter((u) => !sourceText.includes(u));
  const problems: string[] = [];
  if (internal > INTERNAL_LINK_MAX) problems.push(`内部リンクが${internal}本あります（最大${INTERNAL_LINK_MAX}本）`);
  if (external > EXTERNAL_LINK_MAX) problems.push(`発リンク（出典）が${external}本あります（最大${EXTERNAL_LINK_MAX}本）`);
  if (unknownUrls.length > 0) problems.push(`参考データにないURLがあります：${[...new Set(unknownUrls)].join('、')}`);
  return problems.length === 0
    ? { id: 'link_counts', label, status: 'ok', reason: `内部リンク${internal}本・発リンク${external}本`, source: 'code' }
    : { id: 'link_counts', label, status: 'warn', reason: problems.join('、'), source: 'code' };
};

// --- よくある質問（seo-rules.md §3）：まとめの直前に4〜5問 ---
export const isFaqHeading = (text: string): boolean => /よくある(質問|ご質問)|FAQ|Q&A|Ｑ＆Ａ/i.test(text);
const FAQ_QUESTION = /^\s*(Q[.．:：\s]|Ｑ|質問[：:])/;

export const checkFaq = (structure: ArticleSection[]): CheckItem => {
  const label = 'よくある質問（4〜5問）がまとめの前にある';
  const idx = structure.findIndex((s) => s.tag !== 'h1' && isFaqHeading(s.text));
  if (idx < 0) return { id: 'faq', label, status: 'warn', reason: '「よくある質問」の見出しがありません', source: 'code' };
  const problems: string[] = [];
  if (idx !== structure.length - 2) problems.push('まとめの直前にありません');
  const content = structure[idx].content ?? '';
  const count = content.split('\n').filter((l) => FAQ_QUESTION.test(l)).length;
  if (!content.trim()) problems.push('本文がまだありません');
  else if (count < 4 || count > 5) problems.push(`質問が${count}問です（4〜5問）`);
  return problems.length === 0
    ? { id: 'faq', label, status: 'ok', reason: `${count}問、まとめの直前にあります`, source: 'code' }
    : { id: 'faq', label, status: 'warn', reason: problems.join('、'), source: 'code' };
};

// --- 記事のポイント4つ（seo-rules.md §3）：導入文にあるか ---
export const checkKeyPoints = (structure: ArticleSection[]): CheckItem => {
  const label = '導入文に「記事のポイント4つ」がある';
  const intro = structure.find((s) => s.tag === 'h1')?.content ?? '';
  const ok = intro.includes('ポイント');
  return {
    id: 'key_points',
    label,
    status: ok ? 'ok' : 'warn',
    reason: ok ? '入っています' : intro.trim() ? '導入文に「記事のポイント」が見当たりません' : '導入文がまだありません',
    source: 'code',
  };
};

// --- 広告表記（seo-rules.md §8）：広告・PRありのときだけ冒頭にある／なしのときは付いていない ---
export const checkAdNotice = (structure: ArticleSection[], design?: ArticleDesign): CheckItem => {
  const label = '広告表記（広告・PRを含む記事だけ冒頭に）';
  const intro = structure.find((s) => s.tag === 'h1')?.content ?? '';
  const firstLine = intro.trim().split('\n')[0] ?? '';
  const anywhere = structure.some((s) => hasAdNotice(s.content ?? ''));
  if (design?.hasAd) {
    const ok = hasAdNotice(firstLine);
    return {
      id: 'ad_notice', label, status: ok ? 'ok' : 'warn',
      reason: ok ? '冒頭に入っています' : '冒頭に広告表記がありません（導入文を書き直すと自動で付きます）',
      source: 'code',
    };
  }
  return anywhere
    ? { id: 'ad_notice', label, status: 'warn', reason: '「広告・PRを含む」がオフなのに、広告表記が入っています', source: 'code' }
    : { id: 'ad_notice', label, status: 'ok', reason: '広告なしの記事です（表記なし）', source: 'code' };
};

export const runCodeChecks = (
  structure: ArticleSection[],
  mediaKey: string = 'default',
  design?: ArticleDesign,
  sourceText: string = '',
): CheckItem[] => {
  const isKuramikke = mediaKey === KURAMIKKE_KEY;
  return [
    checkH1Length(structure),
    checkHeadingLength(structure),
    checkHeadingNumbers(structure),
    checkHeadingHierarchy(structure),
    checkKeyPoints(structure),
    checkFaq(structure),
    checkLinkCounts(structure, sourceText),
    checkNgPhrases(structure, isKuramikke ? KURAMIKKE_NG_PHRASES : []),
    checkAdNotice(structure, design),
    ...(isKuramikke ? [checkKuramikkeDisclaimer(structure)] : []),
  ];
};

// 本文に残っている「人が対応するところ」（【要確認…】と【リンク…】）を拾う。AIは使わない。
export type TodoKind = 'confirm' | 'link' | 'internal';

export interface TodoItem {
  kind: TodoKind;
  marker: string; // 例：【要確認：営業時間を公式サイトで確認】
  sectionTag: 'h1' | 'h2' | 'h3';
  sectionText: string;
  context: string; // マーカーを含む行（長い場合は前後を切る）
}

const TODO_PATTERN = /【(要確認|リンク|内部リンク)[^】]*】/g;

const cutContext = (line: string, marker: string): string => {
  const trimmed = line.trim();
  if (trimmed.length <= 90) return trimmed;
  const pos = trimmed.indexOf(marker);
  const start = Math.max(0, pos - 40);
  return `${start > 0 ? '…' : ''}${trimmed.slice(start, pos + marker.length + 40)}…`;
};

export const extractTodos = (structure: ArticleSection[]): TodoItem[] => {
  const todos: TodoItem[] = [];
  structure.forEach((section) => {
    (section.content ?? '').split('\n').forEach((line) => {
      for (const match of line.matchAll(TODO_PATTERN)) {
        todos.push({
          kind: match[1] === 'リンク' ? 'link' : match[1] === '内部リンク' ? 'internal' : 'confirm',
          marker: match[0],
          sectionTag: section.tag,
          sectionText: section.text,
          context: cutContext(line, match[0]),
        });
      }
    });
  });
  return todos;
};
