import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

export const initGemini = async (apiKey: string) => {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    // 安定稼働している最新モデルに固定
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    await model.generateContent("test");
    return true; 
  } catch (e) {
    return false; 
  }
};

// --- 構成案生成ロジック（SEO聖典・三位一体の掟 準拠版） ---
export const generateStructure = async (mainKeyword: string, subKeywords: string[], databaseText: string) => {
  if (!genAI) throw new Error("API Key not set");
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const SYSTEM_PROMPT = `
  あなたは世界最高峰のSEO戦略家であり、Pheasantシステムの頭脳です。以下の【SEO聖典の掟】を厳守し、JSON構成を作成せよ。

  # SEO聖典の掟（絶対厳守）
  1. [完全一致バリデーション]: メインKW「${mainKeyword}」を、タイトルおよびH2かH3のいずれかに【一文字も変えず、スペースも保持した完全一致】で配置すること。出力前に必ず自分でチェックせよ。
  2. [情報増分 (Information Gain)の強制]: 提供された参考データ（一次情報）から、既存のネット上にはないHappiino独自の知見や職人の声を抽出し、必ず1箇所「H3」の見出しとして構成に組み込むこと。
  3. [階層構造]: H2は3〜4つ。論理的で網羅的な構造にすること。
  4. [H1の強制出力]: "structure" 配列の【一番最初の要素】に、必ず { "tag": "h1", "text": "確定した記事タイトル" } を配置すること。H1のtextは32文字以内とし、メインKWを完全一致で含むこと。H1は構成全体で1つだけとし、その後にH2/H3が続く構成とせよ。
  5. [まとめの強制]: "structure" 配列の【一番最後の要素】には、必ず記事全体を締めくくるためのH2セクション（tag: "h2"）を追加すること。タイトルは「まとめ」や「おわりに」といった単調な言葉は絶対に避け、記事のテーマに沿ったエモーショナルで具体的なタイトル（例：「明日からの暮らしに〇〇を添えて」「心地よい〇〇のための小さな一歩」など）をAIに考えさせて設定してください。

  # JSON形式
  {
    "title_idea": "32文字以内。メインKWを完全一致で含む",
    "target_persona": "想定読者",
    "structure": [
      { "tag": "h1", "text": "確定した記事タイトル（32文字以内、メインKW完全一致）" },
      { "tag": "h2", "text": "..." },
      { "tag": "h3", "text": "..." }
    ]
  }
  `;

  const prompt = `メインKW: ${mainKeyword}\nサブKW: ${subKeywords.join(", ")}\n参考データ: ${databaseText.substring(0, 100000)}`;
  const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSON生成失敗");
  return JSON.parse(jsonMatch[0]);
};

