import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignIn, UserButton, useUser } from "@clerk/clerk-react";
import { initGemini, generateStructure, generateSectionContent } from './lib/gemini';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'react-hot-toast';
import { Lock, ShieldAlert } from 'lucide-react';
import { PheasantSidebar } from './components/sidebar/PheasantSidebar';
import { PheasantEditor } from './components/editor/PheasantEditor';

const ALLOWED_EMAILS = [
  "ark6122of.eins@gmail.com",
  "kiirou.7@gmail.com",
];

interface StructureItem {
  tag: 'h1' | 'h2' | 'h3';
  text: string;
  content?: string;
}

interface Preset {
  name: string;
  url: string;
}

function PheasantTool() {
  const loadState = <T,>(key: string, defaultVal: T): T => {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultVal;
    try { return JSON.parse(saved); } catch { return defaultVal; }
  };

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('kiwi_apikey') || '');
  const [apiStatus, setApiStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [mediaType, setMediaType] = useState(() => localStorage.getItem('kiwi_media') || 'default');
  const [mainKeyword, setMainKeyword] = useState(() => loadState('kiwi_main', ''));
  const [subKeywords, setSubKeywords] = useState<string[]>(() => loadState('kiwi_sub', []));
  const [databaseText, setDatabaseText] = useState(() => loadState('kiwi_db', ''));
  const [structure, setStructure] = useState<StructureItem[]>(() => loadState('kiwi_struct', []));
  const [isGenerating, setIsGenerating] = useState(false);
  const [writingIndex, setWritingIndex] = useState<number | null>(null);
  const [isPolishing, setIsPolishing] = useState(false);
  const [cannibalAlert, setCannibalAlert] = useState<string | null>(null);
  const [existingArticles, setExistingArticles] = useState<string[]>([]);
  const [presets, setPresets] = useState<Preset[]>(() => loadState('kiwi_presets', []));
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetUrl, setNewPresetUrl] = useState('');

  useEffect(() => localStorage.setItem('kiwi_apikey', apiKey), [apiKey]);
  useEffect(() => localStorage.setItem('kiwi_media', mediaType), [mediaType]);
  useEffect(() => localStorage.setItem('kiwi_main', JSON.stringify(mainKeyword)), [mainKeyword]);
  useEffect(() => localStorage.setItem('kiwi_sub', JSON.stringify(subKeywords)), [subKeywords]);
  useEffect(() => localStorage.setItem('kiwi_db', JSON.stringify(databaseText)), [databaseText]);
  useEffect(() => localStorage.setItem('kiwi_struct', JSON.stringify(structure)), [structure]);
  useEffect(() => localStorage.setItem('kiwi_presets', JSON.stringify(presets)), [presets]);

  useEffect(() => {
    if (apiKey) checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    if (!apiKey) return;
    setApiStatus('idle');
    const isOk = await initGemini(apiKey);
    setApiStatus(isOk ? 'ok' : 'error');
    if(isOk) toast.success('Gemini API 接続OK');
    else toast.error('APIキーが無効です');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'dokusou' | 'history') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const parseData = (data: any[]) => {
      return data.map((row: any) => {
        return row['キーワード'] || row['Keyword'] || row['メインキーワード'] || row['Main Keyword'] || Object.values(row)[0];
      }).filter((k): k is string => typeof k === 'string' && k.length > 0);
    };

    const onLoad = (keywords: string[]) => {
      if (type === 'dokusou') {
        if (keywords.length > 0) {
          setMainKeyword(keywords[0]);
          setSubKeywords(keywords);
          toast.success(`Dokusouデータ: ${keywords.length}件読み込み`);
        }
      } else {
        setExistingArticles(keywords);
        toast.success(`過去記事データ: ${keywords.length}件読み込み`);
      }
    };

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        encoding: "Shift-JIS", 
        complete: (results: any) => onLoad(parseData(results.data)),
        error: () => toast.error('CSV読み込みエラー')
      });
    } else if (file.name.match(/\.xlsx?$/)) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      onLoad(parseData(json));
    }
  };

  const loadPreset = async (url: string) => {
    const toastId = toast.loading('取得中...');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const text = await res.text();
      Papa.parse(text, {
        header: true,
        complete: (results: any) => {
          const keywords = results.data.map((row: any) => row['キーワード'] || row['Main Keyword'] || Object.values(row)[0]).filter(Boolean);
          setExistingArticles(keywords);
          toast.success(`連携完了: ${keywords.length}件`, { id: toastId });
        }
      });
    } catch (e) {
      toast.error('読み込み失敗', { id: toastId });
    }
  };

  const savePreset = () => {
    if (!newPresetName || !newPresetUrl) return;
    const newPresets = [...presets, { name: newPresetName, url: newPresetUrl }];
    setPresets(newPresets);
    setNewPresetName('');
    setNewPresetUrl('');
    toast.success('保存しました');
  };

  useEffect(() => {
    if (existingArticles.includes(mainKeyword)) {
      setCannibalAlert(`⚠️ 「${mainKeyword}」は既に記事があります！`);
    } else {
      setCannibalAlert(null);
    }
  }, [mainKeyword, existingArticles]);

  const handleGenerateStructure = async () => {
    if (apiStatus !== 'ok') return toast.error('API接続を確認してください');
    setIsGenerating(true);
    try {
      const result = await generateStructure(mainKeyword, subKeywords.slice(0, 20), databaseText);
      setStructure(result.structure);
      toast.success('構成案完成');
    } catch (e) {
      toast.error('生成失敗');
    }
    setIsGenerating(false);
  };

  const handleWriteSection = async (index: number) => {
    if (apiStatus !== 'ok') return toast.error('API接続を確認してください');
    setIsGenerating(true);
    setWritingIndex(index);
    const toastId = toast.loading('執筆中...');
    try {
      const item = structure[index];
      const isLast = index === structure.length - 1;
      const content = await generateSectionContent(item.text, `メインKW: ${mainKeyword}`, mediaType, item.tag, isLast);
      setStructure(prev => {
        const newS = [...prev];
        newS[index] = { ...newS[index], content };
        return newS;
      });
      toast.success('執筆完了', { id: toastId });
    } catch (e) { toast.error('執筆エラー', { id: toastId }); }
    setWritingIndex(null);
    setIsGenerating(false);
  };

  const handleWriteAllSections = async () => {
    if (apiStatus !== 'ok') return toast.error('API接続を確認してください');

    // まだ本文が生成されていないセクションのインデックスを収集
    const unwrittenIndices = structure
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => !item.content)
      .map(({ idx }) => idx);

    if (unwrittenIndices.length === 0) {
      toast('すべてのセクションは執筆済みです', { icon: 'ℹ️' });
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading(`一括執筆開始... (0/${unwrittenIndices.length})`);

    for (let i = 0; i < unwrittenIndices.length; i++) {
      const idx = unwrittenIndices[i];
      setWritingIndex(idx);
      toast.loading(`一括執筆中... (${i + 1}/${unwrittenIndices.length}) 「${structure[idx].text}」`, { id: toastId });

      try {
        const item = structure[idx];
        const isLast = idx === structure.length - 1;
        const content = await generateSectionContent(item.text, `メインKW: ${mainKeyword}`, mediaType, item.tag, isLast);
        setStructure(prev => {
          const newS = [...prev];
          newS[idx] = { ...newS[idx], content };
          return newS;
        });
      } catch (e) {
        toast.error(`「${structure[idx].text}」の執筆に失敗`);
      }

      // 最後のセクション以外は2秒間の待機（API負荷軽減）
      if (i < unwrittenIndices.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setWritingIndex(null);
    setIsGenerating(false);
    toast.success('全セクションの一括執筆が完了しました！', { id: toastId });
  };

  const handlePolishWholeArticle = async () => {
    if (apiStatus !== 'ok') return toast.error('API接続を確認してください');
    
    // 全て執筆済みか簡易チェック
    if (structure.some(s => !s.content)) {
      if (!confirm('まだ執筆されていないセクションがあります。このまま推敲を実行しますか？')) return;
    }

    setIsPolishing(true);
    const toastId = toast.loading('記事全体を推敲しています...（これには数分かかる場合があります）');

    try {
      // 既存のgemini.tsに追加された polishWholeArticle をインポートして呼び出す
      const { polishWholeArticle } = await import('./lib/gemini');
      const polishedStructure = await polishWholeArticle(structure, mainKeyword, mediaType);
      
      // 結果で上書き
      setStructure(polishedStructure as StructureItem[]);
      toast.success('推敲が完了しました！', { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error('推敲に失敗しました', { id: toastId });
    }

    setIsPolishing(false);
  };

  const clearAll = () => {
    if(!confirm("リセットしますか？")) return;
    setMainKeyword(''); setSubKeywords([]); setDatabaseText(''); setStructure([]);
    toast('リセットしました', { icon: '🧹' });
  };

  return (
    <div className="min-h-screen flex bg-stone-50 text-slate-800" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
      <Toaster position="top-right" />
      <PheasantSidebar 
        {...{apiStatus, apiKey, setApiKey, checkApiConnection, handleFileUpload, presets, loadPreset, newPresetName, setNewPresetName, newPresetUrl, setNewPresetUrl, savePreset, mainKeyword, setMainKeyword, subKeywords, cannibalAlert, databaseText, setDatabaseText, handleGenerateStructure, isGenerating, clearAll, mediaType, setMediaType}} 
      />
      <PheasantEditor 
        {...{structure, setStructure, handleWriteSection, handleWriteAllSections, handlePolishWholeArticle, isGenerating, isPolishing, writingIndex, mainKeyword}} 
      />
    </div>
  );
}

function ProtectedApp() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-slate-400 text-sm">読み込み中...</div>
    </div>
  );
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isAllowed = ALLOWED_EMAILS.length === 0 || (userEmail && ALLOWED_EMAILS.includes(userEmail));
  if (!isAllowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 bg-asanoha p-4">
        <div className="bg-white p-8 rounded-xl shadow-watoji text-center max-w-md border border-slate-200">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>権限がありません</h1>
          <p className="text-slate-500 mb-6 text-sm">アカウント ({userEmail}) は許可されていません。</p>
          <UserButton />
        </div>
      </div>
    );
  }
  return <PheasantTool />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-stone-50">
      <SignedIn><ProtectedApp /></SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 bg-asanoha">
          {/* ログインカード */}
          <div className="bg-white p-10 rounded-2xl shadow-watoji text-center max-w-md w-full border border-slate-200 relative overflow-hidden">
            {/* 上部装飾ライン */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700"></div>
            
            <div className="mb-6 flex justify-center">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 rounded-xl shadow-lg">
                <Lock size={36} className="text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              <span className="text-emerald-700">Pheasant</span>
            </h1>
            <p className="text-slate-400 mb-8 text-sm tracking-wider">PROFESSIONAL WRITERS ONLY</p>
            <div className="flex justify-center"><SignIn /></div>
            
            {/* 下部装飾 */}
            <div className="mt-8 pt-4 border-t border-slate-100">
              <p className="text-[10px] text-slate-300 tracking-widest">SEO WRITING SYSTEM V1.1</p>
            </div>
          </div>
        </div>
      </SignedOut>
    </div>
  );
}