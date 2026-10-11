import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import type { CheckItem } from '../../lib/articleCheck';

type Props = {
  items: CheckItem[];
  onClose: () => void;
};

export const CheckResultPanel: React.FC<Props> = ({ items, onClose }) => {
  const warnCount = items.filter((i) => i.status === 'warn').length;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold">
          出力前の点検
          <span className={`ml-2 text-xs ${warnCount > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
            {warnCount > 0 ? `要確認 ${warnCount}件` : 'すべてOK'}
          </span>
          <span className="ml-2 text-[10px] text-slate-400 font-normal">表示のみ・記事は書き換えません</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition" aria-label="閉じる">
          <X size={14} />
        </button>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex gap-2">
            {item.status === 'ok' ? (
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-xs font-bold">
                {item.label}
                <span className="ml-1.5 text-[10px] font-normal text-slate-400">{item.source === 'code' ? 'コード判定' : 'AI判定'}</span>
              </div>
              <div className="text-xs text-slate-500">{item.reason}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
