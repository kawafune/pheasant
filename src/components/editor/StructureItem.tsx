import React from 'react';
import { Play, Loader2 } from 'lucide-react';
import { SectionContent } from './SectionContent';

type StructureItemData = {
  tag: 'h1' | 'h2' | 'h3';
  text: string;
  content?: string;
};

type Props = {
  item: StructureItemData;
  idx: number;
  setText: (s: string) => void;
  setContent: (s: string) => void;
  handleWriteSection: (idx: number) => void;
  isWriting?: boolean;
  isGenerating?: boolean;
};

export const StructureItem: React.FC<Props> = ({ item, idx, setText, setContent, handleWriteSection, isWriting, isGenerating }) => {
  // 藍色の見出し枠 + タグ別の左ボーダーカラー
  const borderAccent = {
    h1: 'border-l-emerald-600',
    h2: 'border-l-slate-700',
    h3: 'border-l-slate-400',
  };

  const badgeStyles = {
    h1: 'bg-gradient-to-r from-emerald-600 to-emerald-700',
    h2: 'bg-slate-700',
    h3: 'bg-slate-500',
  };

  return (
    <div className={`group relative rounded-lg overflow-hidden transition-all shadow-sm ${isWriting ? 'ring-2 ring-emerald-400 shadow-emerald-100' : 'hover:shadow-md'}`}>
      {/* 執筆中インジケーター */}
      {isWriting && (
        <div className="absolute -top-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 animate-pulse"></div>
      )}
      {isWriting && (
        <div className="absolute -top-3 left-4 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md z-10">
          <Loader2 size={10} className="animate-spin" /> 執筆中...
        </div>
      )}

      {/* 見出しバー（藍色の背景） */}
      <div className={`bg-gradient-to-r from-slate-800 to-slate-700 border-l-4 ${borderAccent[item.tag]} p-3 flex justify-between items-center gap-3`}>
        <div className="flex-1 flex items-center gap-2.5">
          <span className={`text-[10px] font-bold px-2 py-1 rounded text-white flex-shrink-0 ${badgeStyles[item.tag]} shadow-sm`}>
            {item.tag.toUpperCase()}
          </span>
          <input 
            value={item.text} 
            onChange={(e) => setText(e.target.value)}
            className={`bg-transparent font-bold border-b border-white/20 focus:border-emerald-400 outline-none w-full text-stone-100 placeholder:text-stone-500 ${item.tag === 'h1' ? 'text-lg' : 'text-sm'}`}
          />
        </div>
        {!item.content && (
          <button 
            onClick={() => handleWriteSection(idx)} 
            disabled={isGenerating}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm whitespace-nowrap transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play size={12} fill="currentColor" /> {item.tag === 'h1' ? '導入文を執筆' : '執筆'}
          </button>
        )}
      </div>
      
      {/* 本文エリア（白練の背景） */}
      {item.content && (
        <div className="bg-white border border-t-0 border-slate-200 rounded-b-lg">
          <SectionContent 
            content={item.content}
            setContent={setContent}
            handleWriteSection={() => handleWriteSection(idx)}
          />
        </div>
      )}
    </div>
  );
};
