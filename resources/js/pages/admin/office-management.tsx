import { Head } from '@inertiajs/react';
import { useState } from 'react';
import OfficeTab from '@/components/admin/OfficeTab';
import PositionTab from '@/components/admin/PositionTab';
import UserTab from '@/components/admin/UserTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { adminDashboard, officeManagement } from '@/routes';
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
    offices: string[];
    position: string;
    roles: string[];
    status: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: adminDashboard().url,
    },
    {
        title: 'Office Management',
        href: officeManagement().url,
    },
];

export default function OfficeManagement() {
    const [offices, setOffices] = useState<Office[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    // Office handlers
    const handleAddOffice = (office: Office) => {
        setOffices([...offices, office]);
    };

    const handleEditOffice = (officeId: number, newName: string) => {
        setOffices(offices.map(office =>
            office.id === officeId ? { ...office, name: newName } : office
        ));
    };

    const handleDeleteOffice = (officeId: number) => {
        setOffices(offices.filter(office => office.id !== officeId));
    };

    // Position handlers
    const handleAddPosition = (position: Position) => {
        setPositions([...positions, position]);
    };

    const handleEditPosition = (positionId: number, newName: string) => {
        setPositions(positions.map(position =>
            position.id === positionId ? { ...position, name: newName } : position
        ));
    };

    const handleDeletePosition = (positionId: number) => {
        setPositions(positions.filter(position => position.id !== positionId));
    };

    // User handlers
    const handleAddUser = (user: User) => {
        setUsers([...users, user]);
    };

    const handleEditUser = (userId: number, userUpdates: Omit<User, 'id'>) => {
        setUsers(users.map(user =>
            user.id === userId
                ? { ...user, ...userUpdates }
                : user
        ));
    };

    const handleDeleteUser = (userId: number) => {
        setUsers(users.filter(user => user.id !== userId));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Office Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-3xl font-bold">Office Management</h1>
                <Tabs defaultValue="office" className="w-full">
                    <TabsList>
                        <TabsTrigger value="office">Office</TabsTrigger>
                        <TabsTrigger value="positions">Positions</TabsTrigger>
                        <TabsTrigger value="users">Users</TabsTrigger>
                    </TabsList>

                    <TabsContent value="office">
                        <OfficeTab
                            offices={offices}
                            onAddOffice={handleAddOffice}
                            onEditOffice={handleEditOffice}
                            onDeleteOffice={handleDeleteOffice}
                        />
                    </TabsContent>

                    <TabsContent value="positions">
                        <PositionTab
                            positions={positions}
                            onAddPosition={handleAddPosition}
                            onEditPosition={handleEditPosition}
                            onDeletePosition={handleDeletePosition}
                        />
                    </TabsContent>

                    <TabsContent value="users">
                        <UserTab
                            users={users}
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
