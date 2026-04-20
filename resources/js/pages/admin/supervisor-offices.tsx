import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import SupervisorOfficeTab from '@/components/admin/SupervisorOfficeTab';
import AppLayout from '@/layouts/app-layout';
import { adminDashboard } from '@/routes';
import { supervisorOffices } from '@/routes/admin';
import { assign } from '@/routes/admin/supervisor-offices';
import type { BreadcrumbItem, PaginatedData } from '@/types';

interface Office {
    id: number;
    name: string;
}

interface Supervisor {
    id: number;
    name: string;
    email: string;
}

interface Props {
    offices: PaginatedData<Office>;
    supervisors: Supervisor[];
    assignments: Record<number, number | null>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: adminDashboard().url },
    { title: 'Supervisor Offices', href: supervisorOffices().url },
];

export default function SupervisorOffices({ offices, supervisors, assignments }: Props) {
    const handleAssign = (officeId: number, supervisorId: number | null) => {
        router.patch(assign(officeId).url, { supervisor_id: supervisorId }, { preserveScroll: true, onSuccess: () => toast.success('Supervisor assigned successfully') });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supervisor Offices" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Page heading */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Supervisor Offices</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Assign supervisors to their respective offices.
                    </p>
                </div>

                {/* Card wrapper */}
                <div className="rounded-xl border bg-white shadow-sm">
                    <div className="p-5">
                        <SupervisorOfficeTab
                            offices={offices}
                            paginationRoute={supervisorOffices().url}
                            supervisors={supervisors}
                            assignments={assignments}
                            onAssign={handleAssign}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
