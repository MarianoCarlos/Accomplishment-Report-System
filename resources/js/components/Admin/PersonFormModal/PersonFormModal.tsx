import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type FormPerson = {
    id: number;
    name: string;
    position: string;
    email: string;
    role: string;
};

type Props = {
    isOpen: boolean;
    itemName: string;
    onClose: () => void;
    person?: FormPerson | null;
    officeId?: number;
    roleOptions: Array<{ value: string; label: string }>;
    onConfirm: (name: string, position: string, email: string, role: string) => void;
    onDelete?: (officeId: number, personId: number) => void;
};

export default function PersonFormModal({
    isOpen,
    itemName,
    onClose,
    person,
    officeId,
    roleOptions,
    onConfirm,
    onDelete,
}: Props) {
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const isEditMode = !!person;

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setName('');
            setPosition('');
            setEmail('');
            setRole('');
            onClose();
        } else if (person) {
            setName(person.name);
            setPosition(person.position);
            setEmail(person.email);
            setRole(person.role);
        } else {
            setName('');
            setPosition('');
            setEmail('');
            setRole('');
        }
    };

    const handleSubmit = () => {
        if (name && position && email && role) {
            onConfirm(name, position, email, role);
        }
    };

    const handleDelete = () => {
        if (isEditMode && person && onDelete && officeId) {
            if (confirm(`Are you sure you want to delete this ${itemName.toLowerCase()}?`)) {
                onDelete(officeId, person.id);
                onClose();
            }
        }
    };

    const isFormValid = name && position && email && role;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? `Edit ${itemName}` : `Create ${itemName}`}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={`Enter ${itemName.toLowerCase()} name`}
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
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roleOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={!isFormValid}
                            className="flex-1"
                        >
                            {isEditMode ? 'Update' : 'Create'}
                        </Button>
                        {isEditMode && onDelete && (
                            <Button variant="destructive" onClick={handleDelete}>
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
