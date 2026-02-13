import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type SignatoryForm = {
    name: string;
    position: string;
    role: 'Reviewer' | 'Approver';
};

type Props = {
    isOpen: boolean;
    editing: boolean;
    isLoading?: boolean;
    form: SignatoryForm;
    onChange: (data: SignatoryForm) => void;
    onClose: () => void;
    onSave: () => void;
};

const roles: SignatoryForm['role'][] = ['Reviewer', 'Approver'];

export default function SignatoryModal({
    isOpen,
    editing,
    isLoading = false,
    form,
    onChange,
    onClose,
    onSave,
}: Props) {
    // Handle Escape key to close modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Check if form is valid
    const isInvalid = !form.name.trim() || !form.position.trim() || !form.role;

    // Handle form submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isInvalid) {
            onSave();
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {editing ? 'Edit Signatory' : 'Add Signatory'}
                    </DialogTitle>
                    <DialogDescription>
                        Assign a reviewer or approver for this office.
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="signatory-form"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    {/* Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="signatory-name">Full Name</Label>
                        <Input
                            id="signatory-name"
                            type="text"
                            value={form.name}
                            onChange={(e) =>
                                onChange({ ...form, name: e.target.value })
                            }
                            placeholder="John Doe"
                            autoFocus
                        />
                    </div>

                    {/* Position Field */}
                    <div className="space-y-2">
                        <Label htmlFor="signatory-position">Position</Label>
                        <Input
                            id="signatory-position"
                            type="text"
                            value={form.position}
                            onChange={(e) =>
                                onChange({ ...form, position: e.target.value })
                            }
                            placeholder="Director, Chief, etc."
                        />
                    </div>

                    {/* Role Selection - Segmented Buttons */}
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <div className="flex gap-2">
                            {roles.map((role) => (
                                <Tooltip key={role}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant={
                                                form.role === role
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            className="flex-1"
                                            onClick={() =>
                                                onChange({
                                                    ...form,
                                                    role,
                                                })
                                            }
                                        >
                                            {role}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {role === 'Reviewer'
                                            ? 'Verifies and reviews reports'
                                            : 'Gives final approval for reports'}
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Reviewer verifies reports. Approver gives final
                            approval.
                        </p>
                    </div>
                </form>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>

                    <Button
                        form="signatory-form"
                        type="submit"
                        disabled={isInvalid || isLoading}
                    >
                        {isLoading && <Spinner className="mr-2 size-4" />}
                        {editing ? 'Update' : 'Save'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
