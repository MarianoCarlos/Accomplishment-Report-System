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
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    // ===== OFFICE HANDLERS =====
    const handleAddOffice = (office: { name: string }) => {
        router.post(storeOffice().url, { name: office.name });
    };

    const handleEditOffice = (officeId: number, newName: string) => {
        router.put(updateOffice(officeId).url, { name: newName });
    };

    const handleDeleteOffice = (officeId: number) => {
        router.delete(destroyOffice(officeId).url);
    };

    // ===== POSITION HANDLERS =====
    const handleAddPosition = (position: { name: string }) => {
        router.post(storePosition().url, { name: position.name });
    };

    const handleEditPosition = (positionId: number, newName: string) => {
        router.put(updatePosition(positionId).url, { name: newName });
    };

    const handleDeletePosition = (positionId: number) => {
        router.delete(destroyPosition(positionId).url);
    };

    // ===== USER HANDLERS =====
    const handleAddUser = (user: Omit<User, 'id'>) => {
        router.post(storeUser().url, user);
    };

    const handleEditUser = (userId: number, user: Omit<User, 'id'>) => {
        router.put(updateUser(userId).url, user);
    };

    const handleDeleteUser = (userId: number) => {
        router.delete(destroyUser(userId).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Office Management" />
            <div className="space-y-4 p-4">
                <h1 className="text-3xl font-bold">Office Management</h1>

                <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as 'office' | 'positions' | 'users')} className="w-full">
                    <TabsList>
                        <TabsTrigger value="office">Offices</TabsTrigger>
                        <TabsTrigger value="positions">Positions</TabsTrigger>
                        <TabsTrigger value="users">Users</TabsTrigger>
                    </TabsList>

                    {/* Offices Tab */}
                    <TabsContent value="office">
                        <OfficeTab
                            offices={offices}
                            paginationRoute={officeManagement().url}
                            paginationQuery={{ tab: 'office' }}
                            onAddOffice={(office) =>
                                handleAddOffice({ name: office.name })
                            }
                            onEditOffice={handleEditOffice}
                            onDeleteOffice={handleDeleteOffice}
                        />
                    </TabsContent>

                    {/* Positions Tab */}
                    <TabsContent value="positions">
                        <PositionTab
                            positions={positions}
                            paginationRoute={officeManagement().url}
                            paginationQuery={{ tab: 'positions' }}
                            onAddPosition={(position) =>
                                handleAddPosition({ name: position.name })
                            }
                            onEditPosition={handleEditPosition}
                            onDeletePosition={handleDeletePosition}
                        />
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users">
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
                </Tabs>
            </div>
        </AppLayout>
    );
}
