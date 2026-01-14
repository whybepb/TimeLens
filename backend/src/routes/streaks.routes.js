/**
 * Streaks Routes
 * GET /api/streaks - Get user's streaks
 * PUT /api/streaks - Update user's streaks
 */

const express = require('express');
const Joi = require('joi');
const router = express.Router();

const { databases, COLLECTIONS, DATABASE_ID, ID, Query } = require('../config/appwrite');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation schema for a single streak (allow empty string for lastActiveDate)
const streakItemSchema = Joi.object({
    currentStreak: Joi.number().min(0).required(),
    longestStreak: Joi.number().min(0).required(),
    lastActiveDate: Joi.string().allow('').required()
});

const streaksSchema = Joi.object({
    steps: streakItemSchema,
    sleep: streakItemSchema,
    focus: streakItemSchema,
    pvc: streakItemSchema,
    overall: streakItemSchema
});

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/streaks
 * Get user's streaks
 */
router.get('/', async (req, res) => {
    try {
        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.STREAKS,
            [Query.equal('userId', req.user.id)]
        );

        if (result.documents.length === 0) {
            // Return default streaks if none exist
            const defaultStreak = { currentStreak: 0, longestStreak: 0, lastActiveDate: '' };
            return res.json({
                streaks: {
                    steps: defaultStreak,
                    sleep: defaultStreak,
                    focus: defaultStreak,
                    pvc: defaultStreak,
                    overall: defaultStreak
                }
            });
        }

        const doc = result.documents[0];
        res.json({
            streaks: {
                steps: {
                    currentStreak: doc.stepsCurrentStreak,
                    longestStreak: doc.stepsLongestStreak,
                    lastActiveDate: doc.stepsLastActiveDate
                },
                sleep: {
                    currentStreak: doc.sleepCurrentStreak,
                    longestStreak: doc.sleepLongestStreak,
                    lastActiveDate: doc.sleepLastActiveDate
                },
                focus: {
                    currentStreak: doc.focusCurrentStreak,
                    longestStreak: doc.focusLongestStreak,
                    lastActiveDate: doc.focusLastActiveDate
                },
                pvc: {
                    currentStreak: doc.pvcCurrentStreak,
                    longestStreak: doc.pvcLongestStreak,
                    lastActiveDate: doc.pvcLastActiveDate
                },
                overall: {
                    currentStreak: doc.overallCurrentStreak,
                    longestStreak: doc.overallLongestStreak,
                    lastActiveDate: doc.overallLastActiveDate
                }
            }
        });

    } catch (error) {
        console.error('[Streaks] Get error:', error);
        res.status(500).json({
            error: 'Failed to get streaks',
            message: error.message
        });
    }
});

/**
 * PUT /api/streaks
 * Update user's streaks
 */
router.put('/', validate(streaksSchema), async (req, res) => {
    try {
        const { steps, sleep, focus, pvc, overall } = req.body;

        // Check if streaks document exists
        const existing = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.STREAKS,
            [Query.equal('userId', req.user.id)]
        );

        const data = {
            userId: req.user.id,
            stepsCurrentStreak: steps.currentStreak,
            stepsLongestStreak: steps.longestStreak,
            stepsLastActiveDate: steps.lastActiveDate,
            sleepCurrentStreak: sleep.currentStreak,
            sleepLongestStreak: sleep.longestStreak,
            sleepLastActiveDate: sleep.lastActiveDate,
            focusCurrentStreak: focus.currentStreak,
            focusLongestStreak: focus.longestStreak,
            focusLastActiveDate: focus.lastActiveDate,
            pvcCurrentStreak: pvc.currentStreak,
            pvcLongestStreak: pvc.longestStreak,
            pvcLastActiveDate: pvc.lastActiveDate,
            overallCurrentStreak: overall.currentStreak,
            overallLongestStreak: overall.longestStreak,
            overallLastActiveDate: overall.lastActiveDate,
            updatedAt: new Date().toISOString()
        };

        let doc;
        if (existing.documents.length > 0) {
            doc = await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.STREAKS,
                existing.documents[0].$id,
                data
            );
        } else {
            doc = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.STREAKS,
                ID.unique(),
                data
            );
        }

        res.json({
            message: 'Streaks updated successfully',
            streaks: req.body
        });

    } catch (error) {
        console.error('[Streaks] Update error:', error);
        res.status(500).json({
            error: 'Failed to update streaks',
            message: error.message
        });
    }
});

module.exports = router;
