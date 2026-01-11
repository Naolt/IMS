'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useUsers, useCreateUser, useUpdateUser } from '@/hooks/use-users';
import { UserRole, UserStatus, User as UserType } from '@/types/api';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState
} from '@tanstack/react-table';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { MoreHorizontal, Plus, UserPlus, Shield, UserCog, Loader2 } from 'lucide-react';

export default function UserManagementTable() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const { data: usersResponse, isLoading } = useUsers({ limit: 100 });

    const users = usersResponse?.data || [];

    const columns: ColumnDef<UserType>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                            {user.email}
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: ({ row }) => {
                const role = row.getValue('role') as string;
                return (
                    <Badge
                        variant={role === 'Admin' ? 'default' : 'secondary'}
                    >
                        {role === 'Admin' && (
                            <Shield className="mr-1 h-3 w-3" />
                        )}
                        {role}
                    </Badge>
                );
            }
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                return (
                    <Badge
                        variant={status === 'Active' ? 'default' : 'secondary'}
                        className={
                            status === 'Active'
                                ? 'bg-green-500 hover:bg-green-600'
                                : ''
                        }
                    >
                        {status}
                    </Badge>
                );
            }
        },
        {
            accessorKey: 'createdAt',
            header: 'Joined Date',
            cell: ({ row }) => {
                const date = new Date(row.getValue('createdAt'));
                return format(date, 'MMM dd, yyyy');
            }
        },
        {
            accessorKey: 'lastLogin',
            header: 'Last Login',
            cell: ({ row }) => {
                const lastLogin = row.getValue('lastLogin') as
                    | string
                    | undefined;
                if (!lastLogin) return <span className="text-muted-foreground">Never</span>;
                const date = new Date(lastLogin);
                return format(date, 'MMM dd, yyyy HH:mm');
            }
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const user = row.original;
                return <UserActions user={user} />;
            }
        }
    ];

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New User</DialogTitle>
                            <DialogDescription>
                                Create a new user account for the system
                            </DialogDescription>
                        </DialogHeader>
                        <AddUserForm
                            onClose={() => setIsAddDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column
                                                                  .columnDef
                                                                  .header,
                                                              header.getContext()
                                                          )}
                                                </TableHead>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef
                                                            .cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function UserActions({ user }: { user: UserType }) {
    const { mutate: updateUser, isPending } = useUpdateUser();

    const handleToggleRole = () => {
        const newRole = user.role === UserRole.ADMIN ? UserRole.STAFF : UserRole.ADMIN;
        updateUser({ id: user.id, data: { role: newRole } });
    };

    const handleToggleStatus = () => {
        const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
        updateUser({ id: user.id, data: { status: newStatus } });
    };

    const handleResetPassword = () => {
        console.log('Reset password for user:', user.id);
        // TODO: Implement password reset dialog
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleToggleRole} disabled={isPending}>
                    <UserCog className="mr-2 h-4 w-4" />
                    Change to {user.role === UserRole.ADMIN ? 'Staff' : 'Admin'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleStatus} disabled={isPending}>
                    {user.status === UserStatus.ACTIVE ? 'Deactivate' : 'Activate'} User
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleResetPassword} disabled={isPending}>
                    Reset Password
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function AddUserForm({ onClose }: { onClose: () => void }) {
    const { mutate: createUser, isPending } = useCreateUser();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const userData = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            role: formData.get('role') as string,
            password: formData.get('password') as string
        };

        createUser(userData, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="Enter full name"
                    required
                    disabled={isPending}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    required
                    disabled={isPending}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" required disabled={isPending}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter temporary password"
                    required
                    disabled={isPending}
                />
            </div>
            <DialogFooter>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isPending}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Adding User...' : 'Add User'}
                </Button>
            </DialogFooter>
        </form>
    );
}
