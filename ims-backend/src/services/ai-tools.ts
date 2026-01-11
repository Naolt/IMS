import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { Variant } from '../entities/Variant';
import { Sale } from '../entities/Sale';

const productRepository = AppDataSource.getRepository(Product);
const variantRepository = AppDataSource.getRepository(Variant);
const saleRepository = AppDataSource.getRepository(Sale);

// Tool 1: Get low stock products
export const getLowStockProducts = tool(
    async ({ minStockOnly }: { minStockOnly?: boolean }) => {
        const variants = await variantRepository
            .createQueryBuilder('variant')
            .leftJoinAndSelect('variant.product', 'product')
            .where('variant.stockQuantity <= variant.minStockQuantity')
            .andWhere(minStockOnly ? 'variant.stockQuantity > 0' : '1=1')
            .getMany();

        const products = variants.map(v => ({
            productName: v.product.name,
            productCode: v.product.code,
            size: v.size,
            color: v.color,
            currentStock: v.stockQuantity,
            minStock: v.minStockQuantity,
            status: v.stockQuantity === 0 ? 'Out of Stock' : 'Low Stock'
        }));

        return JSON.stringify({
            count: products.length,
            products
        });
    },
    {
        name: 'get_low_stock_products',
        description: 'Get products that are running low on stock or out of stock. Set minStockOnly to true to exclude out-of-stock items.',
        schema: z.object({
            minStockOnly: z.boolean().optional().describe('If true, only return low stock items (not out of stock)')
        })
    }
);

// Tool 2: Get product information
export const getProductInfo = tool(
    async ({ productCode, productName }: { productCode?: string; productName?: string }) => {
        let query = productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.variants', 'variants');

        if (productCode) {
            query = query.where('product.code = :code', { code: productCode });
        } else if (productName) {
            query = query.where('product.name ILIKE :name', { name: `%${productName}%` });
        } else {
            return JSON.stringify({ error: 'Please provide either productCode or productName' });
        }

        const products = await query.getMany();

        if (products.length === 0) {
            return JSON.stringify({ error: 'Product not found' });
        }

        const result = products.map(p => ({
            code: p.code,
            name: p.name,
            category: p.category,
            brand: p.brand,
            totalVariants: p.variants.length,
            totalStock: p.variants.reduce((sum, v) => sum + v.stockQuantity, 0),
            variants: p.variants.map(v => ({
                size: v.size,
                color: v.color,
                stock: v.stockQuantity,
                minStock: v.minStockQuantity,
                buyingPrice: v.buyingPrice,
                sellingPrice: v.sellingPrice
            }))
        }));

        return JSON.stringify(result);
    },
    {
        name: 'get_product_info',
        description: 'Get detailed information about a specific product by code or name.',
        schema: z.object({
            productCode: z.string().optional().describe('The unique product code'),
            productName: z.string().optional().describe('The product name (partial match)')
        })
    }
);

// Tool 3: Get sales analytics
export const getSalesAnalytics = tool(
    async ({ days, groupBy }: { days?: number; groupBy?: string }) => {
        const daysAgo = days || 30;
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - daysAgo);

        const sales = await saleRepository
            .createQueryBuilder('sale')
            .leftJoinAndSelect('sale.variant', 'variant')
            .leftJoinAndSelect('variant.product', 'product')
            .where('sale.saleDate >= :dateFrom', { dateFrom })
            .getMany();

        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
        const totalProfit = sales.reduce((sum, s) => {
            const buyingPrice = Number(s.variant.buyingPrice);
            const profit = (Number(s.sellingPrice) - buyingPrice) * s.quantity;
            return sum + profit;
        }, 0);

        // Group by product if requested
        let productBreakdown = null;
        if (groupBy === 'product') {
            const productSales: { [key: string]: any } = {};

            sales.forEach(sale => {
                const key = sale.variant.product.name;
                if (!productSales[key]) {
                    productSales[key] = {
                        productName: sale.variant.product.name,
                        productCode: sale.variant.product.code,
                        totalQuantity: 0,
                        totalRevenue: 0,
                        salesCount: 0
                    };
                }
                productSales[key].totalQuantity += sale.quantity;
                productSales[key].totalRevenue += Number(sale.totalAmount);
                productSales[key].salesCount += 1;
            });

            productBreakdown = Object.values(productSales)
                .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
                .slice(0, 10); // Top 10
        }

        return JSON.stringify({
            period: `Last ${daysAgo} days`,
            totalSales,
            totalRevenue,
            totalProfit,
            averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
            topProducts: productBreakdown
        });
    },
    {
        name: 'get_sales_analytics',
        description: 'Get sales analytics for a specific time period. Can group by product to see top sellers.',
        schema: z.object({
            days: z.number().optional().describe('Number of days to look back (default: 30)'),
            groupBy: z.enum(['product']).optional().describe('Group results by product to see top sellers')
        })
    }
);

