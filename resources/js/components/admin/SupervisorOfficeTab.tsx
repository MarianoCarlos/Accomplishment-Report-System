import { Search, UserCheck } from 'lucide-react';
import { Fragment, useState } from 'react';
import AdminPagination from '@/components/admin/AdminPagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
        <div className="space-y-5">

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
                            <TableHead className="h-10 pl-4 font-semibold text-gray-600">Office</TableHead>
                            <TableHead className="h-10 font-semibold text-gray-600">Assigned Supervisor</TableHead>
                            <TableHead className="h-10 pr-4 w-24 text-right font-semibold text-gray-600">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="py-10 text-center text-sm text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="h-5 w-5 text-gray-300" />
                                        <span>No offices found</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((office) => {
                                const supervisor = getSupervisor(office.id);
                                const isSelected = selectedOfficeId === office.id;

                                return (
                                    <Fragment key={office.id}>
                                        <TableRow
                                            className={`border-b border-gray-100 ${
                                                isSelected ? 'bg-blue-50/30' : 'bg-white'
                                            }`}
                                        >
                                            <TableCell className="h-12 pl-4 font-medium text-gray-900">
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
                                            <TableCell className="h-12 pr-4 text-right">
                                                {!isSelected && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 px-3 text-xs"
                                                        onClick={() => toggleOffice(office)}
                                                    >
                                                        Assign
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>

                                        {/* Inline assignment editor */}
                                        {isSelected && (
                                            <TableRow className="border-b border-blue-100 bg-blue-50/60">
                                                <TableCell colSpan={3} className="px-4 py-3">
                                                    <div className="flex flex-wrap items-end gap-3">
                                                        <div className="flex-1 space-y-1 min-w-[220px]">
                                                            <Label
                                                                htmlFor={`sup-select-${office.id}`}
                                                                className="text-xs font-medium text-gray-600"
                                                            >
                                                                Supervisor for{' '}
                                                                <span className="font-semibold text-gray-800">
                                                                    {office.name}
                                                                </span>
                                                            </Label>
                                                            <Select
                                                                value={pendingSupervisorId?.toString() ?? '__none__'}
                                                                onValueChange={(val) =>
                                                                    setPendingSupervisorId(
                                                                        val === '__none__' ? null : Number(val),
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger
                                                                    id={`sup-select-${office.id}`}
                                                                    className="h-9 bg-white text-sm"
                                                                >
                                                                    <SelectValue placeholder="Select a supervisor" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="__none__">— None —</SelectItem>
                                                                    {supervisors.map((s) => (
                                                                        <SelectItem key={s.id} value={s.id.toString()}>
                                                                            {s.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="h-9 px-4"
                                                                onClick={handleSave}
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-9 px-4"
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
