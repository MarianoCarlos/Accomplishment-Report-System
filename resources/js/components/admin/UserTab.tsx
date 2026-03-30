import { Edit2, Search } from 'lucide-react';
import { useState } from 'react';
import AdminPagination from '@/components/admin/AdminPagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PaginatedData } from '@/types';

declare module '@/components/ui/button' {
    interface ButtonProps {
        size?: 'default' | 'sm' | 'lg' | 'xs';
    }
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    position_id?: number;
    office_id?: number;
}

interface Position {
    id: number;
    name: string;
}

interface Office {
    id: number;
    name: string;
}

interface UserTabProps {
    users: PaginatedData<User>;
    paginationRoute: string;
    paginationQuery?: Record<string, string | number | null | undefined>;
    positions: Position[];
    offices: Office[];
    onAddUser: (user: Omit<User, 'id'>) => void;
    onEditUser: (userId: number, user: Omit<User, 'id'>) => void;
    onDeleteUser: (userId: number) => void;
}

export default function UserTab({
    users,
    paginationRoute,
    paginationQuery,
    positions,
    offices,
    onAddUser,
    onEditUser,
    onDeleteUser,
}: UserTabProps) {
    // Form state for adding
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Employee');
    const [position, setPosition] = useState<number | null>(null);
    const [office, setOffice] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    
    // Current editing user
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editRole, setEditRole] = useState('Employee');
    const [editPosition, setEditPosition] = useState<number | null>(null);
    const [editOffice, setEditOffice] = useState<number | null>(null);

    // Available roles
    const ROLES = ['Employee', 'Admin', 'Supervisor'];

    // Filter users by search
    const filtered = users.data.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    // Add new user
    const handleAdd = () => {
        if (!name.trim() || !email.trim()) return;
        
        onAddUser({
            name: name.trim(),
            email: email.trim(),
            role,
            position_id: position || undefined,
            office_id: office || undefined,
        });
        
        setName('');
        setEmail('');
        setRole('Employee');
        setPosition(null);
        setOffice(null);
    };

    // Edit user - start editing
    const startEdit = (user: User) => {
        setCurrentUser(user);
        setEditName(user.name);
        setEditEmail(user.email);
        setEditRole(user.role);
        setEditPosition(user.position_id || null);
        setEditOffice(user.office_id || null);
    };

    // Save changes to user
    const handleSave = () => {
        if (!currentUser || !editName.trim() || !editEmail.trim()) return;
        
        onEditUser(currentUser.id, {
            name: editName.trim(),
            email: editEmail.trim(),
            role: editRole,
            position_id: editPosition || undefined,
            office_id: editOffice || undefined,
        });
        
        setCurrentUser(null);
        setEditName('');
        setEditEmail('');
        setEditRole('Employee');
        setEditPosition(null);
        setEditOffice(null);
    };

    // Delete user
    const handleDelete = () => {
        if (!currentUser) return;
        
        onDeleteUser(currentUser.id);
        setCurrentUser(null);
        setEditName('');
        setEditEmail('');
        setEditRole('Employee');
        setEditPosition(null);
        setEditOffice(null);
    };

    // Cancel edit
    const cancelEdit = () => {
        setCurrentUser(null);
        setEditName('');
        setEditEmail('');
        setEditRole('Employee');
        setEditPosition(null);
        setEditOffice(null);
    };

    return (
        <div className="space-y-4">
            {/* Add/Edit User Form - Same Location */}
            {currentUser ? (
                <div>
                    <h3 className="text-base font-semibold mb-3">Edit User</h3>
                    <div className="space-y-3">
                        {/* Name and Email side by side */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="edit-name" className="text-sm">Name</Label>
                                <Input 
                                    id="edit-name"
                                    placeholder="John Doe"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="h-8"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-email" className="text-sm">Email</Label>
                                <Input 
                                    id="edit-email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    className="h-8"
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div className="space-y-1">
                            <Label htmlFor="edit-role" className="text-sm">Role</Label>
                            <select
                                id="edit-role"
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                                className="h-8 px-3 border border-gray-300 rounded-md text-sm"
                            >
                                {ROLES.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Position */}
                        {positions.length > 0 && (
                            <div className="space-y-1">
                                <Label htmlFor="edit-position" className="text-sm">Position</Label>
                                <select
                                    id="edit-position"
                                    value={editPosition || ''}
                                    onChange={(e) => setEditPosition(e.target.value ? Number(e.target.value) : null)}
                                    className="h-8 px-3 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="">-- Select Position --</option>
                                    {positions.map((pos) => (
                                        <option key={pos.id} value={pos.id}>
                                            {pos.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Office */}
                        {offices.length > 0 && (
                            <div className="space-y-1">
                                <Label htmlFor="edit-office" className="text-sm">Office</Label>
                                <select
                                    id="edit-office"
                                    value={editOffice || ''}
                                    onChange={(e) => setEditOffice(e.target.value ? Number(e.target.value) : null)}
                                    className="h-8 px-3 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="">-- Select Office --</option>
                                    {offices.map((off) => (
                                        <option key={off.id} value={off.id}>
                                            {off.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-1">
                            <Button 
                                onClick={handleSave}
                                disabled={!editName.trim() || !editEmail.trim()}
                                size="sm"
                            >
                                Save
                            </Button>
                            <Button 
                                variant="destructive"
                                onClick={handleDelete}
                                size="sm"
                            >
                                Delete
                            </Button>
                            <Button 
                                variant="outline"
                                onClick={cancelEdit}
                                size="sm"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <h3 className="text-base font-semibold mb-3">Add New User</h3>
                    <div className="space-y-3">
                        {/* Name and Email side by side */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="name" className="text-sm">Name</Label>
                                <Input 
                                    id="name"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-8"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email" className="text-sm">Email</Label>
                                <Input 
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-8"
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div className="space-y-1">
                            <Label htmlFor="role" className="text-sm">Role</Label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="h-8 px-3 border border-gray-300 rounded-md text-sm"
                            >
                                {ROLES.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Position */}
                        {positions.length > 0 && (
                            <div className="space-y-1">
                                <Label htmlFor="position" className="text-sm">Position</Label>
                                <select
                                    id="position"
                                    value={position || ''}
                                    onChange={(e) => setPosition(e.target.value ? Number(e.target.value) : null)}
                                    className="h-8 px-3 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="">-- Select Position --</option>
                                    {positions.map((pos) => (
                                        <option key={pos.id} value={pos.id}>
                                            {pos.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Office */}
                        {offices.length > 0 && (
                            <div className="space-y-1">
                                <Label htmlFor="office" className="text-sm">Office</Label>
                                <select
                                    id="office"
                                    value={office || ''}
                                    onChange={(e) => setOffice(e.target.value ? Number(e.target.value) : null)}
                                    className="h-8 px-3 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="">-- Select Office --</option>
                                    {offices.map((off) => (
                                        <option key={off.id} value={off.id}>
                                            {off.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Submit button */}
                        <Button 
                            onClick={handleAdd}
                            disabled={!name.trim() || !email.trim()}
                            size="sm"
                        >
                            Add User
                        </Button>
                    </div>
                </div>
            )}

            {/* Search input */}
            <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium">Search Users</Label>
                <div className="relative max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input 
                        id="search"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 pl-8 text-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table className="text-sm">
                    <TableHeader className="bg-gray-50">
                        <TableRow className="border-b border-gray-200">
                            <TableHead className="h-10 font-semibold text-gray-700">Name</TableHead>
                            <TableHead className="h-10 font-semibold text-gray-700">Email</TableHead>
                            <TableHead className="h-10 font-semibold text-gray-700">Role</TableHead>
                            <TableHead className="h-10 font-semibold text-gray-700">Position</TableHead>
                            <TableHead className="h-10 font-semibold text-gray-700">Office</TableHead>
                            <TableHead className="h-10 w-32 text-right font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="h-5 w-5 text-gray-400" />
                                        <p>No users found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((user, index) => (
                                <TableRow 
                                    key={user.id}
                                    className={`border-b border-gray-200 ${
                                        currentUser?.id === user.id ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    }`}
                                >
                                    <TableCell className="h-10 font-medium text-gray-900">
                                        {user.name}
                                    </TableCell>
                                    <TableCell className="h-10 text-gray-600 text-xs">
                                        {user.email}
                                    </TableCell>
                                    <TableCell className="h-10">
                                        <Badge 
                                            variant={user.role === 'Admin' ? 'default' : 'secondary'} 
                                            className="text-xs"
                                        >
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="h-10 text-gray-600 text-xs">
                                        {user.position_id ? positions.find(p => p.id === user.position_id)?.name : '—'}
                                    </TableCell>
                                    <TableCell className="h-10 text-gray-600 text-xs">
                                        {user.office_id ? offices.find((o) => o.id === user.office_id)?.name : ''}
                                    </TableCell>
                                    <TableCell className="h-10 text-right">
                                        <Button 
                                            variant={currentUser?.id === user.id ? "default" : "ghost"}
                                            size="sm" 
                                            onClick={() => startEdit(user)}
                                            className="gap-1"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <AdminPagination
                paginated={users}
                route={paginationRoute}
                pageParam="user_page"
                itemLabel="users"
                query={paginationQuery}
            />
        </div>
    );
}
