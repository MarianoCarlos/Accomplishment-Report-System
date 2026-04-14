import { Search, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import AdminPagination from '@/components/admin/AdminPagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

    // Add-form search/dropdown states
    const [positionSearch, setPositionSearch] = useState('');
    const [officeSearch, setOfficeSearch] = useState('');
    const [showPositionDropdown, setShowPositionDropdown] = useState(false);
    const [showOfficeDropdown, setShowOfficeDropdown] = useState(false);

    // Edit-form search/dropdown states
    const [editPositionSearch, setEditPositionSearch] = useState('');
    const [editOfficeSearch, setEditOfficeSearch] = useState('');
    const [showEditPositionDropdown, setShowEditPositionDropdown] = useState(false);
    const [showEditOfficeDropdown, setShowEditOfficeDropdown] = useState(false);

    // Refs for click-outside detection
    const positionRef = useRef<HTMLDivElement>(null);
    const officeRef = useRef<HTMLDivElement>(null);
    const editPositionRef = useRef<HTMLDivElement>(null);
    const editOfficeRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (positionRef.current && !positionRef.current.contains(event.target as Node)) {
                setShowPositionDropdown(false);
            }
            if (officeRef.current && !officeRef.current.contains(event.target as Node)) {
                setShowOfficeDropdown(false);
            }
            if (editPositionRef.current && !editPositionRef.current.contains(event.target as Node)) {
                setShowEditPositionDropdown(false);
            }
            if (editOfficeRef.current && !editOfficeRef.current.contains(event.target as Node)) {
                setShowEditOfficeDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filtered lists for search-select
    const filteredPositions = positions.filter(p => p.name.toLowerCase().includes(positionSearch.toLowerCase()));
    const filteredOffices = offices.filter(o => o.name.toLowerCase().includes(officeSearch.toLowerCase()));
    const filteredEditPositions = positions.filter(p => p.name.toLowerCase().includes(editPositionSearch.toLowerCase()));
    const filteredEditOffices = offices.filter(o => o.name.toLowerCase().includes(editOfficeSearch.toLowerCase()));

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
        setPositionSearch('');
        setOfficeSearch('');
        setShowPositionDropdown(false);
        setShowOfficeDropdown(false);
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
        setEditPositionSearch('');
        setEditOfficeSearch('');
        setShowEditPositionDropdown(false);
        setShowEditOfficeDropdown(false);
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
        setEditPositionSearch('');
        setEditOfficeSearch('');
        setShowEditPositionDropdown(false);
        setShowEditOfficeDropdown(false);
    };

    // Cancel edit
    const cancelEdit = () => {
        setCurrentUser(null);
        setEditName('');
        setEditEmail('');
        setEditRole('Employee');
        setEditPosition(null);
        setEditOffice(null);
        setEditPositionSearch('');
        setEditOfficeSearch('');
        setShowEditPositionDropdown(false);
        setShowEditOfficeDropdown(false);
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

                        {/* Role, Position, Office side by side */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-sm">Role</Label>
                                <Select value={editRole} onValueChange={(val) => setEditRole(val)}>
                                    <SelectTrigger className="h-8 w-full">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLES.map((r) => (
                                            <SelectItem key={r} value={r}>{r}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm">Position</Label>
                                <div className="relative" ref={editPositionRef}>
                                    <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <Input
                                        placeholder="Select Position"
                                        value={showEditPositionDropdown ? editPositionSearch : (positions.find(p => p.id === editPosition)?.name ?? '')}
                                        onChange={(e) => {
                                            setEditPositionSearch(e.target.value);
                                            setShowEditPositionDropdown(true);
                                        }}
                                        onFocus={() => setShowEditPositionDropdown(true)}
                                        className="h-8 pl-6 pr-6 text-sm"
                                    />
                                    {editPosition !== null && (
                                        <button
                                            onClick={() => { setEditPosition(null); setEditPositionSearch(''); }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                    {showEditPositionDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-40 overflow-y-auto">
                                            {filteredEditPositions.length > 0 ? (
                                                filteredEditPositions.map((pos) => (
                                                    <button
                                                        key={pos.id}
                                                        onClick={() => {
                                                            setEditPosition(pos.id);
                                                            setEditPositionSearch('');
                                                            setShowEditPositionDropdown(false);
                                                        }}
                                                        className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
                                                    >
                                                        {pos.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-3 py-1.5 text-sm text-gray-500">No results.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm">Office</Label>
                                <div className="relative" ref={editOfficeRef}>
                                    <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <Input
                                        placeholder="Select Office"
                                        value={showEditOfficeDropdown ? editOfficeSearch : (offices.find(o => o.id === editOffice)?.name ?? '')}
                                        onChange={(e) => {
                                            setEditOfficeSearch(e.target.value);
                                            setShowEditOfficeDropdown(true);
                                        }}
                                        onFocus={() => setShowEditOfficeDropdown(true)}
                                        className="h-8 pl-6 pr-6 text-sm"
                                    />
                                    {editOffice !== null && (
                                        <button
                                            onClick={() => { setEditOffice(null); setEditOfficeSearch(''); }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                    {showEditOfficeDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-40 overflow-y-auto">
                                            {filteredEditOffices.length > 0 ? (
                                                filteredEditOffices.map((off) => (
                                                    <button
                                                        key={off.id}
                                                        onClick={() => {
                                                            setEditOffice(off.id);
                                                            setEditOfficeSearch('');
                                                            setShowEditOfficeDropdown(false);
                                                        }}
                                                        className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
                                                    >
                                                        {off.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-3 py-1.5 text-sm text-gray-500">No results.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
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

                        {/* Role, Position, Office side by side */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-sm">Role</Label>
                                <Select value={role} onValueChange={(val) => setRole(val)}>
                                    <SelectTrigger className="h-8 w-full">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLES.map((r) => (
                                            <SelectItem key={r} value={r}>{r}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm">Position</Label>
                                <div className="relative" ref={positionRef}>
                                    <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <Input
                                        placeholder="Select Position"
                                        value={showPositionDropdown ? positionSearch : (positions.find(p => p.id === position)?.name ?? '')}
                                        onChange={(e) => {
                                            setPositionSearch(e.target.value);
                                            setShowPositionDropdown(true);
                                        }}
                                        onFocus={() => setShowPositionDropdown(true)}
                                        className="h-8 pl-6 pr-6 text-sm"
                                    />
                                    {position !== null && (
                                        <button
                                            onClick={() => { setPosition(null); setPositionSearch(''); }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                    {showPositionDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-40 overflow-y-auto">
                                            {filteredPositions.length > 0 ? (
                                                filteredPositions.map((pos) => (
                                                    <button
                                                        key={pos.id}
                                                        onClick={() => {
                                                            setPosition(pos.id);
                                                            setPositionSearch('');
                                                            setShowPositionDropdown(false);
                                                        }}
                                                        className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
                                                    >
                                                        {pos.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-3 py-1.5 text-sm text-gray-500">No results.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm">Office</Label>
                                <div className="relative" ref={officeRef}>
                                    <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <Input
                                        placeholder="Select Office"
                                        value={showOfficeDropdown ? officeSearch : (offices.find(o => o.id === office)?.name ?? '')}
                                        onChange={(e) => {
                                            setOfficeSearch(e.target.value);
                                            setShowOfficeDropdown(true);
                                        }}
                                        onFocus={() => setShowOfficeDropdown(true)}
                                        className="h-8 pl-6 pr-6 text-sm"
                                    />
                                    {office !== null && (
                                        <button
                                            onClick={() => { setOffice(null); setOfficeSearch(''); }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                    {showOfficeDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-40 overflow-y-auto">
                                            {filteredOffices.length > 0 ? (
                                                filteredOffices.map((off) => (
                                                    <button
                                                        key={off.id}
                                                        onClick={() => {
                                                            setOffice(off.id);
                                                            setOfficeSearch('');
                                                            setShowOfficeDropdown(false);
                                                        }}
                                                        className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
                                                    >
                                                        {off.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-3 py-1.5 text-sm text-gray-500">No results.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
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
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-3 text-xs"
                                            onClick={() => startEdit(user)}
                                        >
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
