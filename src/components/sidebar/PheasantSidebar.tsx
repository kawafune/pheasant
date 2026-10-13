import React from 'react';
import { LogOut } from 'lucide-react';
import { SidebarHeader } from './SidebarHeader';
import { ApiKeySection } from './ApiKeySection';
import { DataUploader } from './DataUploader';
import { KeywordSettings } from './KeywordSettings';
import { DatabaseInput } from './DatabaseInput';
import { DesignInput } from './DesignInput';
import type { ArticleDesign } from '../../lib/articleDesign';
import type { CannibalAlert } from '../../lib/cannibal';
import type { SheetSource } from '../../lib/sheetKeywords';

type Props = {
  apiStatus: 'idle' | 'ok' | 'error';
  apiKey: string;
  setApiKey: (s: string) => void;
  checkApiConnection: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'dokusou' | 'history') => void;
  presets: { name: string; url: string }[];
  loadPreset: (url: string) => void;
  newPresetName: string;
  setNewPresetName: (s: string) => void;
  newPresetUrl: string;
  setNewPresetUrl: (s: string) => void;
  savePreset: () => void;
  mainKeyword: string;
  setMainKeyword: (s: string) => void;
  subKeywords: string[];
  cannibalAlerts: CannibalAlert[];
  activeSheetSources: [string, SheetSource][];
  reloadSheetSource: (key: string) => void;
  databaseText: string;
  setDatabaseText: (s: string) => void;
  handleGenerateStructure: () => void;
  isGenerating: boolean;
  clearAll: () => void;
  mediaType: string;
  setMediaType: (s: string) => void;
  design: ArticleDesign;
  setDesign: (d: ArticleDesign) => void;
  onLogout: () => void;
};

export const PheasantSidebar: React.FC<Props> = (props) => {
  return (
    <aside className="w-96 bg-stone-50 bg-tate-jima border-r border-slate-200 overflow-y-auto flex-shrink-0 flex flex-col">
      {/* 上部：萌黄色のアクセントライン */}
      <div className={`h-1 transition-colors duration-500 ${
        props.apiStatus === 'ok' ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700' 
        : props.apiStatus === 'error' ? 'bg-red-500' 
        : 'bg-slate-300'
      }`}></div>

      <div className="p-5 flex-1">
        <SidebarHeader apiStatus={props.apiStatus} clearAll={props.clearAll} />
        
        <ApiKeySection 
          apiKey={props.apiKey} 
          setApiKey={props.setApiKey} 
          checkApiConnection={props.checkApiConnection} 
        />
        
        <DataUploader 
          handleFileUpload={props.handleFileUpload}
          presets={props.presets}
          loadPreset={props.loadPreset}
          newPresetName={props.newPresetName}
          setNewPresetName={props.setNewPresetName}
          newPresetUrl={props.newPresetUrl}
          setNewPresetUrl={props.setNewPresetUrl}
          savePreset={props.savePreset}
          activeSheetSources={props.activeSheetSources}
          reloadSheetSource={props.reloadSheetSource}
        />

        <div className="space-y-4">
          <KeywordSettings 
            mediaType={props.mediaType}
            setMediaType={props.setMediaType}
            mainKeyword={props.mainKeyword}
            setMainKeyword={props.setMainKeyword}
            subKeywords={props.subKeywords}
            cannibalAlerts={props.cannibalAlerts}
          />
          
          <DesignInput design={props.design} setDesign={props.setDesign} />

          <DatabaseInput 
            databaseText={props.databaseText}
            setDatabaseText={props.setDatabaseText}
            handleGenerateStructure={props.handleGenerateStructure}
            isGenerating={props.isGenerating}
            mainKeyword={props.mainKeyword}
          />
        </div>
      </div>
      
      {/* フッター */}
      <div className="px-5 py-3 border-t border-slate-200 bg-white/50 text-xs text-slate-400 flex items-center justify-between">
        <button onClick={props.onLogout} className="flex items-center gap-1.5 hover:text-slate-600 transition">
          <LogOut size={14} /> ログアウト
        </button>
        <span className="text-[10px] tracking-wider opacity-50">PHEASANT</span>
      </div>
    </aside>
  );
};
