import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { EditorHeader } from './EditorHeader';
import { StructureItem as StructureItemComponent } from './StructureItem';
import { HistoryPanel } from './HistoryPanel';
import { ArticleMetaPanel } from './ArticleMetaPanel';
import { CheckResultPanel } from './CheckResultPanel';
import { TodoPanel } from './TodoPanel';
import type { ArticleMeta } from '../../lib/articleDesign';
import type { CheckItem } from '../../lib/articleCheck';
import { extractTodos } from '../../lib/articleCheck';
import { saveArticle } from '../../lib/historyDb';

type StructureItemData = {
  tag: 'h1' | 'h2' | 'h3';
  text: string;
  content?: string;
};

type Props = {
  structure: StructureItemData[];
  setStructure: (s: StructureItemData[]) => void;
  handleWriteSection: (index: number) => void;
  handleWriteAllSections: () => void;
  stopWriteAllSections: () => void;
  isBatchWriting: boolean;
  handlePolishWholeArticle: () => void;
  isGenerating: boolean;
  isPolishing: boolean;
  writingIndex: number | null;
  mainKeyword: string;
  meta: ArticleMeta;
  handleCheckArticle: () => void;
  isChecking: boolean;
  checkResults: CheckItem[] | null;
  closeCheckResults: () => void;
};

export const PheasantEditor: React.FC<Props> = ({ structure, setStructure, handleWriteSection, handleWriteAllSections, stopWriteAllSections, isBatchWriting, handlePolishWholeArticle, isGenerating, isPolishing, writingIndex, mainKeyword, meta, handleCheckArticle, isChecking, checkResults, closeCheckResults }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const todos = extractTodos(structure);

  // 未解決のマークが残っていても、コピーは止めずに件数だけ知らせる
  const warnRemainingTodos = () => {
    if (todos.length > 0) {
      toast(`【要確認】/【リンク】が${todos.length}件残っています。上の「公開前にやること」を確認してください`, { icon: '⚠️', duration: 6000 });
    }
  };

  // 記事全体をプレーンテキストに変換するユーティリティ
  const buildPlainText = (): string => {
    let plainText = "";
    structure.forEach((item, idx) => {
      plainText += item.text + "\n";
      if (item.content) {
        plainText += item.content + "\n";
      }
      if (idx < structure.length - 1) {
        plainText += "\n";
      }
    });
    return plainText;
  };

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
    warnRemainingTodos();
  };

  const copyAsPlainText = async () => {
    if (structure.length === 0) return;

    const plainText = buildPlainText();
    navigator.clipboard.writeText(plainText);
    toast.success("テキストをコピーしました！（改行保持）", { icon: '📝' });
    warnRemainingTodos();

    // IndexedDB に自動保存
    try {
      await saveArticle({
        createdAt: new Date().toISOString(),
        mainKeyword: mainKeyword || '(未設定)',
        plainText: plainText,
      });
      toast.success("履歴に自動保存しました", { icon: '💾', style: { fontSize: '12px' } });
    } catch (e) {
      // 保存失敗してもコピー自体は成功しているので軽く通知
      console.error('履歴保存エラー:', e);
    }
  };

  return (
    <main className="flex-1 p-8 overflow-y-auto bg-stone-50 bg-kiji-feather relative">
      {structure.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center">
          {/* 空状態の和風プレースホルダー */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-50 to-stone-100 flex items-center justify-center shadow-inner">
              <FileText size={36} className="text-emerald-700/30" />
            </div>
            <p className="text-slate-500 font-semibold text-lg mb-1" style={{ fontFamily: "'Noto Serif JP', serif" }}>構成を作成してください</p>
            <p className="text-slate-400 text-xs">左のサイドバーからキーワードを入力し、構成案を生成します</p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-5 pb-20">
          <EditorHeader 
            copyForWordPress={copyForWordPress} 
            copyAsPlainText={copyAsPlainText} 
            handleWriteAllSections={handleWriteAllSections}
            stopWriteAllSections={stopWriteAllSections}
            isBatchWriting={isBatchWriting}
            handlePolishWholeArticle={handlePolishWholeArticle}
            handleCheckArticle={handleCheckArticle}
            isChecking={isChecking}
            isGenerating={isGenerating}
            isPolishing={isPolishing}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />
          
          <TodoPanel todos={todos} />

          {checkResults && <CheckResultPanel items={checkResults} onClose={closeCheckResults} />}

          <ArticleMetaPanel meta={meta} />

          {structure.map((item, idx) => (
            <StructureItemComponent
              key={idx}
              item={item}
              idx={idx}
              isWriting={writingIndex === idx}
              isGenerating={isGenerating}
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

      {/* 生成履歴パネル */}
      <HistoryPanel isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </main>
  );
};
