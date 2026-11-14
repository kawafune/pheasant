import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { EditorHeader } from './EditorHeader';
import { StructureItem as StructureItemComponent } from './StructureItem';
import { HistoryPanel } from './HistoryPanel';
import { ArticleMetaPanel } from './ArticleMetaPanel';
import { CheckResultPanel } from './CheckResultPanel';
import { TodoPanel } from './TodoPanel';
import { UsageBar } from './UsageBar';
import type { ArticleUsage } from '../../lib/articleUsage';
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
  articleUsage: ArticleUsage;
};

export const PheasantEditor: React.FC<Props> = ({ structure, setStructure, handleWriteSection, handleWriteAllSections, stopWriteAllSections, isBatchWriting, handlePolishWholeArticle, isGenerating, isPolishing, writingIndex, mainKeyword, meta, handleCheckArticle, isChecking, checkResults, closeCheckResults, articleUsage }) => {
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

  // 履歴（このブラウザ内の保存）に記録する
  const saveToHistory = async (plainText: string) => {
    try {
      await saveArticle({
        createdAt: new Date().toISOString(),
        mainKeyword: mainKeyword || '(未設定)',
        plainText: plainText,
      });
      toast.success("履歴に自動保存しました", { icon: '💾', style: { fontSize: '12px' } });
    } catch (e) {
      // 保存失敗してもコピー・ダウンロード自体は成功しているので軽く通知
      console.error('履歴保存エラー:', e);
    }
  };

  const copyAsPlainText = async () => {
    if (structure.length === 0) return;

    const plainText = buildPlainText();
    navigator.clipboard.writeText(plainText);
    toast.success("テキストをコピーしました！（改行保持）", { icon: '📝' });
    warnRemainingTodos();
    await saveToHistory(plainText);
  };

  // 本文をMarkdownに変換する。1行ずつ段落にし、「・」で始まる行は箇条書きにする
  const contentToMarkdown = (content: string): string => {
    const blocks: string[] = [];
    let list: string[] = [];
    const flush = () => { if (list.length) { blocks.push(list.join('\n')); list = []; } };
    content.split('\n').map((l) => l.trim()).filter(Boolean).forEach((line) => {
      const m = line.match(/^[・\-*]\s*(.*)$/);
      if (m) list.push(`- ${m[1]}`);
      else { flush(); blocks.push(line); }
    });
    flush();
    return blocks.join('\n\n');
  };

  const buildMarkdown = (): string => {
    const parts: string[] = [];
    // メタ情報は、表示されないコメントとして先頭に入れておく
    if (meta.metaDescription || meta.keyPoints.length > 0) {
      const lines = ['<!--'];
      if (meta.metaDescription) lines.push(`メタディスクリプション：${meta.metaDescription}`);
      if (meta.keyPoints.length > 0) lines.push('記事のポイント：', ...meta.keyPoints.map((k) => `・${k}`));
      lines.push('-->');
      parts.push(lines.join('\n'));
    }
    structure.forEach((item) => {
      const level = item.tag === 'h1' ? '#' : item.tag === 'h2' ? '##' : '###';
      parts.push(`${level} ${item.text}`);
      if (item.content) parts.push(contentToMarkdown(item.content));
    });
    return parts.join('\n\n') + '\n';
  };

  const downloadMarkdown = async () => {
    if (structure.length === 0) return;
    const md = buildMarkdown();
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const name = (mainKeyword || '記事').replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 40);
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}_${ymd}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // ダウンロードが始まる前に片付けるとファイル名が失われるため、少し待ってから片付ける
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    toast.success("Markdown（.md）をダウンロードしました", { icon: '📄' });
    warnRemainingTodos();
    await saveToHistory(buildPlainText());
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
            downloadMarkdown={downloadMarkdown}
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
          
          <UsageBar usage={articleUsage} />

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
