/**
 * Auth Routes
 * POST /api/auth/register - Create new user
 * POST /api/auth/login - Login and get JWT
 * POST /api/auth/logout - Logout (client-side)
 * GET /api/auth/me - Get current user
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const router = express.Router();

const { databases, users, COLLECTIONS, DATABASE_ID, ID, Query } = require('../config/appwrite');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

// ============================================================================
// Validation Schemas
// ============================================================================

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(50).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// ============================================================================
// Helper: Generate JWT
// ============================================================================

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.$id,
            email: user.email,
            name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// ============================================================================
// Routes
// ============================================================================

/**
 * POST /api/auth/register
 * Create a new user account
 */
router.post('/register', validate(registerSchema), async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Create user in Appwrite (Appwrite handles password hashing internally)
        const newUser = await users.create(
            ID.unique(),
            email,
            undefined, // phone
            password, // Appwrite hashes this internally
            name
        );

        // Create user profile in database
        try {
            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.USERS,
                newUser.$id,
                {
                    userId: newUser.$id,
                    name,
                    email,
                    stepGoal: 10000,
                    sleepGoal: 8,
                    createdAt: new Date().toISOString()
                }
            );
        } catch (profileError) {
            console.log('[Auth] Profile creation skipped (may already exist):', profileError.message);
        }

        // Generate JWT
        const token = generateToken(newUser);

        res.status(201).json({
            message: 'Account created successfully',
            user: {
                id: newUser.$id,
                email: newUser.email,
                name: newUser.name
            },
            token
        });

    } catch (error) {
        console.error('[Auth] Register error:', error);

        // Handle duplicate email
        if (error.code === 409) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'An account with this email already exists'
            });
        }

        res.status(500).json({
            error: 'Registration Failed',
            message: error.message
        });
    }
});

/**
 * POST /api/auth/login
 * Login and receive JWT token
 */
router.post('/login', validate(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const usersList = await users.list([Query.equal('email', email)]);

        if (usersList.total === 0) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid email or password'
            });
        }

        const user = usersList.users[0];
        const storedHash = user.password;

        // Verify password
        let isValidPassword = false;

        try {
            if (storedHash && storedHash.startsWith('$argon2')) {
                // Appwrite uses argon2 for password hashing
                isValidPassword = await argon2.verify(storedHash, password);
            } else if (storedHash && storedHash.startsWith('$2')) {
                // bcrypt hash (legacy)
                isValidPassword = await bcrypt.compare(password, storedHash);
            }
        } catch (verifyError) {
            console.error('[Auth] Password verification error:', verifyError.message);
            isValidPassword = false;
        }

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid email or password'
            });
        }

        // Generate JWT
        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            user: {
                id: user.$id,
                email: user.email,
                name: user.name
            },
            token
        });

    } catch (error) {
        console.error('[Auth] Login error:', error);
        res.status(500).json({
            error: 'Login Failed',
            message: error.message
        });
    }
});

/**
 * POST /api/auth/logout
 * Logout (client-side - just acknowledges the request)
 */
router.post('/logout', authMiddleware, (req, res) => {
    // JWT is stateless, so logout is handled client-side by removing the token
    res.json({
        message: 'Logout successful'
    });
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // Get user profile from database
        const profile = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            req.user.id
        );

        res.json({
            user: {
                id: req.user.id,
                email: req.user.email,
                name: req.user.name,
                stepGoal: profile.stepGoal,
                sleepGoal: profile.sleepGoal,
                createdAt: profile.createdAt
            }
        });

    } catch (error) {
        console.error('[Auth] Get me error:', error);
        res.status(500).json({
            error: 'Failed to get user',
            message: error.message
        });
    }
});

module.exports = router;
