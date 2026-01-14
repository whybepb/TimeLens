/**
 * Goals Routes
 * GET /api/goals - Get user goals
 * PUT /api/goals - Update user goals
 */

const express = require('express');
const Joi = require('joi');
const router = express.Router();

const { databases, COLLECTIONS, DATABASE_ID, ID, Query } = require('../config/appwrite');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation schema
const goalsSchema = Joi.object({
    steps: Joi.number().min(0).max(100000).required(),
    sleep: Joi.number().min(0).max(24).required(),
    focus: Joi.number().min(0).max(1440).required(),
    pvc: Joi.number().min(0).max(100).required(),
    calories: Joi.number().min(0).max(10000).required()
});

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/goals
 * Get user's goals
 */
router.get('/', async (req, res) => {
    try {
        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.USER_GOALS,
            [Query.equal('userId', req.user.id)]
        );

        if (result.documents.length === 0) {
            // Return default goals if none exist
            return res.json({
                goals: {
                    steps: 10000,
                    sleep: 8,
                    focus: 120,
                    pvc: 70,
                    calories: 500
                }
            });
        }

        const doc = result.documents[0];
        res.json({
            goals: {
                steps: doc.steps,
                sleep: doc.sleep,
                focus: doc.focus,
                pvc: doc.pvc,
                calories: doc.calories
            }
        });

    } catch (error) {
        console.error('[Goals] Get error:', error);
        res.status(500).json({
            error: 'Failed to get goals',
            message: error.message
        });
    }
});

/**
 * PUT /api/goals
 * Update user's goals
 */
router.put('/', validate(goalsSchema), async (req, res) => {
    try {
        const { steps, sleep, focus, pvc, calories } = req.body;

        // Check if goals document exists
        const existing = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.USER_GOALS,
            [Query.equal('userId', req.user.id)]
        );

        const data = {
            userId: req.user.id,
            steps,
            sleep,
            focus,
            pvc,
            calories,
            updatedAt: new Date().toISOString()
        };

        let doc;
        if (existing.documents.length > 0) {
            // Update existing
            doc = await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.USER_GOALS,
                existing.documents[0].$id,
                data
            );
        } else {
            // Create new
            doc = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.USER_GOALS,
                ID.unique(),
                data
            );
        }

        res.json({
            message: 'Goals updated successfully',
            goals: {
                steps: doc.steps,
                sleep: doc.sleep,
                focus: doc.focus,
                pvc: doc.pvc,
                calories: doc.calories
            }
        });

    } catch (error) {
        console.error('[Goals] Update error:', error);
        res.status(500).json({
            error: 'Failed to update goals',
            message: error.message
        });
    }
});

module.exports = router;
