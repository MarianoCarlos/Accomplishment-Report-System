import { Head } from '@inertiajs/react';
import { ArrowLeft, Building2, FileText, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/supervisor/dashboard' },
    { title: 'Supervisor', href: '/supervisor' },
];

// ── Types ──────────────────────────────────────────────────────────────────────
interface OfficeMember {
    id: number;
    name: string;
    email: string;
    position: string;
    entries: ReportEntry[];
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

export default function Supervisor({ assignedOffices }: SupervisorPageProps) {
    const [selectedOffice, setSelectedOffice] = useState<AssignedOffice | null>(null);
    const [selectedMember, setSelectedMember] = useState<OfficeMember | null>(null);

    const selectOffice = (office: AssignedOffice) => {
        setSelectedOffice(office);
        setSelectedMember(null);
    };

    const backToOffices = () => {
        setSelectedOffice(null);
        setSelectedMember(null);
    };

    const backToMembers = () => {
        setSelectedMember(null);
    };

    const memberEntries = selectedMember
        ? [...selectedMember.entries].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
        : [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supervisor" />
            <div className="flex flex-1 flex-col gap-4 p-4">

                {/* ── View 1: Office cards ── */}
                {selectedOffice === null && (
                    <>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Supervisor Panel</h1>
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
                                            onClick={() => setSelectedMember(member)}
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
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            {memberEntries.length === 0 ? (
                                <div className="py-12 text-center text-sm text-gray-500">
                                    No report entries found.
                                </div>
                            ) : (
                                <Table className="text-sm">
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="border-b border-gray-200">
                                            <TableHead className="h-10 w-36 font-semibold text-gray-700">Date</TableHead>
                                            <TableHead className="h-10 font-semibold text-gray-700">Entry</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {memberEntries.map((entry, index) => (
                                            <TableRow
                                                key={entry.id}
                                                className={`border-b border-gray-100 last:border-0 ${
                                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                                                }`}
                                            >
                                                <TableCell className="h-11 whitespace-nowrap text-gray-500">
                                                    {formatDate(entry.date)}
                                                </TableCell>
                                                <TableCell className="h-11 text-gray-700">{entry.content}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </>
                )}

            </div>
        </AppLayout>
    );
}