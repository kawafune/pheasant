import React from 'react';
import { Wifi } from 'lucide-react';

type Props = {
  apiKey: string;
  setApiKey: (s: string) => void;
  checkApiConnection: () => void;
};

export const ApiKeySection: React.FC<Props> = ({ apiKey, setApiKey, checkApiConnection }) => {
  return (
    <div className="mb-5 space-y-1.5">
      <label className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Gemini API Key</label>
      <div className="flex gap-2">
        <input 
          type="password" 
          value={apiKey} 
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-2.5 text-sm border border-slate-200 rounded-md bg-white text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition placeholder:text-slate-300"
          placeholder="APIキーを入力（自動保存）"
        />
        <button onClick={checkApiConnection} className="px-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors shadow-sm">
          <Wifi size={16} />
        </button>
      </div>
    </div>
  );
};
