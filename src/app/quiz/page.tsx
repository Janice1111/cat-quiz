'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import quizData from '@/data/quiz.json';

export default function QuizPage() {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Protected Route Check
    useEffect(() => {
        const token = localStorage.getItem('cat_test_token');
        if (!token) {
            router.push('/');
        }
    }, [router]);

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

    const handleOptionSelect = (optionKey: string) => {
        // Save answer
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: optionKey
        }));

        // Move to next question or submit
        if (currentQuestionIndex < quizData.questions.length - 1) {
            setTimeout(() => {
                setCurrentQuestionIndex(prev => prev + 1);
            }, 300); // Small delay for visual feedback
        } else {
            submitQuiz({ ...answers, [currentQuestion.id]: optionKey });
        }
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
                // Redirect to result page with type
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

    if (!currentQuestion) return null;

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
            {/* Progress Bar */}
            <div className="w-full max-w-md mt-4 mb-8">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>进度</span>
                    <span>{currentQuestionIndex + 1} / {quizData.questions.length}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion.id}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6"
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-6 leading-relaxed">
                        {currentQuestion.text}
                    </h2>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option) => {
                            const isSelected = answers[currentQuestion.id] === option.key;
                            return (
                                <button
                                    key={option.key}
                                    onClick={() => handleOptionSelect(option.key)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center group
                    ${isSelected
                                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                                            : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <span className="font-medium">{option.text}</span>
                                    {isSelected && <CheckCircle2 className="w-5 h-5 text-purple-500" />}
                                    {!isSelected && <ChevronRight className="w-5 h-5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            {isSubmitting && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p className="text-gray-600 font-medium">正在分析结果...</p>
                    </div>
                </div>
            )}
        </main>
    );
}
