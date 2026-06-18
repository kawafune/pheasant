import React from 'react';
import { RefreshCw, FileText } from 'lucide-react';

type Props = {
  databaseText: string;
  setDatabaseText: (s: string) => void;
  handleGenerateStructure: () => void;
  isGenerating: boolean;
  mainKeyword: string;
};

export const DatabaseInput: React.FC<Props> = ({ databaseText, setDatabaseText, handleGenerateStructure, isGenerating, mainKeyword }) => {
  const charCount = databaseText.length;
  const isOverLimit = charCount > 100000;

  return (
    <>
      <div>
        <label className="block text-[11px] font-bold mb-1.5 text-slate-500 tracking-wider uppercase">データベース (記事素材)</label>
        <div className="relative">
          <textarea 
            value={databaseText} 
            onChange={(e) => setDatabaseText(e.target.value)}
            className="w-full p-3 border border-slate-200 bg-white text-slate-800 rounded-md h-40 text-xs leading-relaxed focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition resize-y"
            placeholder="参考記事や口コミをペーストしてください（自動保存されます）"
          />
          <div className={`text-[10px] text-right mt-1 font-mono transition-colors ${isOverLimit ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
            {charCount.toLocaleString()} / 100,000文字
          </div>
        </div>
      </div>

      <button 
        onClick={handleGenerateStructure}
        disabled={isGenerating || !mainKeyword}
        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-lg shadow-md hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center gap-2 items-center transition-all active:scale-[0.98]"
      >
        {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : <FileText size={18}/>}
        構成案を作成
      </button>
    </>
  );
};
