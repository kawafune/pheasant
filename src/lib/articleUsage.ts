// この記事で使ったAIのトークン量（画面の「この記事のAI使用量」）
export interface ArticleUsage {
  calls: number;
  input: number;
  cached: number;
  output: number;
}

export const EMPTY_USAGE: ArticleUsage = { calls: 0, input: 0, cached: 0, output: 0 };

export const normalizeUsage = (raw: unknown): ArticleUsage => {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
  return { calls: n(r.calls), input: n(r.input), cached: n(r.cached), output: n(r.output) };
};
