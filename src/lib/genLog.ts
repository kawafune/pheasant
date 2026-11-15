// 生成ログ（タスク13）の1行を、いまの入力から作る
import SEO_RULES from './seo-rules.md?raw';
import { intentLabelOf } from './articleDesign';
import type { ArticleDesign } from './articleDesign';
import type { GenLog } from './historyDb';

// seo-rules.md の「rules_version: v2.17」の行から読む
export const RULES_VERSION = SEO_RULES.match(/^rules_version:\s*(\S+)/m)?.[1] ?? '';

const pad = (n: number) => String(n).padStart(2, '0');
const formatDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

export interface GenLogInput {
  mediaType: string;
  mainKeyword: string;
  subKeywords: string[];
  design: ArticleDesign;
  commonDb: string;
  databaseText: string;
  title: string;
}

export const buildGenLog = (i: GenLogInput): Omit<GenLog, 'gen_id'> => {
  const used = [
    `共通DB:${i.commonDb.trim() ? 'あり' : 'なし'}`,
    `参考データ:${i.databaseText.trim() ? 'あり' : 'なし'}`,
    `広告PR:${i.design.hasAd ? 'あり' : 'なし'}`,
  ];
  return {
    gen_date: formatDate(new Date()),
    rules_version: RULES_VERSION,
    media: i.mediaType,
    main_kw: i.mainKeyword,
    focus_kws: [i.mainKeyword, ...i.subKeywords.filter((k) => k !== i.mainKeyword)].slice(0, 8).join(' / '),
    intent_label: intentLabelOf(i.design.searchIntent),
    stance: i.design.stance.trim(),
    after_change: i.design.readerChange.trim(),
    cash_point: i.design.cashPoint.trim(),
    inputs_used: used.join(' '),
    title: i.title,
    url: '',
    publish_date: '',
  };
};
