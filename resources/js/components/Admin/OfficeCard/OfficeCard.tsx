import { Edit2, ChevronDown, ChevronRight, Plus, Users, Stamp } from 'lucide-react';
import DataTable from '@/components/Admin/DataTable/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

type Props = {
    office: Office;
    isExpanded: boolean;
    activeTab: 'users' | 'signatories';
    onToggleExpand: () => void;
    onChangeTab: (officeId: number, tab: 'users' | 'signatories') => void;
    onEdit: (office: Office) => void;
    onCreateUser: () => void;
    onCreateSignatory: () => void;
    onEditUser: (officeId: number, user: User) => void;
    onEditSignatory: (officeId: number, signatory: Signatory) => void;
    onDeleteUser: (officeId: number, userId: number) => void;
    onDeleteSignatory: (officeId: number, signatoryId: number) => void;
};

export default function OfficeCard({
    office,
    isExpanded,
    activeTab,
    onToggleExpand,
    onChangeTab,
    onEdit,
    onCreateUser,
    onCreateSignatory,
    onEditUser,
    onEditSignatory,
    onDeleteUser,
    onDeleteSignatory,
}: Props) {
    return (
        <Card>
            <CardHeader
                className="cursor-pointer pb-3"
                onClick={onToggleExpand}
            >
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{office.name}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(office);
                            }}
                            className="gap-2"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit
                        </Button>
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </div>
                </div>
            </CardHeader>
            {isExpanded && (
                <CardContent className="space-y-4 pt-0">
                    {/* Tabs */}
                    <div className="flex gap-2 border-b pb-4">
                        {(['users', 'signatories'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => onChangeTab(office.id, tab)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
                                    activeTab === tab
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab === 'users' ? (
                                    <>
                                        <Users className="h-4 w-4" />
                                        Users
                                    </>
                                ) : (
                                    <>
                                        <Stamp className="h-4 w-4" />
                                        Signatories
                                    </>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Create Button */}
                    <Button
                        size="sm"
                        className="gap-2 min-w-[150px]"
                        onClick={() => {
                            if (activeTab === 'users') {
                                onCreateUser();
                            } else {
                                onCreateSignatory();
                            }
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        {activeTab === 'users' ? 'Create User' : 'Create Signatory'}
                    </Button>

                    {/* Tables */}
                    {activeTab === 'users' ? (
                        <DataTable
                            data={office.users || []}
                            itemName="User"
                            onEdit={(user) => onEditUser(office.id, user)}
                            onDelete={(userId) => onDeleteUser(office.id, userId)}
                        />
                    ) : (
                        <DataTable
                            data={office.signatories || []}
                            itemName="Signatory"
                            onEdit={(sig) => onEditSignatory(office.id, sig)}
                            onDelete={(sigId) => onDeleteSignatory(office.id, sigId)}
                        />
                    )}
                </CardContent>
            )}
        </Card>
    );
}
