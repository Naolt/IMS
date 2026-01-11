import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { Variant } from '../entities/Variant';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';
import { ValidationError, NotFoundError, DuplicateEntryError } from '../utils/errors';

const productRepository = AppDataSource.getRepository(Product);
const variantRepository = AppDataSource.getRepository(Variant);

// Create product with variants
export const createProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { code, name, category, brand, imageUrl, variants } = req.body;

    // Validate input
    if (!code || !name || !category) {
        throw new ValidationError('Code, name, and category are required');
    }

    // Check if product code already exists
    const existingProduct = await productRepository.findOne({ where: { code } });
    if (existingProduct) {
        throw new DuplicateEntryError('Product with this code already exists');
    }

    // Create product
    const product = productRepository.create({
        code,
        name,
        category,
        brand,
        imageUrl,
    });

    await productRepository.save(product);

    // Create variants if provided
    if (variants && Array.isArray(variants) && variants.length > 0) {
        const variantEntities = variants.map((v: any) =>
            variantRepository.create({
                productId: product.id,
                size: v.size,
                color: v.color,
                stockQuantity: v.stockQuantity || 0,
                minStockQuantity: v.minStockQuantity || 0,
                buyingPrice: v.buyingPrice,
                sellingPrice: v.sellingPrice,
            })
        );

        await variantRepository.save(variantEntities);
    }

    // Fetch the complete product with variants
    const savedProduct = await productRepository.findOne({
        where: { id: product.id },
        relations: ['variants'],
    });

    sendCreated(res, 'Product created successfully', savedProduct, req.id);
});

// Get all products with pagination and filters
export const getProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const {
        page = 1,
        limit = 10,
        search,
        category,
        brand,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const queryBuilder = productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.variants', 'variants')
        .take(limitNum)
        .skip(skip)
        .orderBy('product.createdAt', 'DESC');

    // Apply filters
    if (search) {
        queryBuilder.andWhere(
            '(product.name ILIKE :search OR product.code ILIKE :search)',
            { search: `%${search}%` }
        );
    }

    if (category) {
        queryBuilder.andWhere('product.category = :category', { category });
    }

    if (brand) {
        queryBuilder.andWhere('product.brand = :brand', { brand });
    }

    const [products, total] = await queryBuilder.getManyAndCount();

    sendPaginated(
        res,
        'Products retrieved successfully',
        products,
        {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
        req.id
    );
});

// Get single product by ID
export const getProductById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const product = await productRepository.findOne({
        where: { id },
        relations: ['variants'],
    });

    if (!product) {
        throw new NotFoundError('Product not found');
    }

    sendSuccess(res, 'Product retrieved successfully', product, req.id);
});

// Update product
export const updateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { code, name, category, brand, imageUrl } = req.body;

    const product = await productRepository.findOne({ where: { id } });

    if (!product) {
        throw new NotFoundError('Product not found');
    }

    // Check if new code already exists (if code is being changed)
    if (code && code !== product.code) {
        const existingProduct = await productRepository.findOne({ where: { code } });
        if (existingProduct) {
            throw new DuplicateEntryError('Product with this code already exists');
        }
    }

    // Update fields
    if (code) product.code = code;
    if (name) product.name = name;
    if (category) product.category = category;
    if (brand !== undefined) product.brand = brand;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;

    await productRepository.save(product);

    const updatedProduct = await productRepository.findOne({
        where: { id },
        relations: ['variants'],
    });

    sendSuccess(res, 'Product updated successfully', updatedProduct, req.id);
});

// Delete product
export const deleteProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const product = await productRepository.findOne({ where: { id } });

    if (!product) {
        throw new NotFoundError('Product not found');
    }

    await productRepository.remove(product);

    sendSuccess(res, 'Product deleted successfully', undefined, req.id);
});

