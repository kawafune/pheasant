import { GoogleGenerativeAI } from "@google/generative-ai";
import SEO_RULES from './seo-rules.md?raw';
import { designToPromptText } from './articleDesign';
import { runCodeChecks } from './articleCheck';
import type { CheckItem } from './articleCheck';
import type { ArticleDesign, ArticleMeta } from './articleDesign';

let genAI: GoogleGenerativeAI | null = null;

export const initGemini = async (apiKey: string) => {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    // 安定稼働している最新モデルに固定
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    await model.generateContent("test");
    return true; 
  } catch {
    return false; 
  }
};

// --- SEOルール（src/lib/seo-rules.md が正本）の読み込み ---
// 画面上の mediaType 値 → seo-rules.md §6 の媒体名
const MEDIA_RULE_KEY: Record<string, string> = {
  default: 'default',
  tabinoto: 'tabinoto',
  sumigi: 'sumigi',
  cocci3: 'cocci',
};

// 3つの関数（構成・本文・推敲）のシステムプロンプト先頭に入れるルールブロック
const buildRulesBlock = (mediaType: string): string => {
  const mediaKey = MEDIA_RULE_KEY[mediaType] ?? 'default';
  return `# この記事作成で必ず守るルール（SEO_Master_Logic 抜粋）
以下は全文です。この記事の媒体は「${mediaKey}」です。§6 のうち「${mediaKey}」の設定を適用してください。

${SEO_RULES}

# ここまでが必ず守るルール
`;
};

// --- 構成案生成ロジック（seo-rules.md 準拠） ---
export interface StructureResult {
  title_idea: string;
  target_persona: string;
  meta_description: string;
  key_points: string[];
  conclusion: string;
  structure: { tag: 'h1' | 'h2' | 'h3'; text: string; content?: string }[];
}

export const generateStructure = async (
  mainKeyword: string,
  subKeywords: string[],
  databaseText: string,
  mediaType: string = 'default',
  design?: ArticleDesign,
  signal?: AbortSignal,
): Promise<StructureResult> => {
  if (!genAI) throw new Error("API Key not set");
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const SYSTEM_PROMPT = `
  ${buildRulesBlock(mediaType)}
  あなたは世界最高峰のSEO戦略家であり、Pheasantシステムの頭脳です。上記のルールと以下の【構成作成の掟】を厳守し、JSON構成を作成せよ。

  # 構成作成の掟（絶対厳守）
  1. [メインKWの配置]: メインKW「${mainKeyword}」はタイトルとH2に【自然な形で】含めること。完全一致にはこだわらず、読者が違和感なく読めることを優先する。全てのH3には入れないこと。
  2. [H1]: "structure" 配列の【一番最初の要素】に { "tag": "h1", "text": "記事タイトル" } を置く。H1は1つだけで、28〜40字前後。内容が一目で分かり、煽り・釣りは禁止。設計に「記事タイトル案」があれば優先して使う。
  3. [H2・H3の数]: 本論のH2は2つが基本。H3は検索意図に必要な分だけ（12個前後が目安。cocci・sumigiの短い記事はもっと少なくてよい）。サブKWは主にH3に使う。同じ質問になるKWは1つの見出しにまとめる。
  4. [見出しの形]: 見出しは短く、読者の「質問」の形を優先する。
  5. [情報増分 (Information Gain)]: 提供された参考データ（一次情報）から、独自の知見・職人の声・現地で困ったことなどを抽出し、必ず少なくとも1つ「H3」の見出しとして構成に組み込むこと。参考データにない固有名詞・数字を見出しに入れない。
  6. [まとめ]: "structure" 配列の【一番最後の要素】は、記事を締めくくるH2（tag: "h2"）の「まとめ」見出しとする。メインKWを自然に含めること。「まとめ」「おわりに」だけの単調な見出しは避け、記事のテーマに沿った具体的でやわらかい見出しにする（例：「${mainKeyword}を暮らしに添える、小さな一歩」）。
  7. [結論に向ける]: 設計に「結論付けとスタンス」があれば、構成全体をその結論に向ける。なければ、参考データと検索意図から結論を一文で決めて、それに向ける。
  8. [並び]: h1 → h2 → h3群 → h2 → h3群 → h2(まとめ) の順にする。

  # 追加で出力する項目
  - "meta_description": 記事を自然に要約した1〜2文。メインKWは自然に1回。記事ごとに固有の文にする。
  - "key_points": 「記事のポイント4つ」。これだけ読めば結論が分かる内容にする（文字列4つの配列）。
  - "conclusion": この記事の結論（1文）。

  # JSON形式（JSONのみを出力）
  {
    "title_idea": "H1と同じ記事タイトル",
    "target_persona": "想定読者",
    "meta_description": "...",
    "key_points": ["...", "...", "...", "..."],
    "conclusion": "...",
    "structure": [
      { "tag": "h1", "text": "記事タイトル" },
      { "tag": "h2", "text": "..." },
      { "tag": "h3", "text": "..." }
    ]
  }
  `;

  const designText = designToPromptText(design);
  const prompt = `メインKW: ${mainKeyword}\nサブKW: ${subKeywords.join(", ")}\n${designText ? designText + "\n" : ""}参考データ: ${databaseText.substring(0, 100000)}`;
  const result = await model.generateContent([SYSTEM_PROMPT, prompt], { signal });
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSON生成失敗");
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    title_idea: parsed.title_idea ?? '',
    target_persona: parsed.target_persona ?? '',
    meta_description: typeof parsed.meta_description === 'string' ? parsed.meta_description : '',
    key_points: Array.isArray(parsed.key_points) ? parsed.key_points.filter((k: unknown): k is string => typeof k === 'string') : [],
    conclusion: typeof parsed.conclusion === 'string' ? parsed.conclusion : '',
    structure: parsed.structure,
  };
};

