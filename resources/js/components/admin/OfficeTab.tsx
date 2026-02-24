import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Office {
    id: number;
    name: string;
}

interface OfficeTabProps {
    offices: Office[];
    onAddOffice: (office: Office) => void;
    onEditOffice: (officeId: number, newName: string) => void;
    onDeleteOffice: (officeId: number) => void;
}

export default function OfficeTab({
    offices,
    onAddOffice,
    onEditOffice,
    onDeleteOffice,
}: OfficeTabProps) {
    const [officeDialogOpen, setOfficeDialogOpen] = useState(false);
    const [editOfficeDialogOpen, setEditOfficeDialogOpen] = useState(false);
    const [officeName, setOfficeName] = useState('');
    const [officeSearch, setOfficeSearch] = useState('');
    const [editingOffice, setEditingOffice] = useState<Office | null>(null);

    const filteredOffices = offices.filter(office =>
        office.name.toLowerCase().includes(officeSearch.toLowerCase())
    );

    const handleAddOffice = () => {
        if (officeName.trim()) {
            const newOffice = {
                id: Math.max(0, ...offices.map(o => o.id)) + 1,
                name: officeName
            };
            onAddOffice(newOffice);
            setOfficeName('');
            setOfficeDialogOpen(false);
        }
    };

    const handleEditOffice = (office: Office) => {
        setEditingOffice(office);
        setOfficeName(office.name);
        setEditOfficeDialogOpen(true);
    };

    const handleSaveOffice = () => {
        if (editingOffice && officeName.trim()) {
            onEditOffice(editingOffice.id, officeName);
        }
        setEditingOffice(null);
        setOfficeName('');
        setEditOfficeDialogOpen(false);
    };

    const handleDeleteClick = () => {
        if (editingOffice) {
            onDeleteOffice(editingOffice.id);
            setEditOfficeDialogOpen(false);
        }
    };

    return (
        <div className="space-y-4">
            <Button onClick={() => setOfficeDialogOpen(true)}>Add Office</Button>
            <Input 
                placeholder="Search office..."
                value={officeSearch}
                onChange={(e) => setOfficeSearch(e.target.value)}
                className="max-w-xs"
            />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Office Name</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredOffices.map((office) => (
                        <TableRow key={office.id}>
                            <TableCell>{office.name}</TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" onClick={() => handleEditOffice(office)}>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={officeDialogOpen} onOpenChange={setOfficeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Office</DialogTitle>
                        <DialogDescription>Enter the office name</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="office-name">Office Name</Label>
                            <Input 
                                id="office-name"
                                placeholder="Enter office name"
                                value={officeName}
                                onChange={(e) => setOfficeName(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleAddOffice} className="w-full">Add Office</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={editOfficeDialogOpen} onOpenChange={setEditOfficeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Office</DialogTitle>
                        <DialogDescription>Update the office name</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-office-name">Office Name</Label>
                            <Input 
                                id="edit-office-name"
                                placeholder="Enter office name"
                                value={officeName}
                                onChange={(e) => setOfficeName(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button onClick={handleSaveOffice} size="sm">Save Changes</Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleDeleteClick}
                                size="sm"
                            >
                                Delete Office
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
