import React from 'react';
import { ListChecks } from 'lucide-react';
import type { TodoItem } from '../../lib/articleCheck';

type Props = {
  todos: TodoItem[];
};

export const TodoPanel: React.FC<Props> = ({ todos }) => {
  if (todos.length === 0) return null;
  const confirms = todos.filter((t) => t.kind === 'confirm');
  const links = todos.filter((t) => t.kind === 'link');

  return (
    <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 text-sm text-slate-700">
      <div className="flex items-center gap-2 font-bold mb-1">
        <ListChecks size={16} className="text-amber-600" />
        公開前にやること（{todos.length}件）
      </div>
      <p className="text-xs text-slate-500 mb-3">
        記事の中の該当箇所を直して、カッコごと消してください。コピーはいつでもできますが、残ったままだと記事に表示されてしまいます。
      </p>

      {confirms.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-bold mb-1">① 【要確認】を確かめる（{confirms.length}件）</div>
          <p className="text-[11px] text-slate-500 mb-1.5">
            カッコの中に書いてある場所で確認し、正しい内容に書き換えて【要確認】を消します。<b>確認できない・分からない場合は、その一文ごと消して大丈夫です。</b>
          </p>
          <ul className="space-y-2">
            {confirms.map((t, i) => (
              <li key={i} className="bg-white border border-amber-100 rounded p-2 text-xs">
                <div className="text-slate-400 mb-0.5">{t.sectionTag.toUpperCase()}：{t.sectionText}</div>
                <div className="font-bold text-amber-700">{t.marker}</div>
                <div className="text-slate-500 mt-0.5">{t.context}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {links.length > 0 && (
        <div>
          <div className="text-xs font-bold mb-1">② 【リンク】を実際のリンクに置き換える（{links.length}件）</div>
          <p className="text-[11px] text-slate-500 mb-1.5">
            左の「記事の設計」の送客先（URL）など、決まっているリンクに置き換えます。送客先が決まっていない場合は、川船さんに確認してください。
          </p>
          <ul className="space-y-1.5">
            {links.map((t, i) => (
              <li key={i} className="bg-white border border-amber-100 rounded p-2 text-xs">
                <span className="text-slate-400">{t.sectionTag.toUpperCase()}：{t.sectionText}</span>
                <span className="ml-2 font-bold text-amber-700">{t.marker}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
