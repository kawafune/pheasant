import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, ChevronDown, FileDown, Copy, FileText, Archive } from 'lucide-react';

type Props = {
  copyAsPlainText: () => void;
  copyForWordPress: () => void;
  downloadMarkdown: () => void;
  onOpenHistory: () => void;
};

const WIDTH = 260;

// 「出力・保存」プルダウン。ヘッダーの枠で切れないよう、メニューは画面の一番上の層に出す。
export const OutputMenu: React.FC<Props> = ({ copyAsPlainText, copyForWordPress, downloadMarkdown, onOpenHistory }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const open = () => {
    const r = buttonRef.current?.getBoundingClientRect();
    if (!r) return;
    const left = Math.min(Math.max(8, r.right - WIDTH), window.innerWidth - WIDTH - 8);
    setPos({ top: r.bottom + 6, left });
  };
  const close = () => setPos(null);

  // メニューの外をクリック・Esc・スクロールで閉じる
  useEffect(() => {
    if (!pos) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !buttonRef.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
    };
  }, [pos]);

  const item = (icon: React.ReactNode, label: string, note: string, action: () => void) => (
    <button
      type="button"
      role="menuitem"
      onClick={() => { close(); action(); }}
      className="w-full text-left px-3 py-2 hover:bg-stone-100 flex gap-2.5 items-start transition"
    >
      <span className="mt-0.5 text-slate-500">{icon}</span>
      <span>
        <span className="block text-sm font-semibold text-slate-700">{label}</span>
        <span className="block text-[11px] text-slate-400">{note}</span>
      </span>
    </button>
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={!!pos}
        onClick={() => (pos ? close() : open())}
        className="bg-stone-600 text-stone-200 px-3 py-2 rounded-md shadow-sm hover:bg-stone-500 font-semibold flex items-center gap-1.5 transition text-sm active:scale-95"
      >
        <Download size={14} /> 出力・保存 <ChevronDown size={14} />
      </button>
      {pos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: WIDTH }}
            className="z-50 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5"
          >
            {item(<FileDown size={15} />, 'テキストをコピー', '改行そのまま。履歴にも保存します', copyAsPlainText)}
            {item(<Copy size={15} />, 'WordPress用HTMLをコピー', '見出し・段落のタグ付き', copyForWordPress)}
            {item(<FileText size={15} />, 'Markdown（.md）をダウンロード', 'ファイルで保存。履歴にも保存します', downloadMarkdown)}
            <div className="my-1 border-t border-slate-100" />
            {item(<Archive size={15} />, '生成履歴を開く', 'これまでに保存した記事', onOpenHistory)}
          </div>,
          document.body,
        )}
    </>
  );
};
