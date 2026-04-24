import { Head, router } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import { ArrowLeft, Building2, CalendarDays, ChevronRight, FileText, Folder, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import AppLayout from '@/layouts/app-layout';
import * as SupervisorController from '@/actions/App/Http/Controllers/Supervisor/SupervisorController';
import { supervisor as supervisorRoute } from '@/routes';
import { dashboard as supervisorDashboard } from '@/routes/supervisor';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: supervisorDashboard().url },
    { title: 'Team', href: supervisorRoute().url },
];

// ── Types ──────────────────────────────────────────────────────────────────────
interface OfficeMember {
    id: number;
    name: string;
    email: string;
    position: string;
    reports: MemberReport[];
}

interface AssignedOffice {
    id: number;
    name: string;
    members: OfficeMember[];
}

interface ReportEntry {
    id: number;
    date: string | null;
    content: string;
}

interface MemberReport {
    id: number;
    startDate: string | null;
    endDate: string | null;
    reviewStatus?: 'draft' | 'submitted' | 'resubmitted' | 'approved' | 'rejected';
    reviewRemarks?: string | null;
    reviewedAt?: string | null;
    entries: ReportEntry[];
}

interface ReportGroup {
    id: number;
    label: string;
    startDate: string | null;
    endDate: string | null;
    latestDate: string | null;
    reviewStatus?: 'draft' | 'submitted' | 'resubmitted' | 'approved' | 'rejected';
    reviewRemarks?: string | null;
    reviewedAt?: string | null;
    entries: ReportEntry[];
}

interface MonthGroup {
    key: string;
    label: string;
    sortValue: number;
    reports: ReportGroup[];
}

interface YearGroup {
    key: string;
    label: string;
    sortValue: number;
    months: MonthGroup[];
}

interface SupervisorPageProps extends SharedData {
    assignedOffices: AssignedOffice[];
}

function formatDate(value: string | null) {
    if (!value) {
        return 'No date';
    }

    const [y, m, day] = value.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[Number(m) - 1]} ${Number(day)}, ${y}`;
}

function formatMonthDay(value: string | null) {
    if (!value) {
        return null;
    }

    const [year, month, day] = value.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNumber = Number(month);
    const dayNumber = Number(day);

    if (!year || Number.isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12 || Number.isNaN(dayNumber)) {
        return null;
    }

    return {
        year,
        text: `${monthNames[monthNumber - 1]} ${dayNumber}`,
    };
}

function compareDateDesc(left: string | null, right: string | null) {
    if (left === right) {
        return 0;
    }

    if (!left) {
        return 1;
    }

    if (!right) {
        return -1;
    }

    return right.localeCompare(left);
}

function getDateParts(value: string | null) {
    if (!value) {
        return null;
    }

    const [year, month] = value.split('-');
    const monthNumber = Number(month);

    if (!year || Number.isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
        return null;
    }

    return {
        year,
        month,
    };
}

function getReportLabel(report: MemberReport) {
    const start = formatMonthDay(report.startDate);
    const end = formatMonthDay(report.endDate);

    if (start && end) {
        if (start.year === end.year) {
            return `${start.text} - ${end.text}, ${end.year}`;
        }

        return `${start.text}, ${start.year} - ${end.text}, ${end.year}`;
    }

    if (start) {
        return `${start.text}, ${start.year}`;
    }

    if (end) {
        return `${end.text}, ${end.year}`;
    }

    return `Untitled #${report.id}`;
}