// Tool 4: Get inventory summary
export const getInventorySummary = tool(
    async ({ category, brand }: { category?: string; brand?: string }) => {
        let query = productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.variants', 'variants');

        if (category) {
            query = query.where('product.category = :category', { category });
        }
        if (brand) {
            query = query.andWhere('product.brand = :brand', { brand });
        }

        const products = await query.getMany();

        const totalProducts = products.length;
        const totalVariants = products.reduce((sum, p) => sum + p.variants.length, 0);
        const totalStock = products.reduce((sum, p) =>
            sum + p.variants.reduce((vSum, v) => vSum + v.stockQuantity, 0), 0
        );

        const outOfStock = products.reduce((sum, p) =>
            sum + p.variants.filter(v => v.stockQuantity === 0).length, 0
        );
        const lowStock = products.reduce((sum, p) =>
            sum + p.variants.filter(v => v.stockQuantity > 0 && v.stockQuantity <= v.minStockQuantity).length, 0
        );

        // Get categories breakdown
        const categoryBreakdown: { [key: string]: number } = {};
        products.forEach(p => {
            categoryBreakdown[p.category] = (categoryBreakdown[p.category] || 0) + 1;
        });

        return JSON.stringify({
            totalProducts,
            totalVariants,
            totalStock,
            outOfStock,
            lowStock,
            categories: Object.entries(categoryBreakdown).map(([name, count]) => ({ name, count }))
        });
    },
    {
        name: 'get_inventory_summary',
        description: 'Get a summary of inventory statistics. Can filter by category or brand.',
        schema: z.object({
            category: z.string().optional().describe('Filter by category'),
            brand: z.string().optional().describe('Filter by brand')
        })
    }
);

// Tool 5: Search products
export const searchProducts = tool(
    async ({ query, category, brand, inStockOnly }: { query?: string; category?: string; brand?: string; inStockOnly?: boolean }) => {
        let queryBuilder = productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.variants', 'variants');

        if (query) {
            queryBuilder = queryBuilder.where(
                'product.name ILIKE :query OR product.code ILIKE :query',
                { query: `%${query}%` }
            );
        }
        if (category) {
            queryBuilder = queryBuilder.andWhere('product.category = :category', { category });
        }
        if (brand) {
            queryBuilder = queryBuilder.andWhere('product.brand = :brand', { brand });
        }

        const products = await queryBuilder.take(20).getMany();

        let results = products.map(p => {
            const totalStock = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
            const prices = p.variants.map(v => Number(v.sellingPrice));
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
            const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

            return {
                code: p.code,
                name: p.name,
                category: p.category,
                brand: p.brand,
                variantCount: p.variants.length,
                totalStock,
                priceRange: minPrice === maxPrice ? minPrice : `${minPrice} - ${maxPrice}`,
                inStock: totalStock > 0
            };
        });

        if (inStockOnly) {
            results = results.filter(r => r.inStock);
        }

        return JSON.stringify({
            count: results.length,
            products: results
        });
    },
    {
        name: 'search_products',
        description: 'Search for products by name, code, category, or brand. Returns up to 20 results.',
        schema: z.object({
            query: z.string().optional().describe('Search query for product name or code'),
            category: z.string().optional().describe('Filter by category'),
            brand: z.string().optional().describe('Filter by brand'),
            inStockOnly: z.boolean().optional().describe('Only show products with stock available')
        })
    }
);

