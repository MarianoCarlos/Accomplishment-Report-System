import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type Signatory = {
    id: number;
    name: string;
    position: string;
    role: 'Reviewer' | 'Approver';
};

type Props = {
    signatories: Signatory[];
    officeId: number;
    onEditSignatory: (officeId: number, signatory: Signatory) => void;
    onDeleteSignatory: (officeId: number, signatoryId: number) => void;
};

export default function OfficeSignatoryTable({
    signatories,
    officeId,
    onEditSignatory,
    onDeleteSignatory,
}: Props) {
    if (signatories.length === 0) {
        return (
            <Card className="py-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    No signatories added yet.
                </p>
            </Card>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-neutral-800">
                    <tr className="border-b text-left">
                        <th className="p-2">Name</th>
                        <th className="p-2">Position</th>
                        <th className="p-2">Role</th>
                        <th className="p-2 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {signatories.map((sig) => (
                        <tr
                            key={sig.id}
                            className="border-b transition hover:bg-gray-50 dark:hover:bg-neutral-800"
                        >
                            <td className="p-2">{sig.name}</td>
                            <td className="p-2">{sig.position}</td>
                            <td className="p-2">
                                <Badge
                                    variant={
                                        sig.role === 'Reviewer'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {sig.role}
                                </Badge>
                            </td>

                            <td className="p-2 text-right">
                                <div className="flex justify-end gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon-sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    onEditSignatory(officeId, sig)
                                                }
                                            >
                                                <Pencil size={16} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit Signatory</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon-sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    onDeleteSignatory(officeId, sig.id)
                                                }
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Delete Signatory</TooltipContent>
                                    </Tooltip>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
