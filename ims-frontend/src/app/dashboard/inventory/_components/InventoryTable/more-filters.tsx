import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/components/ui/sheet';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DualRangeSlider } from '@/components/ui/dual-range-slider';
import { useEffect, useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { useSizes, useColors } from '@/hooks/use-product-options';
import { Table } from '@tanstack/react-table';

interface MoreFiltersProps<TData> {
    table: Table<TData>;
}

export function MoreFilters<TData>({ table }: MoreFiltersProps<TData>) {
    const [values, setValues] = useState([0, 100]);
    const { data: sizesResponse } = useSizes();
    const { data: colorsResponse } = useColors();

    // Transform API data to filter options format
    const sizes = useMemo(() =>
        (sizesResponse?.data || []).map(size => ({ label: size, value: size })),
        [sizesResponse]
    );

    const colors = useMemo(() =>
        (colorsResponse?.data || []).map(color => ({ label: color, value: color })),
        [colorsResponse]
    );

    useEffect(() => {
        if (table.getColumn('buyingPrice')) {
            const column = table.getColumn('buyingPrice');
            column?.setFilterValue(values);
        }
    }, [values, table]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">More Filters</Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>More Filters</SheetTitle>
                    <SheetDescription>
                        Filter products by more criteria.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        {table.getColumn('size') && (
                            <>
                                <Label className="">Size</Label>
                                <div className="col-span-3">
                                    <DataTableFacetedFilter
                                        column={table.getColumn('size')}
                                        title="Select Size"
                                        options={sizes}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        {table.getColumn('color') && (
                            <>
                                <Label className="">Color</Label>
                                <div className="col-span-3">
                                    <DataTableFacetedFilter
                                        column={table.getColumn('color')}
                                        title="Select Color"
                                        options={colors}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="grid grid-cols-4 gap-12 mt-8">
                        {table.getColumn('buyingPrice') && (
                            <>
                                <Label className="">Price</Label>
                                <div className="col-span-3">
                                    <div className="flex flex-col gap-4 ">
                                        <DualRangeSlider
                                            label={(value) => (
                                                <span>
                                                    {formatCurrency(
                                                        value as number
                                                    )}
                                                </span>
                                            )}
                                            value={values}
                                            onValueChange={setValues}
                                            min={0}
                                            max={100}
                                            step={1}
                                        />
                                        <div className="flex justify-between">
                                            <Input
                                                placeholder="Min Price"
                                                value={values[0]}
                                                className="max-w-20"
                                                type="number"
                                                onChange={(e) =>
                                                    setValues([
                                                        Number(e.target.value),
                                                        values[1]
                                                    ])
                                                }
                                            />

                                            <Input
                                                placeholder="Max Price"
                                                value={values[1]}
                                                className="max-w-20"
                                                type="number"
                                                onChange={(e) =>
                                                    setValues([
                                                        values[0],
                                                        Number(e.target.value)
                                                    ])
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
