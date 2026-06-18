import React, { useState, useEffect } from 'react';
import { X, Copy, Trash2, Archive, Loader2 } from 'lucide-react';
import { getAllArticles, deleteArticle, HistoryRecord } from '../../lib/historyDb';
import { toast } from 'react-hot-toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const HistoryPanel: React.FC<Props> = ({ isOpen, onClose }) => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // パネルが開いたときだけIndexedDBから読み込む（起動時負荷ゼロ）
  useEffect(() => {
    if (isOpen) {
      loadRecords();
    }
  }, [isOpen]);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await getAllArticles();
      setRecords(data);
    } catch (e) {
      toast.error('履歴の読み込みに失敗しました');
    }
    setIsLoading(false);
  };

  const handleCopy = (record: HistoryRecord) => {
    navigator.clipboard.writeText(record.plainText);
    toast.success('テキストをコピーしました', { icon: '📝' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この履歴を削除しますか？')) return;
    try {
      await deleteArticle(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      toast.success('削除しました');
    } catch (e) {
      toast.error('削除に失敗しました');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <>
      {/* オーバーレイ */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      )}

      {/* スライドパネル */}
      <div className={`fixed top-0 right-0 h-full w-[480px] max-w-full bg-stone-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* ヘッダー（藍色） */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              <Archive size={18} className="text-emerald-400" />
              生成履歴アーカイブ
            </h3>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-md hover:bg-slate-600 text-stone-400 hover:text-stone-200 transition"
            >
              <X size={18} />
            </button>
          </div>
          <div className="h-0.5 mt-3 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
        </div>

        {/* コンテンツ */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <Loader2 size={28} className="animate-spin mb-3 text-emerald-600" />
              <span className="text-sm">読み込み中...</span>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Archive size={28} className="text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">保存された履歴はありません</p>
              <p className="text-xs mt-1 text-slate-400">「テキストでコピー」時に自動保存されます</p>
            </div>
          ) : (
            records.map(record => (
              <div 
                key={record.id} 
                className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition group"
              >
                {/* カードヘッダー */}
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">{formatDate(record.createdAt)}</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {record.mainKeyword || '(KW未設定)'}
                  </span>
                </div>

                {/* プレビュー */}
                <div className="px-4 py-3">
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                    {record.plainText.substring(0, 200)}
                    {record.plainText.length > 200 ? '...' : ''}
                  </p>
                </div>

                {/* アクション */}
                <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {record.plainText.length.toLocaleString()}文字
                  </span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleCopy(record)}
                      className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md hover:bg-emerald-100 transition font-bold"
                    >
                      <Copy size={11} /> コピー
                    </button>
                    <button 
                      onClick={() => handleDelete(record.id!)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md hover:border-red-300 hover:bg-red-50 transition"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
