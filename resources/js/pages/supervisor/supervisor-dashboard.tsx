import { Head } from '@inertiajs/react';
import { Building2, FileText, ListChecks, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/supervisor/dashboard',
    },
];

interface SupervisorStats {
    officeCount: number;
    employeeCount: number;
    reportCount: number;
    entryCount: number;
}

interface AssignedOfficeSummary {
    id: number;
    name: string;
    membersCount: number;
}

interface SupervisorDashboardProps extends SharedData {
    stats: SupervisorStats;
    assignedOffices: AssignedOfficeSummary[];
}

export default function SupervisorDashboard({ stats, assignedOffices }: SupervisorDashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supervisor Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Supervisor Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Overview of your assigned offices and employee report activity.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Offices</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-2xl font-semibold">{stats.officeCount}</p>
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Employees</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-2xl font-semibold">{stats.employeeCount}</p>
                            <Users className="h-5 w-5 text-muted-foreground" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Reports</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-2xl font-semibold">{stats.reportCount}</p>
                            <FileText className="h-5 w-5 text-muted-foreground" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Entries</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-2xl font-semibold">{stats.entryCount}</p>
                            <ListChecks className="h-5 w-5 text-muted-foreground" />
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Assigned Offices</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {assignedOffices.length === 0 ? (
                            <p className="text-muted-foreground">No offices are currently assigned to you.</p>
                        ) : (
                            assignedOffices.map((office) => (
                                <div key={office.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                                    <span className="font-medium">{office.name}</span>
                                    <span className="text-muted-foreground">
                                        {office.membersCount} employee{office.membersCount !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
                </div>
        </AppLayout>
    );
}