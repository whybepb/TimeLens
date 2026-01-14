/**
 * Appwrite Configuration
 * Connects to Appwrite using Node.js SDK (server-side)
 */

const { Client, Databases, Users, ID, Query } = require('node-appwrite');

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

// Initialize services
const databases = new Databases(client);
const users = new Users(client);

// Collection IDs (matching your existing Appwrite setup)
const COLLECTIONS = {
    USERS: 'users',
    HEALTH_LOGS: 'health_logs',
    GOALS: 'goals',
    DAILY_LOGS: 'daily_logs',
    STREAKS: 'streaks',
    USER_GOALS: 'user_goals',
    FOCUS_SESSIONS: 'focus_sessions',
};

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;

module.exports = {
    client,
    databases,
    users,
    COLLECTIONS,
    DATABASE_ID,
    ID,
    Query,
};
