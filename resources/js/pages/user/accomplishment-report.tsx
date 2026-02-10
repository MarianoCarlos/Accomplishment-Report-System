import { Head } from '@inertiajs/react';
import { useState } from 'react';
import ActiveReports from '@/components/Accomplishment/ActiveReports';
import ArchivedReports from '@/components/Accomplishment/ArchivedReports';
import AppLayout from '@/layouts/app-layout';
import { accomplishmentReport, userDashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

export type Report = {
    id: number;
    startDate: Date;
    endDate: Date;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: userDashboard().url },
    { title: 'Accomplishment Report', href: accomplishmentReport().url },
];

export default function AccomplishmentReport() {
    const [reports, setReports] = useState<Report[]>([]);
    const [archivedReports, setArchivedReports] = useState<Report[]>([]);
    const [nextId, setNextId] = useState(1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accomplishment Report" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <ActiveReports
                    reports={reports}
                    setReports={setReports}
                    setArchivedReports={setArchivedReports}
                    nextId={nextId}
                    setNextId={setNextId}
                />

                {archivedReports.length > 0 && (
                    <ArchivedReports
                        archivedReports={archivedReports}
                        setArchivedReports={setArchivedReports}
                        setReports={setReports}
                    />
                )}
            </div>
        </AppLayout>
    );
}
