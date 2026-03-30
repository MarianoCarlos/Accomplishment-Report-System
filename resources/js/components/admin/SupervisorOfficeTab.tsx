import { Search, UserCheck } from 'lucide-react';
import { Fragment } from 'react';
import { useState } from 'react';
import AdminPagination from '@/components/admin/AdminPagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PaginatedData } from '@/types';

interface Office {
    id: number;
    name: string;
}

interface Supervisor {
    id: number;
    name: string;
    email: string;
}

interface SupervisorOfficeTabProps {
    offices: PaginatedData<Office>;
    paginationRoute: string;
    paginationQuery?: Record<string, string | number | null | undefined>;
    supervisors: Supervisor[];
    assignments: Record<number, number | null>;
    onAssign: (officeId: number, supervisorId: number | null) => void;
}

export default function SupervisorOfficeTab({
    offices,
    paginationRoute,
    paginationQuery,
    supervisors,
    assignments,
    onAssign,
}: SupervisorOfficeTabProps) {
    const [search, setSearch] = useState('');
    const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
    const [pendingSupervisorId, setPendingSupervisorId] = useState<number | null>(null);

    const filtered = offices.data.filter((o) =>
        o.name.toLowerCase().includes(search.toLowerCase()),
    );

    const getSupervisor = (officeId: number): Supervisor | null => {
        const sid = assignments[officeId];
        return sid != null ? (supervisors.find((s) => s.id === sid) ?? null) : null;
    };

    const toggleOffice = (office: Office) => {
        if (selectedOfficeId === office.id) {
            setSelectedOfficeId(null);
            return;
        }
        setSelectedOfficeId(office.id);
        setPendingSupervisorId(assignments[office.id] ?? null);
    };

    const handleSave = () => {
        if (selectedOfficeId === null) return;
        onAssign(selectedOfficeId, pendingSupervisorId);
        setSelectedOfficeId(null);
    };

    const cancelEdit = () => setSelectedOfficeId(null);

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="space-y-2">
                <Label htmlFor="office-search" className="text-sm font-medium">
                    Search Offices
                </Label>
                <div className="relative max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        id="office-search"
                        placeholder="Search by office name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 pl-8 text-sm"
                    />
                </div>
            </div>


            {/* Office Table */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table className="text-sm">
                    <TableHeader className="bg-gray-50">
                        <TableRow className="border-b border-gray-200">
                            <TableHead className="h-10 font-semibold text-gray-700">Office</TableHead>
                            <TableHead className="h-10 font-semibold text-gray-700">Assigned Supervisor</TableHead>
                            <TableHead className="h-10 w-16 text-right font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="py-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="h-5 w-5 text-gray-400" />
                                        <p>No offices found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((office, index) => {
                                const supervisor = getSupervisor(office.id);
                                const isSelected = selectedOfficeId === office.id;

                                return (
                                    <Fragment key={office.id}>
                                        <TableRow
                                            className={`border-b border-gray-200 transition-colors ${
                                                isSelected
                                                    ? 'bg-blue-50'
                                                    : index % 2 === 0
                                                      ? 'bg-white'
                                                      : 'bg-gray-50'
                                            }`}
                                        >
                                            <TableCell className="h-12 font-medium text-gray-900">
                                                {office.name}
                                            </TableCell>
                                            <TableCell className="h-12">
                                                {supervisor ? (
                                                    <Badge variant="secondary" className="text-xs">
                                                        <UserCheck className="mr-1 h-3 w-3" />
                                                        {supervisor.name}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs italic text-gray-400">
                                                        No supervisor assigned
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="h-12 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-3 text-xs"
                                                    onClick={() => toggleOffice(office)}
                                                >
                                                    Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>

                                        {/* Inline assignment editor */}
                                        {isSelected && (
                                            <TableRow className="bg-blue-50/70 border-b border-blue-100">
                                                <TableCell colSpan={3} className="px-6 py-3">
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor={`sup-select-${office.id}`}
                                                            className="text-xs font-medium text-gray-600"
                                                        >
                                                            Select supervisor for{' '}
                                                            <span className="font-semibold text-gray-800">
                                                                {office.name}
                                                            </span>
                                                        </Label>
                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                id={`sup-select-${office.id}`}
                                                                value={pendingSupervisorId ?? ''}
                                                                onChange={(e) =>
                                                                    setPendingSupervisorId(
                                                                        e.target.value
                                                                            ? Number(e.target.value)
                                                                            : null,
                                                                    )
                                                                }
                                                                className="h-8 min-w-56 rounded-md border border-gray-300 px-3 text-sm"
                                                            >
                                                                <option value="">— None —</option>
                                                                {supervisors.map((s) => (
                                                                    <option key={s.id} value={s.id}>
                                                                        {s.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <Button
                                                                size="sm"
                                                                className="h-8 text-xs"
                                                                onClick={handleSave}
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 text-xs"
                                                                onClick={cancelEdit}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </Fragment>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
            <AdminPagination
                paginated={offices}
                route={paginationRoute}
                pageParam="supervisor_office_page"
                itemLabel="offices"
                query={paginationQuery}
            />
        </div>
    );
}
