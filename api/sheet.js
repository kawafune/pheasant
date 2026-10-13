// Vercel のサーバー関数: Googleスプレッドシート（リンク共有）をCSVで返す。
// ブラウザから直接読めない場合（CORS）の予備経路。docs.google.com の共有シートだけを読む。
export default async function handler(req, res) {
  const { id, gid = '0' } = req.query ?? {};

  if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{20,80}$/.test(id) || typeof gid !== 'string' || !/^\d{1,12}$/.test(gid)) {
    res.status(400).send('シートのIDまたはgidが正しくありません');
    return;
  }

  const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
  try {
    const upstream = await fetch(url, { redirect: 'follow' });
    const text = await upstream.text();
    if (!upstream.ok || /^\s*<(!doctype|html)/i.test(text)) {
      res.status(502).send('シートを読めませんでした。共有設定を「リンクを知っている全員が閲覧可」にしてください');
      return;
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    res.status(200).send(text);
  } catch {
    res.status(502).send('Googleに接続できませんでした');
  }
}
