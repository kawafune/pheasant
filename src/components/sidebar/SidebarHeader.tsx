import React from 'react';

type Props = {
  apiStatus: 'idle' | 'ok' | 'error';
  clearAll: () => void;
};

export const SidebarHeader: React.FC<Props> = ({ apiStatus, clearAll }) => {
  return (
    <div className="mb-6">
      {/* ロゴエリア */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          {/* キジをモチーフにしたSVGロゴ */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-md">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.5 2 3 5 3 8c0 2 1 3.5 2.5 4.5L4 22l4-2 4 2 4-2 4 2-1.5-9.5C20 11.5 21 10 21 8c0-3-3.5-6-9-6z" fill="#f5f0e8" fillOpacity="0.9"/>
              <path d="M12 2c-2 0-3.5.5-4.5 1.5C9 4 11 5 12 5s3-1 4.5-1.5C15.5 2.5 14 2 12 2z" fill="#047857"/>
              <circle cx="9" cy="7" r="1" fill="#1e293b"/>
              <path d="M15 8c1-0.5 2.5-0.5 3.5 0" stroke="#047857" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M7 12c1 1 3 2 5 2s4-1 5-2" stroke="#047857" strokeWidth="0.75" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-wide" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              <span className="text-emerald-700 ml-1">Pheasant</span>
            </h1>
            <span className="text-[10px] text-slate-400 tracking-widest">SEO WRITING SYSTEM V1.0</span>
          </div>
        </div>
        <button onClick={clearAll} className="text-[10px] text-slate-400 hover:text-red-500 border border-slate-200 px-2 py-1 rounded hover:border-red-300 transition-colors">
          リセット
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
    </div>
  );
};
