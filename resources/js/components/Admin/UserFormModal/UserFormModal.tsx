import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type User = {
    id: number;
    name: string;
    position: string;
    email: string;
    role: string;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null; // Optional - if not provided, it's create mode
    onConfirm: (name: string, position: string, email: string, role: string) => void;
    onDelete?: (officeId: number, userId: number) => void;
    officeId?: number;
};

export default function UserFormModal({ isOpen, onClose, user, onConfirm, onDelete, officeId }: Props) {
    const [name, setName] = useState(user?.name ?? '');
    const [position, setPosition] = useState(user?.position ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [role, setRole] = useState(user?.role ?? '');

    const isEditMode = !!user;

    const handleSubmit = () => {
        if (name && position && email && role) {
            onConfirm(name, position, email, role);
            // Reset on close is handled by Dialog's onOpenChange
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset form when closing
            setName(user?.name ?? '');
            setPosition(user?.position ?? '');
            setEmail(user?.email ?? '');
            setRole(user?.role ?? '');
            onClose();
        }
    };

    const handleDelete = () => {
        if (isEditMode && user && onDelete && officeId && confirm('Are you sure you want to delete this user?')) {
            onDelete(officeId, user.id);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit User' : 'Create User'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter user name"
                        />
                    </div>
                    <div>
                        <Label htmlFor="position">Position</Label>
                        <Input
                            id="position"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            placeholder="Enter position"
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                        />
                    </div>
                    <div>
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        >
                            <option value="">Select a role</option>
                            <option value="admin">Admin</option>
                            <option value="employee">Employee</option>
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
