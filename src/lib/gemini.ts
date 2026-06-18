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

  # JSON形式
  {
    "title_idea": "32文字以内。メインKWを完全一致で含む",
    "target_persona": "想定読者",
    "structure": [
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
export const generateSectionContent = async (sectionTitle: string, context: string, mediaType: string) => {
  if (!genAI) throw new Error("API Key not set");
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const SYSTEM_PROMPT = `
  あなたは「${mediaType}」の専属プロライターです。
  
  # 執筆プロトコル（絶対厳守）
  1. 導入文（リード文）を書く場合：
     - 文章の末尾に、必ず【この記事の構成（全見出し）】を箇条書きでリストアップせよ。
     - リストの直後に「この記事を読めばこれらの疑問がすべて解決する」またはそれに準ずる確信に満ちた一文を強制的に入れよ。
  2. 通常のH2/H3セクションを書く場合：
     - 「結論→理由→参考データ内の具体例」の順で展開せよ。
     - AI特有の無難な表現を避け、独自知見（Information Gain）を前面に出せ。
  3. 共通ルール：
     - 「です・ます」調で統一。
     - 読者の視線を止めないよう、箇条書き(ul/olタグ相当の表現)を積極的に使用すること。
  `;

  const prompt = `セクション見出し: ${sectionTitle}\n全体の文脈: ${context}`;
  const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
  return result.response.text();
};