import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Office = {
    id: number;
    name: string;
};

type Props = {
    isOpen: boolean;
    office?: Office | null;
    onClose: () => void;
    onConfirm: (name: string) => void;
    onDelete?: () => void;
};

export default function OfficeFormModal({ 
    isOpen, 
    office, 
    onClose, 
    onConfirm, 
    onDelete
}: Props) {
    const [name, setName] = useState('');
    const isEditMode = !!office;

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setName('');
            onClose();
        } else if (office) {
            setName(office.name);
        } else {
            setName('');
        }
    };

    const handleSubmit = () => {
        if (name.trim()) {
            onConfirm(name);
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this office?')) {
            onDelete?.();
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Office' : 'Create Office'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="office-name">Office Name</Label>
                        <Input
                            id="office-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Main Office"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            onClick={handleSubmit} 
                            disabled={!name.trim()}
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
