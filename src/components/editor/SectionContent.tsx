import React from 'react';
import { RefreshCw } from 'lucide-react';

type Props = {
  content: string;
  setContent: (s: string) => void;
  handleWriteSection: () => void;
};

export const SectionContent: React.FC<Props> = ({ content, setContent, handleWriteSection }) => {
  return (
    <details className="border-t border-slate-200 bg-stone-50/80" open={false}>
      <summary className="p-2.5 text-xs text-slate-400 cursor-pointer hover:bg-stone-100 select-none flex justify-center gap-1 font-medium transition-colors">
        <span className="text-emerald-600">▼</span> 執筆内容を表示 / 非表示
      </summary>
      <div className="p-4 pt-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-64 p-4 text-sm leading-8 text-slate-800 border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white resize-y transition"
        />
        <div className="flex justify-end mt-2">
          <button onClick={handleWriteSection} className="text-emerald-600 text-xs hover:text-emerald-700 hover:underline flex items-center gap-1 font-bold transition">
            <RefreshCw size={12}/> 再生成する
          </button>
        </div>
      </div>
    </details>
  );
};
