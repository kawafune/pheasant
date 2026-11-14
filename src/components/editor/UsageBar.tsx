import React from 'react';
import { HelpTip } from './HelpTip';
import type { ArticleUsage } from '../../lib/articleUsage';

const fmt = (n: number) => n.toLocaleString();

// この記事で使ったAIのトークン量（構成案の作成から数える）
export const UsageBar: React.FC<{ usage: ArticleUsage }> = ({ usage }) => {
  if (usage.calls === 0) return null;
  const cachedRate = usage.input > 0 ? Math.round((usage.cached / usage.input) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white border border-slate-200 rounded-md px-3 py-2">
      <span className="font-bold text-slate-600">この記事のAI使用量</span>
      <span>
        {fmt(usage.calls)}回 ／ 入力 {fmt(usage.input)}（うちキャッシュ {fmt(usage.cached)}・{cachedRate}%）／ 出力 {fmt(usage.output)} トークン
      </span>
      <span className="bg-slate-800 rounded">
        <HelpTip
          label="AI使用量"
          text={'構成案を作ってから、この記事で使ったAIの量です（「すべて消す」か、新しく構成案を作ると0に戻ります）。\n・入力：AIに送った量。参考データが長いほど増えます\n・キャッシュ：2回目以降に同じ内容を送った分。割引料金になります\n・出力：AIが書いた量\n\n実際の金額は Google AI Studio の「利用額」で確認できます。'}
        />
      </span>
    </div>
  );
};
