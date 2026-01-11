'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface DateRangePickerProps {
    value?: DateRange;
    onChange?: (range: DateRange | undefined) => void;
    className?: string;
    placeholder?: string;
}

export function DateRangePicker({
    value,
    onChange,
    className,
    placeholder = 'Pick a date range',
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(value);

    // Sync external value changes
    useEffect(() => {
        setDateRange(value);
    }, [value]);

    // Handle date selection
    const handleSelect = (range: DateRange | undefined) => {
        setDateRange(range);

        // Auto-close when both dates are selected
        if (range?.from && range?.to) {
            setIsOpen(false);
            onChange?.(range);
        } else if (!range) {
            onChange?.(undefined);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'justify-start text-left font-normal',
                        !dateRange && 'text-muted-foreground',
                        className
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
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleSelect}
                    numberOfMonths={2}
                    disabled={(date) =>
                        date > new Date() || date < new Date('2000-01-01')
                    }
                />
            </PopoverContent>
        </Popover>
    );
}
