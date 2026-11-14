import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

type Props = {
  label: string; // 何の説明か（読み上げ用）
  text: string;
};

const WIDTH = 300;

// 「?」アイコン。マウスを乗せる・タップ・キーボードで説明を表示する。
// ヘッダーの枠で切れないよう、説明は画面の一番上の層に出す。
export const HelpTip: React.FC<Props> = ({ label, text }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const left = Math.min(Math.max(8, r.left + r.width / 2 - WIDTH / 2), window.innerWidth - WIDTH - 8);
    setPos({ top: r.bottom + 8, left });
  };
  const hide = () => setPos(null);

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-label={`${label}の説明`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={() => (pos ? hide() : show())}
        className="text-stone-400 hover:text-stone-100 transition p-0.5 -ml-1"
      >
        <HelpCircle size={15} />
      </button>
      {pos &&
        createPortal(
          <div
            role="tooltip"
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: WIDTH }}
            className="z-50 rounded-md bg-slate-900 text-white text-xs leading-relaxed p-3 shadow-lg whitespace-pre-line"
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
};
