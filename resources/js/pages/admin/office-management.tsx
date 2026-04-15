import { Head, router } from '@inertiajs/react';
import OfficeTab from '@/components/admin/OfficeTab';
import PositionTab from '@/components/admin/PositionTab';
import UserTab from '@/components/admin/UserTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { adminDashboard } from '@/routes';
import { officeManagement } from '@/routes/admin';
import { store as storeOffice, update as updateOffice, destroy as destroyOffice } from '@/routes/offices';
import { store as storePosition, update as updatePosition, destroy as destroyPosition } from '@/routes/positions';
import { store as storeUser, update as updateUser, destroy as destroyUser } from '@/routes/users';
import type { BreadcrumbItem, PaginatedData } from '@/types';

interface Office {
    id: number;
    name: string;
}

interface Position {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    position_id?: number;
    office_id?: number;
}

interface Props {
    offices: PaginatedData<Office>;
    positions: PaginatedData<Position>;
    users: PaginatedData<User>;
    activeTab?: 'office' | 'positions' | 'users';
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: adminDashboard().url },
    { title: 'Office Management', href: officeManagement().url },
];

export default function OfficeManagement({
    offices,
    positions,
    users,
    activeTab = 'office',
}: Props) {
    const handleTabChange = (tab: 'office' | 'positions' | 'users') => {
        router.get(
            officeManagement().url,
            { tab },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const handleAddOffice    = (office: { name: string }) => router.post(storeOffice().url, { name: office.name });
    const handleEditOffice   = (id: number, name: string) => router.put(updateOffice(id).url, { name });
    const handleDeleteOffice = (id: number)               => router.delete(destroyOffice(id).url);

    const handleAddPosition    = (p: { name: string }) => router.post(storePosition().url, { name: p.name });
    const handleEditPosition   = (id: number, name: string) => router.put(updatePosition(id).url, { name });
    const handleDeletePosition = (id: number)               => router.delete(destroyPosition(id).url);

    const handleAddUser    = (u: Omit<User, 'id'>) => router.post(storeUser().url, u);
    const handleEditUser   = (id: number, u: Omit<User, 'id'>) => router.put(updateUser(id).url, u);
    const handleDeleteUser = (id: number) => router.delete(destroyUser(id).url);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Office Management" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Page heading */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Office Management</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage offices, positions, and user accounts.
                    </p>
                </div>

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={(v) => handleTabChange(v as 'office' | 'positions' | 'users')}
                    className="w-full"
                >
                    <TabsList className="h-10 rounded-lg bg-gray-100 p-1">
                        <TabsTrigger value="office"    className="rounded-md px-4 text-sm font-medium">Offices</TabsTrigger>
                        <TabsTrigger value="positions" className="rounded-md px-4 text-sm font-medium">Positions</TabsTrigger>
                        <TabsTrigger value="users"     className="rounded-md px-4 text-sm font-medium">Users</TabsTrigger>
                    </TabsList>

                    <div className="mt-4 rounded-xl border bg-white shadow-sm">
                        <TabsContent value="office" className="p-5">
                            <OfficeTab
                                offices={offices}
                                paginationRoute={officeManagement().url}
                                paginationQuery={{ tab: 'office' }}
                                onAddOffice={(o) => handleAddOffice({ name: o.name })}
                                onEditOffice={handleEditOffice}
                                onDeleteOffice={handleDeleteOffice}
                            />
                        </TabsContent>

                        <TabsContent value="positions" className="p-5">
                            <PositionTab
                                positions={positions}
                                paginationRoute={officeManagement().url}
                                paginationQuery={{ tab: 'positions' }}
                                onAddPosition={(p) => handleAddPosition({ name: p.name })}
                                onEditPosition={handleEditPosition}
                                onDeletePosition={handleDeletePosition}
                            />
                        </TabsContent>

                        <TabsContent value="users" className="p-5">
                            <UserTab
                                users={users}
                                paginationRoute={officeManagement().url}
                                paginationQuery={{ tab: 'users' }}
                                positions={positions.data}
                                offices={offices.data}
                                onAddUser={handleAddUser}
                                onEditUser={handleEditUser}
                                onDeleteUser={handleDeleteUser}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </AppLayout>
    );
}
