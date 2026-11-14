import React from 'react';
import { Zap, ClipboardCheck, Square, Sparkles } from 'lucide-react';
import { OutputMenu } from './OutputMenu';
import { HelpTip } from './HelpTip';

type Props = {
  copyForWordPress: () => void;
  copyAsPlainText: () => void;
  downloadMarkdown: () => void;
  handleWriteAllSections: () => void;
  stopWriteAllSections: () => void;
  isBatchWriting: boolean;
  handlePolishWholeArticle: () => void;
  handleCheckArticle: () => void;
  isChecking: boolean;
  isGenerating: boolean;
  isPolishing?: boolean;
  onOpenHistory: () => void;
};

export const EditorHeader: React.FC<Props> = ({ copyForWordPress, copyAsPlainText, downloadMarkdown, handleWriteAllSections, stopWriteAllSections, isBatchWriting, handlePolishWholeArticle, handleCheckArticle, isChecking, isGenerating, isPolishing, onOpenHistory }) => {
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
            {isBatchWriting ? (
              <button
                onClick={stopWriteAllSections}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-md shadow-sm hover:from-red-600 hover:to-red-700 font-bold flex items-center gap-2 transition-all active:scale-95 text-sm"
              >
                <Square size={13} fill="currentColor" /> 停止
              </button>
            ) : (
              <button
                onClick={handleWriteAllSections}
                disabled={isGenerating || isPolishing}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-md shadow-sm hover:from-emerald-600 hover:to-emerald-700 font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                <Zap size={14} /> 一括執筆
              </button>
            )}
            <button 
              onClick={handlePolishWholeArticle}
              disabled={isGenerating || isPolishing}
              className="bg-stone-600 text-stone-200 px-3 py-2 rounded-md shadow-sm hover:bg-stone-500 font-semibold flex items-center gap-1.5 transition text-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles size={14} /> {isPolishing ? '整えています...' : '全体を整える'}
            </button>
            <HelpTip label="全体を整える" text={"書き上がった記事全体をAIが読み直して、整えます。\n・見出し同士の内容の重なりや、つながりを直す\n・参考データにない事実や体験談は、削るか【要確認】を付ける\n・見出しはそのまま、本文が書き換わります\n\n全セクションを書き終えてから使うのがおすすめです。"} />
            <button
              onClick={handleCheckArticle}
              disabled={isGenerating || isPolishing || isChecking}
              className="bg-stone-600 text-stone-200 px-3 py-2 rounded-md shadow-sm hover:bg-stone-500 font-semibold flex items-center gap-1.5 transition text-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ClipboardCheck size={14} /> {isChecking ? 'チェック中...' : '公開前チェック'}
            </button>
            <HelpTip label="公開前チェック" text={"公開してよい状態かを確認して、結果を一覧で表示します（記事は書き換えません）。\n・コードで確認：タイトルの字数、使ってはいけない表現\n・AIで確認：見出し直後の答え、事実の作り込み、まとめ、リンクの位置、【要確認】の付け忘れ\n\n「要確認」が出た項目を、手で直してから公開します。"} />
            <OutputMenu
              copyAsPlainText={copyAsPlainText}
              copyForWordPress={copyForWordPress}
              downloadMarkdown={downloadMarkdown}
              onOpenHistory={onOpenHistory}
            />
          </div>
        </div>

        {/* 下部の装飾ライン */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </div>
    </div>
  );
};
