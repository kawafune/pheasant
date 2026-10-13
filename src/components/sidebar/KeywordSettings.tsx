import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { CannibalAlert } from '../../lib/cannibal';

type Props = {
  mediaType: string;
  setMediaType: (s: string) => void;
  mainKeyword: string;
  setMainKeyword: (s: string) => void;
  subKeywords: string[];
  cannibalAlerts: CannibalAlert[];
};

export const KeywordSettings: React.FC<Props> = (props) => {
  const hasWritten = props.cannibalAlerts.some((a) => a.level === 'written');
  const skips = props.cannibalAlerts.filter((a) => a.level === 'skip');
  const nears = props.cannibalAlerts.filter((a) => a.level === 'near');
  const writtens = props.cannibalAlerts.filter((a) => a.level === 'written');

  return (
    <>
      <div>
        <label className="block text-[11px] font-bold mb-1.5 text-slate-500 tracking-wider uppercase">掲載メディア</label>
        <select 
          value={props.mediaType} 
          onChange={(e) => props.setMediaType(e.target.value)}
          className="w-full p-2.5 border border-slate-200 bg-white rounded-md font-bold text-sm text-slate-700 focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
        >
          <option value="default">指定なし (標準ライター)</option>
          <option value="tabinoto">タビノト。 (旅/叙情的)</option>
          <option value="sumigi">sumigi (伝統工芸/丁寧)</option>
          <option value="cocci3">cocci3 (ライフスタイル/軽やか)</option>
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-bold mb-1.5 text-slate-500 tracking-wider uppercase">メインキーワード</label>
        <input 
          value={props.mainKeyword} 
          onChange={(e) => props.setMainKeyword(e.target.value)}
          className={`w-full p-2.5 border-2 rounded-md font-bold outline-none text-slate-800 transition ${hasWritten ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:border-emerald-500 bg-white'}`} 
        />
        {writtens.map((a, i) => (
          <div key={`w${i}`} className="text-red-500 text-xs mt-1.5 flex gap-1 font-bold animate-pulse">
            <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" /> 🔴 既に記事があります：「{a.keyword}」（{a.label}／{a.source}）
          </div>
        ))}
        {skips.map((a, i) => (
          <div key={`s${i}`} className="text-amber-600 text-xs mt-1.5 flex gap-1 font-bold">
            <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" /> 🟡 「書かない」と判定済みです：「{a.keyword}」（{a.source}）
          </div>
        ))}
        {nears.length > 0 && (
          <div className="text-amber-600 text-xs mt-1.5">
            <div className="flex gap-1 font-bold"><AlertTriangle size={12} className="flex-shrink-0 mt-0.5" /> 🟡 近い記事があります（重なっていないか確認）</div>
            <ul className="mt-0.5 pl-5 list-disc font-normal">
              {nears.map((a, i) => (
                <li key={i}>「{a.keyword}」（{a.label}／{a.source}）</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {props.subKeywords.length > 0 && (
        <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-md p-2 text-xs bg-white scrollbar-thin">
          <p className="text-slate-400 mb-1 text-[10px] font-medium">▼ クリックでメインKWに設定</p>
          {props.subKeywords.map((kw, i) => (
            <div key={i} onClick={() => props.setMainKeyword(kw)} className="cursor-pointer text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 p-1.5 truncate border-b border-slate-100 last:border-0 transition-colors rounded">
              {kw}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
