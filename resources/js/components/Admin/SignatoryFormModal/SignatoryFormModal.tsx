import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Signatory = {
    id: number;
    name: string;
    position: string;
    email: string;
    role: string;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    signatory?: Signatory | null; // Optional - if not provided, it's create mode
    onConfirm: (name: string, position: string, email: string, role: string) => void;
    onDelete?: (officeId: number, signatoryId: number) => void;
    officeId?: number;
};

export default function SignatoryFormModal({ isOpen, onClose, signatory, onConfirm, onDelete, officeId }: Props) {
    const [name, setName] = useState(signatory?.name ?? '');
    const [position, setPosition] = useState(signatory?.position ?? '');
    const [email, setEmail] = useState(signatory?.email ?? '');
    const [role, setRole] = useState(signatory?.role ?? '');

    const isEditMode = !!signatory;

    const handleSubmit = () => {
        if (name && position && email && role) {
            onConfirm(name, position, email, role);
            // Reset on close is handled by Dialog's onOpenChange
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset form when closing
            setName(signatory?.name ?? '');
            setPosition(signatory?.position ?? '');
            setEmail(signatory?.email ?? '');
            setRole(signatory?.role ?? '');
            onClose();
        }
    };

    const handleDelete = () => {
        if (isEditMode && signatory && onDelete && officeId && confirm('Are you sure you want to delete this signatory?')) {
            onDelete(officeId, signatory.id);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Signatory' : 'Create Signatory'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="sig-name">Name</Label>
                        <Input
                            id="sig-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter signatory name"
                        />
                    </div>
                    <div>
                        <Label htmlFor="sig-position">Position</Label>
                        <Input
                            id="sig-position"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            placeholder="Enter position"
                        />
                    </div>
                    <div>
                        <Label htmlFor="sig-email">Email</Label>
                        <Input
                            id="sig-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                        />
                    </div>
                    <div>
                        <Label htmlFor="sig-role">Role</Label>
                        <select
                            id="sig-role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        >
                            <option value="">Select a role</option>
                            <option value="reviewer">Reviewer</option>
                            <option value="approver">Approver</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={!name || !position || !email || !role}
                            className="flex-1"
                        >
                            {isEditMode ? 'Update' : 'Create'}
                        </Button>
                        {isEditMode && onDelete && (
                            <Button variant="destructive" onClick={handleDelete} className="gap-2">
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
