import React from 'react';
import { ChevronDown } from 'lucide-react';
import { COMMON_DB_LIMIT } from '../../lib/commonDb';

type Props = {
  mediaLabel: string;
  commonDb: string;
  setCommonDb: (s: string) => void;
};

// 共通データベース（媒体ごとに1つ）。サイトのテーマ全体の情報を入れておき、毎回の記事で使う
export const CommonDbInput: React.FC<Props> = ({ mediaLabel, commonDb, setCommonDb }) => {
  const count = commonDb.length;
  return (
    <details className="group border border-slate-200 rounded-md bg-white">
      <summary className="cursor-pointer select-none list-none flex items-center justify-between px-3 py-2.5 text-[11px] font-bold text-slate-500 tracking-wider">
        <span>
          共通データベース（任意）
          <span className="ml-2 font-normal text-slate-400 normal-case">{mediaLabel}用</span>
          {count > 0 && <span className="ml-2 text-emerald-700 normal-case">入力あり</span>}
        </span>
        <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-3 pb-3 space-y-2">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          この媒体の記事全体で使う情報（運営方針、よく使う公的資料と出典URL、商品・店舗の基本情報など）。記事に合う情報だけが使われます。掲載メディアごとに別々に保存されます。
        </p>
        <textarea
          value={commonDb}
          onChange={(e) => setCommonDb(e.target.value)}
          rows={5}
          placeholder="例：運営方針／よく使う公的資料（出典名とURL）／商品の基本情報"
          className="w-full p-2 border border-slate-200 rounded-md text-xs text-slate-700 focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition resize-y"
        />
        <div className={`text-[10px] text-right font-mono ${count > COMMON_DB_LIMIT ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
          {count.toLocaleString()} / {COMMON_DB_LIMIT.toLocaleString()}文字
        </div>
      </div>
    </details>
  );
};
