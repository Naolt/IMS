'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProducts } from '@/hooks/use-products';
import { useCreateSale } from '@/hooks/use-sales';
import { formatCurrency } from '@/lib/utils';

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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { CheckCircle2, CalendarIcon, AlertTriangle, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const saleSchema = z.object({
    variantId: z.string().min(1, 'Please select a product and variant'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    customerName: z.string().optional(),
    notes: z.string().optional(),
    useCustomPrice: z.boolean().default(false),
    customPrice: z.number().optional(),
    saleDate: z.date().optional()
}).refine((data) => {
    if (data.useCustomPrice && (!data.customPrice || data.customPrice <= 0)) {
        return false;
    }
    return true;
}, {
    message: 'Custom price must be greater than 0',
    path: ['customPrice']
});

type SaleFormData = z.infer<typeof saleSchema>;

export default function RecordSaleForm() {
    const [success, setSuccess] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [selectedVariantId, setSelectedVariantId] = useState<string>('');
    const [productComboOpen, setProductComboOpen] = useState(false);
    const { data: productsResponse, isLoading: loadingProducts } = useProducts({ limit: 100 });
    const { mutate: createSale, isPending } = useCreateSale();

    const form = useForm<SaleFormData>({
        resolver: zodResolver(saleSchema),
        defaultValues: {
            variantId: '',
            quantity: 1,
            customerName: '',
            notes: '',
            useCustomPrice: false,
            customPrice: undefined,
            saleDate: new Date()
        }
    });

    const watchQuantity = form.watch('quantity');
    const watchUseCustomPrice = form.watch('useCustomPrice');
    const watchCustomPrice = form.watch('customPrice');

    // Get available variants for selected product
    const availableVariants = useMemo(() => {
        if (!selectedProductId || !productsResponse?.data) return [];
        const product = productsResponse.data.find((p) => p.id === selectedProductId);
        return product?.variants || [];
    }, [selectedProductId, productsResponse]);

    // Get selected variant details
    const selectedVariant = useMemo(() => {
        if (!selectedVariantId || !availableVariants.length) return null;
        return availableVariants.find((v) => v.id === selectedVariantId);
    }, [selectedVariantId, availableVariants]);

    // Calculate total amount
    const totalAmount = useMemo(() => {
        if (!selectedVariant || !watchQuantity) return 0;
        const price = watchUseCustomPrice && watchCustomPrice
            ? watchCustomPrice
            : selectedVariant.sellingPrice;
        return price * watchQuantity;
    }, [selectedVariant, watchQuantity, watchUseCustomPrice, watchCustomPrice]);

    // Get stock status
    const stockStatus = useMemo(() => {
        if (!selectedVariant) return null;
        if (selectedVariant.stockQuantity === 0) return 'Out of Stock';
        if (selectedVariant.stockQuantity <= selectedVariant.minStockQuantity) return 'Low Stock';
        return 'In Stock';
    }, [selectedVariant]);

    // Validate quantity against stock
    const quantityError = useMemo(() => {
        if (!selectedVariant || !watchQuantity) return null;
        if (watchQuantity > selectedVariant.stockQuantity) {
            return `Insufficient stock. Available: ${selectedVariant.stockQuantity}`;
        }
        return null;
    }, [selectedVariant, watchQuantity]);

    const handleProductChange = (productId: string) => {
        setSelectedProductId(productId);
        setSelectedVariantId('');
        form.setValue('variantId', '');
    };

    const handleVariantChange = (variantId: string) => {
        setSelectedVariantId(variantId);
        form.setValue('variantId', variantId);

        // Set custom price to selling price if enabled
        const variant = availableVariants.find(v => v.id === variantId);
        if (variant && watchUseCustomPrice) {
            form.setValue('customPrice', variant.sellingPrice);
        }
    };

    // Update custom price when toggled
    useEffect(() => {
        if (watchUseCustomPrice && selectedVariant) {
            form.setValue('customPrice', selectedVariant.sellingPrice);
        } else {
            form.setValue('customPrice', undefined);
        }
    }, [watchUseCustomPrice, selectedVariant, form]);

    async function onSubmit(values: SaleFormData) {
        createSale(
            {
                variantId: values.variantId,
                quantity: values.quantity,
                customerName: values.customerName,
                notes: values.notes,
                customPrice: values.useCustomPrice ? values.customPrice : undefined,
                saleDate: values.saleDate ? values.saleDate.toISOString() : undefined
            },
            {
                onSuccess: () => {
                    setSuccess(true);
                    setTimeout(() => {
                        setSuccess(false);
                        form.reset();
                        setSelectedProductId('');
                        setSelectedVariantId('');
                        setProductComboOpen(false);
                    }, 2000);
                },
            }
        );
    }

    if (success) {
        return (
            <Card className="max-w-2xl">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-2xl font-semibold mb-2">
                        Sale Recorded Successfully!
                    </h3>
                    <p className="text-muted-foreground">
                        The sale has been recorded and stock has been updated.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-6xl">
            <CardHeader>
                <CardTitle>Record New Sale</CardTitle>
                <CardDescription>
                    Select a product and enter the sale details
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Product Selection & Quantity */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                                    Product
                                </label>
                                <Popover open={productComboOpen} onOpenChange={setProductComboOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={productComboOpen}
                                            className="w-full justify-between"
                                            disabled={isPending || loadingProducts}
                                        >
                                            {selectedProductId
                                                ? productsResponse?.data.find((p) => p.id === selectedProductId)?.name
                                                : "Search products..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search products by name or code..." />
                                            <CommandList>
                                                <CommandEmpty>No product found.</CommandEmpty>
                                                <CommandGroup>
                                                    {productsResponse?.data.map((product) => (
                                                        <CommandItem
                                                            key={product.id}
                                                            value={`${product.name} ${product.code}`}
                                                            onSelect={() => {
                                                                handleProductChange(product.id);
                                                                setProductComboOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedProductId === product.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{product.name}</span>
                                                                <span className="text-xs text-muted-foreground">Code: {product.code}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <FormField
                                control={form.control}
                                name="variantId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Variant (Size & Color)</FormLabel>
                                        <Select
                                            onValueChange={handleVariantChange}
                                            value={field.value}
                                            disabled={
                                                isPending ||
                                                availableVariants.length === 0
                                            }
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a variant" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {availableVariants.map((variant) => {
                                                    const isOutOfStock = variant.stockQuantity === 0;
                                                    const isLowStock = variant.stockQuantity <= variant.minStockQuantity && variant.stockQuantity > 0;

                                                    return (
                                                        <SelectItem
                                                            key={variant.id}
                                                            value={variant.id}
                                                            disabled={isOutOfStock}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span>
                                                                    {variant.size} - {variant.color}
                                                                    (Stock: {variant.stockQuantity})
                                                                </span>
                                                                {isOutOfStock && (
                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                                                        Out of Stock
                                                                    </span>
                                                                )}
                                                                {isLowStock && (
                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                                                                        Low Stock
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {selectedVariant && (
                                <div className="p-4 bg-muted rounded-lg space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Regular Price:</span>
                                        <span className="font-medium">{formatCurrency(selectedVariant.sellingPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Available Stock:</span>
                                        <span className="font-medium">{selectedVariant.stockQuantity}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Stock Status:</span>
                                        <span className={cn(
                                            "font-medium",
                                            stockStatus === 'Out of Stock' && "text-red-600",
                                            stockStatus === 'Low Stock' && "text-yellow-600",
                                            stockStatus === 'In Stock' && "text-green-600"
                                        )}>
                                            {stockStatus}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                max={selectedVariant?.stockQuantity}
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        Number(e.target.value)
                                                    )
                                                }
                                                disabled={isPending || !selectedVariant}
                                            />
                                        </FormControl>
                                        {selectedVariant && (
                                            <FormDescription>
                                                Max available: {selectedVariant.stockQuantity}
                                            </FormDescription>
                                        )}
                                        {quantityError && (
                                            <div className="flex items-center gap-2 text-sm text-red-600 mt-1">
                                                <AlertTriangle className="h-4 w-4" />
                                                {quantityError}
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Right Column - Pricing, Date, Customer Info & Actions */}
                        <div className="space-y-4">
                            {selectedVariant && watchQuantity > 0 && (
                                <div className="p-6 bg-primary/10 rounded-lg border-2 border-primary/20">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
                                        <span className="text-3xl font-bold text-primary">
                                            {formatCurrency(totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="useCustomPrice"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isPending || !selectedVariant}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Use Custom Price
                                            </FormLabel>
                                            <FormDescription>
                                                Apply a discount or special price for this sale
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {watchUseCustomPrice && (
                                <FormField
                                    control={form.control}
                                    name="customPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Custom Price</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    {...field}
                                                    value={field.value || ''}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value ? Number(e.target.value) : undefined
                                                        )
                                                    }
                                                    disabled={isPending}
                                                />
                                            </FormControl>
                                            {selectedVariant && field.value && field.value < selectedVariant.sellingPrice && (
                                                <FormDescription className="text-green-600">
                                                    Discount: {formatCurrency(selectedVariant.sellingPrice - field.value)}
                                                    ({(((selectedVariant.sellingPrice - field.value) / selectedVariant.sellingPrice) * 100).toFixed(1)}% off)
                                                </FormDescription>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="saleDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Sale Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                        disabled={isPending}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>
                                            Date when the sale occurred
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="customerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Name (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter customer name"
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Any additional notes"
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        form.reset();
                                        setSelectedProductId('');
                                        setSelectedVariantId('');
                                        setProductComboOpen(false);
                                    }}
                                    disabled={isPending}
                                >
                                    Clear
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={isPending || !!quantityError || !selectedVariant}
                                >
                                    {isPending ? 'Recording Sale...' : 'Record Sale'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </form>
            </Form>
        </Card>
    );
}
