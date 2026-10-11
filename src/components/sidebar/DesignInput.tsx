import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { ArticleDesign } from '../../lib/articleDesign';

type Props = {
  design: ArticleDesign;
  setDesign: (d: ArticleDesign) => void;
};

type FieldDef = {
  key: keyof ArticleDesign;
  label: string;
  placeholder: string;
  rows: number;
};

const FIELDS: FieldDef[] = [
  { key: 'searchIntent', label: '検索意図', placeholder: '例：購入直前：肌がチクチクしない服を探している', rows: 2 },
  { key: 'titleIdea', label: '記事タイトル案', placeholder: '入れると構成のH1に優先して使います', rows: 2 },
  { key: 'stance', label: '結論付けとスタンス（2文程度）', placeholder: '例：○○ではなく××で判断すべき。こういう人はこうすると後悔しない。', rows: 3 },
  { key: 'readerChange', label: '読後の変化（1行）', placeholder: '読む前 → 読んだ後の気持ち・学び → 次の行動', rows: 2 },
  { key: 'cashPoint', label: 'キャッシュポイント／送客先', placeholder: '送客先の名前やURL', rows: 2 },
  { key: 'existingUrl', label: '既存記事URL（任意）', placeholder: '食い合い確認用', rows: 2 },
];

export const DesignInput: React.FC<Props> = ({ design, setDesign }) => {
  const filled = FIELDS.filter((f) => design[f.key].trim()).length;

  return (
    <details className="group border border-slate-200 rounded-md bg-white">
      <summary className="cursor-pointer select-none list-none flex items-center justify-between px-3 py-2.5 text-[11px] font-bold text-slate-500 tracking-wider">
        <span>
          記事の設計（任意）
          {filled > 0 && <span className="ml-2 text-emerald-700 normal-case">{filled}項目入力済み</span>}
        </span>
        <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-3 pb-3 space-y-3">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="block text-[11px] font-bold mb-1 text-slate-500">{f.label}</label>
            <textarea
              value={design[f.key]}
              onChange={(e) => setDesign({ ...design, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              rows={f.rows}
              className="w-full p-2 border border-slate-200 rounded-md text-xs text-slate-700 focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition resize-y"
            />
          </div>
        ))}
      </div>
    </details>
  );
};
