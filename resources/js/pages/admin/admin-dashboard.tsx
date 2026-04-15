import { Head } from '@inertiajs/react';
import { Building2, ClipboardList, UserCheck, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { adminDashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
    totalEmployees: number;
    totalSupervisors: number;
    totalOffices: number;
    totalPositions: number;
}

interface RecentUser {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface RecentOffice {
    id: number;
    name: string;
    created_at: string;
}

interface RecentPosition {
    id: number;
    name: string;
    created_at: string;
}

interface OfficeOverview {
    id: number;
    name: string;
    members_count: number;
    supervisor: { id: number; name: string } | null;
}

interface Props {
    stats: Stats;
    recentUsers: RecentUser[];
    recentOffices: RecentOffice[];
    recentPositions: RecentPosition[];
    officeOverview: OfficeOverview[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: adminDashboard().url },
];

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function roleBadgeVariant(role: string): 'default' | 'secondary' | 'outline' {
    if (role === 'Admin') return 'default';
    if (role === 'Supervisor') return 'secondary';
    return 'outline';
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: number;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    accent: string;
}

function StatCard({ label, value, icon: Icon, iconColor, iconBg, accent }: StatCardProps) {
    return (
        <div className={`relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${accent}`}>
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
                    <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
}

// ─── Card Wrapper ─────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-5 py-3.5">
                <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

// ─── Empty Row ───────────────────────────────────────────────────────────────

function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="py-8 text-center text-sm italic text-gray-400">
                {message}
            </TableCell>
        </TableRow>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminDashboard({
    stats,
    recentUsers,
    recentOffices,
    recentPositions,
    officeOverview,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="space-y-6 p-4 md:p-6">

                {/* Page heading */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">System overview and recent activity.</p>
                </div>

                {/* ── Summary Cards ─────────────────────────────────────────── */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Total Employees"
                        value={stats.totalEmployees}
                        icon={Users}
                        iconColor="text-blue-600"
                        iconBg="bg-blue-50"
                        accent="border-gray-200"
                    />
                    <StatCard
                        label="Total Supervisors"
                        value={stats.totalSupervisors}
                        icon={UserCheck}
                        iconColor="text-emerald-600"
                        iconBg="bg-emerald-50"
                        accent="border-gray-200"
                    />
                    <StatCard
                        label="Total Offices"
                        value={stats.totalOffices}
                        icon={Building2}
                        iconColor="text-violet-600"
                        iconBg="bg-violet-50"
                        accent="border-gray-200"
                    />
                    <StatCard
                        label="Total Positions"
                        value={stats.totalPositions}
                        icon={ClipboardList}
                        iconColor="text-amber-600"
                        iconBg="bg-amber-50"
                        accent="border-gray-200"
                    />
                </div>

                {/* ── Recent Activity ───────────────────────────────────────── */}
                <div className="grid gap-4 lg:grid-cols-3">

                    {/* Recent Users */}
                    <Card title="Recently Added Users">
                        <div className="rounded-lg border border-gray-100 overflow-hidden">
                            <Table className="text-sm">
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="border-b border-gray-100">
                                        <TableHead className="h-9 pl-4 font-semibold text-gray-600">Name</TableHead>
                                        <TableHead className="h-9 font-semibold text-gray-600">Role</TableHead>
                                        <TableHead className="h-9 pr-4 text-right font-semibold text-gray-600">Added</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentUsers.length === 0 ? (
                                        <EmptyRow colSpan={3} message="No users yet." />
                                    ) : (
                                        recentUsers.map((user, i) => (
                                            <TableRow
                                                key={user.id}
                                                className={`border-b border-gray-50 transition-colors hover:bg-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                                            >
                                                <TableCell className="h-12 pl-4">
                                                    <p className="font-medium text-gray-900 truncate max-w-[120px]">{user.name}</p>
                                                    <p className="text-xs text-gray-400 truncate max-w-[120px]">{user.email}</p>
                                                </TableCell>
                                                <TableCell className="h-12">
                                                    <Badge variant={roleBadgeVariant(user.role)} className="text-xs">
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="h-12 pr-4 text-right text-xs text-gray-400 whitespace-nowrap">
                                                    {formatDate(user.created_at)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    {/* Recent Offices */}
                    <Card title="Recently Added Offices">
                        <div className="rounded-lg border border-gray-100 overflow-hidden">
                            <Table className="text-sm">
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="border-b border-gray-100">
                                        <TableHead className="h-9 pl-4 font-semibold text-gray-600">Office Name</TableHead>
                                        <TableHead className="h-9 pr-4 text-right font-semibold text-gray-600">Added</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOffices.length === 0 ? (
                                        <EmptyRow colSpan={2} message="No offices yet." />
                                    ) : (
                                        recentOffices.map((office, i) => (
                                            <TableRow
                                                key={office.id}
                                                className={`border-b border-gray-50 transition-colors hover:bg-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                                            >
                                                <TableCell className="h-11 pl-4 font-medium text-gray-900">{office.name}</TableCell>
                                                <TableCell className="h-11 pr-4 text-right text-xs text-gray-400 whitespace-nowrap">
                                                    {formatDate(office.created_at)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    {/* Recent Positions */}
                    <Card title="Recently Added Positions">
                        <div className="rounded-lg border border-gray-100 overflow-hidden">
                            <Table className="text-sm">
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="border-b border-gray-100">
                                        <TableHead className="h-9 pl-4 font-semibold text-gray-600">Position Name</TableHead>
                                        <TableHead className="h-9 pr-4 text-right font-semibold text-gray-600">Added</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentPositions.length === 0 ? (
                                        <EmptyRow colSpan={2} message="No positions yet." />
                                    ) : (
                                        recentPositions.map((pos, i) => (
                                            <TableRow
                                                key={pos.id}
                                                className={`border-b border-gray-50 transition-colors hover:bg-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                                            >
                                                <TableCell className="h-11 pl-4 font-medium text-gray-900">{pos.name}</TableCell>
                                                <TableCell className="h-11 pr-4 text-right text-xs text-gray-400 whitespace-nowrap">
                                                    {formatDate(pos.created_at)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>

                {/* ── Office Overview ───────────────────────────────────────── */}
                <Card title="Office Overview">
                    <div className="rounded-lg border border-gray-100 overflow-hidden">
                        <Table className="text-sm">
                            <TableHeader className="bg-gray-50">
                                <TableRow className="border-b border-gray-100">
                                    <TableHead className="h-10 pl-4 font-semibold text-gray-600">Office</TableHead>
                                    <TableHead className="h-10 font-semibold text-gray-600">Assigned Supervisor</TableHead>
                                    <TableHead className="h-10 pr-4 text-right font-semibold text-gray-600">Employees</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {officeOverview.length === 0 ? (
                                    <EmptyRow colSpan={3} message="No offices found." />
                                ) : (
                                    officeOverview.map((office, i) => (
                                        <TableRow
                                            key={office.id}
                                            className={`border-b border-gray-50 transition-colors hover:bg-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                                        >
                                            <TableCell className="h-11 pl-4 font-medium text-gray-900">{office.name}</TableCell>
                                            <TableCell className="h-11">
                                                {office.supervisor ? (
                                                    <Badge variant="secondary" className="text-xs">
                                                        <UserCheck className="mr-1 h-3 w-3" />
                                                        {office.supervisor.name}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs italic text-gray-400">No supervisor assigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="h-11 pr-4 text-right">
                                                <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-semibold text-gray-600">
                                                    {office.members_count}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

            </div>
        </AppLayout>
    );
}
