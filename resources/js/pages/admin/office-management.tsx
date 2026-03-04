import { Head, router } from '@inertiajs/react';
import OfficeTab from '@/components/admin/OfficeTab';
import PositionTab from '@/components/admin/PositionTab';
import UserTab from '@/components/admin/UserTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

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
}

interface Props {
    offices: Office[];
    positions: Position[];
    users: User[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Office Management', href: '/admin/office-management' },
];

export default function OfficeManagement({
    offices,
    positions,
    users,
}: Props) {
    // ===== OFFICE HANDLERS =====
    const handleAddOffice = (office: { name: string }) => {
        router.post('/offices', { name: office.name });
    };

    const handleEditOffice = (officeId: number, newName: string) => {
        router.put(`/offices/${officeId}`, { name: newName });
    };

    const handleDeleteOffice = (officeId: number) => {
        router.delete(`/offices/${officeId}`);
    };

    // ===== POSITION HANDLERS =====
    const handleAddPosition = (position: { name: string }) => {
        router.post('/positions', { name: position.name });
    };

    const handleEditPosition = (positionId: number, newName: string) => {
        router.put(`/positions/${positionId}`, { name: newName });
    };

    const handleDeletePosition = (positionId: number) => {
        router.delete(`/positions/${positionId}`);
    };

    // ===== USER HANDLERS =====
    const handleAddUser = (user: Omit<User, 'id'>) => {
        router.post('/admin/users', user);
    };

    const handleEditUser = (userId: number, user: Omit<User, 'id'>) => {
        router.put(`/admin/users/${userId}`, user);
    };

    const handleDeleteUser = (userId: number) => {
        router.delete(`/admin/users/${userId}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Office Management" />
            <div className="space-y-4 p-4">
                <h1 className="text-3xl font-bold">Office Management</h1>

                <Tabs defaultValue="office" className="w-full">
                    <TabsList>
                        <TabsTrigger value="office">Offices</TabsTrigger>
                        <TabsTrigger value="positions">Positions</TabsTrigger>
                        <TabsTrigger value="users">Users</TabsTrigger>
                    </TabsList>

                    {/* Offices Tab */}
                    <TabsContent value="office">
                        <OfficeTab
                            offices={offices}
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
                            positions={positions}
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