// Tool 6: Get recent sales
export const getRecentSales = tool(
    async ({ limit, productCode }: { limit?: number; productCode?: string }) => {
        const maxLimit = limit && limit <= 50 ? limit : 10;

        let query = saleRepository
            .createQueryBuilder('sale')
            .leftJoinAndSelect('sale.variant', 'variant')
            .leftJoinAndSelect('variant.product', 'product')
            .orderBy('sale.saleDate', 'DESC')
            .take(maxLimit);

        if (productCode) {
            query = query.where('product.code = :code', { code: productCode });
        }

        const sales = await query.getMany();

        const salesData = sales.map(s => ({
            id: s.id,
            productName: s.variant.product.name,
            productCode: s.variant.product.code,
            size: s.variant.size,
            color: s.variant.color,
            quantity: s.quantity,
            sellingPrice: Number(s.sellingPrice),
            totalAmount: Number(s.totalAmount),
            customerName: s.customerName || 'N/A',
            saleDate: s.saleDate,
            notes: s.notes
        }));

        return JSON.stringify({
            count: salesData.length,
            sales: salesData
        });
    },
    {
        name: 'get_recent_sales',
        description: 'Get recent sales transactions. Can filter by product code and limit results (max 50).',
        schema: z.object({
            limit: z.number().optional().describe('Number of sales to return (default: 10, max: 50)'),
            productCode: z.string().optional().describe('Filter by product code')
        })
    }
);

// Tool 7: Get sales by date range
export const getSalesByDateRange = tool(
    async ({ startDate, endDate, groupBy }: { startDate: string; endDate: string; groupBy?: string }) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD format.' });
        }

        const sales = await saleRepository
            .createQueryBuilder('sale')
            .leftJoinAndSelect('sale.variant', 'variant')
            .leftJoinAndSelect('variant.product', 'product')
            .where('sale.saleDate >= :start', { start })
            .andWhere('sale.saleDate <= :end', { end })
            .getMany();

        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
        const totalQuantity = sales.reduce((sum, s) => sum + s.quantity, 0);
        const totalProfit = sales.reduce((sum, s) => {
            const buyingPrice = Number(s.variant.buyingPrice);
            const profit = (Number(s.sellingPrice) - buyingPrice) * s.quantity;
            return sum + profit;
        }, 0);

        let breakdown = null;
        if (groupBy === 'product') {
            const productSales: { [key: string]: any } = {};
            sales.forEach(sale => {
                const key = sale.variant.product.code;
                if (!productSales[key]) {
                    productSales[key] = {
                        productName: sale.variant.product.name,
                        productCode: sale.variant.product.code,
                        totalQuantity: 0,
                        totalRevenue: 0,
                        salesCount: 0
                    };
                }
                productSales[key].totalQuantity += sale.quantity;
                productSales[key].totalRevenue += Number(sale.totalAmount);
                productSales[key].salesCount += 1;
            });
            breakdown = Object.values(productSales)
                .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);
        } else if (groupBy === 'day') {
            const dailySales: { [key: string]: any } = {};
            sales.forEach(sale => {
                const dateKey = sale.saleDate.toISOString().split('T')[0];
                if (!dailySales[dateKey]) {
                    dailySales[dateKey] = {
                        date: dateKey,
                        totalSales: 0,
                        totalRevenue: 0,
                        totalQuantity: 0
                    };
                }
                dailySales[dateKey].totalSales += 1;
                dailySales[dateKey].totalRevenue += Number(sale.totalAmount);
                dailySales[dateKey].totalQuantity += sale.quantity;
            });
            breakdown = Object.values(dailySales)
                .sort((a: any, b: any) => a.date.localeCompare(b.date));
        }

        return JSON.stringify({
            period: `${startDate} to ${endDate}`,
            totalSales,
            totalRevenue,
            totalProfit,
            totalQuantity,
            averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
            breakdown
        });
    },
    {
        name: 'get_sales_by_date_range',
        description: 'Get sales data for a specific date range. Can group by product or day. Dates should be in YYYY-MM-DD format.',
        schema: z.object({
            startDate: z.string().describe('Start date in YYYY-MM-DD format'),
            endDate: z.string().describe('End date in YYYY-MM-DD format'),
            groupBy: z.enum(['product', 'day']).optional().describe('Group results by product or day')
        })
    }
);

