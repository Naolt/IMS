import { Router } from 'express';
import {
    createSale,
    getSales,
    getSaleById,
    getSalesAnalytics,
    deleteSale,
} from '../controllers/sale.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All sale routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Record a new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - variantId
 *               - quantity
 *             properties:
 *               variantId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *               customerName:
 *                 type: string
 *                 example: Jane Smith
 *               notes:
 *                 type: string
 *                 example: Customer paid cash
 *     responses:
 *       201:
 *         description: Sale recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sale:
 *                   $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Validation error or insufficient stock
 *       404:
 *         description: Variant not found
 *       401:
 *         description: Unauthorized
 */
router.post('/', createSale);

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Get all sales with pagination and filters
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter sales from this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter sales until this date (YYYY-MM-DD)
 *       - in: query
 *         name: variantId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by variant ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user who made the sale
 *     responses:
 *       200:
 *         description: Sales retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sales:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sale'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', getSales);

/**
 * @swagger
 * /api/sales/analytics:
 *   get:
 *     summary: Get sales analytics and statistics
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSales:
 *                   type: number
 *                   example: 15
 *                 totalRevenue:
 *                   type: number
 *                   example: 1499.85
 *                 totalProfit:
 *                   type: number
 *                   example: 749.85
 *                 averageOrderValue:
 *                   type: number
 *                   example: 99.99
 *                 topSellingProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productName:
 *                         type: string
 *                       variantId:
 *                         type: string
 *                       size:
 *                         type: string
 *                       color:
 *                         type: string
 *                       totalQuantity:
 *                         type: integer
 *                       totalRevenue:
 *                         type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/analytics', getSalesAnalytics);

/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Get sale by ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sale:
 *                   $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Sale not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', getSaleById);

/**
 * @swagger
 * /api/sales/{id}:
 *   delete:
 *     summary: Delete sale (Admin only - for corrections)
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale deleted successfully and stock restored
 *       404:
 *         description: Sale not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', authorize('ADMIN'), deleteSale);

export default router;
