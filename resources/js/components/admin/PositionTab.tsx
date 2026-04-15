import { PlusCircle, Search } from 'lucide-react';
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
    const [name, setName] = useState('');
    const [search, setSearch] = useState('');
    const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
    const [editName, setEditName] = useState('');

    const filtered = positions.data.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
    );

    const handleAdd = () => {
        if (!name.trim()) return;
        onAddPosition({ id: 0, name: name.trim() });
        setName('');
    };

    const startEdit = (position: Position) => {
        setCurrentPosition(position);
        setEditName(position.name);
    };

    const handleSave = () => {
        if (!currentPosition || !editName.trim()) return;
        onEditPosition(currentPosition.id, editName.trim());
        setCurrentPosition(null);
        setEditName('');
    };

    const handleDelete = () => {
        if (!currentPosition) return;
        onDeletePosition(currentPosition.id);
        setCurrentPosition(null);
        setEditName('');
    };

    const cancelEdit = () => {
        setCurrentPosition(null);
        setEditName('');
    };

    return (
        <div className="space-y-5">

            {/* ── Form panel ─────────────────────────────────────── */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                {currentPosition ? (
                    <>
                        <h3 className="mb-3 text-sm font-semibold text-gray-700">Edit Position</h3>
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex-1 space-y-1 min-w-[200px]">
                                <Label htmlFor="edit-position-name" className="text-xs font-medium text-gray-600">
                                    Position Name
                                </Label>
                                <Input
                                    id="edit-position-name"
                                    placeholder="e.g. Senior Developer"
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
                        <h3 className="mb-3 text-sm font-semibold text-gray-700">Add New Position</h3>
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex-1 space-y-1 min-w-[200px]">
                                <Label htmlFor="position-name" className="text-xs font-medium text-gray-600">
                                    Position Name
                                </Label>
                                <Input
                                    id="position-name"
                                    placeholder="e.g. Senior Developer"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                    className="h-9 bg-white text-sm"
                                />
                            </div>
                            <Button onClick={handleAdd} disabled={!name.trim()} size="sm" className="h-9 px-4">
                                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                                Add Position
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* ── Search ─────────────────────────────────────────── */}
            <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                    placeholder="Search positions…"
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
                            <TableHead className="h-10 pl-4 font-semibold text-gray-600">Position Name</TableHead>
                            <TableHead className="h-10 pr-4 w-28 text-right font-semibold text-gray-600">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="py-10 text-center text-sm text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="h-5 w-5 text-gray-300" />
                                        <span>No positions found</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((position) => (
                                <TableRow
                                    key={position.id}
                                    className={`border-b border-gray-100 ${
                                        currentPosition?.id === position.id ? 'bg-blue-50/30' : 'bg-white'
                                    }`}
                                >
                                    <TableCell className="h-11 pl-4 font-medium text-gray-900">
                                        {position.name}
                                    </TableCell>
                                    <TableCell className="h-11 pr-4 text-right">
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
