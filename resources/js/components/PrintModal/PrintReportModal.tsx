import { usePage } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Report } from '@/pages/user/accomplishment-report';

type PageProps = {
    auth: {
        user: {
            name: string;
        };
    };
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    report: Report | null;
    onConfirm: (
        reviewer: string,
        approver: string,
        office: string,
        position: string
    ) => void;
};

export default function PrintReportModal({
    isOpen,
    onClose,
    report,
    onConfirm,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const userName = auth.user.name;

    const [reviewer, setReviewer] = useState(report?.reviewer ?? '');
    const [approver, setApprover] = useState(report?.approver ?? '');
    const [office, setOffice] = useState(report?.office ?? '');
    const [position, setPosition] = useState(report?.position ?? '');

    const resetFields = () => {
        setReviewer('');
        setApprover('');
        setOffice('');
        setPosition('');
    };

    const handleClose = () => {
        resetFields();
        onClose();
    };

    const handlePrint = () => {
        onConfirm(reviewer, approver, office, position);
        resetFields();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) handleClose();
        }}>
            <DialogContent className="max-w-lg print:hidden">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Printer className="h-5 w-5 text-muted-foreground" />
                        <DialogTitle>Print Accomplishment Report</DialogTitle>
                    </div>
                    <DialogDescription>
                        Fill out the required information before printing.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* User */}
                    <div className="space-y-2">
                        <Label>User</Label>
                        <Input
                            value={userName}
                            disabled
                            className="bg-muted/40"
                        />
                    </div>

                    {/* Office */}
                    <div className="space-y-2">
                        <Label htmlFor="office">Office</Label>
                        <Input
                            id="office"
                            value={office}
                            onChange={(e) => setOffice(e.target.value)}
                            placeholder="Enter office"
                        />
                    </div>

                    {/* Position */}
                    <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                            id="position"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            placeholder="Enter position"
                        />
                    </div>

                    {/* Reviewer */}
                    <div className="space-y-2">
                        <Label htmlFor="reviewer">Reviewer</Label>
                        <Input
                            id="reviewer"
                            value={reviewer}
                            onChange={(e) => setReviewer(e.target.value)}
                            placeholder="Enter reviewer name"
                        />
                    </div>

                    {/* Approver */}
                    <div className="space-y-2">
                        <Label htmlFor="approver">Approver</Label>
                        <Input
                            id="approver"
                            value={approver}
                            onChange={(e) => setApprover(e.target.value)}
                            placeholder="Enter approver name"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>

                    <Button
                        onClick={handlePrint}
                        disabled={
                            !reviewer.trim() ||
                            !approver.trim() ||
                            !office.trim() ||
                            !position.trim()
                        }
                        className="min-w-[110px]"
                    >
                        Print Report
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