// --- 本文執筆ロジック（seo-rules.md 準拠） ---
export interface SectionParams {
  sectionTitle: string;
  mainKeyword: string;
  mediaType: string;
  sectionTag: 'h1' | 'h2' | 'h3';
  isLast: boolean;
  index: number;
  structure: { tag: 'h1' | 'h2' | 'h3'; text: string }[]; // 構成全体（見出し一覧）
  databaseText: string; // 参考データ（一次情報）
  design?: ArticleDesign;
  meta?: ArticleMeta;
}

export const generateSectionContent = async (params: SectionParams) => {
  const { sectionTitle, mainKeyword, mediaType, sectionTag, isLast, index, structure, databaseText, design, meta } = params;
  if (!genAI) throw new Error("API Key not set");
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const mediaKey = MEDIA_RULE_KEY[mediaType] ?? 'default';
  const isIntro = sectionTag === 'h1';
  const firstH2Index = structure.findIndex((it) => it.tag === 'h2');
  const isFirstH2 = sectionTag === 'h2' && index === firstH2Index && !isLast;
  const hasCashPoint = !!design?.cashPoint?.trim();

  // 字数：固定の上限は置かず、媒体ごとの目安だけ示す
  const lengthRule = isIntro
    ? '- 導入文：文章部分は【300〜500文字程度】。ポイントと見出しリストは別に付ける。'
    : isLast
      ? '- まとめ：【300〜500文字程度】。内容が必要な場合のみ増やしてよい。'
      : mediaKey === 'tabinoto'
        ? '- このセクション：内容に応じて【300〜800文字程度】。解説記事は総字数1万字前後まで可。'
        : '- このセクション：【200〜400文字程度】を目安に、必要な分だけ。水増し・冗長な語りはしない。';

  // 送客先リンクの置き場（seo-rules.md §6）
  const linkRules: string[] = [];
  if (mediaKey === 'sumigi') {
    if (isIntro) linkRules.push('- 結論を示した直後に、押し売りにならない形で【リンク：送客先（自社ショップの該当商品、または開発ストーリー）】を1つ置く。');
    if (isFirstH2) linkRules.push('- 最初のH2の結論部分に、押し売りにならない形で【リンク：送客先】を1つ置く。');
    if (isLast) linkRules.push('- まとめの最後に【リンク：送客先】を置く。');
  } else if (isLast) {
    if (mediaKey === 'tabinoto') linkRules.push('- 記事の終わりに必ず送客先（取材先の公式サイト・予約・通販・地図）を【リンク：送客先】として置く。');
    else if (mediaKey === 'cocci') linkRules.push('- 最後に来店・予約・空間レンタルの問い合わせへの送客先を【リンク：送客先】として置く。');
    else if (hasCashPoint) linkRules.push('- 最後に【リンク：送客先】を置く。');
  }
  const linkBlock = linkRules.length > 0
    ? `# 送客先リンクの置き場\n${linkRules.join('\n')}\n- 本文中には「【リンク：送客先】」のように置き場だけを書く。URLは作らない。${hasCashPoint ? '送客先は設計の「キャッシュポイント／送客先」を指す。' : '設計に送客先の指定がなくても、置き場の表記だけを書く（後で人が実際のリンクに置き換える）。'}\n`
    : '';

  const sectionRule = isIntro
    ? `0. 今回は導入文（リード文）を書く。次の順で構成する：
     ① 読者の日常の悩みに寄り添う【共感】（「〜って悩みますよね」「〜な気がします」など）
     ② 結論・方向性を早めに示す${meta?.conclusion ? `（結論：${meta.conclusion}）` : ''}
     ③ この記事で分かること（メインKWと主要な見出し用KWを自然に含める。長くしすぎない）
     ④ 【記事のポイント】を箇条書き4つ${meta && meta.keyPoints.length > 0 ? `。次の4つをそのまま、または読みやすく整えて使う：\n${meta.keyPoints.map((k) => `        ・${k}`).join('\n')}` : '。構成と参考データから4つ作る'}
     ⑤ 【この記事の構成（全見出し）】を箇条書きでリストアップ
     ⑥ リストの直後に「この記事が、少しでも心地よい暮らしのヒントになれば嬉しいです」といった温かい一文`
    : isLast
      ? `0. 今回は「まとめ」を書く。
     - 見出しのコピペや、本文の単なる要約の繰り返しにしない。
     - ${design?.readerChange?.trim() ? `設計の「読後の変化」（${design.readerChange.trim()}）に沿って` : '読者の気持ちが前向きに変わるように'}、次の行動を【一つだけ】、押し売りせずに提案する。`
      : `1. 今回は通常のH2/H3セクションを書く。
     - 【見出し直後の1〜2文で、その見出しの答えを先に書く】。詳細はその後に続ける。
     - 本文の型：主張 → 理由 → 具体例 →（必要なら）迷いや反論への理解 → もう一度主張。
     - 比較・手順・料金などは文章より箇条書きにする（行頭は「・」。表の記号やMarkdown記法は使わない）。
     - 機械的な解説を避け、友人に温かいお茶を飲みながらおすすめを教えるようなトーンで展開する。
     - 「お守りのような」「相棒」「ホッとする」「心地よい」といった、五感や感情に訴えかける柔らかな語彙を使う。`;

  const sumigiRule = mediaKey === 'sumigi'
    ? '\n  - sumigi：seo-rules.md §5 の表現ルールを最も厳しく適用する。「治る」「防げる」「完全に除去」「必ず効果がある」「医学的に証明」「健康に効果」「改善する」「予防」は使わない。消臭・抗菌・調湿なども断定せず、「〜をサポートする機能」「使う環境で感じ方は変わります」の形にし、公開している試験結果を超える効果は書かない。'
    : '';

  const SYSTEM_PROMPT = `
  ${buildRulesBlock(mediaType)}
  あなたは「${mediaType}」の専属プロライターです。
  「北欧、暮らしの道具店」や「キナリノ」のような、読者の心に優しく寄り添う、体温のあるエッセイ風のトーン＆マナーで執筆してください。

  # 事実と体験のルール（最重要・絶対厳守）
  - 根拠にしてよいのは、渡された「参考データ」と「記事の設計」だけ。データにない固有名詞・数字・料金・営業時間・仕様を作らない。
  - 体験として書いてよいのは、参考データに「運営者の体験」と明記されたものだけ。それ以外を、書き手自身が使った・行ったかのように書かない（「私が実際に〜した」と書かない）。
  - 参考データの他人の話は、出どころを書く（例：「取材先の○○さんによると」「口コミでは」）。
  - 価格・営業時間・仕様・キャンペーン・解約条件・メニュー・対応可否など、読者が損をしうる情報だけに、【要確認：確認する内容と確認先】の形で付ける（例：【要確認：営業時間を公式サイトで確認】）。確認先は、参考データに書かれた出どころ、または公式サイト・店頭など、人が調べられる場所を具体的に書く。
  - 【要確認】は1セクションにつき多くても2つまで。上記以外の理由では付けない。【要確認】が付いた情報があっても、その前後の文章は読んで完成する形に書き切る（「確認が必要です」で文章を止めない）。
  - 参考データに根拠がなく書けない内容は、【要確認】を付けず、書かない。参考データから言える範囲だけで、短くても自然に完結する文章にする（一般論や水増しで埋めない。足りない分は短くてよい）。${sumigiRule}

  # 文量
  ${lengthRule}
  - 字数を満たすための引き伸ばしはしない。

  # 執筆プロトコル（絶対厳守）
  ${sectionRule}

  # 文体のルール
  - 「〜です」「〜ます」の単調な連続を避ける。
  - 「〜ですよね」「〜なんです」「〜かもしれません」「〜だなあと思います」といった、余韻を残す柔らかい語尾を適度にミックスする。
  - 1文を長くしない。2〜3文ごとに段落（改行）を分ける。太字・マーカー等の装飾は使わない。
  - 前後の見出しと内容が重ならないようにする。

  ${linkBlock}
  # 出力
  - 本文のみを出力する（見出し自体は出力しない）。
  `;

  const outline = structure
    .map((it, i) => `${i === index ? '▶ ' : '  '}${it.tag.toUpperCase()}: ${it.text}`)
    .join('\n');
  const tagInfo = isIntro
    ? 'セクション種別: H1（記事の導入文/リード文）'
    : isLast
      ? 'セクション種別: H2（記事全体の最後を締めくくる「まとめ」）'
      : `セクション種別: ${sectionTag.toUpperCase()}（通常セクション）`;
  const designText = designToPromptText(design);
  const prompt = [
    `メインKW: ${mainKeyword}`,
    `執筆するセクション見出し: ${sectionTitle}`,
    tagInfo,
    `# 記事の構成（▶が今回のセクション）\n${outline}`,
    designText,
    `# 参考データ（一次情報）\n${databaseText.substring(0, 100000) || '（参考データなし）'}`,
  ].filter(Boolean).join('\n\n');
  const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
  return result.response.text();
};

