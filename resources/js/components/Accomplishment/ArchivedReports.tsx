import { format } from 'date-fns';
import {
    Folder,
    FolderOpen,
    FileText,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Report } from '@/pages/user/accomplishment-report';

function groupArchivedReports(reports: Report[]) {
    const map: Record<number, Record<number, Report[]>> = {};

    reports.forEach((report) => {
        const year = report.startDate.getFullYear();
        const month = report.startDate.getMonth(); // 0–11

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

type Props = {
    archivedReports: Report[];
    setArchivedReports: React.Dispatch<React.SetStateAction<Report[]>>;
    setReports: React.Dispatch<React.SetStateAction<Report[]>>;
};

export default function ArchivedReports({
    archivedReports,
    setArchivedReports,
    setReports,
}: Props) {
    const [openYear, setOpenYear] = useState<number | null>(null);
    const [openMonth, setOpenMonth] = useState<number | null>(null);

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

            if (!matchesYearSearch(searchQuery, yearNumber)) continue;

            if (!searchQuery) {
                return { year: yearNumber, month: null };
            }

            for (const month of Object.keys(months)) {
                const monthNumber = Number(month);

                if (
                    searchQuery.trim() &&
                    matchesMonthSearch(searchQuery, yearNumber, monthNumber)
                ) {
                    return { year: yearNumber, month: monthNumber };
                }
            }

            return { year: yearNumber, month: null };
        }

        return { year: null, month: null };
    })();

    const retrieveReport = (id: number) => {
        const report = archivedReports.find((r) => r.id === id);
        if (!report) return;

        setArchivedReports((prev) => prev.filter((r) => r.id !== id));
        setReports((prev) => [...prev, report]);
    };

    const retrieveMonthReports = (monthReports: Report[]) => {
        setArchivedReports((prev) =>
            prev.filter((r) => !monthReports.some((mr) => mr.id === r.id)),
        );
        setReports((prev) => [...prev, ...monthReports]);
    };

    return (
        <div className="mt-8 max-w-3xl">
            <h2 className="mb-4 text-lg font-semibold">Archived Reports</h2>

            {/* Search input */}
            <div className="mb-4">
                <label className="text-xs font-medium text-muted-foreground">
                    Search archived reports
                </label>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. 2026 or February"
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm transition focus:ring-2 focus:ring-gray-400 focus:outline-none"
                />
            </div>

            {/* Empty state */}
            {archivedReports.length === 0 ? (
                <div className="rounded-md border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                    No archived reports yet.
                </div>
            ) : (
                /* Folder structure */
                <div className="space-y-2">
                    {Object.entries(groupedArchived)
                        .sort((a, b) => Number(b[0]) - Number(a[0]))
                        .filter(([year]) =>
                            matchesYearSearch(searchQuery, Number(year)),
                        )
                        .map(([year, months]) => {
                            const yearNumber = Number(year);
                            const yearOpen =
                                openYear === yearNumber ||
                                autoOpen.year === yearNumber;
                            const yearReportCount =
                                Object.values(months).flat().length;

                            return (
                                <div
                                    key={year}
                                    className="overflow-hidden rounded-lg border"
                                >
                                    {/* YEAR */}
                                    <button
                                        onClick={() =>
                                            setOpenYear(
                                                yearOpen ? null : yearNumber,
                                            )
                                        }
                                        className="flex w-full items-center justify-between bg-muted/40 px-4 py-3 font-semibold transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-2">
                                            {yearOpen ? (
                                                <FolderOpen className="h-4 w-4" />
                                            ) : (
                                                <Folder className="h-4 w-4" />
                                            )}
                                            <span>{year}</span>
                                            <span className="text-xs font-normal text-muted-foreground">
                                                ({yearReportCount})
                                            </span>
                                        </div>
                                        {yearOpen ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </button>

                                    {/* MONTHS */}
                                    {yearOpen && (
                                        <div className="border-t transition-all duration-300">
                                            {Object.entries(
                                                months as Record<
                                                    number,
                                                    Report[]
                                                >,
                                            )
                                                .sort(
                                                    (a, b) =>
                                                        Number(a[0]) -
                                                        Number(b[0]),
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
                                                    const monthOpen =
                                                        openMonth ===
                                                            monthNumber ||
                                                        autoOpen.month ===
                                                            monthNumber;

                                                    return (
                                                        <div
                                                            key={month}
                                                            className="border-t"
                                                        >
                                                            {/* MONTH */}
                                                            <button
                                                                onClick={() =>
                                                                    setOpenMonth(
                                                                        monthOpen
                                                                            ? null
                                                                            : monthNumber,
                                                                    )
                                                                }
                                                                className="flex w-full items-center justify-between px-6 py-2 transition-colors hover:bg-muted/30"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                                    <span className="text-sm">
                                                                        {format(
                                                                            new Date(
                                                                                yearNumber,
                                                                                monthNumber,
                                                                                1,
                                                                            ),
                                                                            'MMMM',
                                                                        )}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        (
                                                                        {
                                                                            reports.length
                                                                        }
                                                                        )
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            retrieveMonthReports(
                                                                                reports,
                                                                            );
                                                                        }}
                                                                        className="text-xs font-medium text-primary hover:underline"
                                                                    >
                                                                        Restore
                                                                        All
                                                                    </button>
                                                                    {monthOpen ? (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronRight className="h-4 w-4" />
                                                                    )}
                                                                </div>
                                                            </button>

                                                            {/* REPORTS */}
                                                            {monthOpen && (
                                                                <div className="grid grid-cols-2 gap-3 bg-background px-8 py-3 transition-all duration-300">
                                                                    {reports.map(
                                                                        (
                                                                            report,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    report.id
                                                                                }
                                                                                className="flex flex-col items-start justify-between rounded-md border bg-background p-3 text-sm shadow-sm transition-shadow hover:shadow-md"
                                                                            >
                                                                                <div className="flex w-full items-start gap-2">
                                                                                    <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                                                    <div className="min-w-0 flex-1">
                                                                                        <span className="block font-medium">
                                                                                            {format(
                                                                                                report.startDate,
                                                                                                'MMM dd',
                                                                                            )}{' '}
                                                                                            –{' '}
                                                                                            {format(
                                                                                                report.endDate,
                                                                                                'MMM dd',
                                                                                            )}
                                                                                        </span>
                                                                                        <span className="text-xs text-muted-foreground">
                                                                                            {format(
                                                                                                report.endDate,
                                                                                                'yyyy',
                                                                                            )}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>

                                                                                <button
                                                                                    onClick={() =>
                                                                                        retrieveReport(
                                                                                            report.id,
                                                                                        )
                                                                                    }
                                                                                    className="mt-2 text-xs font-medium text-primary hover:underline"
                                                                                >
                                                                                    Retrieve
                                                                                </button>
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
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
