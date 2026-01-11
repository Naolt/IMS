'use client';

import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from './data-table-view-options';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { stockOptions } from './data';
import { MoreFilters } from './more-filters';
import { useCategories, useBrands } from '@/hooks/use-product-options';

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    onSearchChange?: (search: string) => void;
    onCategoryChange?: (category: string) => void;
    onBrandChange?: (brand: string) => void;
}

export function DataTableToolbar<TData>({
    table,
    onSearchChange,
    onCategoryChange,
    onBrandChange
}: DataTableToolbarProps<TData>) {
    const [searchValue, setSearchValue] = useState('');
    const { data: categoriesResponse } = useCategories();
    const { data: brandsResponse } = useBrands();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange?.(searchValue);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchValue, onSearchChange]);

    // Transform API data to filter options format
    const categories = useMemo(() =>
        (categoriesResponse?.data || []).map(cat => ({ label: cat, value: cat })),
        [categoriesResponse]
    );

    const brands = useMemo(() =>
        (brandsResponse?.data || []).map(brand => ({ label: brand, value: brand })),
        [brandsResponse]
    );

    const isFiltered = table.getState().columnFilters.length > 0;

    const handleCategoryFilter = (values: string[]) => {
        const column = table.getColumn('productCategory');
        column?.setFilterValue(values.length > 0 ? values : undefined);
        onCategoryChange?.(values[0] || '');
    };

    const handleBrandFilter = (values: string[]) => {
        const column = table.getColumn('productBrand');
        column?.setFilterValue(values.length > 0 ? values : undefined);
        onBrandChange?.(values[0] || '');
    };

    const handleReset = () => {
        setSearchValue('');
        table.resetColumnFilters();
        onSearchChange?.('');
        onCategoryChange?.('');
        onBrandChange?.('');
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Search products..."
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn('productCategory') && (
                    <DataTableFacetedFilter
                        column={table.getColumn('productCategory')}
                        title="Category"
                        options={categories}
                    />
                )}
                {table.getColumn('productBrand') && (
                    <DataTableFacetedFilter
                        column={table.getColumn('productBrand')}
                        title="Brand"
                        options={brands}
                    />
                )}
                {table.getColumn('stockStatus') && (
                    <DataTableFacetedFilter
                        column={table.getColumn('stockStatus')}
                        title="Stock"
                        options={stockOptions}
                    />
                )}
                <MoreFilters table={table} />
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X />
                    </Button>
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
    );
}
