import React from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { ArticleMeta } from '../../lib/articleDesign';

type Props = {
  meta: ArticleMeta;
};

const copyText = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${label}をコピーしました`, { icon: '📋' });
};

export const ArticleMetaPanel: React.FC<Props> = ({ meta }) => {
  const hasAny = meta.metaDescription || meta.keyPoints.length > 0 || meta.conclusion;
  if (!hasAny) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 text-sm text-slate-700">
      {meta.conclusion && (
        <div>
          <div className="text-[11px] font-bold text-slate-400 tracking-wider mb-1">この記事の結論</div>
          <p>{meta.conclusion}</p>
        </div>
      )}

      {meta.metaDescription && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">メタディスクリプション（{meta.metaDescription.length}字）</span>
            <button
              onClick={() => copyText(meta.metaDescription, 'メタディスクリプション')}
              className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition"
            >
              <Copy size={12} /> コピー
            </button>
          </div>
          <p>{meta.metaDescription}</p>
        </div>
      )}

      {meta.keyPoints.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">記事のポイント</span>
            <button
              onClick={() => copyText(meta.keyPoints.map((k) => `・${k}`).join('\n'), '記事のポイント')}
              className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition"
            >
              <Copy size={12} /> コピー
            </button>
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {meta.keyPoints.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