function buildYearGroups(member: OfficeMember | null): YearGroup[] {
    if (!member) {
        return [];
    }

    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    type YearAccumulator = Record<string, { reports: ReportGroup[] }>;
    const buckets: Record<string, YearAccumulator> = {};

    const pushToBucket = (yearKey: string, monthKey: string, reportGroup: ReportGroup) => {
        if (!buckets[yearKey]) {
            buckets[yearKey] = {};
        }

        if (!buckets[yearKey][monthKey]) {
            buckets[yearKey][monthKey] = { reports: [] };
        }

        buckets[yearKey][monthKey].reports.push(reportGroup);
    };

    member.reports.forEach((report) => {
        const entriesByMonth = new Map<string, ReportEntry[]>();

        report.entries.forEach((entry) => {
            const parts = getDateParts(entry.date);
            const yearKey = parts?.year ?? 'Undated';
            const monthKey = parts?.month ?? 'Undated';
            const bucketKey = `${yearKey}-${monthKey}`;
            const currentEntries = entriesByMonth.get(bucketKey) ?? [];
            currentEntries.push(entry);
            entriesByMonth.set(bucketKey, currentEntries);
        });

        if (entriesByMonth.size === 0) {
            const fallbackParts = getDateParts(report.startDate) ?? getDateParts(report.endDate);
            const yearKey = fallbackParts?.year ?? 'Undated';
            const monthKey = fallbackParts?.month ?? 'Undated';

            pushToBucket(yearKey, monthKey, {
                id: report.id,
                label: getReportLabel(report),
                startDate: report.startDate,
                endDate: report.endDate,
                latestDate: report.endDate ?? report.startDate,
                reviewStatus: report.reviewStatus,
                reviewRemarks: report.reviewRemarks,
                reviewedAt: report.reviewedAt,
                entries: [],
            });

            return;
        }

        entriesByMonth.forEach((entries, bucketKey) => {
            const [yearKey, monthKey] = bucketKey.split('-');
            const sortedEntries = [...entries].sort((a, b) => compareDateDesc(a.date, b.date));

            pushToBucket(yearKey, monthKey, {
                id: report.id,
                label: getReportLabel(report),
                startDate: report.startDate,
                endDate: report.endDate,
                latestDate: sortedEntries[0]?.date ?? null,
                reviewStatus: report.reviewStatus,
                reviewRemarks: report.reviewRemarks,
                reviewedAt: report.reviewedAt,
                entries: sortedEntries,
            });
        });
    });

    return Object.entries(buckets)
        .map(([yearKey, months]) => {
            const monthsList = Object.entries(months)
                .map(([monthKey, monthValue]): MonthGroup => {
                    const monthSort = monthKey === 'Undated' ? -1 : Number(monthKey);
                    const label = monthKey === 'Undated' ? 'Undated' : monthNames[monthSort - 1] ?? monthKey;
                    const reports = [...monthValue.reports].sort((a, b) => {
                        const dateComparison = compareDateDesc(a.latestDate, b.latestDate);
                        if (dateComparison !== 0) {
                            return dateComparison;
                        }

                        return b.id - a.id;
                    });

                    return {
                        key: monthKey,
                        label,
                        sortValue: monthSort,
                        reports,
                    };
                })
                .sort((a, b) => b.sortValue - a.sortValue);

            return {
                key: yearKey,
                label: yearKey,
                sortValue: yearKey === 'Undated' ? -1 : Number(yearKey),
                months: monthsList,
            };
        })
        .sort((a, b) => b.sortValue - a.sortValue);
}

function buildOpenStates(groups: YearGroup[]) {
    const nextOpenYears: Record<string, boolean> = {};
    const nextOpenMonths: Record<string, boolean> = {};

    groups.forEach((yearGroup) => {
        nextOpenYears[yearGroup.key] = false;

        yearGroup.months.forEach((monthGroup) => {
            const monthStateKey = `${yearGroup.key}-${monthGroup.key}`;
            nextOpenMonths[monthStateKey] = false;
        });
    });

    return {
        years: nextOpenYears,
        months: nextOpenMonths,
    };
}

