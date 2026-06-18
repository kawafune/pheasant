import React from 'react';
import { Upload } from 'lucide-react';

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
};

export const DataUploader: React.FC<Props> = (props) => {
  return (
    <div className="mb-6 p-4 bg-stone-100 rounded-lg space-y-4 border border-stone-200">
      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
        <Upload size={16} /> インプット
      </h3>
      
      <div>
        <label className="block text-xs text-slate-600 mb-1 font-semibold">Dokusou (CSV/Excel)</label>
        <input type="file" accept=".csv, .xlsx" onChange={(e) => props.handleFileUpload(e, 'dokusou')} className="text-xs w-full text-slate-600 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200" />
      </div>

      <div>
        <label className="block text-xs text-slate-600 mb-1 font-semibold">過去記事管理</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {props.presets.map((p, i) => (
            <button key={i} onClick={() => props.loadPreset(p.url)} className="text-xs bg-white border border-stone-300 px-2 py-1 rounded hover:bg-stone-200 text-slate-700 transition">
              {p.name}
            </button>
          ))}
        </div>
        <details className="text-xs cursor-pointer group">
          <summary className="text-emerald-600 hover:text-emerald-700 font-semibold transition">＋ シート連携を追加</summary>
          <div className="mt-2 space-y-2 p-3 bg-white rounded border border-stone-200 shadow-sm">
            <input placeholder="名前 (例: sumigi)" value={props.newPresetName} onChange={e => props.setNewPresetName(e.target.value)} className="w-full border border-stone-300 p-1.5 rounded text-xs outline-none focus:border-emerald-500" />
            <input placeholder="公開CSVのURL" value={props.newPresetUrl} onChange={e => props.setNewPresetUrl(e.target.value)} className="w-full border border-stone-300 p-1.5 rounded text-xs outline-none focus:border-emerald-500" />
            <button onClick={props.savePreset} className="w-full bg-slate-700 text-stone-50 p-1.5 rounded hover:bg-slate-800 transition font-bold">保存</button>
          </div>
        </details>
      </div>
    </div>
  );
};
