'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cat, Share2, Home } from 'lucide-react';
import quizData from '@/data/quiz.json';

// Use Suspense boundary for useSearchParams in client component
export default function ResultPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
            <ResultContent />
        </Suspense>
    );
}

function ResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const type = searchParams.get('type');

    // Find result data
    const result = type && (quizData.results as any)[type];

    if (!result) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <p className="text-gray-500 mb-4">找不到结果，请重新测试...</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-purple-500 text-white px-6 py-2 rounded-full"
                >
                    返回首页
                </button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F5F5F7] p-4 pb-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl"
                id="result-card"
            >
                {/* Header Image Area */}
                <div className="h-64 bg-gradient-to-br from-indigo-100 to-purple-100 flex flex-col items-center justify-center relative p-6">
                    <div className="mb-4">
                        {/* Placeholder for AI Generated Image */}
                        <Cat className="w-32 h-32 text-indigo-400 opacity-80" />
                    </div>
                    <div className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-900">
                        专属人格鉴定书
                    </div>
                    <h1 className="text-3xl font-black text-indigo-900 tracking-tight text-center">
                        {result.title}
                    </h1>
                </div>

                {/* Content Body */}
                <div className="p-6">
                    {/* Keywords */}
                    <div className="flex flex-wrap gap-2 justify-center mb-8">
                        {result.keywords.map((k: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold">
                                #{k}
                            </span>
                        ))}
                    </div>

                    {/* Portrait Description */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                            你的画像
                        </h3>
                        <div className="space-y-3">
                            {result.portrait.map((line: string, i: number) => (
                                <p key={i} className="text-gray-600 leading-relaxed text-sm">
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* Advice Section */}
                    <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-1 h-5 bg-pink-500 rounded-full"></span>
                            生存指南
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <span className="shrink-0 font-bold text-xs bg-white border border-gray-200 px-2 py-1 rounded h-fit text-gray-500">社交</span>
                                <p className="text-sm text-gray-600 leading-relaxed">{result.advice.social}</p>
                            </div>
                            <div className="flex gap-3">
                                <span className="shrink-0 font-bold text-xs bg-white border border-gray-200 px-2 py-1 rounded h-fit text-gray-500">恋爱</span>
                                <p className="text-sm text-gray-600 leading-relaxed">{result.advice.love}</p>
                            </div>
                            <div className="flex gap-3">
                                <span className="shrink-0 font-bold text-xs bg-white border border-gray-200 px-2 py-1 rounded h-fit text-gray-500">工作</span>
                                <p className="text-sm text-gray-600 leading-relaxed">{result.advice.work}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 mt-8">
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            重测一次
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                            <Share2 className="w-4 h-4" />
                            保存结果
                        </button>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-4">在这里长按截图保存你的结果卡片</p>
                </div>
            </motion.div>
        </main>
    );
}
