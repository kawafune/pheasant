import React from 'react';
import { AlertTriangle } from 'lucide-react';

type Props = {
  mediaType: string;
  setMediaType: (s: string) => void;
  mainKeyword: string;
  setMainKeyword: (s: string) => void;
  subKeywords: string[];
  cannibalAlert: string | null;
};

export const KeywordSettings: React.FC<Props> = (props) => {
  return (
    <>
      <div>
        <label className="block text-xs font-bold mb-1 text-slate-700">掲載メディア (ライター人格)</label>
        <select 
          value={props.mediaType} 
          onChange={(e) => props.setMediaType(e.target.value)}
          className="w-full p-2 border border-stone-300 bg-white rounded font-bold text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="default">指定なし (標準ライター)</option>
          <option value="tabinoto">タビノト。 (旅/叙情的)</option>
          <option value="sumigi">sumigi (伝統工芸/丁寧)</option>
          <option value="cocci3">cocci3 (ライフスタイル/軽やか)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold mb-1 text-slate-700">メインキーワード</label>
        <input 
          value={props.mainKeyword} 
          onChange={(e) => props.setMainKeyword(e.target.value)}
          className={`w-full p-2 border-2 rounded font-bold outline-none text-slate-800 transition ${props.cannibalAlert ? 'border-red-500 bg-red-50' : 'border-stone-300 focus:border-emerald-500 bg-white'}`} 
        />
        {props.cannibalAlert && <div className="text-red-500 text-xs mt-1 flex gap-1 font-bold animate-pulse"><AlertTriangle size={12}/> {props.cannibalAlert}</div>}
      </div>

      {props.subKeywords.length > 0 && (
        <div className="max-h-32 overflow-y-auto border border-stone-300 rounded p-2 text-xs bg-white scrollbar-thin">
          <p className="text-slate-400 mb-1 text-[10px]">▼ クリックでメインKWに設定</p>
          {props.subKeywords.map((kw, i) => (
            <div key={i} onClick={() => props.setMainKeyword(kw)} className="cursor-pointer text-slate-700 hover:bg-emerald-50 p-1.5 truncate border-b border-stone-100 last:border-0 transition-colors">
              {kw}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