// Tool 8: Get top selling products
export const getTopSellingProducts = tool(
    async ({ days, limit }: { days?: number; limit?: number }) => {
        const daysAgo = days || 30;
        const maxLimit = limit && limit <= 20 ? limit : 10;
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - daysAgo);

        const sales = await saleRepository
            .createQueryBuilder('sale')
            .leftJoinAndSelect('sale.variant', 'variant')
            .leftJoinAndSelect('variant.product', 'product')
            .where('sale.saleDate >= :dateFrom', { dateFrom })
            .getMany();

        const productSales: { [key: string]: any } = {};

        sales.forEach(sale => {
            const key = sale.variant.product.code;
            if (!productSales[key]) {
                productSales[key] = {
                    productName: sale.variant.product.name,
                    productCode: sale.variant.product.code,
                    category: sale.variant.product.category,
                    brand: sale.variant.product.brand,
                    totalQuantity: 0,
                    totalRevenue: 0,
                    totalProfit: 0,
                    salesCount: 0
                };
            }
            const buyingPrice = Number(sale.variant.buyingPrice);
            const profit = (Number(sale.sellingPrice) - buyingPrice) * sale.quantity;

            productSales[key].totalQuantity += sale.quantity;
            productSales[key].totalRevenue += Number(sale.totalAmount);
            productSales[key].totalProfit += profit;
            productSales[key].salesCount += 1;
        });

        const topProducts = Object.values(productSales)
            .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
            .slice(0, maxLimit);

        return JSON.stringify({
            period: `Last ${daysAgo} days`,
            count: topProducts.length,
            products: topProducts
        });
    },
    {
        name: 'get_top_selling_products',
        description: 'Get top selling products ranked by revenue. Returns detailed sales metrics for each product.',
        schema: z.object({
            days: z.number().optional().describe('Number of days to look back (default: 30)'),
            limit: z.number().optional().describe('Number of products to return (default: 10, max: 20)')
        })
    }
);

// Tool 9: Get sales by customer
export const getSalesByCustomer = tool(
    async ({ customerName, days }: { customerName: string; days?: number }) => {
        const daysAgo = days || 365; // Default to 1 year
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - daysAgo);

        const sales = await saleRepository
            .createQueryBuilder('sale')
            .leftJoinAndSelect('sale.variant', 'variant')
            .leftJoinAndSelect('variant.product', 'product')
            .where('sale.customerName ILIKE :name', { name: `%${customerName}%` })
            .andWhere('sale.saleDate >= :dateFrom', { dateFrom })
            .orderBy('sale.saleDate', 'DESC')
            .getMany();

        if (sales.length === 0) {
            return JSON.stringify({ error: `No sales found for customer: ${customerName}` });
        }

        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
        const totalQuantity = sales.reduce((sum, s) => sum + s.quantity, 0);

        const salesDetails = sales.map(s => ({
            id: s.id,
            productName: s.variant.product.name,
            productCode: s.variant.product.code,
            size: s.variant.size,
            color: s.variant.color,
            quantity: s.quantity,
            totalAmount: Number(s.totalAmount),
            saleDate: s.saleDate,
            notes: s.notes
        }));

        return JSON.stringify({
            customerName: sales[0].customerName,
            period: `Last ${daysAgo} days`,
            totalSales,
            totalRevenue,
            totalQuantity,
            averageOrderValue: totalRevenue / totalSales,
            sales: salesDetails.slice(0, 10) // Return latest 10 sales
        });
    },
    {
        name: 'get_sales_by_customer',
        description: 'Get all sales transactions for a specific customer. Provides customer purchase history and metrics.',
        schema: z.object({
            customerName: z.string().describe('Customer name (partial match supported)'),
            days: z.number().optional().describe('Number of days to look back (default: 365)')
        })
    }
);

// Export all tools as an array
export const tools = [
    getLowStockProducts,
    getProductInfo,
    getSalesAnalytics,
    getInventorySummary,
    searchProducts,
    getRecentSales,
    getSalesByDateRange,
    getTopSellingProducts,
    getSalesByCustomer
];
