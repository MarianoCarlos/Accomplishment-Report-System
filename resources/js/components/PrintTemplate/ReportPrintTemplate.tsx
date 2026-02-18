import { format } from 'date-fns';
import { usePage } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import type { Report } from '@/pages/user/accomplishment-report';

type PageProps = {
    auth: {
        user: {
            name: string;
        };
    };
};

type Props = {
    report: Report;
    position: string;
    office: string;
    reviewer: string;
    approver: string;
};

function generateDays(start: Date, end: Date) {
    const days: Date[] = [];
    let current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    while (current <= normalizedEnd) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return days;
}

export default function ReportPrintTemplate({
    report,
    position,
    office,
    reviewer,
    approver,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const userName = auth.user.name;
    
    // Ensure dates are Date objects (in case they come from backend as strings)
    const startDate = report.startDate instanceof Date ? report.startDate : new Date(report.startDate);
    const endDate = report.endDate instanceof Date ? report.endDate : new Date(report.endDate);
    
    const days = generateDays(startDate, endDate);

    return (
        <div className="print-content hidden bg-white p-10 text-sm text-black print:block print:p-12">
            {/* HEADER */}
            <div className="mb-6">
                {/* Top Row */}
                <div className="flex justify-end">
                    <p className="font-semibold">ANNEX "C"</p>
                </div>

                {/* Centered Title */}
                <div className="text-center">
                    <p className="text-base font-bold">ACCOMPLISHMENT REPORT</p>
                    <p>
                        {format(startDate, 'MMMM d')} –{' '}
                        {format(endDate, 'd, yyyy')}
                    </p>
                </div>
            </div>

            {/* PERSON DETAILS */}
            <div className="mb-4 space-y-1">
                <p>
                    <strong>NAME OF PERSONNEL:</strong> {userName}
                </p>
                <p>
                    <strong>POSITION:</strong> {position}
                </p>
                <p>
                    <strong>OFFICE:</strong> {office}
                </p>
            </div>

            {/* TABLE */}
            <table className="w-full table-fixed border-collapse border border-black">
                <thead>
                    <tr>
                        <th className="w-32 border border-black p-2">
                            DATE (DAILY)
                        </th>
                        <th className="border border-black p-2">
                            DETAILED ACCOMPLISHMENT REPORT
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {days.map((date) => {
                        const key = format(date, 'yyyy-MM-dd');

                        return (
                            <tr key={key} className="break-inside-avoid">
                                <td className="border border-black p-2 text-center align-middle">
                                    {format(date, 'MMM d, yyyy')}
                                </td>

                                <td
                                    className="border border-black p-2 align-top break-words whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(report.entries[key] || ''),
                                    }}
                                />
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* TOTAL DAYS */}
            <div className="mt-3">
                <p>
                    <strong>Total Days:</strong> {days.length}
                </p>
            </div>

            {/* SIGNATURE SECTION */}
            <div className="mt-10 grid grid-cols-2 gap-10">
                <div>
                    <p className="font-semibold">SUBMITTED BY:</p>
                    <div className="mt-8 border-t border-black pt-2">
                        {userName}
                        <br />
                        {position}
                    </div>
                </div>

                <div>
                    <p className="font-semibold">REVIEWED BY:</p>
                    <div className="mt-8 border-t border-black pt-2">
                        {reviewer}
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <p className="font-semibold">APPROVED BY:</p>
                <div className="mt-8 w-64 border-t border-black pt-2">
                    {approver}
                </div>
            </div>
        </div>
    );
}
