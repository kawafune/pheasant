import React from 'react';
import { Wifi } from 'lucide-react';

type Props = {
  apiKey: string;
  setApiKey: (s: string) => void;
  checkApiConnection: () => void;
};

export const ApiKeySection: React.FC<Props> = ({ apiKey, setApiKey, checkApiConnection }) => {
  return (
    <div className="mb-6 space-y-2">
      <label className="text-xs font-bold text-slate-600">GEMINI API KEY</label>
      <div className="flex gap-2">
        <input 
          type="password" 
          value={apiKey} 
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-2 text-sm border border-stone-300 rounded bg-white outline-none focus:border-emerald-500"
          placeholder="自動保存されます"
        />
        <button onClick={checkApiConnection} className="p-2 bg-stone-200 text-slate-700 rounded hover:bg-stone-300 transition-colors">
          <Wifi size={16} />
        </button>
      </div>
    </div>
  );
};
