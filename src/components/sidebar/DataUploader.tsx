import React from 'react';
import { Upload, RefreshCw, X } from 'lucide-react';
import type { SheetSource } from '../../lib/sheetKeywords';

type Preset = { name: string; url: string };

type Props = {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'dokusou' | 'history') => void;
  presets: Preset[];
  loadPreset: (url: string) => void;
  newPresetName: string;
  setNewPresetName: (s: string) => void;
  newPresetUrl: string;
  setNewPresetUrl: (s: string) => void;
  savePreset: () => void;
  activeSheetSources: [string, SheetSource][];
  reloadSheetSource: (key: string) => void;
  removeSheetSource: (key: string) => void;
};

export const DataUploader: React.FC<Props> = (props) => {
  return (
    <div className="mb-5 p-4 bg-white rounded-lg space-y-4 border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-700 text-xs flex items-center gap-2 uppercase tracking-wider">
        <div className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center">
          <Upload size={12} className="text-white" />
        </div>
        インプット
      </h3>
      
      <div>
        <label className="block text-[11px] text-slate-500 mb-1.5 font-semibold">Dokusou (CSV/Excel)</label>
        <input 
          type="file" 
          accept=".csv, .xlsx" 
          onChange={(e) => props.handleFileUpload(e, 'dokusou')} 
          className="text-xs w-full text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 file:transition file:cursor-pointer" 
        />
      </div>

      <div>
        <label className="block text-[11px] text-slate-500 mb-1.5 font-semibold">過去記事管理</label>
        <p className="text-[10px] text-slate-400 mb-1.5">掲載メディアを選ぶと、対応するキーワードシートを自動で読み込みます。</p>
        {props.activeSheetSources.length > 0 && (
          <ul className="mb-2 space-y-1">
            {props.activeSheetSources.map(([key, src]) => (
              <li key={key} className="flex items-start justify-between gap-2 text-[11px] bg-stone-50 border border-slate-200 rounded-md px-2 py-1.5">
                <span className={src.state === 'error' ? 'text-red-500' : 'text-slate-600'}>
                  {src.state === 'loading' && `${src.label}：読み込み中…`}
                  {src.state === 'ok' && `✓ ${src.label}：書いた ${src.writtenCount.toLocaleString()}件／書かない ${src.skipCount.toLocaleString()}件`}
                  {src.state === 'error' && `⚠ ${src.label}：${src.message}`}
                </span>
                <span className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => props.reloadSheetSource(key)}
                    disabled={src.state === 'loading'}
                    className="text-slate-400 hover:text-emerald-700 disabled:opacity-40 transition"
                    title="再読み込み"
                  >
                    <RefreshCw size={12} className={src.state === 'loading' ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={() => props.removeSheetSource(key)}
                    className="text-slate-400 hover:text-red-500 transition"
                    title="この連携を外す"
                  >
                    <X size={12} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {props.presets.map((p, i) => (
            <button key={i} onClick={() => props.loadPreset(p.url)} className="text-[11px] bg-stone-50 border border-slate-200 px-2.5 py-1 rounded-md hover:bg-emerald-50 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 transition font-medium">
              {p.name}
            </button>
          ))}
        </div>
        <details className="text-xs cursor-pointer group">
          <summary className="text-emerald-600 hover:text-emerald-700 font-bold transition inline-flex items-center gap-1">
            <span className="text-emerald-600">＋</span> シート連携を追加
          </summary>
          <div className="mt-2 space-y-2 p-3 bg-stone-50 rounded-lg border border-slate-200">
            <input placeholder="名前 (例: sumigi)" value={props.newPresetName} onChange={e => props.setNewPresetName(e.target.value)} className="w-full border border-slate-200 p-2 rounded-md text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 bg-white" />
            <input placeholder="シートのURL（Googleスプレッドシートの共有URL）" value={props.newPresetUrl} onChange={e => props.setNewPresetUrl(e.target.value)} className="w-full border border-slate-200 p-2 rounded-md text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 bg-white" />
            <button onClick={props.savePreset} className="w-full bg-emerald-600 text-white p-2 rounded-md hover:bg-emerald-700 transition font-bold text-xs shadow-sm">保存</button>
          </div>
        </details>
      </div>
    </div>
  );
};
