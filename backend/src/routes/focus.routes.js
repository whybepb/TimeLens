/**
 * Focus Sessions Routes
 * GET /api/focus/sessions - Get user's focus sessions
 * POST /api/focus/sessions - Create a focus session
 */

const express = require('express');
const Joi = require('joi');
const router = express.Router();

const { databases, COLLECTIONS, DATABASE_ID, ID, Query } = require('../config/appwrite');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation schema
const sessionSchema = Joi.object({
    type: Joi.string().valid('focus', 'shortBreak', 'longBreak').required(),
    duration: Joi.number().min(0).required(),
    wasInterrupted: Joi.boolean().required(),
    intention: Joi.string().max(200).allow('', null),
    completedAt: Joi.string().isoDate().required()
});

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/focus/sessions
 * Get user's focus sessions
 * Query params: limit (default: 20)
 */
router.get('/sessions', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FOCUS_SESSIONS,
            [
                Query.equal('userId', req.user.id),
                Query.orderDesc('completedAt'),
                Query.limit(limit)
            ]
        );

        const sessions = result.documents.map(doc => ({
            id: doc.$id,
            type: doc.type,
            duration: doc.duration,
            wasInterrupted: doc.wasInterrupted,
            intention: doc.intention,
            completedAt: doc.completedAt
        }));

        res.json({ sessions });

    } catch (error) {
        console.error('[Focus] Get sessions error:', error);
        res.status(500).json({
            error: 'Failed to get sessions',
            message: error.message
        });
    }
});

/**
 * POST /api/focus/sessions
 * Create a new focus session
 */
router.post('/sessions', validate(sessionSchema), async (req, res) => {
    try {
        const { type, duration, wasInterrupted, intention, completedAt } = req.body;

        const doc = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.FOCUS_SESSIONS,
            ID.unique(),
            {
                userId: req.user.id,
                type,
                duration,
                wasInterrupted,
                intention: intention || '',
                completedAt
            }
        );

        res.status(201).json({
            message: 'Session recorded successfully',
            session: {
                id: doc.$id,
                type: doc.type,
                duration: doc.duration,
                wasInterrupted: doc.wasInterrupted,
                intention: doc.intention,
                completedAt: doc.completedAt
            }
        });

    } catch (error) {
        console.error('[Focus] Create session error:', error);
        res.status(500).json({
            error: 'Failed to record session',
            message: error.message
        });
    }
});

/**
 * GET /api/focus/stats
 * Get focus statistics for today
 */
router.get('/stats', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FOCUS_SESSIONS,
            [
                Query.equal('userId', req.user.id),
                Query.greaterThan('completedAt', `${today}T00:00:00`),
                Query.equal('type', 'focus')
            ]
        );

        const focusSessions = result.documents;
        const completedSessions = focusSessions.filter(s => !s.wasInterrupted);

        const stats = {
            todaySessions: focusSessions.length,
            todayMinutes: Math.round(focusSessions.reduce((acc, s) => acc + s.duration, 0) / 60),
            completedSessions: completedSessions.length,
            currentStreak: completedSessions.length // consecutive completed (simplified)
        };

        res.json({ stats });

    } catch (error) {
        console.error('[Focus] Get stats error:', error);
        res.status(500).json({
            error: 'Failed to get stats',
            message: error.message
        });
    }
});

module.exports = router;
