import React from 'react';
import { Play } from 'lucide-react';
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
};

export const StructureItem: React.FC<Props> = ({ item, idx, setText, setContent, handleWriteSection }) => {
  const tagStyles = {
    h1: 'bg-white border-l-4 border-l-amber-500 border-stone-200 ring-1 ring-amber-100',
    h2: 'bg-white border-l-4 border-l-emerald-600 border-stone-200',
    h3: 'bg-stone-50 ml-6 border-l-4 border-l-stone-400 border-stone-200',
  };

  const badgeStyles = {
    h1: 'bg-amber-600',
    h2: 'bg-emerald-700',
    h3: 'bg-slate-500',
  };

  return (
    <div className={`group relative rounded-lg border transition-all shadow-sm ${tagStyles[item.tag]}`}>
      <div className="p-4 flex justify-between items-center gap-4">
        <div className="flex-1 flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-1 rounded text-stone-50 flex-shrink-0 ${badgeStyles[item.tag]}`}>
            {item.tag.toUpperCase()}
          </span>
          <input 
            value={item.text} 
            onChange={(e) => setText(e.target.value)}
            className={`bg-transparent font-bold border-b border-transparent focus:border-emerald-500 outline-none w-full text-slate-800 ${item.tag === 'h1' ? 'text-lg' : ''}`}
          />
        </div>
        {!item.content && (
          <button onClick={() => handleWriteSection(idx)} className="text-stone-50 bg-slate-700 hover:bg-slate-800 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 shadow-sm whitespace-nowrap transition">
            <Play size={12} fill="currentColor" /> {item.tag === 'h1' ? '導入文を執筆' : '執筆'}
          </button>
        )}
      </div>
      
      {item.content && (
        <SectionContent 
          content={item.content}
          setContent={setContent}
          handleWriteSection={() => handleWriteSection(idx)}
        />
      )}
    </div>
  );
};
