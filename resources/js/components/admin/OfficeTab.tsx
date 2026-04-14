import { Search } from 'lucide-react';
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
    // Form state
    const [name, setName] = useState('');
    const [search, setSearch] = useState('');
    
    // Current editing office
    const [currentOffice, setCurrentOffice] = useState<Office | null>(null);
    const [editName, setEditName] = useState('');

    // Filter offices by search
    const filtered = offices.data.filter(office =>
        office.name.toLowerCase().includes(search.toLowerCase())
    );

    // Add new office
    const handleAdd = () => {
        if (!name.trim()) return;

        onAddOffice({
            id: 0, // placeholder only
            name: name.trim(),
        });

        setName('');
    };

    // Edit office - start editing
    const startEdit = (office: Office) => {
        setCurrentOffice(office);
        setEditName(office.name);
    };

    // Save changes to office
    const handleSave = () => {
        if (!currentOffice || !editName.trim()) return;
        
        onEditOffice(currentOffice.id, editName.trim());
        setCurrentOffice(null);
        setEditName('');
    };

    // Delete office
    const handleDelete = () => {
        if (!currentOffice) return;
        
        onDeleteOffice(currentOffice.id);
        setCurrentOffice(null);
        setEditName('');
    };

    // Cancel edit
    const cancelEdit = () => {
        setCurrentOffice(null);
        setEditName('');
    };

    return (
        <div className="space-y-4">
            {/* Add/Edit Office Form - Same Location */}
            {currentOffice ? (
                <div>
                    <h3 className="text-base font-semibold mb-3">Edit Office</h3>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label htmlFor="edit-name" className="text-sm">Office Name</Label>
                            <Input 
                                id="edit-name"
                                placeholder="e.g. IT Department"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-8 max-w-xs"
                            />
                        </div>
                        <div className="flex gap-2 pt-1">
                            <Button 
                                onClick={handleSave}
                                disabled={!editName.trim()}
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
                    <h3 className="text-base font-semibold mb-3">Add New Office</h3>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label htmlFor="name" className="text-sm">Office Name</Label>
                            <Input 
                                id="name"
                                placeholder="e.g. IT Department"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-8 max-w-xs"
                            />
                        </div>
                        <Button onClick={handleAdd} disabled={!name.trim()} size="sm">
                            Add Office
                        </Button>
                    </div>
                </div>
            )}

            {/* Search input */}
            <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium">Search Offices</Label>
                <div className="relative max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input 
                        id="search"
                        placeholder="Search office..."
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
                            <TableHead className="h-10 font-semibold text-gray-700">Office Name</TableHead>
                            <TableHead className="h-10 w-32 text-right font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="h-5 w-5 text-gray-400" />
                                        <p>No offices found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((office, index) => (
                                <TableRow 
                                    key={office.id}
                                    className={`border-b border-gray-200 ${
                                        currentOffice?.id === office.id ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    }`}
                                >
                                    <TableCell className="h-10 font-medium text-gray-900">
                                        {office.name}
                                    </TableCell>
                                    <TableCell className="h-10 text-right">
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
