import React, { useState, useEffect } from 'react';
import { initGemini, generateStructure, generateSectionContent, checkArticle } from './lib/gemini';
import type { CheckItem } from './lib/articleCheck';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'react-hot-toast';
import { PheasantSidebar } from './components/sidebar/PheasantSidebar';
import { PheasantEditor } from './components/editor/PheasantEditor';
import { LoginGate } from './components/LoginGate';
import { isLoggedIn, logout } from './lib/auth';
import { DESIGN_STORAGE_KEY, EMPTY_DESIGN, EMPTY_META, META_STORAGE_KEY, normalizeDesign, normalizeMeta } from './lib/articleDesign';
import type { ArticleDesign, ArticleMeta } from './lib/articleDesign';

interface StructureItem {
  tag: 'h1' | 'h2' | 'h3';
  text: string;
  content?: string;
}

type PapaResult<T> = { data: T[] };

interface Preset {
  name: string;
  url: string;
}

function PheasantTool({ onLogout }: { onLogout: () => void }) {
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
  const [design, setDesign] = useState<ArticleDesign>(() => normalizeDesign(loadState(DESIGN_STORAGE_KEY, EMPTY_DESIGN)));
  const [meta, setMeta] = useState<ArticleMeta>(() => normalizeMeta(loadState(META_STORAGE_KEY, EMPTY_META)));
  const [checkResults, setCheckResults] = useState<CheckItem[] | null>(null);
  const [isChecking, setIsChecking] = useState(false);
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
  useEffect(() => localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(design)), [design]);
  useEffect(() => localStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta)), [meta]);
  useEffect(() => localStorage.setItem('kiwi_presets', JSON.stringify(presets)), [presets]);

  useEffect(() => {
    if (apiKey) checkApiConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    type Row = Record<string, unknown>;
    const parseData = (data: Row[]) => {
      return data.map((row) => {
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
        complete: (results: PapaResult<Row>) => onLoad(parseData(results.data)),
        error: () => toast.error('CSV読み込みエラー')
      });
    } else if (file.name.match(/\.xlsx?$/)) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Row>(sheet);
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
        complete: (results: PapaResult<Record<string, string>>) => {
          const keywords = results.data.map((row) => row['キーワード'] || row['Main Keyword'] || Object.values(row)[0]).filter(Boolean);
          setExistingArticles(keywords);
          toast.success(`連携完了: ${keywords.length}件`, { id: toastId });
        }
      });
    } catch {
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
      const result = await generateStructure(mainKeyword, subKeywords.slice(0, 20), databaseText, mediaType, design);
      setStructure(result.structure);
      setCheckResults(null);
      setMeta({ metaDescription: result.meta_description, keyPoints: result.key_points, conclusion: result.conclusion });
      toast.success('構成案完成');
    } catch {
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
      const content = await generateSectionContent({ sectionTitle: item.text, mainKeyword, mediaType, sectionTag: item.tag, isLast, index, structure, databaseText, design, meta });
      setStructure(prev => {
        const newS = [...prev];
        newS[index] = { ...newS[index], content };
        return newS;
      });
      toast.success('執筆完了', { id: toastId });
    } catch { toast.error('執筆エラー', { id: toastId }); }
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
        const content = await generateSectionContent({ sectionTitle: item.text, mainKeyword, mediaType, sectionTag: item.tag, isLast, index: idx, structure, databaseText, design, meta });
        setStructure(prev => {
          const newS = [...prev];
          newS[idx] = { ...newS[idx], content };
          return newS;
        });
      } catch {
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
      const polishedStructure = await polishWholeArticle(structure, mainKeyword, mediaType, databaseText);
      
      // 結果で上書き
      setStructure(polishedStructure as StructureItem[]);
      toast.success('推敲が完了しました！', { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error('推敲に失敗しました', { id: toastId });
    }

    setIsPolishing(false);
  };

  const handleCheckArticle = async () => {
    if (apiStatus !== 'ok') return toast.error('API接続を確認してください');
    setIsChecking(true);
    const toastId = toast.loading('記事を点検しています...');
    try {
      const items = await checkArticle(structure, mainKeyword, mediaType, design, databaseText);
      setCheckResults(items);
      const warnCount = items.filter(i => i.status === 'warn').length;
      toast.success(warnCount > 0 ? `点検完了：要確認 ${warnCount}件` : '点検完了：すべてOK', { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error('点検に失敗しました', { id: toastId });
    }
    setIsChecking(false);
  };

  const clearAll = () => {
    if(!confirm("リセットしますか？")) return;
    setMainKeyword(''); setSubKeywords([]); setDatabaseText(''); setStructure([]); setDesign(EMPTY_DESIGN); setMeta(EMPTY_META); setCheckResults(null);
    toast('リセットしました', { icon: '🧹' });
  };

  return (
    <div className="min-h-screen flex bg-stone-50 text-slate-800" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
      <Toaster position="top-right" />
      <PheasantSidebar 
        {...{apiStatus, apiKey, setApiKey, checkApiConnection, handleFileUpload, presets, loadPreset, newPresetName, setNewPresetName, newPresetUrl, setNewPresetUrl, savePreset, mainKeyword, setMainKeyword, subKeywords, cannibalAlert, databaseText, setDatabaseText, handleGenerateStructure, isGenerating, clearAll, mediaType, setMediaType, design, setDesign, onLogout}} 
      />
      <PheasantEditor 
        {...{structure, setStructure, handleWriteSection, handleWriteAllSections, handlePolishWholeArticle, isGenerating, isPolishing, writingIndex, mainKeyword, meta, handleCheckArticle, isChecking, checkResults, closeCheckResults: () => setCheckResults(null)}} 
      />
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(() => isLoggedIn());

  if (!authed) return <LoginGate onSuccess={() => setAuthed(true)} />;

  return (
    <PheasantTool
      onLogout={() => {
        logout();
        setAuthed(false);
      }}
    />
  );
}
