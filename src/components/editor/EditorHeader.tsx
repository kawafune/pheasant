import React from 'react';
import { Copy } from 'lucide-react';

type Props = {
  copyForWordPress: () => void;
};

export const EditorHeader: React.FC<Props> = ({ copyForWordPress }) => {
  return (
    <div className="flex justify-between items-end border-b border-stone-300 pb-4 mb-6 sticky top-0 bg-stone-100 z-10 pt-2">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">記事エディタ</h2>
        <span className="text-xs text-slate-500">自動保存中...</span>
      </div>
      <button 
        onClick={copyForWordPress} 
        className="bg-slate-700 text-stone-50 px-4 py-2 rounded shadow hover:bg-slate-800 font-bold flex items-center gap-2 transition active:scale-95"
      >
        <Copy size={16} /> WordPress用にコピー
      </button>
    </div>
  );
};
