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
        <label className="block text-xs font-bold mb-1 text-slate-700">データベース (記事素材)</label>
        <div className="relative">
          <textarea 
            value={databaseText} 
            onChange={(e) => setDatabaseText(e.target.value)}
            className="w-full p-2 border border-stone-300 bg-white text-slate-800 rounded h-40 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition"
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
        className="w-full py-3 bg-emerald-700 text-stone-50 font-bold rounded shadow-md hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center gap-2 items-center transition-all active:scale-95"
      >
        {isGenerating ? <RefreshCw className="animate-spin"/> : <FileText />}
        構成案を作成
      </button>
    </>
  );
};
