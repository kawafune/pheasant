// 共通データベース（媒体ごとに1つ。seo-rules.md §1・§4）
// サイトのテーマ全体の情報（運営方針、よく使う公的資料、商品の基本情報など）を、媒体ごとに別々に保存する。

export const COMMON_DB_MEDIA = ['default', 'tabinoto', 'sumigi', 'cocci3', 'kuramikke'] as const;

export const commonDbKey = (mediaType: string) => `pheasant_commonDb_${mediaType}`;

// 共通データベースはAIを呼ぶたびに毎回送るので、料金が膨らまないよう上限を小さくする（川船さん判断 2026-11-15）。
// 5,000字なら、1記事（AI呼び出し十数回）で増える料金はわずか。これを超える分は入力できない。
export const COMMON_DB_LIMIT = 5000;

// 保存済みの共通データベースを、媒体ごとにまとめて読む
export const loadCommonDbMap = (): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const m of COMMON_DB_MEDIA) {
    try {
      map[m] = localStorage.getItem(commonDbKey(m)) ?? '';
    } catch {
      map[m] = '';
    }
  }
  return map;
};