// --- 本文執筆ロジック（リード文ハック搭載版） ---
export const generateSectionContent = async (sectionTitle: string, context: string, mediaType: string, sectionTag?: string, isLast?: boolean) => {
  if (!genAI) throw new Error("API Key not set");
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const SYSTEM_PROMPT = `
  あなたは「${mediaType}」の専属プロライターです。
  今回は「北欧、暮らしの道具店」や「キナリノ」のような、読者の心に優しく寄り添う、体温のあるエッセイ風のトーン＆マナーで執筆してください。
  
  # ★ 文字数制限（最重要・絶対厳守・違反禁止）
  ${(sectionTag === 'h1' || isLast) ? 
  `- 今回執筆するセクションは「${sectionTag === 'h1' ? '導入(H1)' : 'まとめ(最後のH2)'}」です。文字数を【300〜500文字程度】とし、読者の心に寄り添い、感情を動かせるよう少し長めに温かく語らせること。` : 
  `- 今回執筆するセクションは通常の「H2/H3」です。これまで通り【150〜250文字程度】のサクッと読めるコンパクトな文字数を絶対厳守すること。`}
  - 記事全体の総文字数が【2000〜3000文字程度】のサクッと読めるボリュームになるよう、無駄な引き伸ばしや冗長な語り口を避けること。
  - 出力前に必ず自分で文字数をカウントし、指定範囲に収まるように削って再調整してから出力すること。

  # 執筆プロトコル（絶対厳守）
  0. H1（記事タイトル＝導入文/リード文）を書く場合：
     - この記事全体の導入文（リード文）として執筆すること。
     - いきなり結論を言うのではなく、「〜って悩みますよね」「〜な気がします」と読者の日常の悩みに寄り添う【共感】からスタートすること。
     - その上で、「この記事ではこんなことがわかります」と、読者がこの先を読み進めたくなるような【ワクワク感】を演出すること。読者の好奇心を刺激し、「え、そうなの？」「もっと知りたい！」と思わせる表現を使うこと。
     - 文章の末尾に、必ず【この記事の構成（全見出し）】を箇条書きでリストアップせよ。
     - リストの直後に「この記事が、少しでも心地よい暮らしのヒントになれば嬉しいです」といった温かい一文を入れよ。

  1. 通常のH2/H3セクションを書く場合：
     - 機械的な解説を避け、友人に温かいお茶を飲みながらおすすめを教えるようなトーンで展開せよ。
     - 「お守りのような」「相棒」「ホッとする」「心地よい」といった、五感や感情に訴えかける柔らかな語彙を積極的に使うこと。
     - 参考データ内の具体例は、まるで自分の体験談（一次情報）のように自然な文脈で織り交ぜること。

  2. 語尾と文体のルール（重要）：
     - 「〜です」「〜ます」の単調な連続を絶対に避けること。
     - 「〜ですよね」「〜なんです」「〜かもしれません」「〜だなあと思います」といった、余韻を残す柔らかい語尾を適度にミックスすること。
     - 読者の視線を止めないよう、箇条書き(ul/olタグ相当の表現)を見やすく使用すること。
  `;

  const tagInfo = sectionTag === 'h1' 
    ? '\nセクション種別: H1（記事の導入文/リード文として執筆せよ）'
    : isLast 
      ? '\nセクション種別: H2（記事全体の最後を締めくくる「まとめ」セクションとして執筆せよ）'
      : `\nセクション種別: ${sectionTag?.toUpperCase()}（通常セクション）`;
  const prompt = `セクション見出し: ${sectionTitle}${tagInfo}\n全体の文脈: ${context}`;
  const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
  return result.response.text();
};

// --- 記事全体の推敲（重複調整）ロジック ---
interface StructureForPolish {
  tag: 'h1' | 'h2' | 'h3';
  text: string;
  content?: string;
}

export const polishWholeArticle = async (structure: StructureForPolish[], mainKeyword: string, mediaType: string): Promise<StructureForPolish[]> => {
  if (!genAI) throw new Error("API Key not set");
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const SYSTEM_PROMPT = `
  あなたは「${mediaType}」の専属プロ編集者です。
  入力された構成と本文全体を通読し、以下の推敲・調整を行ってください。

  # 推敲ルール（絶対厳守）
  1. [重複排除]: 各見出し間で「同じ単語の多用」や「内容の重複」を見つけたら、片方を削るか別の表現に書き換えよ。
  2. [文脈の流れ]: 全体として自然で流れるような1つの記事として読めるよう、セクション間の接続を調整せよ。
  3. [文字数維持]: 各セクションの文字数は【150〜250文字程度】を維持すること。推敲で大幅に増やしたり減らしたりしないこと。
  4. [トーン維持]: 「北欧、暮らしの道具店」や「キナリノ」風の温かいエッセイ調のトーン＆マナーを崩さないこと。
  5. [見出し保持]: 各セクションの見出し（text）は原則として変更しないこと。本文（content）の推敲に集中せよ。
  6. [メインKW保持]: メインキーワード「${mainKeyword}」の配置は変更しないこと。

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
  const prompt = `以下の記事全体を推敲してください。\nメインKW: ${mainKeyword}\n\n${articleJson}`;
  const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
  const text = result.response.text();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("推敲結果のJSON解析に失敗");
  return JSON.parse(jsonMatch[0]);
};