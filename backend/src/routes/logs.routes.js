/**
 * Daily Logs Routes
 * GET /api/logs - Get user's daily logs
 * POST /api/logs - Create/update daily log
 * DELETE /api/logs/:date - Delete a daily log
 */

const express = require('express');
const Joi = require('joi');
const router = express.Router();

const { databases, COLLECTIONS, DATABASE_ID, ID, Query } = require('../config/appwrite');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation schema
const logSchema = Joi.object({
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    steps: Joi.number().min(0).required(),
    sleepHours: Joi.number().min(0).max(24).allow(null),
    focusMinutes: Joi.number().min(0).required(),
    pvcScore: Joi.number().min(0).max(100).required(),
    activeCalories: Joi.number().min(0).required(),
    goalsMetCount: Joi.number().min(0).required()
});

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/logs
 * Get user's daily logs
 * Query params: days (default: 30)
 */
router.get('/', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.DAILY_LOGS,
            [
                Query.equal('userId', req.user.id),
                Query.greaterThan('date', startDate.toISOString().split('T')[0]),
                Query.orderDesc('date'),
                Query.limit(days)
            ]
        );

        const logs = result.documents.map(doc => ({
            date: doc.date,
            steps: doc.steps,
            sleepHours: doc.sleepHours,
            focusMinutes: doc.focusMinutes,
            pvcScore: doc.pvcScore,
            activeCalories: doc.activeCalories,
            goalsMetCount: doc.goalsMetCount
        }));

        res.json({ logs });

    } catch (error) {
        console.error('[Logs] Get error:', error);
        res.status(500).json({
            error: 'Failed to get logs',
            message: error.message
        });
    }
});

/**
 * POST /api/logs
 * Create or update a daily log
 */
router.post('/', validate(logSchema), async (req, res) => {
    try {
        const { date, steps, sleepHours, focusMinutes, pvcScore, activeCalories, goalsMetCount } = req.body;

        // Check if log exists for this date
        const existing = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.DAILY_LOGS,
            [
                Query.equal('userId', req.user.id),
                Query.equal('date', date)
            ]
        );

        const data = {
            userId: req.user.id,
            date,
            steps,
            sleepHours,
            focusMinutes,
            pvcScore,
            activeCalories,
            goalsMetCount
        };

        let doc;
        if (existing.documents.length > 0) {
            // Update existing
            doc = await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.DAILY_LOGS,
                existing.documents[0].$id,
                data
            );
        } else {
            // Create new
            doc = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.DAILY_LOGS,
                ID.unique(),
                data
            );
        }

        res.status(201).json({
            message: 'Log saved successfully',
            log: {
                date: doc.date,
                steps: doc.steps,
                sleepHours: doc.sleepHours,
                focusMinutes: doc.focusMinutes,
                pvcScore: doc.pvcScore,
                activeCalories: doc.activeCalories,
                goalsMetCount: doc.goalsMetCount
            }
        });

    } catch (error) {
        console.error('[Logs] Create error:', error);
        res.status(500).json({
            error: 'Failed to save log',
            message: error.message
        });
    }
});

/**
 * DELETE /api/logs/:date
 * Delete a daily log by date
 */
router.delete('/:date', async (req, res) => {
    try {
        const { date } = req.params;

        // Find the log
        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.DAILY_LOGS,
            [
                Query.equal('userId', req.user.id),
                Query.equal('date', date)
            ]
        );

        if (result.documents.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Log not found for this date'
            });
        }

        // Delete the log
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.DAILY_LOGS,
            result.documents[0].$id
        );

        res.json({
            message: 'Log deleted successfully'
        });

    } catch (error) {
        console.error('[Logs] Delete error:', error);
        res.status(500).json({
            error: 'Failed to delete log',
            message: error.message
        });
    }
});

module.exports = router;
