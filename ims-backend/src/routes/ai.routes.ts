import { Router } from 'express';
import { chat, getState, getHistory, getChatMessages, getTools } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat with AI agent
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - threadId
 *             properties:
 *               message:
 *                 type: string
 *                 description: User message to the AI agent
 *               threadId:
 *                 type: string
 *                 description: Unique thread identifier for conversation history
 *     responses:
 *       200:
 *         description: AI agent response
 *       401:
 *         description: Unauthorized
 */
router.post('/chat', authenticate, chat);

/**
 * @swagger
 * /api/ai/state/{threadId}:
 *   get:
 *     summary: Get current conversation state
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: string
 *         description: Thread ID
 *     responses:
 *       200:
 *         description: Current conversation state
 *       401:
 *         description: Unauthorized
 */
router.get('/state/:threadId', authenticate, getState);

/**
 * @swagger
 * /api/ai/history/{threadId}:
 *   get:
 *     summary: Get conversation history
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: string
 *         description: Thread ID
 *     responses:
 *       200:
 *         description: Conversation history
 *       401:
 *         description: Unauthorized
 */
router.get('/history/:threadId', authenticate, getHistory);

/**
 * @swagger
 * /api/ai/messages/{threadId}:
 *   get:
 *     summary: Get formatted chat messages for a thread
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: string
 *         description: Thread ID
 *     responses:
 *       200:
 *         description: Chat messages in user-friendly format
 *       401:
 *         description: Unauthorized
 */
router.get('/messages/:threadId', authenticate, getChatMessages);

/**
 * @swagger
 * /api/ai/tools:
 *   get:
 *     summary: Get available AI tools
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available tools
 *       401:
 *         description: Unauthorized
 */
router.get('/tools', authenticate, getTools);

export default router;
