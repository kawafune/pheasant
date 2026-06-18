import React from 'react';
import { FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { EditorHeader } from './EditorHeader';
import { StructureItem as StructureItemComponent } from './StructureItem';

type StructureItemData = {
  tag: 'h1' | 'h2' | 'h3';
  text: string;
  content?: string;
};

type Props = {
  structure: StructureItemData[];
  setStructure: (s: StructureItemData[]) => void;
  handleWriteSection: (index: number) => void;
};

export const PheasantEditor: React.FC<Props> = ({ structure, setStructure, handleWriteSection }) => {
  
  const copyForWordPress = () => {
    if (structure.length === 0) return;
    
    let html = "";
    structure.forEach(item => {
      html += `<${item.tag}>${item.text}</${item.tag}>\n`;
      if (item.content) {
        const paragraphs = item.content.split('\n').filter(line => line.trim() !== '');
        paragraphs.forEach(p => {
          html += `<p>${p}</p>\n`;
        });
      }
      html += "\n";
    });

    navigator.clipboard.writeText(html);
    toast.success("WordPress用HTMLをコピーしました！", { icon: '📋' });
  };

  const copyAsPlainText = () => {
    if (structure.length === 0) return;

    let plainText = "";
    structure.forEach((item, idx) => {
      plainText += item.text + "\n";
      if (item.content) {
        plainText += item.content + "\n";
      }
      // セクション間に空行を挿入（最後のセクション以外）
      if (idx < structure.length - 1) {
        plainText += "\n";
      }
    });

    navigator.clipboard.writeText(plainText);
    toast.success("テキストをコピーしました！（改行保持）", { icon: '📝' });
  };

  return (
    <main className="flex-1 p-8 overflow-y-auto bg-stone-100">
      {structure.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-300">
          <FileText size={64} className="mb-4 text-emerald-700/30" />
          <p className="text-slate-500 font-semibold">左のパネルから構成を作成してください</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          <EditorHeader copyForWordPress={copyForWordPress} copyAsPlainText={copyAsPlainText} />
          
          {structure.map((item, idx) => (
            <StructureItemComponent
              key={idx}
              item={item}
              idx={idx}
              setText={(newText) => {
                const newS = [...structure];
                newS[idx].text = newText;
                setStructure(newS);
              }}
              setContent={(newContent) => {
                const newS = [...structure];
                newS[idx].content = newContent;
                setStructure(newS);
              }}
              handleWriteSection={handleWriteSection}
            />
          ))}
        </div>
      )}
    </main>
  );
};
