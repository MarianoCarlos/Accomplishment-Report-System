import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Archive, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import * as ReportController from '@/actions/App/Http/Controllers/ReportController';
import * as ReportEntryController from '@/actions/App/Http/Controllers/ReportEntryController';
import TiptapEditor from '@/components/Editor/TiptapEditor';
import PrintReportModal from '@/components/PrintModal/PrintReportModal';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import type { Report } from '@/pages/user/accomplishment-report';

type PrintData = {
    report: Report;
    position: string;
    office: string;
    reviewer: string;
    approver: string;
};

function normalize(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function generateDays(start: string, end: string) {
    const days: Date[] = [];
    const current = new Date(start + 'T00:00:00');
    const endDate = new Date(end + 'T00:00:00');

    while (current <= endDate) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return days;
}

function isDateInRange(date: Date, start: string, end: string) {
    const d = normalize(date);
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    return d >= s && d <= e;
}

function countCompletedDays(report: Report) {
    const total = Object.keys(report.entries).length;

    const completed = Object.values(report.entries).filter(
        (v) => v.content.trim() !== '',
    ).length;

    return { completed, total };
}

interface Office {
    id: number;
    name: string;
}

interface Position {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

type Props = {
    reports: Report[];
    setPrintData: (data: PrintData) => void;
    offices: Office[];
    positions: Position[];
    users: User[];
};

export default function ActiveReports({ reports, setPrintData, offices, positions, users }: Props) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [open, setOpen] = useState(false);
    const [range, setRange] = useState<DateRange | undefined>();
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

    const updateEntry = (entryId: number, value: string) => {
        router.patch(
            ReportEntryController.update(entryId).url,
            { content: value },
            { preserveScroll: true },
        );
    };

    const disabledDates = useMemo(
        () => (date: Date) =>
            reports.some((r) => isDateInRange(date, r.startDate, r.endDate)),
        [reports],
    );

    const addReport = () => {
        if (!range?.from || !range?.to) return;

        router.post(
            ReportController.store().url,
            {
                start_date: format(range.from, 'yyyy-MM-dd'),
                end_date: format(range.to, 'yyyy-MM-dd'),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRange(undefined);
                    setOpen(false);
                },
            },
        );
    };

    const archiveReport = (id: number) => {
        router.patch(
            ReportController.archive(id).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setExpandedId(null),
            },
        );
    };

    const deleteReport = (id: number) => {
        if (!confirm('Are you sure you want to permanently delete this report? This cannot be undone.')) return;

        router.delete(
            ReportController.destroy(id).url,
            {
                preserveScroll: true,
                onSuccess: () => setExpandedId(null),
            },
        );
    };

    const expandedReport = reports.find((r) => r.id === expandedId);

    const expandedDays = useMemo(() => {
        if (!expandedReport) return [];
        return generateDays(expandedReport.startDate, expandedReport.endDate);
    }, [expandedReport]);

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
                                <Card
                                    key={report.id}
                                    className={`flex flex-col gap-0 px-4 py-3 ${
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
                                            {format(
                                                new Date(report.startDate + 'T00:00:00'),
                                                'MMM dd',
                                            )}{' '}
                                            –{' '}
                                            {format(
                                                new Date(report.endDate + 'T00:00:00'),
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

                                        <div className="flex items-center gap-2">
                                            <button
                                                disabled={isDisabled}
                                                onClick={() =>
                                                    deleteReport(report.id)
                                                }
                                                className="text-destructive transition hover:opacity-80 disabled:pointer-events-none"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>

                                            <button
                                                disabled={isDisabled}
                                                onClick={() =>
                                                    archiveReport(report.id)
                                                }
                                                className="text-muted-foreground transition hover:opacity-80 disabled:pointer-events-none"
                                                title="Archive"
                                            >
                                                <Archive className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Expanded editor */}
                {expandedReport && (
                    <Card className="mt-4 border border-border p-6">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold">
                                {format(
                                    new Date(expandedReport.startDate + 'T00:00:00'),
                                    'MMM dd',
                                )}{' '}
                                –{' '}
                                {format(
                                    new Date(expandedReport.endDate + 'T00:00:00'),
                                    'MMM dd, yyyy',
                                )}
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {expandedDays.map((date) => {
                                const key = format(date, 'yyyy-MM-dd');
                                const entry = expandedReport.entries[key];

                                return (
                                    <div
                                        key={key}
                                        className="flex items-start gap-6"
                                    >
                                        {/* Left Date Column */}
                                        <div className="flex w-24 flex-col items-center pt-3">
                                            <span className="text-xs tracking-wide text-muted-foreground uppercase">
                                                {format(date, 'EEE')}
                                            </span>
                                            <span className="text-sm font-semibold">
                                                {format(date, 'dd')}
                                            </span>
                                        </div>

                                        {/* Right Editor */}
                                        <div className="flex-1">
                                            <TiptapEditor
                                                value={entry?.content ?? ''}
                                                onChange={(value) => {
                                                    if (entry) {
                                                        updateEntry(
                                                            entry.id,
                                                            value,
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer actions */}
                        <div className="mt-6 flex justify-end gap-2 print:hidden">
                            <Button
                                variant="success"
                                onClick={() => setExpandedId(null)}
                            >
                                Save as Draft
                            </Button>

                            <Button
                                onClick={() => {
                                    setIsPrintModalOpen(true);
                                }}
                            >
                                Print
                            </Button>
                        </div>
                    </Card>
                )}

                <PrintReportModal
                    key={`${expandedReport?.id ?? 'none'}-${isPrintModalOpen}`}
                    isOpen={isPrintModalOpen}
                    onClose={() => setIsPrintModalOpen(false)}
                    report={expandedReport ?? null}
                    offices={offices}
                    positions={positions}
                    users={users}
                    onConfirm={(reviewer, approver, modalOffice, modalPosition) => {
                        if (!expandedReport) return;

                        router.patch(
                            ReportController.updatePrintDetails(expandedReport.id).url,
                            {
                                office: modalOffice,
                                position: modalPosition,
                                reviewer,
                                approver,
                            },
                            {
                                preserveScroll: true,
                                onSuccess: () => {
                                    setPrintData({
                                        report: {
                                            ...expandedReport,
                                            office: modalOffice,
                                            position: modalPosition,
                                            reviewer,
                                            approver,
                                        },
                                        position: modalPosition,
                                        office: modalOffice,
                                        reviewer,
                                        approver,
                                    });

                                    setIsPrintModalOpen(false);

                                    setTimeout(() => {
                                        window.print();
                                        setExpandedId(null);
                                    }, 200);
                                },
                            },
                        );
                    }}
                />
            </div>

            {/* PRINT TEMPLATE - visible only when printing */}
        </>
    );
}
