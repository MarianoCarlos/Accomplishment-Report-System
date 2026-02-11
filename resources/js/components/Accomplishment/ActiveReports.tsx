import { format } from 'date-fns';
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
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Accomplishments</h1>

                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button disabled={expandedId !== null}>
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

                {/* Active list */}
                {reports.length > 0 && (
                    <div className="grid max-w-xl grid-cols-2 gap-3">
                        {reports.map((report) => {
                            const expanded = report.id === expandedId;
                            const isDisabled =
                                expandedId !== null && expandedId !== report.id;

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
                                            setExpandedId(
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

                {/* Expanded editor */}
                {expandedReport && (
                    <div className="mt-2 rounded-xl border p-4">
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
                                        <td className="w-28 py-2 text-center text-sm font-medium">
                                            {format(date, 'MMM dd')}
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
                        <div className="mt-4 flex justify-end gap-2 print:hidden">
                            <Button
                                variant="outline"
                                onClick={() => setExpandedId(null)}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setExpandedId(null)}
                            >
                                Save Report
                            </Button>

                            <Button onClick={() => setIsPrintModalOpen(true)}>
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
                        }, 100);
                    }}
                />
            </div>

            {/* PRINT TEMPLATE - visible only when printing */}
        </>
    );
}
