import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Folder,
    FolderOpen,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    Undo2,
    Search,
    Archive,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import * as ReportController from '@/actions/App/Http/Controllers/ReportController';
import ReportStatusBadge from '@/components/Accomplishment/ReportStatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Report } from '@/pages/user/accomplishment-report';

/* ── helpers ───────────────────────────────────────────────── */

function groupArchivedReports(reports: Report[]) {
    const map: Record<number, Record<number, Report[]>> = {};

    reports.forEach((report) => {
        const startDate = new Date(report.startDate + 'T00:00:00');
        const year = startDate.getFullYear();
        const month = startDate.getMonth(); // 0–11

        if (!map[year]) map[year] = {};
        if (!map[year][month]) map[year][month] = [];

        map[year][month].push(report);
    });

    return map;
}

function matchesYearSearch(search: string, year: number) {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase().trim();
    return year.toString().includes(searchLower);
}

function matchesMonthSearch(search: string, year: number, month: number) {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase().trim();
    const monthName = format(new Date(year, month, 1), 'MMMM').toLowerCase();

    return (
        monthName.includes(searchLower) || year.toString().includes(searchLower)
    );
}

/* ── sub-components ────────────────────────────────────────── */

function ReportRow({
    report,
    onRetrieve,
}: {
    report: Report;
    onRetrieve: (id: number) => void;
}) {
    return (
        <div className="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted/40">
            {/* Date range */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm font-medium">
                    {format(new Date(report.startDate + 'T00:00:00'), 'MMM dd')}{' '}
                    –{' '}
                    {format(new Date(report.endDate + 'T00:00:00'), 'MMM dd')}
                </span>
            </div>

            {/* Status */}
            <ReportStatusBadge status={report.reviewStatus} />

            {/* Retrieve */}
            <Button
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 gap-1.5 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => onRetrieve(report.id)}
            >
                <Undo2 className="h-3.5 w-3.5" />
                Restore
            </Button>
        </div>
    );
}