export default function Team({ assignedOffices }: SupervisorPageProps) {
    const [selectedOffice, setSelectedOffice] = useState<AssignedOffice | null>(null);
    const [selectedMember, setSelectedMember] = useState<OfficeMember | null>(null);
    const [openYears, setOpenYears] = useState<Record<string, boolean>>({});
    const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({});
    const [selectedReportKey, setSelectedReportKey] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<ReportGroup | null>(null);
    const [reviewRemarks, setReviewRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReview = (status: 'approved' | 'rejected') => {
        if (!selectedReport) return;
        setIsSubmitting(true);

        router.patch(
            SupervisorController.review(selectedReport.id).url,
            {
                review_status: status,
                review_remarks: reviewRemarks,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Report ${status} successfully.`);
                    setIsSubmitting(false);
                    setSelectedReport(prev => prev ? {
                        ...prev,
                        reviewStatus: status,
                        reviewRemarks: reviewRemarks,
                        reviewedAt: new Date().toISOString()
                    } : null);
                    setReviewRemarks('');
                },
                onError: () => {
                    setIsSubmitting(false);
                    toast.error('Failed to submit review.');
                },
            }
        );
    };

    const selectOffice = (office: AssignedOffice) => {
        setSelectedOffice(office);
        setSelectedMember(null);
        setSelectedReportKey(null);
        setSelectedReport(null);
    };

    const backToOffices = () => {
        setSelectedOffice(null);
        setSelectedMember(null);
        setOpenYears({});
        setOpenMonths({});
        setSelectedReportKey(null);
        setSelectedReport(null);
    };

    const backToMembers = () => {
        setSelectedMember(null);
        setOpenYears({});
        setOpenMonths({});
        setSelectedReportKey(null);
        setSelectedReport(null);
    };

    const selectMember = (member: OfficeMember) => {
        const nextGroups = buildYearGroups(member);
        const defaults = buildOpenStates(nextGroups);

        setSelectedMember(member);
        setOpenYears(defaults.years);
        setOpenMonths(defaults.months);
        setSelectedReportKey(null);
        setSelectedReport(null);
    };

    const groupedByYear = useMemo<YearGroup[]>(() => buildYearGroups(selectedMember), [selectedMember]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team" />
            <div className="flex flex-1 flex-col gap-4 p-4">

                {/* ── View 1: Office cards ── */}
                {selectedOffice === null && (
                    <>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Assigned Offices</h1>
                            <p className="text-sm text-muted-foreground">
                                Select an office to view its members.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {assignedOffices.map((office) => (
                                <Card
                                    key={office.id}
                                    className="cursor-pointer transition-shadow hover:shadow-md"
                                    onClick={() => selectOffice(office)}
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="rounded-lg bg-indigo-50 p-2">
                                                <Building2 className="h-5 w-5 text-indigo-600" />
                                            </span>
                                            <CardTitle className="text-base font-semibold">
                                                {office.name}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {office.members.length} member{office.members.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {assignedOffices.length === 0 && (
                            <Card>
                                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                                    No offices are currently assigned to you.
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {/* ── View 2: Member list ── */}
                {selectedOffice !== null && selectedMember === null && (
                    <>
                        <div>
                            <Button variant="ghost" size="sm" onClick={backToOffices} className="gap-1.5">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Offices
                            </Button>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="rounded-lg bg-indigo-50 p-2">
                                <Building2 className="h-5 w-5 text-indigo-600" />
                            </span>
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">{selectedOffice.name}</h1>
                                <p className="text-sm text-muted-foreground">
                                    Click a member to view their report entries.
                                </p>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <Table className="text-sm">
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="border-b border-gray-200">
                                        <TableHead className="h-10 font-semibold text-gray-700">Name</TableHead>
                                        <TableHead className="h-10 font-semibold text-gray-700">Email</TableHead>
                                        <TableHead className="h-10 font-semibold text-gray-700">Position</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedOffice.members.map((member, index) => (
                                        <TableRow
                                            key={member.id}
                                            className={`cursor-pointer border-b border-gray-100 transition-colors last:border-0 hover:bg-blue-50 ${
                                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                                            }`}
                                            onClick={() => selectMember(member)}
                                        >
                                            <TableCell className="h-12 font-medium text-gray-900">{member.name}</TableCell>
                                            <TableCell className="h-12 text-gray-500">{member.email}</TableCell>
                                            <TableCell className="h-12 text-gray-600">{member.position}</TableCell>
                                        </TableRow>
                                    ))}

                                    {selectedOffice.members.length === 0 && (
                                        <TableRow>
                                            <TableCell className="h-12 text-center text-sm text-gray-500" colSpan={3}>
                                                No employees found for this office.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}

                {/* ── View 3: Member report entries ── */}
                {selectedMember !== null && (
                    <>
                        <div>
                            <Button variant="ghost" size="sm" onClick={backToMembers} className="gap-1.5">
                                <ArrowLeft className="h-4 w-4" />
                                Back to {selectedOffice?.name}
                            </Button>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="rounded-lg bg-blue-50 p-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </span>
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">{selectedMember.name}</h1>
                                <p className="text-sm text-muted-foreground">{selectedMember.position}</p>
                            </div>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-[minmax(280px,340px)_1fr]">
                            <div className="rounded-lg border border-gray-200 p-3 lg:max-h-[calc(100vh-14rem)] lg:overflow-hidden">
                                <h2 className="mb-3 text-sm font-semibold text-slate-700">Report Navigation</h2>
                                {groupedByYear.length === 0 ? (
                                    <div className="py-8 text-center text-sm text-gray-500">No reports available.</div>
                                ) : (
                                    <div className="space-y-3 lg:max-h-[calc(100vh-18rem)] lg:overflow-y-auto lg:pr-1">
                                        {groupedByYear.map((yearGroup) => (
                                            <Collapsible
                                                key={yearGroup.key}
                                                open={openYears[yearGroup.key] ?? false}
                                                onOpenChange={(isOpen) => {
                                                    setOpenYears((current) => ({
                                                        ...current,
                                                        [yearGroup.key]: isOpen,
                                                    }));
                                                }}
                                            >
                                                <CollapsibleTrigger asChild>
                                                    <button
                                                        className="flex w-full items-center justify-start rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-left"
                                                        type="button"
                                                    >
                                                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                                            <ChevronRight
                                                                className={`h-4 w-4 transition-transform ${openYears[yearGroup.key] ? 'rotate-90' : ''}`}
                                                            />
                                                            <Folder className="h-4 w-4 text-slate-500" />
                                                            {yearGroup.label}
                                                        </span>
                                                    </button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="mt-2 space-y-2 pl-4">
                                                    {yearGroup.months.map((monthGroup) => {
                                                        const monthStateKey = `${yearGroup.key}-${monthGroup.key}`;

                                                        return (
                                                            <Collapsible
                                                                key={monthStateKey}
                                                                open={openMonths[monthStateKey] ?? false}
                                                                onOpenChange={(isOpen) => {
                                                                    setOpenMonths((current) => ({
                                                                        ...current,
                                                                        [monthStateKey]: isOpen,
                                                                    }));
                                                                }}
                                                            >
                                                                <CollapsibleTrigger asChild>
                                                                    <button
                                                                        className="flex w-full items-center justify-start rounded-md border border-slate-200 bg-white px-3 py-2 text-left"
                                                                        type="button"
                                                                    >
                                                                        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                                            <ChevronRight
                                                                                className={`h-4 w-4 transition-transform ${openMonths[monthStateKey] ? 'rotate-90' : ''}`}
                                                                            />
                                                                            <CalendarDays className="h-4 w-4 text-slate-500" />
                                                                            {monthGroup.label}
                                                                        </span>
                                                                    </button>
                                                                </CollapsibleTrigger>
                                                                <CollapsibleContent className="mt-2 space-y-1 pl-4">
                                                                    {monthGroup.reports.map((reportGroup) => {
                                                                        const reportStateKey = `${monthStateKey}-${reportGroup.id}`;
                                                                        const isSelected = selectedReportKey === reportStateKey;

                                                                        return (
                                                                            <button
                                                                                key={reportStateKey}
                                                                                className={`flex w-full items-center justify-start rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                                                                                    isSelected
                                                                                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                                                                                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                                                                                }`}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setSelectedReportKey(reportStateKey);
                                                                                    setSelectedReport(reportGroup);
                                                                                }}
                                                                            >
                                                                                <span className="flex items-center gap-2">
                                                                                    <FileText className="h-4 w-4" />
                                                                                    {reportGroup.label}
                                                                                </span>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </CollapsibleContent>
                                                            </Collapsible>
                                                        );
                                                    })}
                                                </CollapsibleContent>
                                            </Collapsible>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-lg border border-gray-200 p-3">
                                <h2 className="mb-3 text-sm font-semibold text-slate-700">Selected Report Details</h2>
                                {selectedReport === null ? (
                                    <div className="py-12 text-center text-sm text-gray-500">
                                        Select a report from the left panel to view its details.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                                            <p className="text-sm font-semibold text-slate-800">{selectedReport.label}</p>
                                        </div>

                                        {selectedReport.entries.length === 0 ? (
                                            <div className="rounded-md border border-dashed border-slate-300 px-3 py-5 text-sm text-slate-500">
                                                No entries found for this report.
                                            </div>
                                        ) : (
                                            <div className="overflow-hidden rounded-md border border-gray-200">
                                                {/* Approval Panel */}
                                                <div className="bg-white border-b border-gray-200 p-4">
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="text-sm font-semibold text-gray-900">Review Status</h3>
                                                                <div className="mt-1 flex items-center gap-2">
                                                                    {selectedReport.reviewStatus === 'approved' && (
                                                                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                                                                            <CheckCircle className="mr-1 h-3 w-3" />
                                                                            Approved
                                                                        </Badge>
                                                                    )}
                                                                    {selectedReport.reviewStatus === 'rejected' && (
                                                                        <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200">
                                                                            <XCircle className="mr-1 h-3 w-3" />
                                                                            Rejected
                                                                        </Badge>
                                                                    )}
                                                                    {selectedReport.reviewStatus === 'submitted' && (
                                                                        <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                                                                            <Clock className="mr-1 h-3 w-3" />
                                                                            Submitted — Awaiting Review
                                                                        </Badge>
                                                                    )}
                                                                    {selectedReport.reviewStatus === 'resubmitted' && (
                                                                        <Badge variant="outline" className="text-violet-700 border-violet-200 bg-violet-50">
                                                                            <Clock className="mr-1 h-3 w-3" />
                                                                            Resubmitted — Awaiting Review
                                                                        </Badge>
                                                                    )}
                                                                    {(!selectedReport.reviewStatus || selectedReport.reviewStatus === 'draft') && (
                                                                        <Badge variant="outline" className="text-gray-600 border-gray-300 bg-gray-50">
                                                                            Draft — Not Submitted
                                                                        </Badge>
                                                                    )}
                                                                    {selectedReport.reviewedAt && (
                                                                        <span className="text-xs text-gray-500">
                                                                            on {formatDate(selectedReport.reviewedAt.split('T')[0])}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {selectedReport.reviewRemarks ? (
                                                            <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700 border border-gray-100">
                                                                <strong>Remarks:</strong> {selectedReport.reviewRemarks}
                                                            </div>
                                                        ) : null}

                                                        {/* Show review controls for submitted/resubmitted/approved/rejected */}
                                                        {selectedReport.reviewStatus && ['submitted', 'resubmitted', 'approved', 'rejected'].includes(selectedReport.reviewStatus) && (
                                                            <div className="space-y-3 pt-2">
                                                                <Textarea
                                                                    placeholder="Add remarks (optional)..."
                                                                    value={reviewRemarks}
                                                                    onChange={(e) => setReviewRemarks(e.target.value)}
                                                                    className="min-h-[80px] resize-none text-sm"
                                                                />
                                                                <div className="flex items-center gap-2">
                                                                    {selectedReport.reviewStatus !== 'approved' && (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleReview('approved')}
                                                                            disabled={isSubmitting}
                                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                        >
                                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                                            Approve
                                                                        </Button>
                                                                    )}
                                                                    {selectedReport.reviewStatus !== 'rejected' && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() => handleReview('rejected')}
                                                                            disabled={isSubmitting}
                                                                        >
                                                                            <XCircle className="mr-2 h-4 w-4" />
                                                                            Reject
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <Table className="text-sm">
                                                    <TableHeader className="bg-gray-50">
                                                        <TableRow className="border-b border-gray-200">
                                                            <TableHead className="h-10 w-40 font-semibold text-gray-700">Date</TableHead>
                                                            <TableHead className="h-10 font-semibold text-gray-700">Entry</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {selectedReport.entries.map((entry, index) => (
                                                            <TableRow
                                                                key={entry.id}
                                                                className={`border-b border-gray-100 last:border-0 ${
                                                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                                                                }`}
                                                            >
                                                                <TableCell className="h-11 whitespace-nowrap text-gray-500">
                                                                    {formatDate(entry.date)}
                                                                </TableCell>
                                                                <TableCell className="report-content h-11 whitespace-normal break-words [overflow-wrap:anywhere] text-gray-700">
                                                                    <div
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: DOMPurify.sanitize(entry.content ?? ''),
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

            </div>
        </AppLayout>
    );
}