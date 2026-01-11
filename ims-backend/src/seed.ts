import { AppDataSource } from './config/database';
import { User, UserRole } from './entities/User';
import { Product } from './entities/Product';
import { Variant } from './entities/Variant';
import { Sale } from './entities/Sale';
import bcrypt from 'bcrypt';

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected!');

        // Clear existing data
        console.log('Clearing existing data...');
        const saleRepo = AppDataSource.getRepository(Sale);
        const variantRepo = AppDataSource.getRepository(Variant);
        const productRepo = AppDataSource.getRepository(Product);
        const userRepo = AppDataSource.getRepository(User);

        // Delete in correct order (respecting foreign keys)
        await saleRepo.clear();
        await variantRepo.clear();
        await productRepo.clear();
        await userRepo.clear();

        // Create Users
        console.log('Creating users...');
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
        console.log('✓ Users created');

        // Create Products and Variants
        console.log('Creating products...');
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
            {
                code: 'DXPS15',
                name: 'Dell XPS 15',
                category: 'Electronics',
                brand: 'Dell',
                variants: [
                    { color: 'Platinum', size: '16GB/512GB', buyingPrice: 1100, sellingPrice: 1299, stockQuantity: 6, minStockQuantity: 2 },
                ],
            },
            {
                code: 'SONY-WH1000XM5',
                name: 'Sony WH-1000XM5',
                category: 'Electronics',
                brand: 'Sony',
                variants: [
                    { color: 'Black', size: 'Standard', buyingPrice: 280, sellingPrice: 349, stockQuantity: 25, minStockQuantity: 5 },
                    { color: 'Silver', size: 'Standard', buyingPrice: 280, sellingPrice: 349, stockQuantity: 18, minStockQuantity: 5 },
                ],
            },
            {
                code: 'NIKE-AM270',
                name: 'Nike Air Max 270',
                category: 'Footwear',
                brand: 'Nike',
                variants: [
                    { color: 'Black', size: '9', buyingPrice: 80, sellingPrice: 120, stockQuantity: 15, minStockQuantity: 3 },
                    { color: 'Black', size: '10', buyingPrice: 80, sellingPrice: 120, stockQuantity: 12, minStockQuantity: 3 },
                    { color: 'White', size: '9', buyingPrice: 80, sellingPrice: 120, stockQuantity: 3, minStockQuantity: 2 },
                    { color: 'White', size: '10', buyingPrice: 80, sellingPrice: 120, stockQuantity: 2, minStockQuantity: 2 },
                ],
            },
            {
                code: 'ADS-UB23',
                name: 'Adidas Ultraboost 23',
                category: 'Footwear',
                brand: 'Adidas',
                variants: [
                    { color: 'Black', size: '9', buyingPrice: 100, sellingPrice: 150, stockQuantity: 8, minStockQuantity: 3 },
                    { color: 'Blue', size: '10', buyingPrice: 100, sellingPrice: 150, stockQuantity: 10, minStockQuantity: 3 },
                ],
            },
            {
                code: 'LEVI-501',
                name: "Levi's 501 Jeans",
                category: 'Clothing',
                brand: "Levi's",
                variants: [
                    { color: 'Blue', size: '32', buyingPrice: 40, sellingPrice: 69, stockQuantity: 20, minStockQuantity: 5 },
                    { color: 'Blue', size: '34', buyingPrice: 40, sellingPrice: 69, stockQuantity: 18, minStockQuantity: 5 },
                    { color: 'Black', size: '32', buyingPrice: 40, sellingPrice: 69, stockQuantity: 15, minStockQuantity: 5 },
                ],
            },
            {
                code: 'CHMP-HOOD',
                name: 'Champion Hoodie',
                category: 'Clothing',
                brand: 'Champion',
                variants: [
                    { color: 'Gray', size: 'M', buyingPrice: 25, sellingPrice: 45, stockQuantity: 30, minStockQuantity: 10 },
                    { color: 'Gray', size: 'L', buyingPrice: 25, sellingPrice: 45, stockQuantity: 25, minStockQuantity: 10 },
                    { color: 'Black', size: 'M', buyingPrice: 25, sellingPrice: 45, stockQuantity: 22, minStockQuantity: 10 },
                ],
            },
            {
                code: 'COKE-12PK',
                name: 'Coca-Cola 12-Pack',
                category: 'Food & Beverage',
                brand: 'Coca-Cola',
                variants: [
                    { color: 'Red', size: '355ml x 12', buyingPrice: 4, sellingPrice: 6.99, stockQuantity: 50, minStockQuantity: 20 },
                ],
            },
            {
                code: 'PEPSI-12PK',
                name: 'Pepsi 12-Pack',
                category: 'Food & Beverage',
                brand: 'Pepsi',
                variants: [
                    { color: 'Blue', size: '355ml x 12', buyingPrice: 4, sellingPrice: 6.99, stockQuantity: 45, minStockQuantity: 20 },
                ],
            },
            {
                code: 'PRNG',
                name: 'Pringles',
                category: 'Food & Beverage',
                brand: 'Pringles',
                variants: [
                    { color: 'Red', size: 'Original 149g', buyingPrice: 1.5, sellingPrice: 2.99, stockQuantity: 60, minStockQuantity: 30 },
                    { color: 'Green', size: 'Sour Cream 149g', buyingPrice: 1.5, sellingPrice: 2.99, stockQuantity: 55, minStockQuantity: 30 },
                ],
            },
            {
                code: 'STNLY-40OZ',
                name: 'Stanley Quencher Tumbler',
                category: 'Home & Kitchen',
                brand: 'Stanley',
                variants: [
                    { color: 'Black', size: '40oz', buyingPrice: 30, sellingPrice: 45, stockQuantity: 12, minStockQuantity: 5 },
                    { color: 'Pink', size: '40oz', buyingPrice: 30, sellingPrice: 45, stockQuantity: 8, minStockQuantity: 5 },
                ],
            },
            {
                code: 'DYSN-V15',
                name: 'Dyson V15 Vacuum',
                category: 'Home & Kitchen',
                brand: 'Dyson',
                variants: [
                    { color: 'Gold', size: 'Standard', buyingPrice: 450, sellingPrice: 599, stockQuantity: 4, minStockQuantity: 2 },
                ],
            },
            {
                code: 'INPT-DUO',
                name: 'Instant Pot Duo',
                category: 'Home & Kitchen',
                brand: 'Instant Pot',
                variants: [
                    { color: 'Silver', size: '6 Quart', buyingPrice: 60, sellingPrice: 89, stockQuantity: 10, minStockQuantity: 3 },
                ],
            },
        ];

        const products: Product[] = [];
        const variants: Variant[] = [];

        for (const productData of productsData) {
            const product = productRepo.create({
                code: productData.code,
                name: productData.name,
                category: productData.category,
                brand: productData.brand,
            });
            const savedProduct = await productRepo.save(product);
            products.push(savedProduct);

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

        console.log(`✓ Created ${products.length} products with ${variants.length} variants`);

        // Create Sales (spanning last 6 months)
        console.log('Creating sales transactions...');
        const salesData = [];
        const now = new Date();
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);

        // Helper function to generate random date between two dates
        const randomDate = (start: Date, end: Date) => {
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        };

        // Helper function to get random item from array
        const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

        // Generate 200-300 sales transactions
        const numberOfSales = 250;

        for (let i = 0; i < numberOfSales; i++) {
            const variant = randomItem(variants);
            const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
            const saleDate = randomDate(sixMonthsAgo, now);
            const soldBy = Math.random() > 0.5 ? admin : staff;

            const sale = saleRepo.create({
                variant: variant,
                user: soldBy,
                quantity: quantity,
                sellingPrice: variant.sellingPrice,
                totalAmount: variant.sellingPrice * quantity,
                saleDate: saleDate,
                customerName: Math.random() > 0.3 ? `Customer ${Math.floor(Math.random() * 100)}` : undefined,
                notes: Math.random() > 0.7 ? 'Regular customer' : undefined,
            });

            salesData.push(sale);
        }

        await saleRepo.save(salesData);
        console.log(`✓ Created ${salesData.length} sales transactions`);

        console.log('\n✅ Database seeded successfully!\n');
        console.log('📧 Admin Account: admin@ims.com / Admin@123');
        console.log('📧 Staff Account: staff@ims.com / Staff@123\n');

        await AppDataSource.destroy();
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seed();
