import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    onConfirm: (reviewer: string, approver: string) => void;
};

export default function PrintReportModal({
    isOpen,
    onClose,
    userName,
    onConfirm,
}: Props) {
    const [reviewer, setReviewer] = useState('');
    const [approver, setApprover] = useState('');

    if (!isOpen) return null;

    const handlePrint = () => {
        onConfirm(reviewer, approver);

        // reset values
        setReviewer('');
        setApprover('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold">
                    Print Report
                </h2>

                {/* User */}
                <div className="mb-3">
                    <label className="text-sm font-medium">User</label>
                    <div className="mt-1 rounded-md border bg-muted px-3 py-2 text-sm">
                        {userName}
                    </div>
                </div>

                {/* Reviewer */}
                <div className="mb-3">
                    <label className="text-sm font-medium">
                        Reviewer
                    </label>
                    <select
                        value={reviewer}
                        onChange={(e) => setReviewer(e.target.value)}
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="">Select reviewer</option>
                        <option value="John Doe">John Doe</option>
                        <option value="Jane Smith">Jane Smith</option>
                    </select>
                </div>

                {/* Approver */}
                <div className="mb-5">
                    <label className="text-sm font-medium">
                        Approver
                    </label>
                    <select
                        value={approver}
                        onChange={(e) => setApprover(e.target.value)}
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="">Select approver</option>
                        <option value="Manager A">Manager A</option>
                        <option value="Director B">Director B</option>
                    </select>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>

                    <Button
                        onClick={handlePrint}
                        disabled={!reviewer || !approver}
                    >
                        Print
                    </Button>
                </div>
            </div>
        </div>
    );
}