// Add variant to existing product
export const addVariant = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { size, color, stockQuantity, minStockQuantity, buyingPrice, sellingPrice } = req.body;

    // Validate input
    if (!size || !color || buyingPrice === undefined || sellingPrice === undefined) {
        throw new ValidationError('Size, color, buyingPrice, and sellingPrice are required');
    }

    const product = await productRepository.findOne({ where: { id } });

    if (!product) {
        throw new NotFoundError('Product not found');
    }

    // Check if variant already exists
    const existingVariant = await variantRepository.findOne({
        where: { productId: id, size, color },
    });

    if (existingVariant) {
        throw new DuplicateEntryError('Variant with this size and color already exists');
    }

    const variant = variantRepository.create({
        productId: id,
        size,
        color,
        stockQuantity: stockQuantity || 0,
        minStockQuantity: minStockQuantity || 0,
        buyingPrice,
        sellingPrice,
    });

    await variantRepository.save(variant);

    sendCreated(res, 'Variant added successfully', variant, req.id);
});

// Update variant
export const updateVariant = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { variantId } = req.params;
    const {
        size,
        color,
        stockQuantity,
        minStockQuantity,
        buyingPrice,
        sellingPrice,
    } = req.body;

    const variant = await variantRepository.findOne({ where: { id: variantId } });

    if (!variant) {
        throw new NotFoundError('Variant not found');
    }

    // Update fields
    if (size) variant.size = size;
    if (color) variant.color = color;
    if (stockQuantity !== undefined) variant.stockQuantity = stockQuantity;
    if (minStockQuantity !== undefined) variant.minStockQuantity = minStockQuantity;
    if (buyingPrice !== undefined) variant.buyingPrice = buyingPrice;
    if (sellingPrice !== undefined) variant.sellingPrice = sellingPrice;

    await variantRepository.save(variant);

    sendSuccess(res, 'Variant updated successfully', variant, req.id);
});

// Delete variant
export const deleteVariant = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { variantId } = req.params;

    const variant = await variantRepository.findOne({ where: { id: variantId } });

    if (!variant) {
        throw new NotFoundError('Variant not found');
    }

    await variantRepository.remove(variant);

    sendSuccess(res, 'Variant deleted successfully', undefined, req.id);
});

// Get low stock variants
export const getLowStock = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const variants = await variantRepository
        .createQueryBuilder('variant')
        .leftJoinAndSelect('variant.product', 'product')
        .where('variant.stockQuantity <= variant.minStockQuantity')
        .orderBy('variant.stockQuantity', 'ASC')
        .getMany();

    sendSuccess(res, 'Low stock variants retrieved successfully', variants, req.id);
});

// Get distinct categories
export const getCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const categories = await productRepository
        .createQueryBuilder('product')
        .select('DISTINCT product.category', 'category')
        .where('product.category IS NOT NULL')
        .orderBy('product.category', 'ASC')
        .getRawMany();

    const categoryList = categories.map(c => c.category);

    sendSuccess(res, 'Categories retrieved successfully', categoryList, req.id);
});

// Get distinct brands
export const getBrands = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const brands = await productRepository
        .createQueryBuilder('product')
        .select('DISTINCT product.brand', 'brand')
        .where('product.brand IS NOT NULL')
        .orderBy('product.brand', 'ASC')
        .getRawMany();

    const brandList = brands.map(b => b.brand);

    sendSuccess(res, 'Brands retrieved successfully', brandList, req.id);
});

// Get distinct sizes
export const getSizes = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const sizes = await variantRepository
        .createQueryBuilder('variant')
        .select('DISTINCT variant.size', 'size')
        .where('variant.size IS NOT NULL')
        .orderBy('variant.size', 'ASC')
        .getRawMany();

    const sizeList = sizes.map(s => s.size);

    sendSuccess(res, 'Sizes retrieved successfully', sizeList, req.id);
});

// Get distinct colors
export const getColors = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const colors = await variantRepository
        .createQueryBuilder('variant')
        .select('DISTINCT variant.color', 'color')
        .where('variant.color IS NOT NULL')
        .orderBy('variant.color', 'ASC')
        .getRawMany();

    const colorList = colors.map(c => c.color);

    sendSuccess(res, 'Colors retrieved successfully', colorList, req.id);
});