function MonthGroup({
    yearNumber,
    monthNumber,
    reports,
    isOpen,
    onToggle,
    onRetrieve,
    onRestoreAll,
}: {
    yearNumber: number;
    monthNumber: number;
    reports: Report[];
    isOpen: boolean;
    onToggle: () => void;
    onRetrieve: (id: number) => void;
    onRestoreAll: (reports: Report[]) => void;
}) {
    return (
        <div>
            {/* Month header */}
            <div className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-muted/30">
                <button
                    type="button"
                    onClick={onToggle}
                    className="flex flex-1 items-center gap-2"
                >
                    {isOpen ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">
                        {format(new Date(yearNumber, monthNumber, 1), 'MMMM')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {reports.length} {reports.length === 1 ? 'report' : 'reports'}
                    </span>
                </button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => onRestoreAll(reports)}
                >
                    <Undo2 className="h-3 w-3" />
                    Restore All
                </Button>
            </div>

            {/* Report list */}
            {isOpen && (
                <div className="ml-5 mt-1 flex flex-col gap-2 border-l-2 border-muted pl-4 pb-2">
                    {reports.map((report) => (
                        <ReportRow
                            key={report.id}
                            report={report}
                            onRetrieve={onRetrieve}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── main component ────────────────────────────────────────── */

type Props = {
    archivedReports: Report[];
};

export default function ArchivedReports({ archivedReports }: Props) {
    const [openYear, setOpenYear] = useState<number | null>(null);
    const [openMonth, setOpenMonth] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const groupedArchived = useMemo(
        () => groupArchivedReports(archivedReports),
        [archivedReports],
    );

    const autoOpen = (() => {
        if (!searchQuery.trim()) {
            return { year: null, month: null };
        }

        for (const [year, months] of Object.entries(groupedArchived)) {
            const yearNumber = Number(year);

            for (const month of Object.keys(months)) {
                const monthNumber = Number(month);

                if (
                    matchesMonthSearch(searchQuery, yearNumber, monthNumber)
                ) {
                    return {
                        year: yearNumber,
                        month: `${yearNumber}-${monthNumber}`,
                    };
                }
            }

            if (matchesYearSearch(searchQuery, yearNumber)) {
                return { year: yearNumber, month: null };
            }
        }

        return { year: null, month: null };
    })();

    const retrieveReport = (id: number) => {
        router.patch(
            ReportController.restore(id).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Report restored successfully.');
                }
            },
        );
    };

    const retrieveMonthReports = (monthReports: Report[]) => {
        monthReports.forEach((report) => {
            router.patch(
                ReportController.restore(report.id).url,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Report restored successfully.');
                    }
                },
            );
        });
    };

    const sortedYears = useMemo(
        () =>
            Object.entries(groupedArchived)
                .sort((a, b) => Number(b[0]) - Number(a[0]))
                .filter(([year, months]) => {
                    const yearNumber = Number(year);

                    if (matchesYearSearch(searchQuery, yearNumber)) return true;

                    return Object.keys(months).some((month) =>
                        matchesMonthSearch(
                            searchQuery,
                            yearNumber,
                            Number(month),
                        ),
                    );
                }),
        [groupedArchived, searchQuery],
    );

    return (
        <div className="mt-8 max-w-2xl">
            {/* Section header */}
            <div className="mb-4 flex items-center gap-2">
                <Archive className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Archived Reports</h2>
            </div>

            {/* Search */}
            <div className="relative mb-5">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by year or month…"
                    className="pl-9"
                />
            </div>

            {archivedReports.length === 0 ? (
                <Card className="flex flex-col items-center gap-2 p-8 text-center">
                    <Archive className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                        No archived reports yet.
                    </p>
                </Card>
            ) : sortedYears.length === 0 ? (
                <Card className="flex flex-col items-center gap-2 p-8 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                        No results for "{searchQuery}"
                    </p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {sortedYears.map(([year, months]) => {
                        const yearNumber = Number(year);
                        const yearOpen = searchQuery.trim()
                            ? autoOpen.year === yearNumber
                            : openYear === yearNumber;
                        const yearReportCount =
                            Object.values(months).flat().length;

                        return (
                            <div key={year} className="rounded-lg border bg-card">
                                {/* Year header */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpenYear(
                                            yearOpen ? null : yearNumber,
                                        )
                                    }
                                    className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-muted/30"
                                >
                                    <div className="flex items-center gap-2.5">
                                        {yearOpen ? (
                                            <FolderOpen className="h-4.5 w-4.5 text-primary" />
                                        ) : (
                                            <Folder className="h-4.5 w-4.5 text-muted-foreground" />
                                        )}
                                        <span className="text-base font-semibold">
                                            {year}
                                        </span>
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                            {yearReportCount}
                                        </span>
                                    </div>
                                    {yearOpen ? (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </button>

                                {/* Months */}
                                {yearOpen && (
                                    <div className="border-t px-4 py-2">
                                        <div className="ml-2 flex flex-col gap-1 border-l-2 border-muted pl-4">
                                            {Object.entries(months)
                                                .sort(
                                                    (a, b) =>
                                                        Number(b[0]) -
                                                        Number(a[0]),
                                                )
                                                .filter(([month]) =>
                                                    matchesMonthSearch(
                                                        searchQuery,
                                                        yearNumber,
                                                        Number(month),
                                                    ),
                                                )
                                                .map(([month, reports]) => {
                                                    const monthNumber =
                                                        Number(month);
                                                    const monthKey = `${yearNumber}-${monthNumber}`;
                                                    const monthOpen =
                                                        searchQuery.trim()
                                                            ? autoOpen.month ===
                                                              monthKey
                                                            : openMonth ===
                                                              monthKey;

                                                    return (
                                                        <MonthGroup
                                                            key={month}
                                                            yearNumber={yearNumber}
                                                            monthNumber={monthNumber}
                                                            reports={reports}
                                                            isOpen={monthOpen}
                                                            onToggle={() =>
                                                                setOpenMonth(
                                                                    monthOpen
                                                                        ? null
                                                                        : monthKey,
                                                                )
                                                            }
                                                            onRetrieve={retrieveReport}
                                                            onRestoreAll={retrieveMonthReports}
                                                        />
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
