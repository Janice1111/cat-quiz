'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Cat, KeyRound, ArrowRight, Loader2 } from 'lucide-react';

export default function Home() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('请输入激活码');
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
        throw new Error(data.error || '验证失败');
      }

      // Success matching
      localStorage.setItem('cat_test_token', data.token);
      router.push('/quiz');

    } catch (err: any) {
      setError(err.message || '发生未知错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="relative h-48 bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <Cat className="text-white w-24 h-24 drop-shadow-lg" />
        </div>

        <div className="p-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            如果你是一只猫...
          </h1>
          <p className="text-center text-gray-500 mb-8">
            输入激活码，解锁你的猫咪人格图鉴
          </p>

          <form onSubmit={handleStart} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="请输入激活码 (如 CAT-8823...)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all uppercase text-gray-900 bg-gray-50 placeholder:text-gray-400"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  验证中...
                </>
              ) : (
                <>
                  开始测试 <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              还没有激活码？请联系发布者获取
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
