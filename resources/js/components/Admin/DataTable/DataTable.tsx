import { Edit2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type DataItem = {
    id: number;
    name: string;
    position: string;
    email: string;
    role: string;
};

type Props<T extends DataItem = DataItem> = {
    data: T[];
    itemName: string; // e.g., "User", "Signatory" - for display labels
    onEdit: (item: T) => void;
};

export default function DataTable<T extends DataItem = DataItem>({ 
    data, 
    itemName,
    onEdit 
}: Props<T>) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (data.length === 0) {
        return (
            <div className="space-y-4">
                <Input
                    placeholder={`Search ${itemName.toLowerCase()}s...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                    disabled
                />
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-sm text-muted-foreground">No {itemName.toLowerCase()}s created yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Input
                placeholder={`Search ${itemName.toLowerCase()}s...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                                    No {itemName.toLowerCase()}s found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.position}</TableCell>
                                    <TableCell>{item.email}</TableCell>
                                    <TableCell>{item.role}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(item)}
                                            className="gap-2"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
