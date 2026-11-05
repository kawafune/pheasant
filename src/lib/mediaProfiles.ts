// 媒体ごとの、コード側で持つ設定。ルールの正本は seo-rules.md §6（Notion SEO_Master_Logic 8-13）。

export const KURAMIKKE_KEY = 'kuramikke';

// クラミッケ：記事の最後に自動で付ける免責文（seo-rules.md §6 kuramikke の免責文と同じ）
export const KURAMIKKE_DISCLAIMER =
  'この記事は一般的な情報提供です。診断や、法律・税の助言ではありません。個別のご判断は、専門家や窓口にご相談ください。';

const DISCLAIMER_MARK = '一般的な情報提供です';

export const hasKuramikkeDisclaimer = (text: string): boolean => text.includes(DISCLAIMER_MARK);

// 免責文と、情報の基準日（作成日）の注記。AIには書かせず、コードで付ける
export const buildKuramikkeFooter = (date: Date = new Date()): string => {
  const d = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  return `※${KURAMIKKE_DISCLAIMER}\n※この記事は${d}時点の情報をもとに作成しています。制度や料金は変わることがあります。`;
};
