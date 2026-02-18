import { Head } from '@inertiajs/react';
import { useState } from 'react';
import ActiveReports from '@/components/Accomplishment/ActiveReports';
import ArchivedReports from '@/components/Accomplishment/ArchivedReports';
import ReportPrintTemplate from '@/components/PrintTemplate/ReportPrintTemplate';
import AppLayout from '@/layouts/app-layout';
import { accomplishmentReport, userDashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

export type Report = {
    id: number;
    startDate: Date;
    endDate: Date;
    entries: Record<string, string>; // key = YYYY-MM-DD, value = HTML
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: userDashboard().url },
    { title: 'Accomplishment Report', href: accomplishmentReport().url },
];

type PrintData = {
    report: Report;
    position: string;
    office: string;
    reviewer: string;
    approver: string;
} | null;

export default function AccomplishmentReport() {
    const [reports, setReports] = useState<Report[]>([]);
    const [archivedReports, setArchivedReports] = useState<Report[]>([]);
    const [nextId, setNextId] = useState(1);
    const [printData, setPrintData] = useState<PrintData>(null);

    return (
        <>
            {/* NORMAL APP LAYOUT */}
            <div className="print:hidden">
                <AppLayout breadcrumbs={breadcrumbs}>
                    <Head title="Accomplishment Report" />

                    <div className="flex flex-1 flex-col gap-6 p-4">
                        <ActiveReports
                            reports={reports}
                            setReports={setReports}
                            setArchivedReports={setArchivedReports}
                            nextId={nextId}
                            setNextId={setNextId}
                            setPrintData={setPrintData}
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
            </div>

            {/* PRINT DOCUMENT (OUTSIDE LAYOUT) */}
            {printData && (
                <ReportPrintTemplate
                    report={printData.report}
                    position={printData.position}
                    office={printData.office}
                    reviewer={printData.reviewer}
                    approver={printData.approver}
                />
            )}
        </>
    );
}
