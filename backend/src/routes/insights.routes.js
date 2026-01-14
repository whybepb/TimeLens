/**
 * AI Insights Routes
 * POST /api/insights - Get AI-generated insights based on health data
 */

const express = require('express');
const Joi = require('joi');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation schema
const insightsSchema = Joi.object({
    steps: Joi.number().min(0).required(),
    sleepHours: Joi.number().min(0).max(24).allow(null),
    activeCalories: Joi.number().min(0).required(),
    pvcScore: Joi.number().min(0).max(100).required(),
    focusMinutes: Joi.number().min(0).optional()
});

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/insights
 * Get AI-generated insights based on health data
 * Uses Groq API for LLM-powered advice
 */
router.post('/', validate(insightsSchema), async (req, res) => {
    try {
        const { steps, sleepHours, activeCalories, pvcScore, focusMinutes } = req.body;

        // Try Groq API if key is configured
        if (process.env.GROQ_API_KEY) {
            const aiResponse = await getGroqInsights(req.body);
            if (aiResponse) {
                return res.json(aiResponse);
            }
        }

        // Fallback to rule-based insights
        const insights = generateMockInsights({ steps, sleepHours, activeCalories, pvcScore, focusMinutes });
        res.json(insights);

    } catch (error) {
        console.error('[Insights] Error:', error);
        res.status(500).json({
            error: 'Failed to generate insights',
            message: error.message
        });
    }
});

/**
 * Call Groq API for AI insights
 */
async function getGroqInsights(data) {
    try {
        const prompt = `You are a wellness coach. Based on this data, provide brief, personalized advice:
- Steps: ${data.steps}
- Sleep: ${data.sleepHours ?? 'Unknown'} hours
- Calories burned: ${data.activeCalories}
- Productivity score: ${data.pvcScore}/100
- Focus time: ${data.focusMinutes ?? 0} minutes

Respond in JSON format:
{
  "summary": "One sentence summary of the day",
  "tips": ["tip1", "tip2", "tip3"],
  "encouragement": "A motivational message"
}`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 300
            })
        });

        if (!response.ok) {
            console.error('[Insights] Groq API error:', response.statusText);
            return null;
        }

        const result = await response.json();
        const content = result.choices[0]?.message?.content;

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return null;
    } catch (error) {
        console.error('[Insights] Groq API error:', error);
        return null;
    }
}

/**
 * Generate rule-based insights (fallback)
 */
function generateMockInsights({ steps, sleepHours, pvcScore, focusMinutes }) {
    let summary = '';
    let tips = [];
    let encouragement = '';

    if (pvcScore >= 70) {
        summary = 'Excellent day! You\'re performing at a high level.';
        tips = [
            'Keep up the great momentum!',
            'Consider a light stretch session to maintain flexibility',
            'Stay hydrated throughout the day'
        ];
        encouragement = 'You\'re crushing it! 💪';
    } else if (pvcScore >= 40) {
        summary = 'Solid day with room for improvement.';
        tips = [
            steps < 5000 ? 'Try to add a short walk to boost your steps' : 'Great step count!',
            sleepHours === null ? 'Consider tracking your sleep for better insights' :
                sleepHours < 7 ? 'Aim for 7-8 hours of sleep tonight' : 'Good sleep!',
            focusMinutes < 60 ? 'Try a 25-minute focus session' : 'Nice focus time!'
        ];
        encouragement = 'You\'re making progress! Keep going! 🌟';
    } else {
        summary = 'Recovery day - focus on rest and rejuvenation.';
        tips = [
            'Prioritize getting quality sleep tonight',
            'A short walk can help boost energy levels',
            'Stay hydrated and eat nutritious meals'
        ];
        encouragement = 'Every day is a fresh start. You\'ve got this! 🌱';
    }

    return { summary, tips, encouragement };
}

module.exports = router;
