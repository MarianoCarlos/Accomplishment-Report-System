import { usePage } from '@inertiajs/react';
import { Printer, X, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
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

interface Office {
    id: number;
    name: string;
}

interface Position {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    position_id?: number;
}

type PageProps = {
    auth: {
        user: {
            name: string;
            office_id?: number;
            position_id?: number;
        };
    };
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    report: Report | null;
    offices: Office[];
    positions: Position[];
    users: User[];
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
    offices,
    positions,
    users,
    onConfirm,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const userName = auth.user.name;
    const userOfficeId = auth.user.office_id;
    const userPositionId = auth.user.position_id;
    const autoAssignedOfficeName = userOfficeId
        ? offices.find((office) => office.id === userOfficeId)?.name ?? ''
        : '';
    const userPositionName = userPositionId
        ? positions.find(p => p.id === userPositionId)?.name ?? ''
        : '';

    const [selectedOffice, setSelectedOffice] = useState(autoAssignedOfficeName);
    const [selectedPosition, setSelectedPosition] = useState((userPositionName || report?.position) ?? '');
    const [selectedReviewer, setSelectedReviewer] = useState(report?.reviewer ?? '');
    const [selectedApprover, setSelectedApprover] = useState(report?.approver ?? '');

    // Search states for user selectors
    const [reviewerSearch, setReviewerSearch] = useState('');
    const [approverSearch, setApproverSearch] = useState('');
    const [showReviewerDropdown, setShowReviewerDropdown] = useState(false);
    const [showApproverDropdown, setShowApproverDropdown] = useState(false);

    const reviewerRef = useRef<HTMLDivElement>(null);
    const approverRef = useRef<HTMLDivElement>(null);

    // Validation errors state
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Handle click outside for dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (reviewerRef.current && !reviewerRef.current.contains(event.target as Node)) {
                setShowReviewerDropdown(false);
            }
            if (approverRef.current && !approverRef.current.contains(event.target as Node)) {
                setShowApproverDropdown(false);
            }
        };

        if (showReviewerDropdown || showApproverDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showReviewerDropdown, showApproverDropdown]);

    // Helper function to get position name
    const getPositionName = (positionId?: number) => {
        if (!positionId) return '';
        return positions.find(p => p.id === positionId)?.name ?? '';
    };

    // Filter users based on search
    const filteredReviewers = users.filter(user =>
        user.name.toLowerCase().includes(reviewerSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(reviewerSearch.toLowerCase())
    );

    const filteredApprovers = users.filter(user =>
        user.name.toLowerCase().includes(approverSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(approverSearch.toLowerCase())
    );

    // Get selected user objects and display names
    const reviewerUser = users.find(u => u.name === selectedReviewer);
    const reviewerName = reviewerUser
        ? `${reviewerUser.name}${reviewerUser.position_id ? `, ${getPositionName(reviewerUser.position_id)}` : ''}`
        : '';
    const approverUser = users.find(u => u.name === selectedApprover);
    const approverName = approverUser
        ? `${approverUser.name}${approverUser.position_id ? `, ${getPositionName(approverUser.position_id)}` : ''}`
        : '';

    const resetFields = () => {
        setSelectedOffice(autoAssignedOfficeName);
        setSelectedPosition((userPositionName || report?.position) ?? '');
        setSelectedReviewer('');
        setSelectedApprover('');
        setReviewerSearch('');
        setApproverSearch('');
        setShowReviewerDropdown(false);
        setShowApproverDropdown(false);
    };

    const handleClose = () => {
        resetFields();
        onClose();
    };

    const handlePrint = () => {
        // Validate all required fields
        const newErrors: Record<string, string> = {};

        if (!selectedOffice.trim()) {
            newErrors.office = 'Office is required';
        }
        if (!selectedPosition.trim()) {
            newErrors.position = 'Position is required';
        }
        if (!selectedReviewer.trim()) {
            newErrors.reviewer = 'Reviewer is required';
        }
        if (!selectedApprover.trim()) {
            newErrors.approver = 'Approver is required';
        }

        // If there are errors, show them and don't submit
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Clear errors on successful submission
        setErrors({});
        onConfirm(selectedReviewer, selectedApprover, selectedOffice, selectedPosition);
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
                        Select position and approvers before printing.
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

                    {/* Office - Read Only (Auto-filled from assigned office) */}
                    <div className="space-y-2">
                        <Label htmlFor="office">Office</Label>
                        <Input
                            id="office"
                            value={selectedOffice}
                            disabled
                            className="bg-muted/40 cursor-not-allowed"
                        />
                        {!selectedOffice && (
                            <p className="text-xs text-amber-600">No office assigned. Please contact admin.</p>
                        )}
                        {errors.office && (
                            <p className="text-xs text-red-500 mt-1">{errors.office}</p>
                        )}
                    </div>

                    {/* Position - Read Only (Auto-filled from assigned position) */}
                    {positions.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="position">Position</Label>
                            <Input
                                id="position"
                                value={selectedPosition}
                                disabled
                                className="bg-muted/40 cursor-not-allowed"
                            />
                            {!selectedPosition && (
                                <p className="text-xs text-amber-600">No position assigned. Please contact admin.</p>
                            )}
                        </div>
                    )}

                    {/* Reviewer - Searchable Select */}
                    {users.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="reviewer">Reviewer</Label>
                            <div className="relative" ref={reviewerRef}>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <Input
                                        id="reviewer"
                                        placeholder="Search reviewer..."
                                        value={showReviewerDropdown ? reviewerSearch : reviewerName}
                                        onChange={(e) => {
                                            setReviewerSearch(e.target.value);
                                            setShowReviewerDropdown(true);
                                            if (e.target.value) {
                                                setErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.reviewer;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        onClick={() => setShowReviewerDropdown(true)}
                                        className={`pl-8 h-9 ${errors.reviewer ? 'border-red-500' : ''
                                            }`}
                                    />
                                    {selectedReviewer && (
                                        <button
                                            onClick={() => {
                                                setSelectedReviewer('');
                                                setReviewerSearch('');
                                            }}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Reviewer Dropdown List */}
                                {showReviewerDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">
                                        {filteredReviewers.length > 0 ? (
                                            filteredReviewers.map((user) => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => {
                                                        setSelectedReviewer(user.name);
                                                        setReviewerSearch('');
                                                        setShowReviewerDropdown(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
                                                >
                                                    <div className="font-medium">
                                                        {user.name}
                                                        {user.position_id && (
                                                            <span className="text-gray-600">, {getPositionName(user.position_id)}</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-sm text-gray-500">
                                                No users found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {errors.reviewer && (
                                <p className="text-xs text-red-500 mt-1">{errors.reviewer}</p>
                            )}
                        </div>
                    )}

                    {/* Approver - Searchable Select */}
                    {users.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="approver">Approver</Label>
                            <div className="relative" ref={approverRef}>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <Input
                                        id="approver"
                                        placeholder="Search approver..."
                                        value={showApproverDropdown ? approverSearch : approverName}
                                        onChange={(e) => {
                                            setApproverSearch(e.target.value);
                                            setShowApproverDropdown(true);
                                            if (e.target.value) {
                                                setErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.approver;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        onClick={() => setShowApproverDropdown(true)}
                                        className={`pl-8 h-9 ${errors.approver ? 'border-red-500' : ''
                                            }`}
                                    />
                                    {selectedApprover && (
                                        <button
                                            onClick={() => {
                                                setSelectedApprover('');
                                                setApproverSearch('');
                                            }}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Approver Dropdown List */}
                                {showApproverDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">
                                        {filteredApprovers.length > 0 ? (
                                            filteredApprovers.map((user) => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => {
                                                        setSelectedApprover(user.name);
                                                        setApproverSearch('');
                                                        setShowApproverDropdown(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
                                                >
                                                    <div className="font-medium">
                                                        {user.name}
                                                        {user.position_id && (
                                                            <span className="text-gray-600">, {getPositionName(user.position_id)}</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-sm text-gray-500">
                                                No users found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {errors.approver && (
                                <p className="text-xs text-red-500 mt-1">{errors.approver}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>

                    <Button
                        onClick={handlePrint}
                        disabled={
                            !selectedReviewer.trim() ||
                            !selectedApprover.trim() ||
                            !selectedOffice.trim() ||
                            !selectedPosition.trim()
                        }
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
