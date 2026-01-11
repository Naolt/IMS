'use client';

import { useFieldArray, Control, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useCreateProduct } from '@/hooks/use-products';
import { useCategories, useBrands, useSizes, useColors } from '@/hooks/use-product-options';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CreatableCombobox } from '@/components/ui/creatable-combobox';
import { productSchema } from '../_schema/inventory-form-schema';
import { Plus, PlusCircle, PlusIcon, Trash } from 'lucide-react';
import CloudinaryUpload from '@/components/cloudinary-upload';
import { Separator } from '@/components/ui/separator';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';

export default function AddInventoryForm() {
    const router = useRouter();
    const { mutate: createProduct, isPending } = useCreateProduct();
    const { data: categoriesResponse } = useCategories();
    const { data: brandsResponse } = useBrands();

    const categories = categoriesResponse?.data || [];
    const brands = brandsResponse?.data || [];

    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            productCode: '',
            productName: '',
            productCategory: '',
            productBrand: '',
            imageUrl: '',
            variants: [
                {
                    size: '',
                    color: '',
                    stockQuantity: 0,
                    minStockQuantity: 0,
                    buyingPrice: 0,
                    sellingPrice: 0
                }
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'variants'
    });

    async function onSubmit(values: z.infer<typeof productSchema>) {
        // Transform form data to match API schema
        const apiData = {
            code: values.productCode,
            name: values.productName,
            category: values.productCategory,
            brand: values.productBrand,
            imageUrl: values.imageUrl,
            variants: values.variants,
        };

        createProduct(apiData, {
            onSuccess: () => {
                router.push('/dashboard/inventory');
            },
        });
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full grid grid-cols-3 gap-8"
            >
                {/* Product Information */}

                <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem className="col-span-3">
                            <FormLabel>Product Image</FormLabel>
                            <FormControl>
                                <CloudinaryUpload
                                    value={field.value}
                                    onChange={field.onChange}
                                    onRemove={() => field.onChange('')}
                                    disabled={isPending}
                                />
                            </FormControl>
                            <FormDescription>
                                Upload a product image (JPEG, PNG, WEBP or SVG, max 2MB)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="productCode"
                    render={({ field }) => (
                        <FormItem className="col-span-3 md:col-span-1">
                            <FormLabel>Product Code</FormLabel>
                            <FormControl>
                                <Input {...field} disabled={isPending} />
                            </FormControl>
                            <FormDescription>
                                Enter the product code
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                        <FormItem className="col-span-3 md:col-span-2">
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                                <Input {...field} disabled={isPending} />
                            </FormControl>
                            <FormDescription>
                                Enter the product name
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="productCategory"
                    render={({ field }) => (
                        <FormItem className="col-span-3 md:col-span-1">
                            <FormLabel>Product Category</FormLabel>
                            <FormControl>
                                <CreatableCombobox
                                    options={categories}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Select or create category..."
                                    searchPlaceholder="Search categories..."
                                    disabled={isPending}
                                />
                            </FormControl>
                            <FormDescription>
                                Select existing or create new category
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="productBrand"
                    render={({ field }) => (
                        <FormItem className="col-span-3 md:col-span-1">
                            <FormLabel>Product Brand</FormLabel>
                            <FormControl>
                                <CreatableCombobox
                                    options={brands}
                                    value={field.value || ''}
                                    onValueChange={field.onChange}
                                    placeholder="Select or create brand..."
                                    searchPlaceholder="Search brands..."
                                    disabled={isPending}
                                />
                            </FormControl>
                            <FormDescription>
                                Select existing or create new brand
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Separator className="col-span-3" />

                {/* Variants */}
                <FormField
                    control={form.control}
                    name="variants"
                    render={() => (
                        <FormItem className="col-span-3">
                            <FormLabel>Variants</FormLabel>
                            <FormControl>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {fields.map((field, index) => (
                                        <Variant
                                            control={form.control}
                                            key={field.id} // Use unique field ID provided by RHF
                                            index={index}
                                            onRemove={() => remove(index)} // Pass remove handler
                                        />
                                    ))}
                                    <AddVariantButton
                                        onClick={() =>
                                            append({
                                                size: '',
                                                color: '',
                                                stockQuantity: 0,
                                                minStockQuantity: 0,
                                                buyingPrice: 0,
                                                sellingPrice: 0
                                            })
                                        }
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="col-span-3 w-full flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/dashboard/inventory')}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Adding Product...' : 'Add Product'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

function Variant({
    control,
    index,
    onRemove
}: {
    control: Control<z.infer<typeof productSchema>>;
    index: number;
    onRemove: () => void;
}) {
    const { data: sizesResponse } = useSizes();
    const { data: colorsResponse } = useColors();

    const sizes = sizesResponse?.data || [];
    const colors = colorsResponse?.data || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Variant {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 ">
                <FormField
                    control={control}
                    name={`variants.${index}.size`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Size</FormLabel>
                            <FormControl>
                                <CreatableCombobox
                                    options={sizes}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Select size..."
                                    searchPlaceholder="Search..."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name={`variants.${index}.color`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                                <CreatableCombobox
                                    options={colors}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Select color..."
                                    searchPlaceholder="Search..."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name={`variants.${index}.stockQuantity`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Stock Quantity</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name={`variants.${index}.minStockQuantity`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Min Stock</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name={`variants.${index}.buyingPrice`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Buying Price</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name={`variants.${index}.sellingPrice`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Selling Price</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button
                    type="button"
                    size={'icon'}
                    variant={'ghost'}
                    className="text-red-500"
                    onClick={onRemove}
                >
                    <Trash />
                </Button>
            </CardFooter>
        </Card>
    );
}

function AddVariantButton({ onClick }: { onClick: () => void }) {
    return (
        <Card>
            <CardContent className="flex  flex-col gap-2 items-center justify-center min-h-[386px]">
                <Button type="button" variant={'outline'} onClick={onClick}>
                    <PlusIcon />
                    Add Variant
                </Button>
                <div className="text-muted-foreground">
                    Click to add a new variant
                </div>
            </CardContent>
        </Card>
    );
}
