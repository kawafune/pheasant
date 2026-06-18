import React from 'react';
import { UserButton } from "@clerk/clerk-react";
import { SidebarHeader } from './SidebarHeader';
import { ApiKeySection } from './ApiKeySection';
import { DataUploader } from './DataUploader';
import { KeywordSettings } from './KeywordSettings';
import { DatabaseInput } from './DatabaseInput';

type Props = {
  apiStatus: 'idle' | 'ok' | 'error';
  apiKey: string;
  setApiKey: (s: string) => void;
  checkApiConnection: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'dokusou' | 'history') => void;
  presets: any[];
  loadPreset: (url: string) => void;
  newPresetName: string;
  setNewPresetName: (s: string) => void;
  newPresetUrl: string;
  setNewPresetUrl: (s: string) => void;
  savePreset: () => void;
  mainKeyword: string;
  setMainKeyword: (s: string) => void;
  subKeywords: string[];
  cannibalAlert: string | null;
  databaseText: string;
  setDatabaseText: (s: string) => void;
  handleGenerateStructure: () => void;
  isGenerating: boolean;
  clearAll: () => void;
  mediaType: string;
  setMediaType: (s: string) => void;
};

export const PheasantSidebar: React.FC<Props> = (props) => {
  return (
    <aside className={`w-96 bg-stone-50 border-r border-stone-200 p-6 overflow-y-auto flex-shrink-0 border-l-8 transition-colors duration-300 ${props.apiStatus === 'ok' ? 'border-l-emerald-600' : props.apiStatus === 'error' ? 'border-l-red-500' : 'border-l-stone-300'}`}>
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
      />

      <div className="space-y-4">
        <KeywordSettings 
          mediaType={props.mediaType}
          setMediaType={props.setMediaType}
          mainKeyword={props.mainKeyword}
          setMainKeyword={props.setMainKeyword}
          subKeywords={props.subKeywords}
          cannibalAlert={props.cannibalAlert}
        />
        
        <DatabaseInput 
          databaseText={props.databaseText}
          setDatabaseText={props.setDatabaseText}
          handleGenerateStructure={props.handleGenerateStructure}
          isGenerating={props.isGenerating}
          mainKeyword={props.mainKeyword}
        />
      </div>
      
      <div className="mt-8 pt-4 border-t border-stone-200 text-xs text-slate-400 text-center">
        <UserButton showName />
      </div>
    </aside>
  );
};
