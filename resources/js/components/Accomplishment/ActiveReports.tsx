import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Archive, Plus, Trash2, Send, RefreshCw, AlertCircle, Undo, CheckCircle } from 'lucide-react';
import { useMemo, useState, useRef, useEffect } from 'react';
import type { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import * as ReportController from '@/actions/App/Http/Controllers/ReportController';
import * as ReportEntryController from '@/actions/App/Http/Controllers/ReportEntryController';
import ReportStatusBadge from '@/components/Accomplishment/ReportStatusBadge';
import TiptapEditor from '@/components/Editor/TiptapEditor';
import PrintReportModal from '@/components/PrintModal/PrintReportModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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

function isDateInRange(date: Date, start: Date, end: Date) {
    const d = normalize(date);
    return d >= start && d <= end;
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
    const [reportToDelete, setReportToDelete] = useState<number | null>(null);
    const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const expandReport = (id: number | null) => {
        setExpandedId(id);
        setSavingState('idle');
        setLastSaved(null);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const updateEntry = (entryId: number, value: string) => {
        setSavingState('saving');
        
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            router.patch(
                ReportEntryController.update(entryId).url,
                { content: value },
                { 
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setSavingState('saved');
                        setLastSaved(new Date());
                    },
                    onError: () => setSavingState('idle'),
                },
            );
        }, 1000);
    };

    const parsedReports = useMemo(
        () => reports.map(r => ({
            start: new Date(r.startDate + 'T00:00:00'),
            end: new Date(r.endDate + 'T00:00:00')
        })),
        [reports]
    );

    const disabledDates = useMemo(
        () => (date: Date) =>
            parsedReports.some((r) => isDateInRange(date, r.start, r.end)),
        [parsedReports],
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
                    toast.success('Accomplishment report created.');
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
                onSuccess: () => {
                    expandReport(null);
                    toast.success('Report archived successfully.');
                },
            },
        );
    };

    const deleteReport = (id: number) => {
        router.delete(
            ReportController.destroy(id).url,
            {
                preserveScroll: true,
                onSuccess: () => {
                    expandReport(null);
                    setReportToDelete(null);
                    toast.success('Report deleted permanently.');
                },
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
                                            expandReport(
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

                                    <div className="mt-1 mb-2">
                                        <ReportStatusBadge status={report.reviewStatus} />
                                    </div>

                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            {completed}/{total} days completed
                                        </span>

                                        <div className="flex items-center gap-2">
                                            <button
                                                disabled={isDisabled}
                                                onClick={() =>
                                                    setReportToDelete(report.id)
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
                {expandedReport && (() => {
                    const status = expandedReport.reviewStatus ?? 'draft';
                    const isEditable = status === 'draft' || status === 'rejected';
                    const isLocked = !isEditable;

                    return (
                        <Card className="mt-4 border border-border p-6">
                            <div className="mb-4 flex items-center justify-between">
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
                                {isLocked ? (
                                    <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                                        Read Only
                                    </Badge>
                                ) : (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        {savingState === 'saving' && (
                                            <span className="flex items-center gap-1.5 text-blue-600">
                                                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Auto-saving...
                                            </span>
                                        )}
                                        {savingState === 'saved' && lastSaved && (
                                            <span className="flex items-center gap-1.5 text-emerald-600">
                                                <CheckCircle className="h-3.5 w-3.5" /> Saved at {format(lastSaved, 'h:mm a')}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Remarks banner (inside the report) */}
                            {expandedReport.reviewRemarks && (
                                <div className={`mb-4 flex items-start gap-3 rounded-lg border p-3 text-sm ${
                                    status === 'rejected'
                                        ? 'border-red-200 bg-red-50 text-red-800'
                                        : 'border-amber-200 bg-amber-50 text-amber-800'
                                }`}>
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <div>
                                        <p className="font-semibold">Supervisor Remarks</p>
                                        <p className="mt-0.5">{expandedReport.reviewRemarks}</p>
                                    </div>
                                </div>
                            )}

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
                                                {isLocked ? (
                                                    <div className="min-h-[60px] rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700">
                                                        {entry?.content ? (
                                                            <div dangerouslySetInnerHTML={{ __html: entry.content }} />
                                                        ) : (
                                                            <span className="text-muted-foreground italic">No entry</span>
                                                        )}
                                                    </div>
                                                ) : (
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
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer actions */}
                            <div className="mt-6 flex justify-between print:hidden">
                                <div className="flex gap-2">
                                    {status === 'draft' && (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                                onClick={() => expandReport(null)}
                                            >
                                                Done Editing
                                            </Button>
                                            <Button
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                onClick={() => {
                                                    router.patch(
                                                        ReportController.submit(expandedReport.id).url,
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                            onSuccess: () => {
                                                                expandReport(null);
                                                                toast.success('Report submitted for review.');
                                                            },
                                                        }
                                                    );
                                                }}
                                            >
                                                <Send className="mr-2 h-4 w-4" />
                                                Submit
                                            </Button>
                                        </>
                                    )}
                                    {status === 'rejected' && (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                                onClick={() => expandReport(null)}
                                            >
                                                Done Editing
                                            </Button>
                                            <Button
                                                className="bg-violet-600 hover:bg-violet-700 text-white"
                                                onClick={() => {
                                                    router.patch(
                                                        ReportController.submit(expandedReport.id).url,
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                            onSuccess: () => {
                                                                expandReport(null);
                                                                toast.success('Report resubmitted for review.');
                                                            },
                                                        }
                                                    );
                                                }}
                                            >
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Resubmit
                                            </Button>
                                        </>
                                    )}
                                    {(status === 'submitted' || status === 'resubmitted') && (
                                        <Button
                                            variant="outline"
                                            className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                                            onClick={() => {
                                                router.patch(
                                                    ReportController.unsubmit(expandedReport.id).url,
                                                    {},
                                                    {
                                                        preserveScroll: true,
                                                        onSuccess: () => {
                                                            expandReport(null);
                                                            toast.success('Report unsubmitted and returned to draft.');
                                                        },
                                                    }
                                                );
                                            }}
                                        >
                                            <Undo className="mr-2 h-4 w-4" />
                                            Unsubmit
                                        </Button>
                                    )}
                                </div>

                                <Button
                                    onClick={() => {
                                        setIsPrintModalOpen(true);
                                    }}
                                >
                                    Print
                                </Button>
                            </div>
                        </Card>
                    );
                })()}

                <PrintReportModal
                    key={`${expandedReport?.id ?? 'none'}-${isPrintModalOpen}`}
                    isOpen={isPrintModalOpen}
                    onClose={() => setIsPrintModalOpen(false)}
                    offices={offices}
                    positions={positions}
                    users={users}
                    onConfirm={(reviewer, approver, modalOffice, modalPosition) => {
                        if (!expandedReport) return;

                        setPrintData({
                            report: expandedReport,
                            position: modalPosition,
                            office: modalOffice,
                            reviewer,
                            approver,
                        });

                        setIsPrintModalOpen(false);

                        setTimeout(() => {
                            window.print();
                            expandReport(null);
                        }, 200);
                    }}
                />
            </div>

            {/* Deletion Confirmation Dialog */}
            <Dialog open={reportToDelete !== null} onOpenChange={(open) => {
                if (!open) setReportToDelete(null);
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Accomplishment Report</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete this report? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setReportToDelete(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => {
                            if (reportToDelete) {
                                deleteReport(reportToDelete);
                            }
                        }}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* PRINT TEMPLATE - visible only when printing */}
        </>
    );
}
