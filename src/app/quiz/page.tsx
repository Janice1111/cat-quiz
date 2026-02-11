'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle2, Cat, Sparkles, Footprints } from 'lucide-react';
import quizData from '@/data/quiz.json';

export default function QuizPage() {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [direction, setDirection] = useState(0);
    const startTimeRef = useRef<number>(Date.now());
    const [showEasterEgg, setShowEasterEgg] = useState(false);

    // Protected Route Check & Init
    useEffect(() => {
        const token = localStorage.getItem('cat_test_token');
        if (!token) {
            router.push('/');
        } else {
            startTimeRef.current = Date.now();
        }
    }, [router]);

    const currentQuestion = quizData.questions[currentQuestionIndex];
    // Calculate progress for the cat position
    const progressPercent = ((currentQuestionIndex) / (quizData.questions.length - 1)) * 100;

    const handleOptionSelect = (optionKey: string) => {
        // Save answer
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: optionKey
        }));

        // Slide direction
        setDirection(1);

        // Easter Egg: Check ease of answering (Speed run check could go here logic-wise, 
        // but user asked for "completed in extremely short time", so we check at submission)

        // Move to next question or submit
        if (currentQuestionIndex < quizData.questions.length - 1) {
            setTimeout(() => {
                setCurrentQuestionIndex(prev => prev + 1);
            }, 400);
        } else {
            checkProSpeedAndSubmit({ ...answers, [currentQuestion.id]: optionKey });
        }
    };

    const checkProSpeedAndSubmit = (finalAnswers: Record<string, string>) => {
        const duration = Date.now() - startTimeRef.current;
        // If completed in less than 5 seconds (impossible to read), trigger easter egg
        if (duration < 5000) {
            setShowEasterEgg(true);
            return;
        }
        submitQuiz(finalAnswers);
    };

    const submitQuiz = async (finalAnswers: Record<string, string>) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: finalAnswers }),
            });

            const data = await res.json();

            if (data.success && data.resultType) {
                router.push(`/result?type=${data.resultType}`);
            } else {
                alert('提交失败，请重试');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('网络错误，请重试');
            setIsSubmitting(false);
        }
    };

    // Card Variants for "Page Flip" / Slide effect
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
            rotateY: direction > 0 ? 15 : -15,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            rotateY: 0,
            scale: 1,
            transition: {
                type: "spring",
                bounce: 0.2,
                duration: 0.6
            }
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0,
            rotateY: direction < 0 ? 15 : -15,
            scale: 0.95,
            transition: { duration: 0.4 }
        })
    };

    if (!currentQuestion) return null;

    return (
        <main className="min-h-screen bg-[#FDF6E3] flex flex-col items-center p-4 overflow-hidden relative">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
                <div className="absolute top-[10%] left-[5%] rotate-12 text-[#E6A23C]"><Footprints size={120} /></div>
                <div className="absolute bottom-[10%] right-[5%] -rotate-12 text-[#E6A23C]"><Footprints size={120} /></div>
            </div>

            {/* Cat Chase Progress Bar */}
            <div className="w-full max-w-md mt-6 mb-10 relative px-4">
                {/* Track */}
                <div className="h-3 bg-[#FDE6BA] rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full w-full opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fff_10px,#fff_20px)]"></div>
                </div>

                {/* Moving Cat & Yarn */}
                <motion.div
                    className="absolute top-1/2 -ml-3 transform -translate-y-1/2 flex items-center"
                    initial={{ left: '0%' }}
                    animate={{ left: `${progressPercent}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                >
                    <div className="relative">
                        <Cat className="w-8 h-8 text-[#E6A23C] drop-shadow-sm" fill="#FFFBF0" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute -right-6 top-1/2 -translate-y-1/2"
                        >
                            <div className="w-4 h-4 rounded-full bg-[#F56C6C] shadow-sm border-2 border-white"></div>
                        </motion.div>
                        {/* String connecting cat and yarn */}
                        <div className="absolute top-1/2 right-0 w-6 h-0.5 bg-[#F56C6C] origin-left -z-10"></div>
                    </div>
                </motion.div>
            </div>

            {/* Scenario Indicator */}
            <div className="mb-4 flex items-center gap-2 text-[#8D7B68] text-sm font-medium bg-[#FFF] px-4 py-1.5 rounded-full shadow-sm border border-[#FDE6BA]">
                <Sparkles className="w-4 h-4 text-[#E6A23C]" />
                <span>喵星考验 {currentQuestionIndex + 1} / {quizData.questions.length}</span>
            </div>

            {/* Question Card Area */}
            <div className="w-full max-w-md relative min-h-[400px]">
                <AnimatePresence custom={direction} mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute w-full bg-[#FFFBF0] rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(230,162,60,0.15)] border-4 border-[#FDE6BA] p-6 lg:p-8 overflow-hidden"
                    >
                        {/* Decorative Corner */}
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#FEF0D5] rounded-full blur-xl opacity-50"></div>

                        <h2 className="text-xl lg:text-2xl font-black text-[#5C4033] mb-8 leading-relaxed tracking-wide relative z-10">
                            {currentQuestion.text}
                        </h2>

                        <div className="space-y-4">
                            {currentQuestion.options.map((option, idx) => {
                                const isSelected = answers[currentQuestion.id] === option.key;
                                return (
                                    <motion.button
                                        key={option.key}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => handleOptionSelect(option.key)}
                                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex justify-between items-center group relative overflow-hidden
                      ${isSelected
                                                ? 'border-[#E6A23C] bg-[#FEF0D5] text-[#8D4B00]'
                                                : 'border-[#FDE6BA] bg-white hover:border-[#E6A23C] hover:bg-[#FFF8F0] text-[#5C4033]'
                                            }`}
                                    >
                                        <span className="font-bold relative z-10">{option.text}</span>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                        ${isSelected ? 'border-[#E6A23C] bg-[#E6A23C]' : 'border-[#E6A23C] opacity-20 group-hover:opacity-100'}
                    `}>
                                            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Loading Overlay */}
            {isSubmitting && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-[#FDF6E3]/90 backdrop-blur-sm flex items-center justify-center z-50"
                >
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <Cat className="w-16 h-16 text-[#E6A23C] animate-bounce" />
                            <Sparkles className="absolute -top-4 -right-4 text-[#F56C6C] w-8 h-8 animate-ping" />
                        </div>
                        <p className="text-[#5C4033] font-bold text-lg mt-4">正在连接喵星数据库...</p>
                    </div>
                </motion.div>
            )}

            {/* Easter Egg Modal */}
            {showEasterEgg && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center border-4 border-[#F56C6C]"
                    >
                        <Cat className="w-20 h-20 text-[#F56C6C] mx-auto mb-4" />
                        <h3 className="text-2xl font-black text-[#5C4033] mb-2">喵？！！</h3>
                        <p className="text-[#8D7B68] mb-6 font-medium">
                            如果不认真回答，<br />本喵可是无法看穿你的灵魂的！
                        </p>
                        <button
                            onClick={() => {
                                setShowEasterEgg(false);
                                setCurrentQuestionIndex(0);
                                startTimeRef.current = Date.now();
                                setAnswers({});
                            }}
                            className="bg-[#F56C6C] text-white px-8 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-transform"
                        >
                            对不起，我重测 T_T
                        </button>
                    </motion.div>
                </div>
            )}
        </main>
    );
}
