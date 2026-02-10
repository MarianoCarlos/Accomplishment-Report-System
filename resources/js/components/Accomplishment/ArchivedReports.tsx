import { format } from 'date-fns';
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
    return year.toString().includes(search.trim());
}

function matchesMonthSearch(search: string, year: number, month: number) {
    if (!search.trim()) return true;

    const monthName = format(new Date(year, month, 1), 'MMMM').toLowerCase();

    return monthName.includes(search.toLowerCase().trim());
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

    const [yearSearch, setYearSearch] = useState('');
    const [monthSearch, setMonthSearch] = useState('');

    const groupedArchived = useMemo(
        () => groupArchivedReports(archivedReports),
        [archivedReports],
    );

    const autoOpen = (() => {
        if (!yearSearch && !monthSearch) {
            return { year: null, month: null };
        }

        for (const [year, months] of Object.entries(groupedArchived)) {
            const yearNumber = Number(year);

            if (!matchesYearSearch(yearSearch, yearNumber)) continue;

            if (!monthSearch) {
                return { year: yearNumber, month: null };
            }

            for (const month of Object.keys(months)) {
                const monthNumber = Number(month);

                if (matchesMonthSearch(monthSearch, yearNumber, monthNumber)) {
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

    return (
        <div className="mt-8 max-w-xl">
            <h2 className="mb-3 text-lg font-semibold">Archived Reports</h2>

            {/* Search inputs */}
            <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">
                        Year
                    </label>
                    <input
                        type="text"
                        value={yearSearch}
                        onChange={(e) => setYearSearch(e.target.value)}
                        placeholder="e.g. 2026"
                        className="rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 focus:outline-none"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">
                        Month
                    </label>
                    <input
                        type="text"
                        value={monthSearch}
                        onChange={(e) => setMonthSearch(e.target.value)}
                        placeholder="e.g. Feb"
                        className="rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 focus:outline-none"
                    />
                </div>
            </div>

            {/* Folder structure */}
            <div className="space-y-2">
                {Object.entries(groupedArchived)
                    .sort((a, b) => Number(b[0]) - Number(a[0]))
                    .filter(([year]) =>
                        matchesYearSearch(yearSearch, Number(year)),
                    )
                    .map(([year, months]) => {
                        const yearNumber = Number(year);
                        const yearOpen =
                            openYear === yearNumber ||
                            autoOpen.year === yearNumber;

                        return (
                            <div key={year} className="rounded-md border">
                                {/* YEAR */}
                                <button
                                    onClick={() =>
                                        setOpenYear(
                                            yearOpen ? null : yearNumber,
                                        )
                                    }
                                    className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold"
                                >
                                    📁 {year}
                                    <span>{yearOpen ? '▲' : '▼'}</span>
                                </button>

                                {/* MONTHS */}
                                {yearOpen && (
                                    <div className="border-t">
                                        {Object.entries(
                                            months as Record<number, Report[]>,
                                        )
                                            .sort(
                                                (a, b) =>
                                                    Number(a[0]) - Number(b[0]),
                                            )
                                            .filter(([month]) =>
                                                matchesMonthSearch(
                                                    monthSearch,
                                                    yearNumber,
                                                    Number(month),
                                                ),
                                            )
                                            .map(([month, reports]) => {
                                                const monthNumber =
                                                    Number(month);
                                                const monthOpen =
                                                    openMonth === monthNumber ||
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
                                                            className="flex w-full items-center justify-between px-6 py-2 text-sm"
                                                        >
                                                            📂{' '}
                                                            {format(
                                                                new Date(
                                                                    yearNumber,
                                                                    monthNumber,
                                                                    1,
                                                                ),
                                                                'MMMM',
                                                            )}
                                                            <span>
                                                                {monthOpen
                                                                    ? '▲'
                                                                    : '▼'}
                                                            </span>
                                                        </button>

                                                        {/* REPORTS */}
                                                        {monthOpen && (
                                                            <div className="grid grid-cols-2 gap-3 px-8 pb-3">
                                                                {reports.map(
                                                                    (
                                                                        report,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                report.id
                                                                            }
                                                                            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm font-semibold"
                                                                        >
                                                                            <span>
                                                                                {format(
                                                                                    report.startDate,
                                                                                    'MMM dd',
                                                                                )}{' '}
                                                                                –{' '}
                                                                                {format(
                                                                                    report.endDate,
                                                                                    'MMM dd, yyyy',
                                                                                )}
                                                                            </span>

                                                                            <button
                                                                                onClick={() =>
                                                                                    retrieveReport(
                                                                                        report.id,
                                                                                    )
                                                                                }
                                                                                className="text-xs font-medium text-primary hover:underline"
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
        </div>
    );
}
