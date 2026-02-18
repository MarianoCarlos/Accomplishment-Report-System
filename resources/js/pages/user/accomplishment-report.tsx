import { Head } from '@inertiajs/react';
import { useState } from 'react';
import ActiveReports from '@/components/Accomplishment/ActiveReports';
import ArchivedReports from '@/components/Accomplishment/ArchivedReports';
import ReportPrintTemplate from '@/components/PrintTemplate/ReportPrintTemplate';
import AppLayout from '@/layouts/app-layout';
import { accomplishmentReport, userDashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

export type ReportEntry = {
    id: number;
    content: string;
};

export type Report = {
    id: number;
    startDate: string;
    endDate: string;
    entries: Record<string, ReportEntry>; // key = YYYY-MM-DD
    office?: string;
    position?: string;
    reviewer?: string;
    approver?: string;
};

type PrintData = {
    report: Report;
    position: string;
    office: string;
    reviewer: string;
    approver: string;
} | null;

type Props = {
    activeReports: Report[];
    archivedReports: Report[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: userDashboard().url },
    { title: 'Accomplishment Report', href: accomplishmentReport().url },
];

export default function AccomplishmentReport({ activeReports, archivedReports }: Props) {
    const [printData, setPrintData] = useState<PrintData>(null);

    return (
        <>
            {/* NORMAL APP LAYOUT */}
            <div className="print:hidden">
                <AppLayout breadcrumbs={breadcrumbs}>
                    <Head title="Accomplishment Report" />

                    <div className="flex flex-1 flex-col gap-6 p-4">
                        <ActiveReports
                            reports={activeReports}
                            setPrintData={setPrintData}
                        />

                        {archivedReports.length > 0 && (
                            <ArchivedReports
                                archivedReports={archivedReports}
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
