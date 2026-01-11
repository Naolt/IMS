import UserManagementTable from './_components/UserManagementTable';

export default function UsersPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage system users and their roles
                    </p>
                </div>
            </div>
            <UserManagementTable />
        </div>
    );
}
