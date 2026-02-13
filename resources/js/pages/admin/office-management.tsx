import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import OfficeList from '@/components/OfficeManagement/OfficeList';
import OfficeModal from '@/components/OfficeManagement/OfficeModal';
import OfficeSummaryCards from '@/components/OfficeManagement/OfficeSummaryCards';
import OfficeTabs from '@/components/OfficeManagement/OfficeTabs';
import SignatoryModal from '@/components/OfficeManagement/SignatoryModal';
import UserModal from '@/components/OfficeManagement/UserModal';
import UserTable from '@/components/OfficeManagement/UserTable';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { adminDashboard, officeManagement } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: adminDashboard().url },
    { title: 'Office Management', href: officeManagement().url },
];

type Signatory = {
    id: number;
    name: string;
    position: string;
    role: 'Reviewer' | 'Approver';
};

type SignatoryForm = {
    name: string;
    position: string;
    role: 'Reviewer' | 'Approver';
};

type OfficeForm = {
    name: string;
};

type UserForm = {
    name: string;
    email: string;
    position: string;
    office: number | '';
    role: 'Admin' | 'Staff';
};

type Office = {
    id: number;
    name: string;
    signatories: Signatory[];
};

type User = {
    id: number;
    name: string;
    email: string;
    position: string;
    office: number | '';
    role: 'Admin' | 'Staff';
    status: 'Active' | 'Inactive';
};

