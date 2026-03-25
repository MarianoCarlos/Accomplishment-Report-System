import { Head, router } from '@inertiajs/react';
import SupervisorOfficeTab from '@/components/admin/SupervisorOfficeTab';
import AppLayout from '@/layouts/app-layout';
import { adminDashboard } from '@/routes';
import { supervisorOffices } from '@/routes/admin';
import { assign } from '@/routes/admin/supervisor-offices';
import type { BreadcrumbItem } from '@/types';

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
    offices: Office[];
    supervisors: Supervisor[];
    assignments: Record<number, number | null>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: adminDashboard().url },
    { title: 'Supervisor Offices', href: supervisorOffices().url },
];

export default function SupervisorOffices({ offices, supervisors, assignments }: Props) {
    const handleAssign = (officeId: number, supervisorId: number | null) => {
        router.patch(assign(officeId).url, { supervisor_id: supervisorId });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supervisor Offices" />
            <div className="space-y-4 p-4">
                <h1 className="text-3xl font-bold">Supervisor Offices</h1>
                <p className="text-sm text-gray-500">
                    Assign supervisors to their respective offices.
                </p>
                <SupervisorOfficeTab
                    offices={offices}
                    supervisors={supervisors}
                    assignments={assignments}
                    onAssign={handleAssign}
                />
            </div>
        </AppLayout>
    );
}
