import { CheckCircle, XCircle, Send, RefreshCw, FileEdit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
    status?: 'draft' | 'submitted' | 'resubmitted' | 'approved' | 'rejected' | string | null;
}

export default function ReportStatusBadge({ status }: Props) {
    if (status === 'approved') {
        return (
            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                <CheckCircle className="mr-1 h-3 w-3" />
                Approved
            </Badge>
        );
    }

    if (status === 'rejected') {
        return (
            <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200">
                <XCircle className="mr-1 h-3 w-3" />
                Rejected
            </Badge>
        );
    }

    if (status === 'submitted') {
        return (
            <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                <Send className="mr-1 h-3 w-3" />
                Submitted
            </Badge>
        );
    }

    if (status === 'resubmitted') {
        return (
            <Badge variant="outline" className="text-violet-700 border-violet-200 bg-violet-50">
                <RefreshCw className="mr-1 h-3 w-3" />
                Resubmitted
            </Badge>
        );
    }

    // Default to Draft
    return (
        <Badge variant="outline" className="text-gray-600 border-gray-300 bg-gray-50">
            <FileEdit className="mr-1 h-3 w-3" />
            Draft
        </Badge>
    );
}
