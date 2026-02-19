import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
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

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            return () => window.removeEventListener('keydown', handleEsc);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handlePrint = () => {
        onConfirm(reviewer, approver);

        // reset values
        setReviewer('');
        setApprover('');
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            >
                <div className="mb-5">
                    <div className="flex items-center gap-2">
                        <Printer className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-lg font-semibold">
                            Print Accomplishment Report
                        </h2>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Please select the reviewer and approver before
                        printing.
                    </p>
                </div>

                <div className="space-y-4">
                    {/* User */}
                    <div>
                        <label className="text-sm font-medium">User</label>
                        <div className="mt-1 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                            {userName}
                        </div>
                    </div>

                    {/* Reviewer */}
                    <div>
                        <label className="text-sm font-medium">
                            Reviewer
                        </label>
                        <select
                            value={reviewer}
                            onChange={(e) => setReviewer(e.target.value)}
                            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                            <option value="">Select reviewer</option>
                            <option value="John Doe">John Doe</option>
                            <option value="Jane Smith">Jane Smith</option>
                        </select>
                    </div>

                    {/* Approver */}
                    <div>
                        <label className="text-sm font-medium">
                            Approver
                        </label>
                        <select
                            value={approver}
                            onChange={(e) => setApprover(e.target.value)}
                            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                            <option value="">Select approver</option>
                            <option value="Manager A">Manager A</option>
                            <option value="Director B">Director B</option>
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>

                    <Button
                        onClick={handlePrint}
                        disabled={!reviewer || !approver}
                        className="min-w-[110px]"
                    >
                        Print Report
                    </Button>
                </div>
            </div>
        </div>
    );
}
