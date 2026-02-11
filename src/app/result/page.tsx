'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Cat, Share2, Home, Download, Sparkles, Star } from 'lucide-react';
import quizData from '@/data/quiz.json';
import html2canvas from 'html2canvas';

export default function ResultPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-[#8D7B68]">正在生成画像...</div>}>
            <ResultContent />
        </Suspense>
    );
}

function ResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const type = searchParams.get('type');
    const [rarity, setRarity] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // Find result data
    const result = type && (quizData.results as any)[type];

    useEffect(() => {
        // Calculate rarity based on type (mock logic for now, or random)
        // Make it consistent for the same session if possible, but random is okay for fun
        // Weighted random: 1% - 15% range usually feels "rare"
        const randomRarity = Math.floor(Math.random() * (15 - 1) + 1);
        setRarity(randomRarity);
    }, []);

    const handleSaveImage = async () => {
        const element = document.getElementById('result-card');
        if (!element || isSaving) return;

        setIsSaving(true);
        try {
            // Wait a tiny bit for any animations to settle
            await new Promise(resolve => setTimeout(resolve, 300));

            // Use HTML2Canvas to capture the card
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#FDF6E3',
                useCORS: true,
                allowTaint: false,
                logging: false,
                width: element.offsetWidth,
                height: element.offsetHeight,
            });

            // Convert to image
            const image = canvas.toDataURL('image/png');

            // Trigger download - more robust approach
            const link = document.createElement('a');
            link.href = image;
            link.download = `猫系人格-${result?.title || '鉴定卡'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Helpful overlay for mobile users in case download doesn't trigger automatically
            if (/micromessenger|kanzhun|weibo/i.test(navigator.userAgent)) {
                alert('已生成图鉴卡！如果在 App 中无法自动下载，请尝试长按结果图保存。');
            }
        } catch (error) {
            console.error('Save failed:', error);
            alert('保存失败，可能是权限限制或图片还在加载中，请稍后再试或直接截图保存哦 T_T');
        } finally {
            setIsSaving(false);
        }
    };

    if (!result) {
        return (
            <div className="min-h-screen bg-[#FDF6E3] flex flex-col items-center justify-center p-4">
                <p className="text-[#8D7B68] mb-4">喵？找不到你的档案...</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-[#E6A23C] text-white px-6 py-2 rounded-full shadow-md"
                >
                    返回首页
                </button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FDF6E3] p-4 py-8 overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FDE6BA] rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FECACA] rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-md mx-auto relative z-10"
                id="result-card"
            >
                {/* Main Card with Organic Shape */}
                <div className="bg-[#FFFBF0] rounded-[2rem] rounded-tr-[5rem] shadow-[8px_8px_0px_0px_rgba(92,64,51,0.1)] border-4 border-[#5C4033] overflow-hidden relative">

                    {/* Header: Rarity & Title */}
                    <div className="bg-[#5C4033] p-6 text-white text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs font-bold ring-1 ring-white/30 mb-3">
                                <Sparkles className="w-3 h-3 text-[#FFD700]" />
                                <span>喵星稀有度 {rarity}%</span>
                            </div>
                            <h1 className="text-3xl font-black tracking-wider mb-1">
                                {result.title}
                            </h1>
                            <p className="text-[#E6A23C] text-sm font-medium tracking-widest opacity-90">
                                CAT PERSONALITY
                            </p>
                        </div>
                        {/* Removed external texture overlay to fix CORS issues in canvas capture */}
                    </div>

                    {/* Header Image Area */}
                    <div className="h-80 bg-gradient-to-br from-[#FDE6BA]/50 to-[#FECACA]/30 flex flex-col items-center justify-center relative p-6">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                y: [0, -10, 0]
                            }}
                            transition={{
                                duration: 0.5,
                                y: {
                                    repeat: Infinity,
                                    duration: 3,
                                    ease: "easeInOut"
                                }
                            }}
                            className="mb-6 relative w-56 h-56"
                        >
                            {/* Dynamic Image with Fallback */}
                            <img
                                src={`/images/cats/${result.type}.png`}
                                alt={result.title}
                                className="w-full h-full object-contain drop-shadow-2xl relative z-10"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                            {/* Fallback Icon (initially hidden if image loads, shown on error) */}
                            <div className="hidden absolute inset-0 flex items-center justify-center">
                                <Cat className="w-40 h-40 text-[#5C4033] opacity-50" />
                            </div>
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-[#FDE6BA] rounded-full blur-3xl opacity-60 transform scale-110 -z-10"></div>
                        </motion.div>

                        <div className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#5C4033] border border-white/40">
                            专属人格鉴定书
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6">

                        {/* Cat Monologue */}
                        <div className="mb-6 relative">
                            <div className="absolute -top-3 -left-2 text-4xl text-[#E6A23C] opacity-30 font-serif">“</div>
                            <div className="px-4 space-y-2">
                                {result.portrait.map((line: string, idx: number) => (
                                    <p key={idx} className="text-[#5C4033] text-sm leading-7 font-medium text-justify">
                                        {line}
                                    </p>
                                ))}
                            </div>
                            <div className="absolute -bottom-4 -right-2 text-4xl text-[#E6A23C] opacity-30 font-serif rotate-180">“</div>
                        </div>

                        {/* Keywords Tags */}
                        <div className="flex flex-wrap gap-2 justify-center mb-8">
                            {result.keywords.map((k: string, i: number) => (
                                <span key={i} className="px-3 py-1.5 bg-[#FDF6E3] border border-[#FDE6BA] text-[#8D7B68] rounded-lg text-xs font-bold">
                                    #{k}
                                </span>
                            ))}
                        </div>

                        {/* Survival Guide */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#E6F7FF] flex items-center justify-center shrink-0 border border-[#91D5FF]">
                                    <span className="text-xs">🤝</span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-[#8D7B68] mb-0.5">社交磁场</h4>
                                    <p className="text-xs text-[#5C4033]/80 leading-relaxed">{result.advice.social}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#FFF0F6] flex items-center justify-center shrink-0 border border-[#FFADD2]">
                                    <span className="text-xs">❤️</span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-[#8D7B68] mb-0.5">情感频道</h4>
                                    <p className="text-xs text-[#5C4033]/80 leading-relaxed">{result.advice.love}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#F6FFED] flex items-center justify-center shrink-0 border border-[#B7EB8F]">
                                    <span className="text-xs">💼</span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-[#8D7B68] mb-0.5">搬砖天赋</h4>
                                    <p className="text-xs text-[#5C4033]/80 leading-relaxed">{result.advice.work}</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer Stamp */}
                    <div className="bg-[#FEF0D5] p-3 text-center border-t-4 border-[#5C4033] border-dashed">
                        <p className="text-[10px] text-[#A69080] font-mono tracking-widest">
                            CAT IDENTITY VERIFIED
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 mt-8 px-2">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border-2 border-[#E6A23C] text-[#E6A23C] font-bold shadow-sm hover:bg-[#FFFBF0] transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        重测一次
                    </button>
                    <button
                        onClick={handleSaveImage}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#5C4033] text-white font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                生成中...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                保存鉴定卡
                            </>
                        )}
                    </button>
                </div>

            </motion.div>
        </main>
    );
}
