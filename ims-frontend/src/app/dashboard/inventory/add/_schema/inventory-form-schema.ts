import { z } from 'zod';

export const inventorySchema = z.object({
    size: z.string().min(1, { message: 'Size is required' }),
    color: z.string().min(1, { message: 'Color is required' }),
    stockQuantity: z
        .number()
        .int({ message: 'Stock quantity must be an integer' })
        .min(0, { message: 'Stock quantity cannot be negative' }),
    minStockQuantity: z
        .number()
        .int({ message: 'Minimum stock quantity must be an integer' })
        .min(0, { message: 'Minimum stock quantity cannot be negative' }),
    buyingPrice: z
        .number()
        .min(0, { message: 'Buying price must be 0 or greater' }),
    sellingPrice: z
        .number()
        .min(0, { message: 'Selling price must be 0 or greater' })
});

export const productSchema = z.object({
    productCode: z
        .string()
        .min(1, { message: 'Product code is required' })
        .max(50, { message: 'Product code must be 50 characters or less' }),
    productName: z
        .string()
        .min(1, { message: 'Product name is required' })
        .max(100, { message: 'Product name must be 100 characters or less' }),
    productCategory: z
        .string()
        .min(1, { message: 'Product category is required' }),
    productBrand: z.string().optional(),
    imageUrl: z.string().optional(),
    variants: z
        .array(inventorySchema)
        .min(1, { message: 'At least one variant is required' })
        .refine(
            (variants) =>
                new Set(variants.map((v) => `${v.size}-${v.color}`)).size ===
                variants.length,
            {
                message:
                    'Each variant must have a unique size and color combination'
            }
        )
});
