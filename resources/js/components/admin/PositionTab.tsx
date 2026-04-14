import { Search } from 'lucide-react';
import { useState } from 'react';
import AdminPagination from '@/components/admin/AdminPagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PaginatedData } from '@/types';

interface Position {
    id: number;
    name: string;
}

interface PositionTabProps {
    positions: PaginatedData<Position>;
    paginationRoute: string;
    paginationQuery?: Record<string, string | number | null | undefined>;
    onAddPosition: (position: Position) => void;
    onEditPosition: (positionId: number, newName: string) => void;
    onDeletePosition: (positionId: number) => void;
}

export default function PositionTab({
    positions,
    paginationRoute,
    paginationQuery,
    onAddPosition,
    onEditPosition,
    onDeletePosition,
}: PositionTabProps) {
    // Form state
    const [name, setName] = useState('');
    const [search, setSearch] = useState('');
    
    // Current editing position
    const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
    const [editName, setEditName] = useState('');

    // Filter positions by search
    const filtered = positions.data.filter(position =>
        position.name.toLowerCase().includes(search.toLowerCase())
    );

    // Add new position
    const handleAdd = () => {
        if (!name.trim()) return;

        onAddPosition({
            id: 0, // temporary placeholder (backend generates real ID)
            name: name.trim(),
        });

        setName('');
    };

    // Edit position - start editing
    const startEdit = (position: Position) => {
        setCurrentPosition(position);
        setEditName(position.name);
    };

    // Save changes to position
    const handleSave = () => {
        if (!currentPosition || !editName.trim()) return;
        
        onEditPosition(currentPosition.id, editName.trim());
        setCurrentPosition(null);
        setEditName('');
    };

    // Delete position
    const handleDelete = () => {
        if (!currentPosition) return;
        
        onDeletePosition(currentPosition.id);
        setCurrentPosition(null);
        setEditName('');
    };

    // Cancel edit
    const cancelEdit = () => {
        setCurrentPosition(null);
        setEditName('');
    };

    return (
        <div className="space-y-4">
            {/* Add/Edit Position Form - Same Location */}
            {currentPosition ? (
                <div>
                    <h3 className="text-base font-semibold mb-3">Edit Position</h3>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label htmlFor="edit-name" className="text-sm">Position Name</Label>
                            <Input 
                                id="edit-name"
                                placeholder="e.g. Senior Developer"
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
                    <h3 className="text-base font-semibold mb-3">Add New Position</h3>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label htmlFor="name" className="text-sm">Position Name</Label>
                            <Input 
                                id="name"
                                placeholder="e.g. Senior Developer"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-8 max-w-xs"
                            />
                        </div>
                        <Button onClick={handleAdd} disabled={!name.trim()} size="sm">
                            Add Position
                        </Button>
                    </div>
                </div>
            )}

            {/* Search input */}
            <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium">Search Positions</Label>
                <div className="relative max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input 
                        id="search"
                        placeholder="Search position..."
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
                            <TableHead className="h-10 font-semibold text-gray-700">Position Name</TableHead>
                            <TableHead className="h-10 w-32 text-right font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="h-5 w-5 text-gray-400" />
                                        <p>No positions found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((position, index) => (
                                <TableRow 
                                    key={position.id}
                                    className={`border-b border-gray-200 ${
                                        currentPosition?.id === position.id ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    }`}
                                >
                                    <TableCell className="h-10 font-medium text-gray-900">
                                        {position.name}
                                    </TableCell>
                                    <TableCell className="h-10 text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-3 text-xs"
                                            onClick={() => startEdit(position)}
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
                paginated={positions}
                route={paginationRoute}
                pageParam="position_page"
                itemLabel="positions"
                query={paginationQuery}
            />
        </div>
    );
}
