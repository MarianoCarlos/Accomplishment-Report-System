import { PlusCircle, Search, X } from 'lucide-react';
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

const ROLES = ['Employee', 'Admin', 'Supervisor'];

function roleBadgeVariant(role: string): 'default' | 'secondary' | 'outline' {
    if (role === 'Admin') return 'default';
    if (role === 'Supervisor') return 'secondary';
    return 'outline';
}

// ─── Searchable dropdown ─────────────────────────────────────────────────────

interface SearchDropdownProps {
    id?: string;
    placeholder: string;
    items: { id: number; name: string }[];
    selectedId: number | null;
    onSelect: (id: number | null) => void;
}

function SearchDropdown({ id, placeholder, items, selectedId, onSelect }: SearchDropdownProps) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selectedName = items.find((i) => i.id === selectedId)?.name ?? '';
    const filtered = items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
                id={id}
                placeholder={placeholder}
                value={open ? query : selectedName}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                className="h-9 pl-8 pr-7 text-sm bg-white"
            />
            {selectedId !== null && (
                <button
                    type="button"
                    onClick={() => { onSelect(null); setQuery(''); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
            {open && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-40 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-md">
                    {filtered.length > 0 ? (
                        filtered.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => { onSelect(item.id); setQuery(''); setOpen(false); }}
                                className="w-full border-b border-gray-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-blue-50"
                            >
                                {item.name}
                            </button>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-400 italic">No results</div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

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
    // Add form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Employee');
    const [position, setPosition] = useState<number | null>(null);
    const [office, setOffice] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    // Edit form state
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editRole, setEditRole] = useState('Employee');
    const [editPosition, setEditPosition] = useState<number | null>(null);
    const [editOffice, setEditOffice] = useState<number | null>(null);

    const filtered = users.data.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()),
    );

    const handleAdd = () => {
        if (!name.trim() || !email.trim()) return;
        onAddUser({ name: name.trim(), email: email.trim(), role, position_id: position || undefined, office_id: office || undefined });
        setName(''); setEmail(''); setRole('Employee'); setPosition(null); setOffice(null);
    };

    const startEdit = (user: User) => {
        setCurrentUser(user);
        setEditName(user.name);
        setEditEmail(user.email);
        setEditRole(user.role);
        setEditPosition(user.position_id || null);
        setEditOffice(user.office_id || null);
    };

    const handleSave = () => {
        if (!currentUser || !editName.trim() || !editEmail.trim()) return;
        onEditUser(currentUser.id, { name: editName.trim(), email: editEmail.trim(), role: editRole, position_id: editPosition || undefined, office_id: editOffice || undefined });
        setCurrentUser(null);
    };

    const handleDelete = () => {
        if (!currentUser) return;
        onDeleteUser(currentUser.id);
        setCurrentUser(null);
    };

    const cancelEdit = () => setCurrentUser(null);

    return (
        <div className="space-y-5">

            {/* ── Form panel ─────────────────────────────────────── */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                {currentUser ? (
                    <>
                        <h3 className="mb-3 text-sm font-semibold text-gray-700">Edit User</h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="edit-name" className="text-xs font-medium text-gray-600">Name</Label>
                                <Input id="edit-name" placeholder="John Doe" value={editName} onChange={(e) => setEditName(e.target.value)} className="h-9 bg-white text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-email" className="text-xs font-medium text-gray-600">Email</Label>
                                <Input id="edit-email" type="email" placeholder="john@example.com" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="h-9 bg-white text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-medium text-gray-600">Role</Label>
                                <Select value={editRole} onValueChange={setEditRole}>
                                    <SelectTrigger className="h-9 bg-white text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-medium text-gray-600">Position</Label>
                                <SearchDropdown
                                    placeholder="Select position"
                                    items={positions}
                                    selectedId={editPosition}
                                    onSelect={setEditPosition}
                                />
                            </div>
                            <div className="space-y-1 sm:col-span-2 md:col-span-1">
                                <Label className="text-xs font-medium text-gray-600">Office</Label>
                                <SearchDropdown
                                    placeholder="Select office"
                                    items={offices}
                                    selectedId={editOffice}
                                    onSelect={setEditOffice}
                                />
                            </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                            <Button onClick={handleSave} disabled={!editName.trim() || !editEmail.trim()} size="sm" className="h-9 px-4">Save</Button>
                            <Button variant="destructive" onClick={handleDelete} size="sm" className="h-9 px-4">
                                Delete
                            </Button>
                            <Button variant="outline" onClick={cancelEdit} size="sm" className="h-9 px-4">
                                Cancel
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="mb-3 text-sm font-semibold text-gray-700">Add New User</h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="user-name" className="text-xs font-medium text-gray-600">Name</Label>
                                <Input id="user-name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="h-9 bg-white text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="user-email" className="text-xs font-medium text-gray-600">Email</Label>
                                <Input id="user-email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 bg-white text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-medium text-gray-600">Role</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger className="h-9 bg-white text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-medium text-gray-600">Position</Label>
                                <SearchDropdown
                                    placeholder="Select position"
                                    items={positions}
                                    selectedId={position}
                                    onSelect={setPosition}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-medium text-gray-600">Office</Label>
                                <SearchDropdown
                                    placeholder="Select office"
                                    items={offices}
                                    selectedId={office}
                                    onSelect={setOffice}
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <Button onClick={handleAdd} disabled={!name.trim() || !email.trim()} size="sm" className="h-9 px-4">
                                <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add User
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* ── Search ─────────────────────────────────────────── */}
            <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                    placeholder="Search users…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 pl-9 text-sm"
                />
            </div>

            {/* ── Table ──────────────────────────────────────────── */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table className="text-sm">
                    <TableHeader className="bg-gray-50">
                        <TableRow className="border-b border-gray-200">
                            <TableHead className="h-10 pl-4 font-semibold text-gray-600">Name</TableHead>
                            <TableHead className="h-10 font-semibold text-gray-600">Email</TableHead>
                            <TableHead className="h-10 font-semibold text-gray-600">Role</TableHead>
                            <TableHead className="h-10 font-semibold text-gray-600">Position</TableHead>
                            <TableHead className="h-10 font-semibold text-gray-600">Office</TableHead>
                            <TableHead className="h-10 pr-4 w-24 text-right font-semibold text-gray-600">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-sm text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="h-5 w-5 text-gray-300" />
                                        <span>No users found</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((user) => (
                                <TableRow
                                    key={user.id}
                                    className={`border-b border-gray-100 ${
                                        currentUser?.id === user.id ? 'bg-blue-50/30' : 'bg-white'
                                    }`}
                                >
                                    <TableCell className="h-11 pl-4 font-medium text-gray-900">{user.name}</TableCell>
                                    <TableCell className="h-11 text-xs text-gray-500">{user.email}</TableCell>
                                    <TableCell className="h-11">
                                        <Badge variant={roleBadgeVariant(user.role)} className="text-xs">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="h-11 text-xs text-gray-500">
                                        {user.position_id ? positions.find((p) => p.id === user.position_id)?.name : '—'}
                                    </TableCell>
                                    <TableCell className="h-11 text-xs text-gray-500">
                                        {user.office_id ? offices.find((o) => o.id === user.office_id)?.name : '—'}
                                    </TableCell>
                                    <TableCell className="h-11 pr-4 text-right">
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
