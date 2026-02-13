import { ChevronDown, Pencil, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import OfficeSignatoryTable from './OfficeSignatoryTable';

type Signatory = {
    id: number;
    name: string;
    position: string;
    role: 'Reviewer' | 'Approver';
};

type Office = {
    id: number;
    name: string;
    signatories: Signatory[];
};

type Props = {
    offices: Office[];
    expandedOffice: number | null;
    onExpandOffice: (id: number | null) => void;
    onAddOffice: () => void;
    onEditOffice: (office: Office) => void;
    onDeleteOffice: (officeId: number) => void;
    onAddSignatory: (officeId: number) => void;
    onEditSignatory: (officeId: number, signatory: Signatory) => void;
    onDeleteSignatory: (officeId: number, signatoryId: number) => void;
};

export default function OfficeList({
    offices,
    expandedOffice,
    onExpandOffice,
    onAddOffice,
    onEditOffice,
    onDeleteOffice,
    onAddSignatory,
    onEditSignatory,
    onDeleteSignatory,
}: Props) {
    return (
        <div className="mt-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold">Office List</h3>
                    <p className="text-sm text-gray-500">
                        {offices.length}{' '}
                        {offices.length === 1 ? 'office' : 'offices'} configured
                    </p>
                </div>
                <Button onClick={onAddOffice}>
                    <Plus size={16} />
                    Add Office
                </Button>
            </div>

            <Separator className="mb-6" />

            <div className="space-y-3">
                {offices.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-gray-500">No offices configured yet. Create one to get started.</p>
                    </Card>
                ) : (
                    offices.map((office) => (
                        <Card key={office.id} className="p-5">
                            <Collapsible
                                open={expandedOffice === office.id}
                                onOpenChange={(open) =>
                                    onExpandOffice(open ? office.id : null)
                                }
                            >
                                <div className="flex w-full items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold">
                                            {office.name}
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {office.signatories.length}{' '}
                                            {office.signatories.length === 1
                                                ? 'signatory'
                                                : 'signatories'}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon-sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditOffice(office);
                                                    }}
                                                >
                                                    <Pencil size={16} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit Office</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon-sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteOffice(office.id);
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete Office</TooltipContent>
                                        </Tooltip>

                                        <CollapsibleTrigger asChild>
                                            <Button
                                                size="icon-sm"
                                                variant="ghost"
                                            >
                                                <ChevronDown
                                                    size={16}
                                                    className={`transition-transform ${
                                                        expandedOffice === office.id
                                                            ? 'rotate-180'
                                                            : ''
                                                    }`}
                                                />
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>
                                </div>

                                {/* 🔹 Expandable Signatories */}
                                <CollapsibleContent>
                                    <div className="mt-4 border-t pt-4">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-lg font-semibold">
                                                    Signatories
                                                </h4>
                                                <Badge variant="secondary">
                                                    {office.signatories.length}
                                                </Badge>
                                            </div>

                                            <Button
                                                onClick={() =>
                                                    onAddSignatory(office.id)
                                                }
                                            >
                                                <Plus size={16} />
                                                Add Signatory
                                            </Button>
                                        </div>

                                        <OfficeSignatoryTable
                                            signatories={office.signatories}
                                            officeId={office.id}
                                            onEditSignatory={onEditSignatory}
                                            onDeleteSignatory={onDeleteSignatory}
                                        />
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
