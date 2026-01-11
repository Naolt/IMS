'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, startOfDay, endOfDay } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface DataTableToolbarProps {
    onSearchChange?: (search: string) => void;
    onDateRangeChange?: (startDate?: string, endDate?: string) => void;
}

export function DataTableToolbar({
    onSearchChange,
    onDateRangeChange,
}: DataTableToolbarProps) {
    const [search, setSearch] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isOpen, setIsOpen] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange?.(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search, onSearchChange]);

    // Handle date range change
    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            // Format dates as YYYY-MM-DD and ensure end date includes the full day
            const startDate = format(startOfDay(dateRange.from), 'yyyy-MM-dd');
            const endDate = format(endOfDay(dateRange.to), 'yyyy-MM-dd');

            onDateRangeChange?.(startDate, endDate);
            // Close popover when both dates are selected
            setIsOpen(false);
        } else if (!dateRange) {
            onDateRangeChange?.(undefined, undefined);
        }
    }, [dateRange, onDateRangeChange]);

    const isFiltered = search !== '' || dateRange;

    return (
        <div className="flex items-center justify-between gap-2">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Search by product, customer, or code..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-8 w-[250px] lg:w-[350px]"
                />

                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                'h-8 border-dashed',
                                dateRange && 'border-primary'
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                                        {format(dateRange.to, 'LLL dd, y')}
                                    </>
                                ) : (
                                    format(dateRange.from, 'LLL dd, y')
                                )
                            ) : (
                                <span>Date Range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                            disabled={(date) =>
                                date > new Date() || date < new Date('2000-01-01')
                            }
                        />
                    </PopoverContent>
                </Popover>

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setSearch('');
                            setDateRange(undefined);
                        }}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
