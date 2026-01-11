import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Table } from '@tanstack/react-table';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';

interface DataTablePaginationProps<TData> {
    table: Table<TData>;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
}

export function DataTablePagination<TData>({
    table,
    pagination,
    onPageChange,
    onPageSizeChange
}: DataTablePaginationProps<TData>) {
    const currentPage = pagination?.page || table.getState().pagination.pageIndex + 1;
    const pageSize = pagination?.limit || table.getState().pagination.pageSize;
    const totalPages = pagination?.totalPages || table.getPageCount();
    const total = pagination?.total || table.getFilteredRowModel().rows.length;

    const handlePageSizeChange = (value: string) => {
        const newSize = Number(value);
        if (onPageSizeChange) {
            onPageSizeChange(newSize);
        } else {
            table.setPageSize(newSize);
        }
    };

    const handleFirstPage = () => {
        if (onPageChange) {
            onPageChange(1);
        } else {
            table.setPageIndex(0);
        }
    };

    const handlePreviousPage = () => {
        if (onPageChange) {
            onPageChange(currentPage - 1);
        } else {
            table.previousPage();
        }
    };

    const handleNextPage = () => {
        if (onPageChange) {
            onPageChange(currentPage + 1);
        } else {
            table.nextPage();
        }
    };

    const handleLastPage = () => {
        if (onPageChange) {
            onPageChange(totalPages);
        } else {
            table.setPageIndex(table.getPageCount() - 1);
        }
    };

    const canPreviousPage = pagination ? currentPage > 1 : table.getCanPreviousPage();
    const canNextPage = pagination ? currentPage < totalPages : table.getCanNextPage();

    return (
        <div className="flex items-center justify-between px-2">
            <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{' '}
                {total} row(s) selected.
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={handlePageSizeChange}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[5, 10, 20, 30, 40, 50].map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={handleFirstPage}
                        disabled={!canPreviousPage}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={handlePreviousPage}
                        disabled={!canPreviousPage}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={handleNextPage}
                        disabled={!canNextPage}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={handleLastPage}
                        disabled={!canNextPage}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}
