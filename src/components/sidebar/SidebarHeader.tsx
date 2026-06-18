import React from 'react';

type Props = {
  apiStatus: 'idle' | 'ok' | 'error';
  clearAll: () => void;
};

export const SidebarHeader: React.FC<Props> = ({ apiStatus, clearAll }) => {
  return (
    <div className="mb-8 flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
          🕊️ Pheasant <span className="text-xs text-slate-400">V1.0</span>
        </h1>
        <div className="text-xs text-slate-500 mt-1">
          Status: <span className={`font-bold ${apiStatus === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}>{apiStatus === 'ok' ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>
      <button onClick={clearAll} className="text-xs text-slate-400 hover:text-red-500 underline">リセット</button>
    </div>
  );
};
