import React from 'react';
import { RefreshCw } from 'lucide-react';

type Props = {
  content: string;
  setContent: (s: string) => void;
  handleWriteSection: () => void;
};

export const SectionContent: React.FC<Props> = ({ content, setContent, handleWriteSection }) => {
  return (
    <details className="border-t border-stone-200 bg-stone-50/50" open={false}>
      <summary className="p-2 text-xs text-slate-400 cursor-pointer hover:bg-stone-100 select-none flex justify-center">
        ▼ 執筆内容を表示 / 非表示
      </summary>
      <div className="p-4 pt-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-64 p-3 text-sm leading-7 text-slate-800 border border-stone-300 rounded focus:ring-2 focus:ring-slate-500 outline-none bg-white resize-y"
        />
        <div className="flex justify-end mt-2">
          <button onClick={handleWriteSection} className="text-slate-500 text-xs hover:text-slate-700 hover:underline flex items-center gap-1 font-semibold">
            <RefreshCw size={12}/> 再生成する
          </button>
        </div>
      </div>
    </details>
  );
};
