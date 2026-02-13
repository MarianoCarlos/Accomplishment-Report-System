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

type OfficeForm = {
    name: string;
};

type Props = {
    isOpen: boolean;
    editing?: boolean;
    isLoading?: boolean;
    form: OfficeForm;
    onChange: (data: OfficeForm) => void;
    onClose: () => void;
    onSave: () => void;
};

export default function OfficeModal({
    isOpen,
    editing = false,
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
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Handle Enter key to submit
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && form.name.trim()) {
            onSave();
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {editing ? 'Edit Office' : 'Add Office'}
                    </DialogTitle>
                    <DialogDescription>
                        {editing
                            ? 'Update office information.'
                            : 'Create a new office for assigning signatories.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="office-name">Office Name</Label>
                        <Input
                            id="office-name"
                            type="text"
                            value={form.name}
                            onChange={(e) =>
                                onChange({ ...form, name: e.target.value })
                            }
                            onKeyDown={handleKeyDown}
                            autoFocus
                            placeholder="Enter office name"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onSave}
                        disabled={!form.name.trim() || isLoading}
                    >
                        {isLoading && <Spinner className="mr-2 size-4" />}
                        {editing ? 'Update Office' : 'Create Office'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
