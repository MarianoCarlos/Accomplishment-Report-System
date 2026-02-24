import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Position {
    id: number;
    name: string;
}

interface PositionTabProps {
    positions: Position[];
    onAddPosition: (position: Position) => void;
    onEditPosition: (positionId: number, newName: string) => void;
    onDeletePosition: (positionId: number) => void;
}

export default function PositionTab({
    positions,
    onAddPosition,
    onEditPosition,
    onDeletePosition,
}: PositionTabProps) {
    const [positionDialogOpen, setPositionDialogOpen] = useState(false);
    const [editPositionDialogOpen, setEditPositionDialogOpen] = useState(false);
    const [positionName, setPositionName] = useState('');
    const [positionSearch, setPositionSearch] = useState('');
    const [editingPosition, setEditingPosition] = useState<Position | null>(null);

    const filteredPositions = positions.filter(position =>
        position.name.toLowerCase().includes(positionSearch.toLowerCase())
    );

    const handleAddPosition = () => {
        if (positionName.trim()) {
            const newPosition = {
                id: Math.max(0, ...positions.map(p => p.id)) + 1,
                name: positionName
            };
            onAddPosition(newPosition);
            setPositionName('');
            setPositionDialogOpen(false);
        }
    };

    const handleEditPosition = (position: Position) => {
        setEditingPosition(position);
        setPositionName(position.name);
        setEditPositionDialogOpen(true);
    };

    const handleSavePosition = () => {
        if (editingPosition && positionName.trim()) {
            onEditPosition(editingPosition.id, positionName);
        }
        setEditingPosition(null);
        setPositionName('');
        setEditPositionDialogOpen(false);
    };

    const handleDeleteClick = () => {
        if (editingPosition) {
            onDeletePosition(editingPosition.id);
            setEditPositionDialogOpen(false);
        }
    };

    return (
        <div className="space-y-4">
            <Button onClick={() => setPositionDialogOpen(true)}>Add Position</Button>
            <Input 
                placeholder="Search position..."
                value={positionSearch}
                onChange={(e) => setPositionSearch(e.target.value)}
                className="max-w-xs"
            />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Position Name</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredPositions.map((position) => (
                        <TableRow key={position.id}>
                            <TableCell>{position.name}</TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" onClick={() => handleEditPosition(position)}>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={positionDialogOpen} onOpenChange={setPositionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Position</DialogTitle>
                        <DialogDescription>Enter the position name</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="position-name">Position Name</Label>
                            <Input 
                                id="position-name"
                                placeholder="Enter position name"
                                value={positionName}
                                onChange={(e) => setPositionName(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleAddPosition} className="w-full">Add Position</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={editPositionDialogOpen} onOpenChange={setEditPositionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Position</DialogTitle>
                        <DialogDescription>Update the position name</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-position-name">Position Name</Label>
                            <Input 
                                id="edit-position-name"
                                placeholder="Enter position name"
                                value={positionName}
                                onChange={(e) => setPositionName(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button onClick={handleSavePosition} size="sm">Save Changes</Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleDeleteClick}
                                size="sm"
                            >
                                Delete Position
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
