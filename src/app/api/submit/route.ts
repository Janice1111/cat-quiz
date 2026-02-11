import { NextResponse } from 'next/server';
import { codesDb } from '@/lib/db';
import quizData from '@/data/quiz.json';

// Type definitions based on quiz.json structure
type DimensionKey = 'E' | 'S' | 'D' | 'N';
type CatResultKey = keyof typeof quizData.results;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { answers, token } = body; // { q01: 'A', q02: 'B', ... }, token: "base64_code"

        if (!answers || Object.keys(answers).length === 0) {
            return NextResponse.json(
                { error: '没有收到答案数据' },
                { status: 400 }
            );
        }

        // 1. 验证 token 并在最后核销激活码
        let activationCodeValue = '';
        if (token) {
            try {
                // 解码 token 获取激活码 (简单版本)
                // 如果之前 verify 接口加了 v1_ 前缀，这里也要处理
                const decoded = Buffer.from(token, 'base64').toString('utf-8');
                activationCodeValue = decoded.replace('v1_', '');
            } catch (e) {
                console.error('Token decode error:', e);
            }
        }

        // 1. Calculate Scores
        const scores: Record<DimensionKey, number> = { E: 0, S: 0, D: 0, N: 0 };

        // Iterate through submitted answers
        Object.entries(answers).forEach(([questionId, optionKey]) => {
            // Find the question in quizData
            const question = quizData.questions.find(q => q.id === questionId);
            if (question) {
                // Find the selected option
                const selectedOption = question.options.find(o => o.key === optionKey);
                if (selectedOption) {
                    // Add points to the corresponding dimension
                    const dimension = selectedOption.dimension as DimensionKey;
                    scores[dimension] += quizData.scoring.option_points;
                }
            }
        });

        console.log('User Scores:', scores);

        // 2. Determine Result Type
        let resultType: CatResultKey | null = null;

        // Sort dimensions by score (descending)
        const sortedDimensions = Object.entries(scores)
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA) as [DimensionKey, number][];

        const [firstDim, firstScore] = sortedDimensions[0];
        const [secondDim, secondScore] = sortedDimensions[1];
        const [lastDim, lastScore] = sortedDimensions[sortedDimensions.length - 1];

        // Rule: Balanced (Maine Coon)
        // "max_minus_min_lte": 4
        if (quizData.scoring.balanced_rule.enabled && (firstScore - lastScore <= quizData.scoring.balanced_rule.max_minus_min_lte)) {
            resultType = quizData.scoring.balanced_rule.result_type_if_balanced as CatResultKey;
        } else {
            // Rule: Mapping
            // Check mapping rules in order
            for (const rule of quizData.scoring.result_mapping) {
                const { when, result_type } = rule;

                // Check if rule matches
                // Rule might specify top1, or top1 and top2
                let match = true;

                if (when.top1 && when.top1 !== firstDim) match = false;
                // Only check top2 if it's specified in the rule
                // AND if the rule actually relies on top2.
                // Be careful: some rules require specific top2, some don't.
                if (match && when.top2) {
                    if (when.top2 !== secondDim) match = false;
                }

                if (match) {
                    resultType = result_type as CatResultKey;
                    break;
                }
            }
        }

        // Fallback if no rule matches (should not happen with complete logic, but good for safety)
        // Default to the cat corresponding to the top 1 dimension if all else fails
        if (!resultType) {
            // Fallback logic
            if (firstDim === 'E') resultType = 'orange_cat';
            else if (firstDim === 'S') resultType = 'scottish_fold';
            else if (firstDim === 'D') resultType = 'bengal';
            else resultType = 'chinchilla_persian';
        }

        // 3. Construct Result Response
        const resultData = quizData.results[resultType];

        // 4. 核销激活码 (如果存在且是普通码)
        if (activationCodeValue) {
            try {
                const codeRecord = codesDb.findByCode(activationCodeValue);

                if (codeRecord && codeRecord.type === 'normal') {
                    codesDb.markAsUsed(activationCodeValue);
                    console.log(`Code consumed: ${activationCodeValue}`);
                }
            } catch (dbError) {
                // 核销失败不应该影响结果展示，但需要记录
                console.error('Failed to consume code:', dbError);
            }
        }

        return NextResponse.json({
            success: true,
            resultType,
            scores,
            resultData
        });

    } catch (error) {
        console.error('Calculation Error:', error);
        return NextResponse.json(
            { error: '计算结果时发生错误' },
            { status: 500 }
        );
    }
}
