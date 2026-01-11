import { Router } from 'express';
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addVariant,
    updateVariant,
    deleteVariant,
    getLowStock,
    getCategories,
    getBrands,
    getSizes,
    getColors,
} from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All product routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product with variants
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - category
 *             properties:
 *               code:
 *                 type: string
 *                 example: DRESS-001
 *               name:
 *                 type: string
 *                 example: Summer Floral Dress
 *               category:
 *                 type: string
 *                 example: Dresses
 *               brand:
 *                 type: string
 *                 example: Fashion House
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - size
 *                     - color
 *                     - buyingPrice
 *                     - sellingPrice
 *                   properties:
 *                     size:
 *                       type: string
 *                       example: M
 *                     color:
 *                       type: string
 *                       example: Blue
 *                     stockQuantity:
 *                       type: integer
 *                       example: 10
 *                     minStockQuantity:
 *                       type: integer
 *                       example: 2
 *                     buyingPrice:
 *                       type: number
 *                       example: 25.00
 *                     sellingPrice:
 *                       type: number
 *                       example: 49.99
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error or product code already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/', createProduct);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with pagination and filters
 *     tags: [Products]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or code
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
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
router.get('/', getProducts);

/**
 * @swagger
 * /api/products/low-stock:
 *   get:
 *     summary: Get products with low stock
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Low stock items retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 variants:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Variant'
 *       401:
 *         description: Unauthorized
 */
router.get('/low-stock', getLowStock);

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get all distinct product categories
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["T-Shirts", "Jeans", "Shoes", "Accessories"]
 *       401:
 *         description: Unauthorized
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /api/products/brands:
 *   get:
 *     summary: Get all distinct product brands
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Brands retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 brands:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Nike", "Adidas", "Puma", "New Balance"]
 *       401:
 *         description: Unauthorized
 */
router.get('/brands', getBrands);

/**
 * @swagger
 * /api/products/sizes:
 *   get:
 *     summary: Get all distinct variant sizes
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sizes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sizes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["XS", "S", "M", "L", "XL", "XXL"]
 *       401:
 *         description: Unauthorized
 */
router.get('/sizes', getSizes);

/**
 * @swagger
 * /api/products/colors:
 *   get:
 *     summary: Get all distinct variant colors
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Colors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 colors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Black", "White", "Red", "Blue", "Green"]
 *       401:
 *         description: Unauthorized
 */
router.get('/colors', getColors);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: DRESS-001-UPDATED
 *               name:
 *                 type: string
 *                 example: Updated Product Name
 *               category:
 *                 type: string
 *                 example: Dresses
 *               brand:
 *                 type: string
 *                 example: Fashion House
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com/new-image.jpg
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', authorize('ADMIN'), deleteProduct);

/**
 * @swagger
 * /api/products/{id}/variants:
 *   post:
 *     summary: Add variant to product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - size
 *               - color
 *               - buyingPrice
 *               - sellingPrice
 *             properties:
 *               size:
 *                 type: string
 *                 example: L
 *               color:
 *                 type: string
 *                 example: Red
 *               stockQuantity:
 *                 type: integer
 *                 example: 15
 *               minStockQuantity:
 *                 type: integer
 *                 example: 3
 *               buyingPrice:
 *                 type: number
 *                 example: 30.00
 *               sellingPrice:
 *                 type: number
 *                 example: 59.99
 *     responses:
 *       201:
 *         description: Variant added successfully
 *       400:
 *         description: Validation error or variant already exists
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/variants', addVariant);

/**
 * @swagger
 * /api/products/variants/{variantId}:
 *   put:
 *     summary: Update variant
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Variant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               size:
 *                 type: string
 *                 example: XL
 *               color:
 *                 type: string
 *                 example: Blue
 *               stockQuantity:
 *                 type: integer
 *                 example: 20
 *               minStockQuantity:
 *                 type: integer
 *                 example: 5
 *               buyingPrice:
 *                 type: number
 *                 example: 28.00
 *               sellingPrice:
 *                 type: number
 *                 example: 54.99
 *     responses:
 *       200:
 *         description: Variant updated successfully
 *       404:
 *         description: Variant not found
 *       401:
 *         description: Unauthorized
 */
router.put('/variants/:variantId', updateVariant);

/**
 * @swagger
 * /api/products/variants/{variantId}:
 *   delete:
 *     summary: Delete variant (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Variant ID
 *     responses:
 *       200:
 *         description: Variant deleted successfully
 *       404:
 *         description: Variant not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/variants/:variantId', authorize('ADMIN'), deleteVariant);

export default router;
 