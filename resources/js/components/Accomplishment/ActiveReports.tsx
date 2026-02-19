import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Archive, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import TiptapEditor from '@/components/Editor/TiptapEditor';
import PrintReportModal from '@/components/PrintModal/PrintReportModal';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import type { Report } from '@/pages/user/accomplishment-report';

type PrintData = {
    report: Report;
    userName: string;
    position: string;
    office: string;
    reviewer: string;
    approver: string;
};

function generateDays(start: Date, end: Date) {
    const days: Date[] = [];
    const current = new Date(start);

    while (current <= end) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return days;
}

function isDateInRange(date: Date, start: Date, end: Date) {
    return date >= start && date <= end;
}

function countCompletedDays(report: Report): {
    completed: number;
    total: number;
} {
    const days = generateDays(report.startDate, report.endDate);
    const completed = Object.values(report.entries).filter(
        (v) => v.trim() !== '',
    ).length;
    return { completed, total: days.length };
}

type Props = {
    reports: Report[];
    setReports: React.Dispatch<React.SetStateAction<Report[]>>;
    setArchivedReports: React.Dispatch<React.SetStateAction<Report[]>>;
    nextId: number;
    setNextId: React.Dispatch<React.SetStateAction<number>>;
    userName?: string;
    position?: string;
    office?: string;
    setPrintData: (data: PrintData) => void;
};

export default function ActiveReports({
    reports,
    setReports,
    setArchivedReports,
    nextId,
    setNextId,
    userName = 'User Name',
    position = 'Project Technical Staff I',
    office = 'HEMIS',
    setPrintData,
}: Props) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [open, setOpen] = useState(false);
    const [range, setRange] = useState<DateRange | undefined>();
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

    const disabledDates = useMemo(
        () => (date: Date) =>
            reports.some((r) => isDateInRange(date, r.startDate, r.endDate)),
        [reports],
    );

    const addReport = () => {
        if (!range?.from || !range?.to) return;

        const days = generateDays(range.from, range.to);

        const entries: Record<string, string> = {};
        days.forEach((day) => {
            entries[format(day, 'yyyy-MM-dd')] = '';
        });

        setReports((prev) => [
            ...prev,
            {
                id: nextId,
                startDate: range.from!,
                endDate: range.to!,
                entries,
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
        setExpandedId(null);
    };

    const expandedReport = reports.find((r) => r.id === expandedId);

    return (
        <>
            {/* NORMAL SCREEN CONTENT */}
            <div className="print:hidden">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Accomplishments
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage and submit your bi-monthly accomplishment
                            reports.
                        </p>
                    </div>

                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                disabled={expandedId !== null}
                                className="shadow-sm"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Accomplishment
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent
                            align="end"
                            side="bottom"
                            sideOffset={8}
                            className="w-auto rounded-xl p-0 shadow-lg"
                        >
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

                {/* Active list */}
                {reports.length > 0 && (
                    <div className="grid max-w-2xl grid-cols-2 gap-3">
                        {reports.map((report) => {
                            const expanded = report.id === expandedId;
                            const isDisabled =
                                expandedId !== null && expandedId !== report.id;
                            const { completed, total } =
                                countCompletedDays(report);

                            return (
                                <div
                                    key={report.id}
                                    className={`flex flex-col rounded-lg border bg-muted/30 px-4 py-3 shadow-sm transition hover:shadow-md ${
                                        isDisabled
                                            ? 'cursor-not-allowed opacity-40'
                                            : ''
                                    }`}
                                >
                                    <button
                                        disabled={isDisabled}
                                        onClick={() =>
                                            setExpandedId(
                                                expanded ? null : report.id,
                                            )
                                        }
                                        className="flex items-center justify-between disabled:pointer-events-none"
                                    >
                                        <span className="text-sm font-semibold">
                                            {format(report.startDate, 'MMM dd')}{' '}
                                            –{' '}
                                            {format(
                                                report.endDate,
                                                'MMM dd, yyyy',
                                            )}
                                        </span>
                                        {expanded ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </button>

                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            {completed}/{total} days completed
                                        </span>

                                        <button
                                            disabled={isDisabled}
                                            onClick={() =>
                                                archiveReport(report.id)
                                            }
                                            className="text-destructive transition hover:opacity-80 disabled:pointer-events-none"
                                            title="Archive"
                                        >
                                            <Archive className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Expanded editor */}
                {expandedReport && (
                    <div className="mt-4 rounded-xl border bg-muted/20 p-6">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold">
                                {format(expandedReport.startDate, 'MMM dd')} –{' '}
                                {format(expandedReport.endDate, 'MMM dd, yyyy')}
                            </h2>
                        </div>

                        <table className="w-full">
                            <tbody>
                                {generateDays(
                                    expandedReport.startDate,
                                    expandedReport.endDate,
                                ).map((date) => (
                                    <tr
                                        key={date.toISOString()}
                                        className="align-middle"
                                    >
                                        <td className="w-28 py-3 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs tracking-wide text-muted-foreground uppercase">
                                                    {format(date, 'EEE')}
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {format(date, 'dd')}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="py-2">
                                            <TiptapEditor
                                                value={
                                                    expandedReport.entries[
                                                        format(
                                                            date,
                                                            'yyyy-MM-dd',
                                                        )
                                                    ] ?? ''
                                                }
                                                onChange={(value) => {
                                                    const key = format(
                                                        date,
                                                        'yyyy-MM-dd',
                                                    );

                                                    setReports((prev) =>
                                                        prev.map((report) =>
                                                            report.id ===
                                                            expandedReport.id
                                                                ? {
                                                                      ...report,
                                                                      entries: {
                                                                          ...report.entries,
                                                                          [key]: value,
                                                                      },
                                                                  }
                                                                : report,
                                                        ),
                                                    );
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer actions */}
                        <div className="mt-6 flex justify-end gap-2 print:hidden">
                            <Button
                                variant="ghost"
                                onClick={() => setExpandedId(null)}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="secondary"
                                onClick={() => setExpandedId(null)}
                            >
                                Save Report
                            </Button>

                            <Button
                                onClick={() => {
                                    setIsPrintModalOpen(true);
                                }}
                            >
                                Print
                            </Button>
                        </div>
                    </div>
                )}

                <PrintReportModal
                    isOpen={isPrintModalOpen}
                    onClose={() => setIsPrintModalOpen(false)}
                    userName={userName}
                    onConfirm={(reviewer, approver) => {
                        if (!expandedReport) return;

                        setPrintData({
                            report: expandedReport,
                            userName,
                            position,
                            office,
                            reviewer,
                            approver,
                        });

                        setIsPrintModalOpen(false);

                        setTimeout(() => {
                            window.print();
                            setExpandedId(null);
                        }, 100);
                    }}
                />
            </div>

            {/* PRINT TEMPLATE - visible only when printing */}
        </>
    );
}