// --- 記事全体の推敲（重複調整）ロジック ---
interface StructureForPolish {
  tag: 'h1' | 'h2' | 'h3';
  text: string;
  content?: string;
}

export const polishWholeArticle = async (structure: StructureForPolish[], mainKeyword: string, mediaType: string, databaseText: string = ''): Promise<StructureForPolish[]> => {
  if (!genAI) throw new Error("API Key not set");
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const mediaKey = MEDIA_RULE_KEY[mediaType] ?? 'default';

  const SYSTEM_PROMPT = `
  ${buildRulesBlock(mediaType)}
  あなたは「${mediaType}」の専属プロ編集者です。
  入力された構成と本文全体を通読し、以下の推敲・調整を行ってください。

  # 推敲ルール（絶対厳守）
  1. [重複排除]: 各見出し間で「同じ単語の多用」や「内容の重複」を見つけたら、片方を削るか別の表現に書き換えよ。
  2. [文脈の流れ]: 全体として自然で流れるような1つの記事として読めるよう、セクション間の接続を調整せよ。
  3. [文字数維持]: 各セクションの字数を大きく変えないこと。推敲で大幅に増やしたり減らしたりしない。
  4. [トーン維持]: 「北欧、暮らしの道具店」や「キナリノ」風の温かいエッセイ調のトーン＆マナーを崩さないこと。
  5. [見出し保持]: 各セクションの見出し（text）は原則として変更しないこと。本文（content）の推敲に集中せよ。
  6. [メインKW保持]: メインキーワード「${mainKeyword}」の配置は今のまま保つこと。完全一致の確認や、KWを入れるための書き換えはしない。
  7. [事実の点検]: 参考データにない事実・体験（固有名詞・数字・料金・営業時間・「私が実際に〜した」のような書き手自身の体験）が混ざっていたら、原則として【削る】こと。削っても文章が自然に完結するように前後を整える。体験として残してよいのは、参考データに「運営者の体験」と明記されたものだけ。他人の体験は出どころ（「取材先の○○さんによると」「口コミでは」）が分かる形にする。価格・営業時間・仕様など読者が損をしうる情報だけは、【要確認：確認する内容と確認先】の形で付けてよい（付けるのは1セクション2つまで）。
  8. [リンクの置き場]: 本文中の「【リンク：送客先】」と、すでに付いている「【要確認：…】」の表記は消さず、位置も変えないこと（内容は「何を・どこで確認するか」が分かる形のまま残す）。
${mediaKey === 'sumigi' ? `  9. [sumigi・表現の点検]: seo-rules.md §5 のNG表現（「治る」「防げる」「完全に除去」「必ず効果がある」「医学的に証明」「健康に効果」「改善する」「予防」など）が残っていたら、「〜をサポートする機能」「使う環境で感じ方は変わります」などのOK表現に直すこと。公開している試験結果を超える効果は書かない。\n` : ''}
  # 入出力形式
  - 入力・出力ともに以下のJSON配列形式とする。
  - 全セクションを含めた完全な配列を出力すること（一部だけの出力は不可）。
  [
    { "tag": "h1", "text": "...", "content": "..." },
    { "tag": "h2", "text": "...", "content": "..." },
    ...
  ]
  `;

  const articleJson = JSON.stringify(structure, null, 2);
  const prompt = `以下の記事全体を推敲してください。\nメインKW: ${mainKeyword}\n\n# 参考データ（一次情報。事実の点検に使う）\n${databaseText.substring(0, 100000) || '（参考データなし）'}\n\n# 記事\n${articleJson}`;
  const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
  const text = result.response.text();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("推敲結果のJSON解析に失敗");
  return JSON.parse(jsonMatch[0]);
};

