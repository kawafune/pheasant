import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { login } from '../lib/auth';

type Props = {
  onSuccess: () => void;
};

export const LoginGate: React.FC<Props> = ({ onSuccess }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setIsChecking(true);
    setError('');
    try {
      const ok = await login(passcode);
      if (ok) onSuccess();
      else setError('合言葉が違います');
    } catch {
      setError('この環境ではログインできません（https のページで開いてください）');
    }
    setIsChecking(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 bg-asanoha p-4">
      <div className="bg-white p-10 rounded-2xl shadow-watoji text-center max-w-md w-full border border-slate-200 relative overflow-hidden">
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

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="合言葉を入力"
            autoFocus
            autoComplete="current-password"
            className="w-full p-3 border-2 border-slate-200 rounded-md text-center font-bold text-slate-800 focus:border-emerald-500 outline-none transition"
          />
          {error && <div className="text-red-500 text-xs font-bold">{error}</div>}
          <button
            type="submit"
            disabled={isChecking || !passcode.trim()}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-lg shadow-md hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {isChecking ? '確認中...' : '入る'}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-300 tracking-widest">SEO WRITING SYSTEM</p>
        </div>
      </div>
    </div>
  );
};
