import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { CannibalAlert } from '../lib/cannibal';
import { isPlanned } from '../lib/cannibal';

type Props = {
  keyword: string;
  alerts: CannibalAlert[]; // written / skip のみ
  onCancel: () => void;
  onProceed: () => void;
};

export const DuplicateModal: React.FC<Props> = ({ keyword, alerts, onCancel, onProceed }) => {
  const hasWritten = alerts.some((a) => a.level === 'written' && !isPlanned(a));
  const hasPlanned = alerts.some(isPlanned);
  // 「書く予定」だけのときは、「既に書いた」ではなく予定の確認として伝える
  const plannedOnly = !hasWritten && hasPlanned && alerts.every((a) => isPlanned(a) || a.level === 'skip') && !alerts.some((a) => a.level === 'skip');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className={hasWritten ? 'text-red-500' : 'text-amber-500'} size={22} />
          <h2 className="font-bold text-slate-800 text-lg" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            {hasWritten ? 'それは、既に書いた記事です' : plannedOnly ? '既に書く予定になっています' : hasPlanned ? '既に書く予定、または「書かない」と判定されています' : 'それは、「書かない」と判定したキーワードです'}
          </h2>
        </div>
        <p className="text-sm text-slate-600 mb-3">
          {plannedOnly ? (
            <>「<b>{keyword}</b>」は、シートで「書く予定」になっています。このまま記事を書きますか？</>
          ) : (
            <>「<b>{keyword}</b>」で書くと、同じキーワードの記事と検索順位を食い合う（カニバリ）おそれがあります。</>
          )}
        </p>
        <ul className="mb-5 space-y-1.5 text-xs">
          {alerts.map((a, i) => (
            <li key={i} className={`rounded-md border px-3 py-2 ${a.level === 'written' && !isPlanned(a) ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
              {a.level === 'written' && !isPlanned(a) ? '🔴 ' : '🟡 '}「{a.keyword}」（{a.label}／{a.source}）
            </li>
          ))}
        </ul>
        <div className="flex gap-2 justify-end">
          <button
            autoFocus
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition"
          >
            やめる
          </button>
          <button
            onClick={onProceed}
            className="px-4 py-2 rounded-md border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
          >
            {plannedOnly ? 'このまま書く' : 'それでも書く'}
          </button>
        </div>
      </div>
    </div>
  );
};
