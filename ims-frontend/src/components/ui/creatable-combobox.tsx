'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface CreatableComboboxProps {
    options: string[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    emptyText?: string;
    searchPlaceholder?: string;
    className?: string;
    disabled?: boolean;
}

export function CreatableCombobox({
    options,
    value,
    onValueChange,
    placeholder = 'Select option...',
    emptyText = 'No option found.',
    searchPlaceholder = 'Search...',
    className,
    disabled = false,
}: CreatableComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');

    const filteredOptions = React.useMemo(() => {
        if (!searchValue) return options;
        return options.filter((option) =>
            option.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [options, searchValue]);

    const canCreate = React.useMemo(() => {
        if (!searchValue) return false;
        return !options.some(
            (option) => option.toLowerCase() === searchValue.toLowerCase()
        );
    }, [options, searchValue]);

    const handleSelect = (selectedValue: string) => {
        onValueChange(selectedValue === value ? '' : selectedValue);
        setOpen(false);
        setSearchValue('');
    };

    const handleCreate = () => {
        if (searchValue.trim()) {
            onValueChange(searchValue.trim());
            setOpen(false);
            setSearchValue('');
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('w-full justify-between', className)}
                    disabled={disabled}
                >
                    {value || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        <CommandEmpty>
                            <div className="py-2 text-center text-sm">
                                {emptyText}
                            </div>
                        </CommandEmpty>
                        {filteredOptions.length > 0 && (
                            <CommandGroup>
                                {filteredOptions.map((option) => (
                                    <CommandItem
                                        key={option}
                                        value={option}
                                        onSelect={() => handleSelect(option)}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                value === option ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                        {option}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        {canCreate && (
                            <CommandGroup>
                                <CommandItem
                                    value={searchValue}
                                    onSelect={handleCreate}
                                    className="text-primary"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create &quot;{searchValue}&quot;
                                </CommandItem>
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
