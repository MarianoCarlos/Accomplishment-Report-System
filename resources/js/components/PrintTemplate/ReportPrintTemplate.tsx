import { usePage } from '@inertiajs/react';
import { format } from 'date-fns';
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
    reviewerPosition?: string;
    approverPosition?: string;
};

function generateDays(start: string, end: string) {
    const days: Date[] = [];
    const current = new Date(start + 'T00:00:00');
    const normalizedEnd = new Date(end + 'T00:00:00');

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
    reviewerPosition,
    approverPosition,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const userName = auth.user.name;
    
    const startDate = report.startDate;
    const endDate = report.endDate;
    
    const days = generateDays(startDate, endDate);

    return (
        <div 
            className="print-content hidden bg-white p-10 text-black print:block print:p-12"
            style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '12pt' }}
        >
            {/* HEADER */}
            <div className="mb-6">
                {/* Top Row */}
                <div className="flex justify-end mb-2">
                    <p className="font-bold">ANNEX "C"</p>
                </div>

                {/* Centered Title */}
                <div className="text-center">
                    <p className="font-bold uppercase">ACCOMPLISHMENT REPORT</p>
                    <p className="font-bold">
                        {format(new Date(startDate + 'T00:00:00'), 'MMMM d')} –{' '}
                        {format(new Date(endDate + 'T00:00:00'), 'd, yyyy')}
                    </p>
                </div>
            </div>

            {/* PERSON DETAILS */}
            <div className="mb-4 space-y-0.5 uppercase">
                <p>NAME OF PERSONNEL: {userName}</p>
                <p>POSITION: {position}</p>
                <p>OFFICE: {office}</p>
            </div>

            {/* TABLE */}
            <table className="w-full table-fixed border-collapse border border-black">
                <thead>
                    <tr>
                        <th className="w-36 border border-black p-2 align-middle text-center font-bold uppercase leading-snug">
                            DATE<br />(DAILY)
                        </th>
                        <th className="border border-black p-2 align-middle text-center font-bold uppercase">
                            DETAILED ACCOMPLISHMENT REPORT
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {days.map((date) => {
                        const key = format(date, 'yyyy-MM-dd');

                        return (
                            <tr key={key} className="break-inside-avoid">
                                <td className="border border-black p-2 text-center align-middle font-bold">
                                    {format(date, 'MMM d, yyyy')}
                                </td>

                                <td
                                    className="border border-black p-2 align-top break-words whitespace-pre-wrap leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(report.entries[key]?.content ?? ''),
                                    }}
                                />
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* TOTAL DAYS */}
            <div className="mt-2">
                <p>Total Days: {days.length}</p>
            </div>

            {/* SIGNATURE SECTION */}
            <div className="mt-8 grid grid-cols-2 gap-x-10 gap-y-12 uppercase">
                <div>
                    <p className="mb-12">SUBMITTED BY:</p>
                    <div>
                        <div className="inline-block border-b border-black min-w-[240px] pb-0.5">
                            {userName}
                        </div>
                        <p className="mt-1 capitalize">{position.toLowerCase()}</p>
                    </div>
                </div>

                <div className="space-y-12">
                    <div>
                        <p className="mb-12">REVIEWED BY:</p>
                        <div>
                            <div className="inline-block border-b border-black min-w-[280px] pb-0.5">
                                {reviewer}
                            </div>
                            {reviewerPosition && (
                                <p className="mt-1 capitalize">{reviewerPosition.toLowerCase()}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="mb-12">APPROVED BY:</p>
                        <div>
                            <div className="inline-block border-b border-black min-w-[280px] pb-0.5">
                                {approver}
                            </div>
                            {approverPosition && (
                                <p className="mt-1 capitalize">{approverPosition.toLowerCase()}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
