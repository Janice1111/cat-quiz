'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Cat, KeyRound, Sparkles, PawPrint, Loader2 } from 'lucide-react';

export default function Home() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('喵？请先输入神秘暗号哦！');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '暗号不对哦，再试一次？');
      }

      // Success
      if (audioRef.current) {
        audioRef.current.play().catch(() => { }); // Attempt to play sound
      }

      localStorage.setItem('cat_test_token', data.token);

      // 同时设置 cookie 供服务器端中间件使用
      document.cookie = `cat_test_token=${data.token}; path=/; max-age=3600; SameSite=Strict`;

      // Delay navigation slightly for sound/animation
      setTimeout(() => {
        router.push('/quiz');
      }, 800);

    } catch (err: any) {
      setError(err.message || '发生未知错误，请重试');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDF6E3] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 transform -rotate-12"><PawPrint size={64} className="text-[#E6A23C]" /></div>
        <div className="absolute bottom-20 right-10 transform rotate-12"><PawPrint size={80} className="text-[#E6A23C]" /></div>
        <div className="absolute top-1/2 left-[-20px] transform rotate-45"><Cat size={120} className="text-[#F56C6C]" /></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="max-w-md w-full bg-[#FFFBF0] rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(230,162,60,0.2)] border-4 border-[#FDE6BA] overflow-hidden relative z-10"
      >
        {/* Header Illustration Area */}
        <div className="bg-[#FEF0D5] p-8 flex flex-col items-center justify-center relative border-b-4 border-[#FFF] border-dashed">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="bg-white p-4 rounded-full shadow-lg border-4 border-white mb-2"
          >
            <Cat className="text-[#E6A23C] w-16 h-16" />
          </motion.div>
          <div className="absolute top-4 right-6">
            <Sparkles className="text-[#F56C6C] w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="p-8 pt-6">
          {/* Audio effect */}
          <audio ref={audioRef} src="https://cdn.pixabay.com/audio/2024/09/02/audio_1739c63b72.mp3" preload="auto" />

          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-[#5C4033] mb-2 tracking-wide">
              遇见你的猫系灵魂
            </h1>
            <p className="text-[#8D7B68] text-sm font-medium">
              输入神秘暗号，解密你的喵星身份
            </p>
          </div>

          <form onSubmit={handleStart} className="space-y-5">
            <motion.div
              className="relative group"
              animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#D4A373] group-focus-within:text-[#E6A23C] transition-colors">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="喵，请出示你的激活码..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#FDE6BA] rounded-full focus:outline-none focus:border-[#E6A23C] focus:ring-4 focus:ring-[#FEF0D5] transition-all text-[#5C4033] placeholder-[#D4A373] font-medium text-lg text-center tracking-widest uppercase shadow-sm"
              />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-[#F56C6C] text-sm text-center font-bold bg-[#FEF0D5] py-2 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#E6A23C] text-white py-4 rounded-full font-bold text-lg shadow-[0px_4px_0px_0px_#B7791F] hover:bg-[#F0B15B] hover:shadow-[0px_4px_0px_0px_#C88A2E] active:translate-y-[2px] active:shadow-[0px_2px_0px_0px_#B7791F] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  正在变身中...
                </>
              ) : (
                <>
                  立即变身 <PawPrint className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-[#C2B280] font-medium border-t-2 border-dashed border-[#FDE6BA] pt-4 inline-block px-4">
              还没有暗号？去找找发布者吧 🐱
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
