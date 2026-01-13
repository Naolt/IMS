import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { Product } from '../entities/Product';
import { Variant } from '../entities/Variant';
import { Sale } from '../entities/Sale';
import bcrypt from 'bcrypt';

const router = Router();

/**
 * @swagger
 * /api/seed:
 *   post:
 *     summary: Seed the database with initial data (production use)
 *     description: Creates admin/staff users and sample products. Use this once after deployment.
 *     tags: [Seed]
 *     responses:
 *       200:
 *         description: Database seeded successfully
 *       500:
 *         description: Seeding failed
 */
router.post('/', async (req, res) => {
    try {
        const userRepo = AppDataSource.getRepository(User);
        const productRepo = AppDataSource.getRepository(Product);
        const variantRepo = AppDataSource.getRepository(Variant);
        const saleRepo = AppDataSource.getRepository(Sale);

        // Check if database is already seeded
        const existingUsers = await userRepo.count();
        if (existingUsers > 0) {
            return res.status(400).json({
                success: false,
                message: 'Database already seeded. Delete existing data first if you want to reseed.',
            });
        }

        // Create Users
        const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
        const hashedStaffPassword = await bcrypt.hash('Staff@123', 10);

        const admin = userRepo.create({
            email: 'admin@ims.com',
            password: hashedAdminPassword,
            name: 'Admin User',
            role: UserRole.ADMIN,
            isVerified: true,
        });

        const staff = userRepo.create({
            email: 'staff@ims.com',
            password: hashedStaffPassword,
            name: 'Staff User',
            role: UserRole.STAFF,
            isVerified: true,
        });

        await userRepo.save([admin, staff]);

        // Create Products and Variants
        const productsData = [
            {
                code: 'IPH15P',
                name: 'iPhone 15 Pro',
                category: 'Electronics',
                brand: 'Apple',
                variants: [
                    { color: 'Black', size: '128GB', buyingPrice: 850, sellingPrice: 999, stockQuantity: 15, minStockQuantity: 5 },
                    { color: 'Black', size: '256GB', buyingPrice: 950, sellingPrice: 1099, stockQuantity: 12, minStockQuantity: 5 },
                    { color: 'White', size: '512GB', buyingPrice: 1100, sellingPrice: 1299, stockQuantity: 8, minStockQuantity: 3 },
                ],
            },
            {
                code: 'SGS24',
                name: 'Samsung Galaxy S24',
                category: 'Electronics',
                brand: 'Samsung',
                variants: [
                    { color: 'Gray', size: '128GB', buyingPrice: 650, sellingPrice: 799, stockQuantity: 20, minStockQuantity: 5 },
                    { color: 'Black', size: '256GB', buyingPrice: 750, sellingPrice: 899, stockQuantity: 5, minStockQuantity: 3 },
                ],
            },
            {
                code: 'MBA-M3',
                name: 'MacBook Air M3',
                category: 'Electronics',
                brand: 'Apple',
                variants: [
                    { color: 'Silver', size: '8GB/256GB', buyingPrice: 950, sellingPrice: 1099, stockQuantity: 10, minStockQuantity: 3 },
                    { color: 'Space Gray', size: '16GB/512GB', buyingPrice: 1200, sellingPrice: 1399, stockQuantity: 7, minStockQuantity: 2 },
                ],
            },
        ];

        const variants: Variant[] = [];

        for (const productData of productsData) {
            const product = productRepo.create({
                code: productData.code,
                name: productData.name,
                category: productData.category,
                brand: productData.brand,
            });
            const savedProduct = await productRepo.save(product);

            for (const variantData of productData.variants) {
                const variant = variantRepo.create({
                    color: variantData.color,
                    size: variantData.size,
                    buyingPrice: variantData.buyingPrice,
                    sellingPrice: variantData.sellingPrice,
                    stockQuantity: variantData.stockQuantity,
                    minStockQuantity: variantData.minStockQuantity,
                    product: savedProduct,
                });
                const savedVariant = await variantRepo.save(variant);
                variants.push(savedVariant);
            }
        }

        // Create some sample sales
        const now = new Date();
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);

        const salesData = [];
        for (let i = 0; i < 20; i++) {
            const variant = variants[Math.floor(Math.random() * variants.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            const saleDate = new Date(oneMonthAgo.getTime() + Math.random() * (now.getTime() - oneMonthAgo.getTime()));
            const soldBy = Math.random() > 0.5 ? admin : staff;

            const sale = saleRepo.create({
                variant: variant,
                user: soldBy,
                quantity: quantity,
                sellingPrice: variant.sellingPrice,
                totalAmount: variant.sellingPrice * quantity,
                saleDate: saleDate,
                customerName: Math.random() > 0.3 ? `Customer ${Math.floor(Math.random() * 50)}` : undefined,
            });

            salesData.push(sale);
        }

        await saleRepo.save(salesData);

        res.json({
            success: true,
            message: 'Database seeded successfully!',
            data: {
                users: 2,
                products: productsData.length,
                variants: variants.length,
                sales: salesData.length,
                credentials: {
                    admin: {
                        email: 'admin@ims.com',
                        password: 'Admin@123',
                    },
                    staff: {
                        email: 'staff@ims.com',
                        password: 'Staff@123',
                    },
                },
            },
        });
    } catch (error) {
        console.error('Seeding error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to seed database',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
