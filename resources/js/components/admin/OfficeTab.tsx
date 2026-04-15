import { PlusCircle, Search } from 'lucide-react';
import { useState } from 'react';
import AdminPagination from '@/components/admin/AdminPagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PaginatedData } from '@/types';

interface Office {
    id: number;
    name: string;
}

interface OfficeTabProps {
    offices: PaginatedData<Office>;
    paginationRoute: string;
    paginationQuery?: Record<string, string | number | null | undefined>;
    onAddOffice: (office: Office) => void;
    onEditOffice: (officeId: number, newName: string) => void;
    onDeleteOffice: (officeId: number) => void;
}

export default function OfficeTab({
    offices,
    paginationRoute,
    paginationQuery,
    onAddOffice,
    onEditOffice,
    onDeleteOffice,
}: OfficeTabProps) {
    const [name, setName] = useState('');
    const [search, setSearch] = useState('');
    const [currentOffice, setCurrentOffice] = useState<Office | null>(null);
    const [editName, setEditName] = useState('');

    const filtered = offices.data.filter((o) =>
        o.name.toLowerCase().includes(search.toLowerCase()),
    );

    const handleAdd = () => {
        if (!name.trim()) return;
        onAddOffice({ id: 0, name: name.trim() });
        setName('');
    };

    const startEdit = (office: Office) => {
        setCurrentOffice(office);
        setEditName(office.name);
    };

    const handleSave = () => {
        if (!currentOffice || !editName.trim()) return;
        onEditOffice(currentOffice.id, editName.trim());
        setCurrentOffice(null);
        setEditName('');
    };

    const handleDelete = () => {
        if (!currentOffice) return;
        onDeleteOffice(currentOffice.id);
        setCurrentOffice(null);
        setEditName('');
    };

    const cancelEdit = () => {
        setCurrentOffice(null);
        setEditName('');
    };

    return (
        <div className="space-y-5">

            {/* ── Form panel ─────────────────────────────────────── */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                {currentOffice ? (
                    <>
                        <h3 className="mb-3 text-sm font-semibold text-gray-700">Edit Office</h3>
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex-1 space-y-1 min-w-[200px]">
                                <Label htmlFor="edit-office-name" className="text-xs font-medium text-gray-600">
                                    Office Name
                                </Label>
                                <Input
                                    id="edit-office-name"
                                    placeholder="e.g. IT Department"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="h-9 bg-white text-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSave} disabled={!editName.trim()} size="sm" className="h-9 px-4">
                                    Save
                                </Button>
                                <Button variant="destructive" onClick={handleDelete} size="sm" className="h-9 px-4">
                                    Delete
                                </Button>
                                <Button variant="outline" onClick={cancelEdit} size="sm" className="h-9 px-4">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="mb-3 text-sm font-semibold text-gray-700">Add New Office</h3>
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex-1 space-y-1 min-w-[200px]">
                                <Label htmlFor="office-name" className="text-xs font-medium text-gray-600">
                                    Office Name
                                </Label>
                                <Input
                                    id="office-name"
                                    placeholder="e.g. IT Department"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                    className="h-9 bg-white text-sm"
                                />
                            </div>
                            <Button onClick={handleAdd} disabled={!name.trim()} size="sm" className="h-9 px-4">
                                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                                Add Office
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* ── Search ─────────────────────────────────────────── */}
            <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                    placeholder="Search offices…"
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
                            <TableHead className="h-10 pl-4 font-semibold text-gray-600">Office Name</TableHead>
                            <TableHead className="h-10 pr-4 w-28 text-right font-semibold text-gray-600">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="py-10 text-center text-sm text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="h-5 w-5 text-gray-300" />
                                        <span>No offices found</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((office) => (
                                <TableRow
                                    key={office.id}
                                    className={`border-b border-gray-100 ${
                                        currentOffice?.id === office.id ? 'bg-blue-50/30' : 'bg-white'
                                    }`}
                                >
                                    <TableCell className="h-11 pl-4 font-medium text-gray-900">
                                        {office.name}
                                    </TableCell>
                                    <TableCell className="h-11 pr-4 text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-3 text-xs"
                                            onClick={() => startEdit(office)}
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
                paginated={offices}
                route={paginationRoute}
                pageParam="office_page"
                itemLabel="offices"
                query={paginationQuery}
            />
        </div>
    );
}
