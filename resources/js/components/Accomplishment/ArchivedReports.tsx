import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Folder,
    FolderOpen,
    FileText,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import * as ReportController from '@/actions/App/Http/Controllers/ReportController';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Report } from '@/pages/user/accomplishment-report';

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
            { preserveScroll: true },
        );
    };

    const retrieveMonthReports = (monthReports: Report[]) => {
        monthReports.forEach((report) => {
            router.patch(
                ReportController.restore(report.id).url,
                {},
                { preserveScroll: true },
            );
        });
    };

    return (
        <div className="mt-8 max-w-3xl">
            <h2 className="mb-4 text-lg font-semibold">Archived Reports</h2>

            {/* Search input */}
            <div className="mb-4">
                <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. 2026 or February"
                />
            </div>

            {archivedReports.length === 0 ? (
                <Card className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">No archived reports yet.</p>
                </Card>
            ) : (
                <div className="space-y-2">
                    {Object.entries(groupedArchived)
                        .sort((a, b) => Number(b[0]) - Number(a[0]))
                        .filter(([year, months]) => {
                            const yearNumber = Number(year);

                            if (matchesYearSearch(searchQuery, yearNumber))
                                return true;

                            return Object.keys(months).some((month) =>
                                matchesMonthSearch(
                                    searchQuery,
                                    yearNumber,
                                    Number(month),
                                ),
                            );
                        })
                        .map(([year, months]) => {
                            const yearNumber = Number(year);
                            const yearOpen =
                                searchQuery.trim()
                                    ? autoOpen.year === yearNumber
                                    : openYear === yearNumber;
                            const yearReportCount =
                                Object.values(months).flat().length;

                            return (
                                <div
                                    key={year}
                                    className="overflow-hidden rounded-lg border"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenYear(
                                                yearOpen ? null : yearNumber,
                                            )
                                        }
                                        className="flex w-full items-center justify-between bg-muted/40 px-4 py-3 font-semibold hover:bg-muted/50"
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

                                    {yearOpen && (
                                        <div className="border-t">
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
                                                            ? autoOpen.month === monthKey
                                                            : openMonth === monthKey;

                                                    return (
                                                        <div
                                                            key={month}
                                                            className="border-t"
                                                        >
                                                            <div className="flex items-center justify-between px-6 py-2 hover:bg-muted/30">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setOpenMonth(
                                                                            monthOpen
                                                                                ? null
                                                                                : monthKey,
                                                                        )
                                                                    }
                                                                    className="flex items-center gap-2"
                                                                >
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
                                                                    {monthOpen ? (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronRight className="h-4 w-4" />
                                                                    )}
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        retrieveMonthReports(
                                                                            reports,
                                                                        )
                                                                    }
                                                                    className="text-xs font-medium text-primary hover:underline"
                                                                >
                                                                    Restore All
                                                                </button>
                                                            </div>

                                                            {monthOpen && (
                                                                <div className="grid grid-cols-2 gap-3 bg-background px-8 py-3">
                                                                    {reports.map(
                                                                        (
                                                                            report,
                                                                        ) => (
                                                                            <Card
                                                                                key={
                                                                                    report.id
                                                                                }
                                                                                className="flex flex-col gap-3 p-4"
                                                                            >
                                                                                <div className="flex items-start gap-2">
                                                                                    <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                                                                    <div>
                                                                                        <span className="block font-medium">
                                                                                            {format(
                                                                                                new Date(report.startDate + 'T00:00:00'),
                                                                                                'MMM dd',
                                                                                            )}{' '}
                                                                                            –{' '}
                                                                                            {format(
                                                                                                new Date(report.endDate + 'T00:00:00'),
                                                                                                'MMM dd',
                                                                                            )}
                                                                                        </span>
                                                                                        <span className="text-xs text-muted-foreground">
                                                                                            {format(
                                                                                                new Date(report.endDate + 'T00:00:00'),
                                                                                                'yyyy',
                                                                                            )}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        retrieveReport(
                                                                                            report.id,
                                                                                        )
                                                                                    }
                                                                                    className="text-xs font-medium text-primary hover:underline"
                                                                                >
                                                                                    Retrieve
                                                                                </button>
                                                                            </Card>
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
