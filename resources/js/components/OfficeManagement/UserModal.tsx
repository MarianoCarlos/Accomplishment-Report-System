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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type UserForm = {
    name: string;
    email: string;
    position: string;
    office: number | '';
    role: 'Admin' | 'Staff';
};

type Office = {
    id: number;
    name: string;
    signatories: { id: number }[];
};

type Props = {
    isOpen: boolean;
    editing?: boolean;
    isLoading?: boolean;
    form: UserForm;
    offices: Office[];
    onChange: (data: UserForm) => void;
    onClose: () => void;
    onSave: () => void;
};

const roles: UserForm['role'][] = ['Staff', 'Admin'];

export default function UserModal({
    isOpen,
    editing = false,
    isLoading = false,
    form,
    offices,
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
    const isEmailValid = /\S+@\S+\.\S+/.test(form.email);
    const isInvalid =
        !form.name.trim() ||
        !isEmailValid ||
        !form.position.trim() ||
        !form.office ||
        !form.role;

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
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {editing ? 'Edit User' : 'Create User'}
                    </DialogTitle>
                    <DialogDescription>
                        {editing
                            ? 'Update user information and role.'
                            : 'Add a new staff or administrator to the system.'}
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="user-form"
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* Personal Information Section */}
                    <div>
                        <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Personal Information
                        </h3>
                        <Separator className="mb-4" />
                        <div className="space-y-3">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="user-name">Full Name</Label>
                                <Input
                                    id="user-name"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) =>
                                        onChange({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="John Doe"
                                    autoFocus
                                />
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="user-email">
                                    Email Address
                                </Label>
                                <Input
                                    id="user-email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        onChange({
                                            ...form,
                                            email: e.target.value,
                                        })
                                    }
                                    placeholder="user@example.com"
                                />
                            </div>

                            {/* Position Field */}
                            <div className="space-y-2">
                                <Label htmlFor="user-position">Position</Label>
                                <Input
                                    id="user-position"
                                    type="text"
                                    value={form.position}
                                    onChange={(e) =>
                                        onChange({
                                            ...form,
                                            position: e.target.value,
                                        })
                                    }
                                    placeholder="Director, Manager, etc."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Assignment Section */}
                    <div>
                        <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Assignment
                        </h3>
                        <Separator className="mb-4" />
                        <div className="space-y-3">
                            {/* Office Field */}
                            <div className="space-y-2">
                                <Label htmlFor="user-office">Office</Label>
                                <Select
                                    value={form.office.toString()}
                                    onValueChange={(value) =>
                                        onChange({
                                            ...form,
                                            office: value ? Number(value) : '',
                                        })
                                    }
                                >
                                    <SelectTrigger id="user-office">
                                        <SelectValue placeholder="Select Office" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {offices.map((office) => (
                                            <SelectItem
                                                key={office.id}
                                                value={office.id.toString()}
                                            >
                                                {office.name}
                                                {office.signatories.length >
                                                    0 &&
                                                    ` (${office.signatories.length} signator${office.signatories.length !== 1 ? 'ies' : 'y'})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Role Selection - Segmented Buttons */}
                            <div className="space-y-2">
                                <Label>System Role</Label>
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
                                                {role === 'Staff'
                                                    ? 'Can submit and view reports'
                                                    : 'Can manage users and configure system'}
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Staff can submit reports. Admin can manage
                                    users and configure system.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        form="user-form"
                        disabled={isInvalid || isLoading}
                    >
                        {isLoading && <Spinner className="mr-2 size-4" />}
                        {editing ? 'Update User' : 'Create User'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
