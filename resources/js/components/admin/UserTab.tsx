import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface User {
    id: number;
    name: string;
    email: string;
    offices: string[];
    position: string;
    roles: string[];
    status: string;
}

interface UserTabProps {
    users: User[];
    onAddUser: (user: User) => void;
    onEditUser: (userId: number, user: Omit<User, 'id'>) => void;
    onDeleteUser: (userId: number) => void;
}

export default function UserTab({
    users,
    onAddUser,
    onEditUser,
    onDeleteUser,
}: UserTabProps) {
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.roles.some(role => role.toLowerCase().includes(userSearch.toLowerCase()))
    );

    const resetUserForm = () => {
        setUserName('');
        setUserEmail('');
        setUserRoles([]);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setUserName(user.name);
        setUserEmail(user.email);
        setUserRoles(user.roles);
        setUserDialogOpen(true);
    };

    const handleSaveUser = () => {
        if (editingUser && userName.trim() && userEmail.trim()) {
            onEditUser(editingUser.id, {
                name: userName,
                email: userEmail,
                offices: editingUser.offices,
                position: editingUser.position,
                roles: userRoles.length > 0 ? userRoles : ['Employee'],
                status: editingUser.status
            });
            setEditingUser(null);
            resetUserForm();
            setUserDialogOpen(false);
        }
    };

    const handleAddUser = () => {
        if (userName.trim() && userEmail.trim()) {
            const newUser: User = {
                id: Math.max(0, ...users.map(u => u.id)) + 1,
                name: userName,
                email: userEmail,
                offices: [],
                position: '',
                roles: userRoles.length > 0 ? userRoles : ['Employee'],
                status: 'Active'
            };
            onAddUser(newUser);
            resetUserForm();
            setUserDialogOpen(false);
        }
    };

    const toggleRole = (role: string) => {
        setUserRoles(prev =>
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
    };

    const handleDeleteUser = () => {
        if (editingUser) {
            onDeleteUser(editingUser.id);
            resetUserForm();
            setEditingUser(null);
            setUserDialogOpen(false);
        }
    };

    return (
        <div className="space-y-4">
            <Button onClick={() => setUserDialogOpen(true)}>Add User</Button>
            <Input 
                placeholder="Search user..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="max-w-xs"
            />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {user.roles.map((role) => (
                                        <Badge key={role} variant="default">{role}</Badge>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={userDialogOpen} onOpenChange={(open) => {
                setUserDialogOpen(open);
                if (!open) {
                    resetUserForm();
                    setEditingUser(null);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                        <DialogDescription>{editingUser ? 'Update user details' : 'Enter the user details'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="user-name">Name</Label>
                            <Input 
                                id="user-name"
                                placeholder="Enter user name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-email">Email</Label>
                            <Input 
                                id="user-email"
                                type="email"
                                placeholder="Enter user email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Roles</Label>
                            <div className="space-y-2">
                                {['Employee', 'Admin', 'Supervisor'].map((role) => (
                                    <div key={role} className="flex items-center gap-2">
                                        <Checkbox 
                                            id={`role-${role}`}
                                            checked={userRoles.includes(role)}
                                            onCheckedChange={() => toggleRole(role)}
                                        />
                                        <Label htmlFor={`role-${role}`} className="font-normal">{role}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button onClick={editingUser ? handleSaveUser : handleAddUser} size="sm" disabled={!userName.trim() || !userEmail.trim()}>{editingUser ? 'Save Changes' : 'Add User'}</Button>
                            {editingUser && (
                                <Button variant="destructive" onClick={handleDeleteUser} size="sm">
                                    Delete User
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
