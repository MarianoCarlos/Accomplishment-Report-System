import { Edit2, Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

declare module '@/components/ui/button' {
    interface ButtonProps {
        size?: 'default' | 'sm' | 'lg' | 'xs';
    }
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
}

interface UserTabProps {
    users: User[];
    onAddUser: (user: User) => void;
    onEditUser: (userId: number, user: Omit<User, 'id'>) => void;
    onDeleteUser: (userId: number) => void;
}

export default function UserTab({
    users,
    onAddUser,
    onEditUser,
    onDeleteUser,
}: UserTabProps) {
    // Form state for adding
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [roles, setRoles] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    
    // Current editing user
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editRoles, setEditRoles] = useState<string[]>([]);

    // Available roles
    const ROLES = ['Employee', 'Admin', 'Supervisor'];

    // Filter users by search
    const filtered = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    // Add new user
    const handleAdd = () => {
        if (!name.trim() || !email.trim()) return;
        
        const newUser: User = {
            id: Math.max(0, ...users.map(u => u.id)) + 1,
            name: name.trim(),
            email: email.trim(),
            roles: roles.length > 0 ? roles : ['Employee'],
        };
        
        onAddUser(newUser);
        setName('');
        setEmail('');
        setRoles([]);
    };

    // Edit user - start editing
    const startEdit = (user: User) => {
        setCurrentUser(user);
        setEditName(user.name);
        setEditEmail(user.email);
        setEditRoles(user.roles);
    };

    // Save changes to user
    const handleSave = () => {
        if (!currentUser || !editName.trim() || !editEmail.trim()) return;
        
        onEditUser(currentUser.id, {
            name: editName.trim(),
            email: editEmail.trim(),
            roles: editRoles.length > 0 ? editRoles : ['Employee'],
        });
        
        setCurrentUser(null);
        setEditName('');
        setEditEmail('');
        setEditRoles([]);
    };

    // Delete user
    const handleDelete = () => {
        if (!currentUser) return;
        
        onDeleteUser(currentUser.id);
        setCurrentUser(null);
        setEditName('');
        setEditEmail('');
        setEditRoles([]);
    };

    // Cancel edit
    const cancelEdit = () => {
        setCurrentUser(null);
        setEditName('');
        setEditEmail('');
        setEditRoles([]);
    };

    // Toggle role for add form
    const toggleRole = (role: string) => {
        setRoles(prev =>
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
    };

    // Toggle role for edit form
    const toggleEditRole = (role: string) => {
        setEditRoles(prev =>
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
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

                        {/* Roles */}
                        <div className="space-y-1">
                            <Label className="text-sm">Roles</Label>
                            <div className="flex gap-4">
                                {ROLES.map((role) => (
                                    <div key={role} className="flex items-center gap-2">
                                        <Checkbox 
                                            id={`edit-role-${role}`}
                                            checked={editRoles.includes(role)}
                                            onCheckedChange={() => toggleEditRole(role)}
                                        />
                                        <Label htmlFor={`edit-role-${role}`} className="font-normal cursor-pointer text-sm">
                                            {role}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

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

                        {/* Roles */}
                        <div className="space-y-1">
                            <Label className="text-sm">Roles</Label>
                            <div className="flex gap-4">
                                {ROLES.map((role) => (
                                    <div key={role} className="flex items-center gap-2">
                                        <Checkbox 
                                            id={`role-${role}`}
                                            checked={roles.includes(role)}
                                            onCheckedChange={() => toggleRole(role)}
                                        />
                                        <Label htmlFor={`role-${role}`} className="font-normal cursor-pointer text-sm">
                                            {role}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

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
                            <TableHead className="h-10 font-semibold text-gray-700">Roles</TableHead>
                            <TableHead className="h-10 w-32 text-right font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
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
                                        <div className="flex gap-1 flex-wrap">
                                            {user.roles.map((role) => (
                                                <Badge 
                                                    key={role} 
                                                    variant={role === 'Admin' ? 'default' : 'secondary'} 
                                                    className="text-xs"
                                                >
                                                    {role}
                                                </Badge>
                                            ))}
                                        </div>
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
            <p className="text-xs text-gray-500">Showing {filtered.length} of {users.length} users</p>
        </div>
    );
}
