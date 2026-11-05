import React from 'react';
import { Trash2 } from 'lucide-react';

type Props = {
  apiStatus: 'idle' | 'ok' | 'error';
  apiError: string;
  clearAll: () => void;
};

export const SidebarHeader: React.FC<Props> = ({ apiStatus, apiError, clearAll }) => {
  return (
    <div className="mb-6">
      {/* ロゴエリア */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-md text-xl">
            🕊️
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-wide" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              <span className="text-emerald-700 ml-1">Pheasant</span>
            </h1>
            <span className="text-[10px] text-slate-400 tracking-widest">SEO WRITING SYSTEM V1.1</span>
          </div>
        </div>
        <button onClick={clearAll} title="入力した内容と、作った構成・本文をすべて消します" className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-red-600 border border-slate-300 px-2.5 py-1.5 rounded-md hover:border-red-300 hover:bg-red-50 transition-colors">
          <Trash2 size={12} /> すべて消す
        </button>
      </div>

      {/* ステータスバー */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
        apiStatus === 'ok' 
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
          : apiStatus === 'error'
          ? 'bg-red-50 text-red-600 border border-red-200'
          : 'bg-slate-50 text-slate-400 border border-slate-200'
      }`}>
        <span className={`w-2 h-2 rounded-full ${
          apiStatus === 'ok' ? 'bg-emerald-500 animate-pulse' : apiStatus === 'error' ? 'bg-red-500' : 'bg-slate-300'
        }`}></span>
        {apiStatus === 'ok' ? 'ONLINE — 接続中' : apiStatus === 'error' ? 'OFFLINE — 接続エラー' : '未接続'}
      </div>
      {apiStatus === 'error' && apiError && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-red-600">{apiError}</p>
      )}
    </div>
  );
};
