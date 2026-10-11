// 記事の設計（seo-rules.md §1）。すべて任意入力。
export interface ArticleDesign {
  searchIntent: string; // 検索意図（属性ラベル付き。例：購入直前：…）
  titleIdea: string; // 記事タイトル案
  stance: string; // 結論付けとスタンス（2文程度）
  readerChange: string; // 読後の変化（読む前 → 読んだ後 → 次の行動）
  cashPoint: string; // キャッシュポイント／送客先（URLも可）
  existingUrl: string; // 既存記事URL（食い合い確認用）
}

export const EMPTY_DESIGN: ArticleDesign = {
  searchIntent: '',
  titleIdea: '',
  stance: '',
  readerChange: '',
  cashPoint: '',
  existingUrl: '',
};

// localStorage の新規キー（既存の kiwi_* は変更しない）
export const DESIGN_STORAGE_KEY = 'pheasant_design';

export const DESIGN_LABELS: Record<keyof ArticleDesign, string> = {
  searchIntent: '検索意図',
  titleIdea: '記事タイトル案',
  stance: '結論付けとスタンス',
  readerChange: '読後の変化',
  cashPoint: 'キャッシュポイント／送客先',
  existingUrl: '既存記事URL',
};

// プロンプトに入れる文字列。入力がある項目だけ出力し、全部空なら空文字を返す。
export const designToPromptText = (design?: ArticleDesign): string => {
  if (!design) return '';
  const lines = (Object.keys(DESIGN_LABELS) as (keyof ArticleDesign)[])
    .filter((key) => design[key]?.trim())
    .map((key) => `- ${DESIGN_LABELS[key]}: ${design[key].trim()}`);
  if (lines.length === 0) return '';
  return `# 記事の設計（入力済みの項目のみ。空の項目は未指定）\n${lines.join('\n')}`;
};

// localStorage から読んだ値を安全に ArticleDesign へ整える
export const normalizeDesign = (raw: unknown): ArticleDesign => {
  const base = { ...EMPTY_DESIGN };
  if (raw && typeof raw === 'object') {
    for (const key of Object.keys(base) as (keyof ArticleDesign)[]) {
      const v = (raw as Record<string, unknown>)[key];
      if (typeof v === 'string') base[key] = v;
    }
  }
  return base;
};

// 構成生成で一緒に得る記事全体の情報（seo-rules.md §2・§3）
export interface ArticleMeta {
  metaDescription: string; // メタディスクリプション（1〜2文）
  keyPoints: string[]; // 記事のポイント4つ
  conclusion: string; // この記事の結論（1文）
}

export const EMPTY_META: ArticleMeta = { metaDescription: '', keyPoints: [], conclusion: '' };

export const META_STORAGE_KEY = 'pheasant_meta';

export const normalizeMeta = (raw: unknown): ArticleMeta => {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_META };
  const r = raw as Record<string, unknown>;
  return {
    metaDescription: typeof r.metaDescription === 'string' ? r.metaDescription : '',
    keyPoints: Array.isArray(r.keyPoints) ? r.keyPoints.filter((k): k is string => typeof k === 'string') : [],
    conclusion: typeof r.conclusion === 'string' ? r.conclusion : '',
  };
};
