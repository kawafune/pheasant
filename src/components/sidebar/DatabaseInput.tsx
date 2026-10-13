import React from 'react';
import { RefreshCw, FileText, Square } from 'lucide-react';

type Props = {
  databaseText: string;
  setDatabaseText: (s: string) => void;
  handleGenerateStructure: () => void;
  stopGenerateStructure: () => void;
  isStructuring: boolean;
  isGenerating: boolean;
  mainKeyword: string;
};

export const DatabaseInput: React.FC<Props> = ({ databaseText, setDatabaseText, handleGenerateStructure, stopGenerateStructure, isStructuring, isGenerating, mainKeyword }) => {
  const charCount = databaseText.length;
  const isOverLimit = charCount > 100000;

  return (
    <>
      <div>
        <label className="block text-[11px] font-bold mb-1.5 text-slate-500 tracking-wider uppercase">データベース (記事素材)</label>
        <div className="mb-2 rounded-md border border-amber-200 bg-amber-50/70 p-2.5 text-[11px] leading-relaxed text-slate-600">
          <p className="font-bold text-amber-700">※ ここに入力する情報で、記事の仕上がりが変わります</p>
          <p className="mt-0.5">記事は、ここに入れた内容だけを根拠に書きます。ないことは書かないので、素材が少ないと記事も薄くなります。</p>
          <ul className="mt-1 list-disc pl-4">
            <li>取材メモ、職人・店主の言葉、口コミ、スペック、料金、営業時間などを入れる</li>
            <li>書き手自身の体験は「運営者の体験：」と書き添える（書いていないものは体験として書かれません）</li>
          </ul>
        </div>
        <div className="relative">
          <textarea 
            value={databaseText} 
            onChange={(e) => setDatabaseText(e.target.value)}
            className="w-full p-3 border border-slate-200 bg-white text-slate-800 rounded-md h-40 text-xs leading-relaxed focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition resize-y"
            placeholder="取材メモ・口コミ・スペック・料金などをペーストしてください（自動保存されます）"
          />
          <div className={`text-[10px] text-right mt-1 font-mono transition-colors ${isOverLimit ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
            {charCount.toLocaleString()} / 100,000文字
          </div>
        </div>
      </div>

      {isStructuring ? (
        <button
          onClick={stopGenerateStructure}
          className="w-full py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg shadow-md hover:from-red-600 hover:to-red-700 flex justify-center gap-2 items-center transition-all active:scale-[0.98]"
        >
          <Square size={16} fill="currentColor" />
          停止（構成案の作成をやめる）
        </button>
      ) : (
        <button
          onClick={handleGenerateStructure}
          disabled={isGenerating || !mainKeyword}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-lg shadow-md hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center gap-2 items-center transition-all active:scale-[0.98]"
        >
          {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <FileText size={18} />}
          構成案を作成
        </button>
      )}
    </>
  );
};
