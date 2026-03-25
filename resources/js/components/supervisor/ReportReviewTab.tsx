import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Fragment, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface MockEntry {
    id: number;
    content: string;
}

export interface MockReport {
    id: number;
    employeeId: number;
    employeeName: string;
    employeePosition: string;
    entries: Record<string, MockEntry>;
}

interface ReportReviewTabProps {
    reports: MockReport[];
}

export default function ReportReviewTab({ reports }: ReportReviewTabProps) {
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const filtered = reports.filter((r) =>
        r.employeeName.toLowerCase().includes(search.toLowerCase()),
    );

    const toggleExpand = (id: number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="space-y-1.5">
                <Label htmlFor="report-search" className="text-sm font-medium">
                    Search Employee
                </Label>
                <div className="relative w-56">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        id="report-search"
                        placeholder="Employee name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 pl-8 text-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
                <Table className="text-sm">
                    <TableHeader className="bg-gray-50">
                        <TableRow className="border-b border-gray-200">
                            <TableHead className="h-10 font-semibold text-gray-700">Employee</TableHead>
                            <TableHead className="h-10 font-semibold text-gray-700">Position</TableHead>
                            <TableHead className="h-10 w-20 text-right font-semibold text-gray-700">
                                Details
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="py-10 text-center text-sm text-gray-500"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="h-5 w-5 text-gray-400" />
                                        <p>No reports found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((report, index) => {
                                const isExpanded = expandedId === report.id;
                                const entries = Object.entries(report.entries).sort(
                                    ([a], [b]) => a.localeCompare(b),
                                );

                                return (
                                    <Fragment key={report.id}>
                                        <TableRow
                                            className={`border-b border-gray-200 transition-colors ${
                                                isExpanded
                                                    ? 'bg-blue-50'
                                                    : index % 2 === 0
                                                      ? 'bg-white'
                                                      : 'bg-gray-50/50'
                                            }`}
                                        >
                                            <TableCell className="h-12 font-medium text-gray-900">
                                                {report.employeeName}
                                            </TableCell>
                                            <TableCell className="h-12 text-gray-600">
                                                {report.employeePosition}
                                            </TableCell>
                                            <TableCell className="h-12 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 gap-1 px-2 text-xs"
                                                    onClick={() => toggleExpand(report.id)}
                                                >
                                                    {isExpanded ? (
                                                        <>
                                                            <ChevronUp className="h-3 w-3" />
                                                            Hide
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="h-3 w-3" />
                                                            View
                                                        </>
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>

                                        {/* Inline expanded entries */}
                                        {isExpanded && (
                                            <TableRow className="border-b border-blue-100 bg-blue-50/60">
                                                <TableCell colSpan={3} className="px-6 py-4">
                                                    <div className="space-y-3">
                                                        {entries.length === 0 ? (
                                                            <p className="text-sm italic text-gray-400">
                                                                No entries for this report.
                                                            </p>
                                                        ) : (
                                                            <div className="divide-y divide-blue-100 rounded-md border border-blue-100 bg-white">
                                                                {entries.map(([date, entry]) => {
                                                                    const [y, m, d] = date.split('-');
                                                                    const months = [
                                                                        'Jan','Feb','Mar','Apr','May','Jun',
                                                                        'Jul','Aug','Sep','Oct','Nov','Dec',
                                                                    ];
                                                                    const label = `${months[Number(m) - 1]} ${Number(d)}, ${y}`;
                                                                    return (
                                                                        <div
                                                                            key={date}
                                                                            className="flex gap-4 px-4 py-2.5"
                                                                        >
                                                                            <span className="w-28 shrink-0 text-xs font-medium text-gray-500">
                                                                                {label}
                                                                            </span>
                                                                            <span className="flex-1 text-sm text-gray-800">
                                                                                {entry.content}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
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
        </div>
    );
}