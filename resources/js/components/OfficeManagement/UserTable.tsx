import { Pencil, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type User = {
    id: number;
    name: string;
    email: string;
    office: number | '';
    position: string;
    role: 'Admin' | 'Staff';
    status: 'Active' | 'Inactive';
};

type Office = {
    id: number;
    name: string;
};

type Props = {
    users: User[];
    offices?: Office[];
    onCreateUser: () => void;
    onEditUser: (user: User) => void;
    onDeleteUser: (userId: number) => void;
};

function RoleBadge({ role }: { role: User['role'] }) {
    return (
        <Badge variant={role === 'Admin' ? 'default' : 'secondary'}>
            {role}
        </Badge>
    );
}

export default function UserTable({
    users,
    offices = [],
    onCreateUser,
    onEditUser,
    onDeleteUser,
}: Props) {
    const getOfficeName = (officeId: number | '') => {
        if (!officeId) return '—';
        return offices.find((o) => o.id === officeId)?.name || 'Unknown Office';
    };
    return (
        <div>
            {/* Header Section */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold">User Accounts</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {users.length} total{' '}
                        {users.length === 1 ? 'user' : 'users'}
                    </p>
                </div>
                <Button onClick={onCreateUser}>
                    <Plus size={16} />
                    Create User
                </Button>
            </div>
            <Separator className="mb-6" />

            {/* Table Container */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800">
                            <tr className="text-left text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Position</th>
                                <th className="p-3">Office</th>
                                <th className="p-3">Role</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="p-6 text-center">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                No users found. Create your first user.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b transition hover:bg-gray-50 dark:hover:bg-neutral-800"
                                >
                                    <td className="p-3 font-medium text-gray-900 dark:text-white">
                                        {user.name}
                                    </td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">
                                        {user.email}
                                    </td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">
                                        {user.position}
                                    </td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">
                                        {getOfficeName(user.office)}
                                    </td>
                                    <td className="p-3">
                                        <RoleBadge role={user.role} />
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="icon-sm"
                                                        variant="ghost"
                                                        onClick={() => onEditUser(user)}
                                                        aria-label={`Edit user ${user.name}`}
                                                    >
                                                        <Pencil size={16} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Edit user</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="icon-sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            onDeleteUser(user.id)
                                                        }
                                                        aria-label={`Delete user ${user.name}`}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Delete user</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