// --- 出力前の点検（seo-rules.md §7） ---
// 表示だけを行い、記事は書き換えない。H1の字数とNG表現はコードで、それ以外はAIで確認する。
const AI_CHECK_ITEMS: { id: string; label: string }[] = [
  { id: 'kw_h1', label: 'H1にメインKWが自然に入っている' },
  { id: 'kw_h2_h3', label: 'H2にメインKWが自然に入り、全H3に入れすぎていない' },
  { id: 'answer_first', label: '各見出しの直後に答えがある' },
  { id: 'no_fabrication', label: '参考データにない事実・体験を作っていない' },
  { id: 'summary_action', label: 'まとめが「読後の変化」に沿った次の行動を一つ示している' },
  { id: 'link_position', label: '送客先（または購入先）へのリンク位置が指定されている' },
  { id: 'need_confirm', label: '価格・営業時間・仕様など損をしうる情報に【要確認】が付いている' },
];

export const checkArticle = async (
  structure: StructureForPolish[],
  mainKeyword: string,
  mediaType: string,
  design?: ArticleDesign,
  databaseText: string = '',
): Promise<CheckItem[]> => {
  const codeItems = runCodeChecks(structure);
  if (!genAI) throw new Error("API Key not set");
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const SYSTEM_PROMPT = `
  ${buildRulesBlock(mediaType)}
  あなたは厳格な校閲者です。渡された記事が seo-rules.md の §7「出力の自己点検」を満たしているか、項目ごとに判定してください。記事を書き換えてはいけません。判定と理由だけを返します。

  # 点検項目
${AI_CHECK_ITEMS.map((it) => `  - ${it.id}: ${it.label}`).join('\n')}

  # 判定の基準
  - "ok": 問題が見当たらない。
  - "warn": 要確認。理由に、該当する見出し名と何が問題かを具体的に書く（1〜2文）。
  - 参考データが空の場合、no_fabrication は「参考データがないため判定できない」を理由に "warn" とし、記事内の怪しい固有名詞・数字・体験談があれば挙げる。
  - 完全一致は求めない。キーワードが自然に含まれていれば "ok"。
  - メインKWはH1・H2に自然に入っていればよく、全H3に入っていないことが望ましい。
  - link_position は、媒体ごとの送客先ルール（§6）に照らし、本文中に【リンク：送客先】などのリンク位置が示されているかを見る。
  - 迷ったら "warn"。

  # 出力形式（JSON配列のみ。全項目を含める）
  [
    { "id": "kw_h1", "status": "ok", "reason": "..." }
  ]
  `;

  const designText = designToPromptText(design);
  const prompt = [
    `メインKW: ${mainKeyword}`,
    designText,
    `# 参考データ（一次情報）\n${databaseText.substring(0, 100000) || '（参考データなし）'}`,
    `# 記事\n${JSON.stringify(structure, null, 2)}`,
  ].filter(Boolean).join('\n\n');

  try {
    const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
    const jsonMatch = result.response.text().match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("点検結果のJSON解析に失敗");
    const parsed: { id?: string; status?: string; reason?: string }[] = JSON.parse(jsonMatch[0]);
    const aiItems: CheckItem[] = AI_CHECK_ITEMS.map((it) => {
      const found = parsed.find((p) => p.id === it.id);
      return {
        id: it.id,
        label: it.label,
        status: found?.status === 'ok' ? 'ok' : 'warn',
        reason: found?.reason ?? 'AIの判定結果が返りませんでした',
        source: 'ai',
      };
    });
    return [...codeItems, ...aiItems];
  } catch (e) {
    console.error(e);
    return [
      ...codeItems,
      { id: 'ai_failed', label: 'AIによる点検', status: 'warn', reason: 'AI点検に失敗しました。もう一度お試しください', source: 'ai' },
    ];
  }
};
