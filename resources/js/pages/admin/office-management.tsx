'use client';

import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import OfficeCard from '@/components/Admin/OfficeCard/OfficeCard';
import OfficeFormModal from '@/components/Admin/OfficeFormModal/OfficeFormModal';
import PersonFormModal from '@/components/Admin/PersonFormModal/PersonFormModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { adminDashboard, officeManagement } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: adminDashboard().url },
    { title: 'Office Management', href: officeManagement().url },
];

interface User {
    id: number;
    name: string;
    position: string;
    email: string;
    role: string;
}

interface Signatory {
    id: number;
    name: string;
    position: string;
    email: string;
    role: string;
}

interface Office {
    id: number;
    name: string;
    users?: User[];
    signatories?: Signatory[];
}

type ModalState = {
    type: 'none' | 'user' | 'signatory';
    isEdit: boolean;
    officeId: number | null;
    data: User | Signatory | null;
};

export default function OfficeManagement() {
    const [offices, setOffices] = useState<Office[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOfficeOpen, setIsCreateOfficeOpen] = useState(false);
    const [isEditOfficeOpen, setIsEditOfficeOpen] = useState(false);
    const [editingOffice, setEditingOffice] = useState<Office | null>(null);
    const [expandedOfficeId, setExpandedOfficeId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<{ [key: number]: 'users' | 'signatories' }>({});
    const [modalState, setModalState] = useState<ModalState>({ type: 'none', isEdit: false, officeId: null, data: null });

    // Office Management
    const addOffice = (name: string) => {
        const newOffice: Office = {
            id: Math.max(...offices.map(o => o.id), 0) + 1,
            name,
        };
        setOffices([...offices, newOffice]);
    };

    const updateOffice = (name: string) => {
        if (!editingOffice) return;
        setOffices(offices.map(o =>
            o.id === editingOffice.id ? { ...o, name } : o
        ));
        setEditingOffice(null);
        setIsEditOfficeOpen(false);
    };

    const deleteOffice = (id: number) => {
        setOffices(offices.filter(o => o.id !== id));
    };

    const startEditOffice = (office: Office) => {
        setEditingOffice(office);
        setIsEditOfficeOpen(true);
    };

    // Modal Management
    const openModal = (type: 'user' | 'signatory', officeId: number, data: User | Signatory | null = null) => {
        setModalState({ type, isEdit: !!data, officeId, data });
    };

    const closeModal = () => {
        setModalState({ type: 'none', isEdit: false, officeId: null, data: null });
    };

    // User Management
    const updateOfficeUsers = (officeId: number, updater: (users: User[]) => User[]) => {
        setOffices(offices.map(office =>
            office.id === officeId ? { ...office, users: updater(office.users || []) } : office
        ));
    };

    const handleSaveUser = (name: string, position: string, email: string, role: string) => {
        if (!modalState.officeId) return;
        if (modalState.isEdit) {
            const user = modalState.data as User;
            updateOfficeUsers(modalState.officeId, users =>
                users.map(u => u.id === user.id ? { ...u, name, position, email, role } : u)
            );
        } else {
            updateOfficeUsers(modalState.officeId, users => [
                ...users,
                { id: Math.max(...users.map(u => u.id), 0) + 1, name, position, email, role }
            ]);
        }
        closeModal();
    };

    const handleDeleteUser = (officeId: number, userId: number) => {
        updateOfficeUsers(officeId, users => users.filter(u => u.id !== userId));
    };

    // Signatory Management
    const updateOfficeSignatories = (officeId: number, updater: (signatories: Signatory[]) => Signatory[]) => {
        setOffices(offices.map(office =>
            office.id === officeId ? { ...office, signatories: updater(office.signatories || []) } : office
        ));
    };

    const handleSaveSignatory = (name: string, position: string, email: string, role: string) => {
        if (!modalState.officeId) return;
        if (modalState.isEdit) {
            const signatory = modalState.data as Signatory;
            updateOfficeSignatories(modalState.officeId, signatories =>
                signatories.map(s => s.id === signatory.id ? { ...s, name, position, email, role } : s)
            );
        } else {
            updateOfficeSignatories(modalState.officeId, signatories => [
                ...signatories,
                { id: Math.max(...signatories.map(s => s.id), 0) + 1, name, position, email, role }
            ]);
        }
        closeModal();
    };

    const handleDeleteSignatory = (officeId: number, signatoryId: number) => {
        updateOfficeSignatories(officeId, signatories => signatories.filter(s => s.id !== signatoryId));
    };

    const filteredOffices = offices.filter(office =>
        office.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Office Management" />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <Card className="flex flex-1 flex-col">
                        <CardHeader className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Offices</CardTitle>
                                    <CardDescription>Manage your organization's offices</CardDescription>
                                </div>
                                <Button onClick={() => setIsCreateOfficeOpen(true)} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Office
                                </Button>
                            </div>
                            <Input
                                placeholder="Search offices..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto">
                            <div className="grid gap-4">
                                {filteredOffices.map((office) => (
                                    <OfficeCard
                                        key={office.id}
                                        office={office}
                                        isExpanded={expandedOfficeId === office.id}
                                        activeTab={(activeTab[office.id] || 'users') as 'users' | 'signatories'}
                                        onToggleExpand={() =>
                                            setExpandedOfficeId(expandedOfficeId === office.id ? null : office.id)
                                        }
                                        onChangeTab={(officeId, tab) =>
                                            setActiveTab({ ...activeTab, [officeId]: tab })
                                        }
                                        onEdit={startEditOffice}
                                        onCreateUser={() => openModal('user', office.id)}
                                        onCreateSignatory={() => openModal('signatory', office.id)}
                                        onEditUser={(officeId, user) => openModal('user', officeId, user)}
                                        onEditSignatory={(officeId, sig) => openModal('signatory', officeId, sig)}
                                        onDeleteUser={handleDeleteUser}
                                        onDeleteSignatory={handleDeleteSignatory}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>

            {/* Office Form Modals */}
            <OfficeFormModal
                isOpen={isCreateOfficeOpen}
                onClose={() => setIsCreateOfficeOpen(false)}
                onConfirm={(name) => {
                    addOffice(name);
                    setIsCreateOfficeOpen(false);
                }}
            />

            <OfficeFormModal
                isOpen={isEditOfficeOpen}
                office={editingOffice}
                onClose={() => setIsEditOfficeOpen(false)}
                onConfirm={(name) => {
                    updateOffice(name);
                    setIsEditOfficeOpen(false);
                }}
                onDelete={() => {
                    if (editingOffice) {
                        deleteOffice(editingOffice.id);
                        setIsEditOfficeOpen(false);
                    }
                }}
            />

            {/* User Form Modal */}
            <PersonFormModal
                isOpen={modalState.type === 'user'}
                itemName="User"
                onClose={closeModal}
                person={modalState.type === 'user' && modalState.isEdit ? (modalState.data as User) : null}
                officeId={modalState.officeId || undefined}
                roleOptions={[
                    { value: 'admin', label: 'Admin' },
                    { value: 'employee', label: 'Employee' },
                ]}
                onConfirm={handleSaveUser}
                onDelete={handleDeleteUser}
            />

            {/* Signatory Form Modal */}
            <PersonFormModal
                isOpen={modalState.type === 'signatory'}
                itemName="Signatory"
                onClose={closeModal}
                person={modalState.type === 'signatory' && modalState.isEdit ? (modalState.data as Signatory) : null}
                officeId={modalState.officeId || undefined}
                roleOptions={[
                    { value: 'reviewer', label: 'Reviewer' },
                    { value: 'approver', label: 'Approver' },
                ]}
                onConfirm={handleSaveSignatory}
                onDelete={handleDeleteSignatory}
            />
        </>
    );
}
