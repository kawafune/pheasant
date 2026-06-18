import React from 'react';
import { Copy, FileDown, Zap, Archive } from 'lucide-react';

type Props = {
  copyForWordPress: () => void;
  copyAsPlainText: () => void;
  handleWriteAllSections: () => void;
  isGenerating: boolean;
  onOpenHistory: () => void;
};

export const EditorHeader: React.FC<Props> = ({ copyForWordPress, copyAsPlainText, handleWriteAllSections, isGenerating, onOpenHistory }) => {
  return (
    <div className="sticky top-0 z-10 pt-2 pb-4 mb-6" style={{ background: 'linear-gradient(to bottom, #f8f6f1 80%, transparent)' }}>
      {/* 和綴じ本風ヘッダー */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-lg shadow-watoji overflow-hidden">
        {/* 上部の装飾ライン（藍×萌黄の市松模様風） */}
        <div className="h-1 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600"></div>
        
        <div className="px-5 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-stone-100 tracking-wide" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              記事エディタ
            </h2>
            <span className="text-[10px] text-stone-400 tracking-widest">AUTO-SAVING • PHEASANT EDITOR</span>
          </div>
          
          <div className="flex gap-2 flex-wrap justify-end">
            <button 
              onClick={handleWriteAllSections}
              disabled={isGenerating}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-md shadow-sm hover:from-emerald-600 hover:to-emerald-700 font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              <Zap size={14} /> 一括執筆
            </button>
            <button 
              onClick={copyAsPlainText} 
              className="bg-stone-600 text-stone-200 px-3 py-2 rounded-md shadow-sm hover:bg-stone-500 font-semibold flex items-center gap-1.5 transition text-sm active:scale-95"
            >
              <FileDown size={14} /> テキスト
            </button>
            <button 
              onClick={copyForWordPress} 
              className="bg-stone-600 text-stone-200 px-3 py-2 rounded-md shadow-sm hover:bg-stone-500 font-semibold flex items-center gap-1.5 transition text-sm active:scale-95"
            >
              <Copy size={14} /> WP用
            </button>
            <button
              onClick={onOpenHistory}
              className="bg-stone-600/50 text-stone-300 px-2.5 py-2 rounded-md hover:bg-stone-500/50 hover:text-stone-100 flex items-center gap-1 transition text-sm active:scale-95"
            >
              <Archive size={14} />
            </button>
          </div>
        </div>

        {/* 下部の装飾ライン */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </div>
    </div>
  );
};