export default function OfficeManagement() {
    const [activeTab, setActiveTab] = useState<'offices' | 'users'>('offices');
    const [expandedOffice, setExpandedOffice] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
    const [editingOfficeId, setEditingOfficeId] = useState<number | null>(null);
    const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(
        null,
    );
    const [editingSignatoryId, setEditingSignatoryId] = useState<number | null>(
        null,
    );
    const [newSignatory, setNewSignatory] = useState<SignatoryForm>({
        name: '',
        position: '',
        role: 'Reviewer',
    });
    const [newOffice, setNewOffice] = useState<OfficeForm>({
        name: '',
    });
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [newUser, setNewUser] = useState<UserForm>({
        name: '',
        email: '',
        position: '',
        office: '',
        role: 'Staff',
    });

    // 🔹 Static Sample Data (UI Only)
    const [offices, setOffices] = useState<Office[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    // 🔹 Memoized Totals
    const totalSignatories = useMemo(
        () =>
            offices.reduce((acc, office) => acc + office.signatories.length, 0),
        [offices],
    );

    const handleAddSignatory = () => {
        if (!selectedOfficeId) return;

        if (editingSignatoryId !== null) {
            // Update existing signatory
            setOffices((prev) =>
                prev.map((office) =>
                    office.id === selectedOfficeId
                        ? {
                              ...office,
                              signatories: office.signatories.map((sig) =>
                                  sig.id === editingSignatoryId
                                      ? {
                                            ...sig,
                                            ...newSignatory,
                                        }
                                      : sig,
                              ),
                          }
                        : office,
                ),
            );
        } else {
            // Add new signatory
            setOffices((prev) =>
                prev.map((office) =>
                    office.id === selectedOfficeId
                        ? {
                              ...office,
                              signatories: [
                                  ...office.signatories,
                                  {
                                      id: Date.now(),
                                      ...newSignatory,
                                  },
                              ],
                          }
                        : office,
                ),
            );
        }

        setNewSignatory({
            name: '',
            position: '',
            role: 'Reviewer',
        });
        setEditingSignatoryId(null);
        setIsModalOpen(false);
    };

    const handleDeleteSignatory = (officeId: number, signatoryId: number) => {
        setOffices((prev) =>
            prev.map((office) =>
                office.id === officeId
                    ? {
                          ...office,
                          signatories: office.signatories.filter(
                              (sig) => sig.id !== signatoryId,
                          ),
                      }
                    : office,
            ),
        );
    };

    const handleAddOffice = () => {
        if (!newOffice.name.trim()) return;

        if (editingOfficeId !== null) {
            // Update existing office
            setOffices((prev) =>
                prev.map((office) =>
                    office.id === editingOfficeId
                        ? {
                              ...office,
                              name: newOffice.name,
                          }
                        : office,
                ),
            );
        } else {
            // Add new office
            setOffices((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    name: newOffice.name,
                    signatories: [],
                },
            ]);
        }

        setNewOffice({ name: '' });
        setEditingOfficeId(null);
        setIsOfficeModalOpen(false);
    };

    const handleEditOffice = (office: Office) => {
        setEditingOfficeId(office.id);
        setNewOffice({ name: office.name });
        setIsOfficeModalOpen(true);
    };

    const handleDeleteOffice = (officeId: number) => {
        setOffices((prev) => prev.filter((office) => office.id !== officeId));
        // Reset related state if the deleted office was selected
        if (selectedOfficeId === officeId) {
            setSelectedOfficeId(null);
        }
        if (expandedOffice === officeId) {
            setExpandedOffice(null);
        }
    };

    const handleAddUser = () => {
        if (
            !newUser.name.trim() ||
            !newUser.email.trim() ||
            !newUser.position.trim() ||
            !newUser.office
        )
            return;

        if (editingUserId !== null) {
            // Update existing user
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === editingUserId
                        ? {
                              ...user,
                              name: newUser.name,
                              email: newUser.email,
                              position: newUser.position,
                              office: newUser.office,
                              role: newUser.role,
                          }
                        : user,
                ),
            );
        } else {
            // Add new user
            setUsers((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    name: newUser.name,
                    email: newUser.email,
                    position: newUser.position,
                    office: newUser.office,
                    role: newUser.role,
                    status: 'Active',
                },
            ]);
        }

        setNewUser({
            name: '',
            email: '',
            position: '',
            office: '',
            role: 'Staff',
        });
        setEditingUserId(null);
        setIsUserModalOpen(false);
    };

    const handleEditUser = (user: User) => {
        setEditingUserId(user.id);
        setNewUser({
            name: user.name,
            email: user.email,
            position: user.position,
            office: user.office,
            role: user.role,
        });
        setIsUserModalOpen(true);
    };

    const handleDeleteUser = (userId: number) => {
        setUsers((prev) => prev.filter((user) => user.id !== userId));
    };

    const handleOpenAddModal = (officeId: number) => {
        setSelectedOfficeId(officeId);
        setNewSignatory({ name: '', position: '', role: 'Reviewer' });
        setEditingSignatoryId(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (officeId: number, signatory: Signatory) => {
        setSelectedOfficeId(officeId);
        setNewSignatory({
            name: signatory.name,
            position: signatory.position,
            role: signatory.role,
        });
        setEditingSignatoryId(signatory.id);
        setIsModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Office Management" />

            <div className="flex flex-col gap-6 p-6">
                {/* 🔹 Summary Cards */}
                <div>
                    <h2 className="mb-4 text-lg font-semibold">Overview</h2>
                    <OfficeSummaryCards
                        totalOffices={offices.length}
                        totalSignatories={totalSignatories}
                        totalUsers={users.length}
                    />
                </div>

                <Separator />

                {/* 🔹 Tabs */}
                <div>
                    <OfficeTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    >
                        {activeTab === 'offices' && (
                            <OfficeList
                                offices={offices}
                                expandedOffice={expandedOffice}
                                onExpandOffice={setExpandedOffice}
                                onAddOffice={() => {
                                    setEditingOfficeId(null);
                                    setNewOffice({ name: '' });
                                    setIsOfficeModalOpen(true);
                                }}
                                onEditOffice={handleEditOffice}
                                onDeleteOffice={handleDeleteOffice}
                                onAddSignatory={handleOpenAddModal}
                                onEditSignatory={handleOpenEditModal}
                                onDeleteSignatory={handleDeleteSignatory}
                            />
                        )}

                        {activeTab === 'users' && (
                            <UserTable
                                users={users}
                                offices={offices}
                                onCreateUser={() => {
                                    setEditingUserId(null);
                                    setNewUser({
                                        name: '',
                                        email: '',
                                        position: '',
                                        office: '',
                                        role: 'Staff',
                                    });
                                    setIsUserModalOpen(true);
                                }}
                                onEditUser={handleEditUser}
                                onDeleteUser={handleDeleteUser}
                            />
                        )}
                    </OfficeTabs>
                </div>

                {/* 🔹 Add/Edit Signatory Modal */}
                <SignatoryModal
                    isOpen={isModalOpen}
                    editing={!!editingSignatoryId}
                    form={newSignatory}
                    onChange={setNewSignatory}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingSignatoryId(null);
                        setNewSignatory({
                            name: '',
                            position: '',
                            role: 'Reviewer',
                        });
                    }}
                    onSave={handleAddSignatory}
                />

                {/* 🔹 Add Office Modal */}
                <OfficeModal
                    isOpen={isOfficeModalOpen}
                    editing={!!editingOfficeId}
                    form={newOffice}
                    onChange={setNewOffice}
                    onClose={() => {
                        setIsOfficeModalOpen(false);
                        setEditingOfficeId(null);
                        setNewOffice({ name: '' });
                    }}
                    onSave={handleAddOffice}
                />

                {/* 🔹 Add User Modal */}
                <UserModal
                    isOpen={isUserModalOpen}
                    editing={!!editingUserId}
                    form={newUser}
                    offices={offices}
                    onChange={setNewUser}
                    onClose={() => {
                        setIsUserModalOpen(false);
                        setEditingUserId(null);
                        setNewUser({
                            name: '',
                            email: '',
                            position: '',
                            office: '',
                            role: 'Staff',
                        });
                    }}
                    onSave={handleAddUser}
                />
            </div>
        </AppLayout>
    );
}
