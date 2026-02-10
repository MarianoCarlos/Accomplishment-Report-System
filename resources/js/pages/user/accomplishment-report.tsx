import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { accomplishmentReport, userDashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: userDashboard().url },
    { title: 'Accomplishment Report', href: accomplishmentReport().url },
];

function generateDays(start: Date, end: Date) {
    const days: Date[] = [];

    const current = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
    );

    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    while (current <= last) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return days;
}

function isDateInRange(date: Date, start: Date, end: Date) {
    return date >= start && date <= end;
}

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

type Report = {
    id: number;
    startDate: Date;
    endDate: Date;
};

export default function AccomplishmentReport() {
    const [reports, setReports] = useState<Report[]>([]);
    const [archivedReports, setArchivedReports] = useState<Report[]>([]);
    const [nextId, setNextId] = useState(1);

    const [expandedReportId, setExpandedReportId] = useState<number | null>(
        null,
    );

    const [open, setOpen] = useState(false);
    const [range, setRange] = useState<DateRange | undefined>();

    const [openYear, setOpenYear] = useState<number | null>(null);
    const [openMonth, setOpenMonth] = useState<number | null>(null);

    const [yearSearch, setYearSearch] = useState('');
    const [monthSearch, setMonthSearch] = useState('');

    const groupedArchived = useMemo(
        () => groupArchivedReports(archivedReports),
        [archivedReports],
    );

    const disabledDates = useMemo(
        () => (date: Date) =>
            reports.some((report) =>
                isDateInRange(date, report.startDate, report.endDate),
            ),
        [reports],
    );

    const addReport = () => {
        if (!range?.from || !range?.to) return;

        setReports((prev) => [
            ...prev,
            {
                id: nextId,
                startDate: range.from!,
                endDate: range.to!,
            },
        ]);

        setNextId((prev) => prev + 1);
        setRange(undefined);
        setOpen(false);
    };

    const archiveReport = (id: number) => {
        const report = reports.find((r) => r.id === id);
        if (!report) return;

        setReports((prev) => prev.filter((r) => r.id !== id));
        setArchivedReports((prev) => [...prev, report]);
        setExpandedReportId(null);
    };

    const retrieveReport = (id: number) => {
        const report = archivedReports.find((r) => r.id === id);
        if (!report) return;

        setArchivedReports((prev) => prev.filter((r) => r.id !== id));
        setReports((prev) => [...prev, report]);
    };

    const expandedReport = useMemo(
        () => reports.find((r) => r.id === expandedReportId),
        [reports, expandedReportId],
    );

    function matchesYearSearch(search: string, year: number) {
        if (!search.trim()) return true;
        return year.toString().includes(search.trim());
    }

    function matchesMonthSearch(search: string, year: number, month: number) {
        if (!search.trim()) return true;

        const monthName = format(
            new Date(year, month, 1),
            'MMMM',
        ).toLowerCase();

        return monthName.includes(search.toLowerCase().trim());
    }

    useEffect(() => {
        if (!yearSearch && !monthSearch) return;

        for (const [year, months] of Object.entries(groupedArchived)) {
            const yearNumber = Number(year);

            if (!matchesYearSearch(yearSearch, yearNumber)) continue;

            // Open the matching year
            setOpenYear(yearNumber);

            for (const month of Object.keys(months)) {
                const monthNumber = Number(month);

                if (matchesMonthSearch(monthSearch, yearNumber, monthNumber)) {
                    // Open the matching month
                    setOpenMonth(monthNumber);
                    return;
                }
            }

            // If year matches but no month search, just open year
            setOpenMonth(null);
            return;
        }
    }, [yearSearch, monthSearch]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accomplishment Report" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Accomplishments</h1>

                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button disabled={expandedReportId !== null}>
                                Add Accomplishment
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0" align="end">
                            <div className="p-3">
                                <Calendar
                                    mode="range"
                                    selected={range}
                                    onSelect={setRange}
                                    numberOfMonths={1}
                                    disabled={disabledDates}
                                />

                                <div className="mt-3 flex items-center justify-between gap-2">
                                    <div className="text-sm text-muted-foreground">
                                        {range?.from && range?.to ? (
                                            <>
                                                {format(range.from, 'MMM dd')} –{' '}
                                                {format(
                                                    range.to,
                                                    'MMM dd, yyyy',
                                                )}
                                            </>
                                        ) : (
                                            'Select a date range'
                                        )}
                                    </div>

                                    <Button
                                        size="sm"
                                        onClick={addReport}
                                        disabled={!range?.from || !range?.to}
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Active reports */}
                {reports.length > 0 && (
                    <div className="grid max-w-xl grid-cols-2 gap-3">
                        {reports.map((report) => {
                            const expanded = report.id === expandedReportId;
                            const isDisabled =
                                expandedReportId !== null &&
                                expandedReportId !== report.id;

                            return (
                                <div
                                    key={report.id}
                                    className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm font-semibold transition ${
                                        isDisabled
                                            ? 'cursor-not-allowed opacity-40'
                                            : 'border-input bg-background'
                                    } `}
                                >
                                    <button
                                        disabled={isDisabled}
                                        onClick={() =>
                                            setExpandedReportId(
                                                expanded ? null : report.id,
                                            )
                                        }
                                        className="flex flex-1 items-center justify-between disabled:pointer-events-none"
                                    >
                                        <span>
                                            {format(report.startDate, 'MMM dd')}{' '}
                                            –{' '}
                                            {format(
                                                report.endDate,
                                                'MMM dd, yyyy',
                                            )}
                                        </span>
                                        <span className="ml-2 text-xs">
                                            {expanded ? '▲' : '▼'}
                                        </span>
                                    </button>

                                    <button
                                        disabled={isDisabled}
                                        onClick={() => archiveReport(report.id)}
                                        className="ml-3 text-xs font-medium text-destructive hover:underline disabled:pointer-events-none"
                                    >
                                        Archive
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Expanded report body */}
                {expandedReport && (
                    <div className="mt-2 rounded-xl border p-4">
                        <table className="w-full">
                            <tbody>
                                {generateDays(
                                    expandedReport.startDate,
                                    expandedReport.endDate,
                                ).map((date, index) => (
                                    <tr key={index}>
                                        <td className="w-28 py-2 text-sm font-medium">
                                            {format(date, 'MMM dd')}
                                        </td>
                                        <td>
                                            <textarea
                                                rows={2}
                                                className="w-full rounded-md border p-2 text-sm"
                                                placeholder="Write your accomplishment..."
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer actions */}
                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setExpandedReportId(null)}
                            >
                                Cancel
                            </Button>

                            <Button onClick={() => setExpandedReportId(null)}>
                                Save Report
                            </Button>
                        </div>
                    </div>
                )}

                {/* Archived reports – Folder view */}
                {archivedReports.length > 0 && (
                    <div className="mt-8 max-w-xl">
                        <h2 className="mb-3 text-lg font-semibold">
                            Archived Reports
                        </h2>
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
                                    className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
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
                                    className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {Object.entries(groupedArchived)
                                .sort((a, b) => Number(b[0]) - Number(a[0]))
                                .filter(([year]) =>
                                    matchesYearSearch(yearSearch, Number(year)),
                                )
                                .map(([year, months]) => {
                                    const yearNumber = Number(year);
                                    const yearOpen = openYear === yearNumber;

                                    return (
                                        <div
                                            key={year}
                                            className="rounded-md border"
                                        >
                                            {/* YEAR */}
                                            <button
                                                onClick={() =>
                                                    setOpenYear(
                                                        yearOpen
                                                            ? null
                                                            : yearNumber,
                                                    )
                                                }
                                                className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold"
                                            >
                                                📁 {year}
                                                <span>
                                                    {yearOpen ? '▲' : '▼'}
                                                </span>
                                            </button>

                                            {/* MONTHS */}
                                            {yearOpen && (
                                                <div className="border-t">
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
                                                        ) // ascending months
                                                        .filter(([month]) =>
                                                            matchesMonthSearch(
                                                                monthSearch,
                                                                yearNumber,
                                                                Number(month),
                                                            ),
                                                        )
                                                        .map(
                                                            ([
                                                                month,
                                                                reports,
                                                            ]) => {
                                                                const monthNumber =
                                                                    Number(
                                                                        month,
                                                                    );
                                                                const monthOpen =
                                                                    openMonth ===
                                                                    monthNumber;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            month
                                                                        }
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
                                                            },
                                                        )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
