import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { useState } from 'react';
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
    const current = new Date(start);

    while (current <= end) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return days;
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

    /** archive filters */
    const [archiveYear, setArchiveYear] = useState<number | 'all'>('all');
    const [archiveMonth, setArchiveMonth] = useState<number | 'all'>('all');

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

    const expandedReport = reports.find(
        (report) => report.id === expandedReportId,
    );

    const filteredArchivedReports = archivedReports.filter((report) => {
        const year = report.startDate.getFullYear();
        const month = report.startDate.getMonth() + 1;

        if (archiveYear !== 'all' && year !== archiveYear) return false;
        if (archiveMonth !== 'all' && month !== archiveMonth) return false;

        return true;
    });

    const archiveYears = Array.from(
        new Set(archivedReports.map((r) => r.startDate.getFullYear())),
    ).sort((a, b) => b - a);

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

                {/* Archived reports with filters */}
                {archivedReports.length > 0 && (
                    <div className="mt-8 max-w-xl">
                        <h2 className="mb-3 text-lg font-semibold">
                            Archived Reports
                        </h2>

                        {/* Filters */}
                        <div className="mb-3 flex gap-2">
                            <select
                                value={archiveYear}
                                onChange={(e) =>
                                    setArchiveYear(
                                        e.target.value === 'all'
                                            ? 'all'
                                            : Number(e.target.value),
                                    )
                                }
                                className="rounded-md border px-2 py-1 text-sm"
                            >
                                <option value="all">All Years</option>
                                {archiveYears.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={archiveMonth}
                                onChange={(e) =>
                                    setArchiveMonth(
                                        e.target.value === 'all'
                                            ? 'all'
                                            : Number(e.target.value),
                                    )
                                }
                                className="rounded-md border px-2 py-1 text-sm"
                            >
                                <option value="all">All Months</option>
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <option key={i} value={i + 1}>
                                        {format(new Date(2026, i, 1), 'MMMM')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Archived list — SAME FORMAT AS ACTIVE (no dropdown icon) */}
                        <div className="grid grid-cols-2 gap-3">
                            {filteredArchivedReports.map((report) => (
                                <div
                                    key={report.id}
                                    className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold"
                                >
                                    <div className="flex flex-1 items-center">
                                        <span>
                                            {format(report.startDate, 'MMM dd')}{' '}
                                            –{' '}
                                            {format(
                                                report.endDate,
                                                'MMM dd, yyyy',
                                            )}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() =>
                                            retrieveReport(report.id)
                                        }
                                        className="ml-3 text-xs font-medium text-primary hover:underline"
                                    >
                                        Retrieve
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
