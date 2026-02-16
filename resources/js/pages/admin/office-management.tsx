'use client';

import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { adminDashboard, officeManagement } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: adminDashboard().url,
    },
    {
        title: 'Office Management',
        href: officeManagement().url,
    },
];

interface Office {
    id: number;
    name: string;
    location: string;
    status: 'active' | 'inactive';
    description?: string;
}

const initialOffices: Office[] = [
    {
        id: 1,
        name: 'Main Office',
        location: 'Downtown, City Center',
        status: 'active',
        description: 'Headquarters of the organization',
    },
    {
        id: 2,
        name: 'Branch Office - North',
        location: 'North District',
        status: 'active',
        description: 'Regional office serving northern areas',
    },
    {
        id: 3,
        name: 'Branch Office - South',
        location: 'South District',
        status: 'inactive',
        description: 'Regional office serving southern areas',
    },
    {
        id: 4,
        name: 'Support Center',
        location: 'Business Park',
        status: 'active',
        description: 'Customer support and operations center',
    },
];

export default function OfficeManagement() {
    const [offices, setOffices] = useState<Office[]>(initialOffices);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingOffice, setEditingOffice] = useState<Office | null>(null);
    const [formData, setFormData] = useState({ name: '', location: '', description: '' });

    const handleAddOffice = () => {
        if (formData.name && formData.location) {
            const newOffice: Office = {
                id: Math.max(...offices.map(o => o.id), 0) + 1,
                name: formData.name,
                location: formData.location,
                description: formData.description,
                status: 'active',
            };
            setOffices([...offices, newOffice]);
            setFormData({ name: '', location: '', description: '' });
            setIsAddDialogOpen(false);
        }
    };

    const handleEditOffice = (office: Office) => {
        setEditingOffice(office);
        setFormData({ name: office.name, location: office.location, description: office.description || '' });
        setIsEditDialogOpen(true);
    };

    const handleUpdateOffice = () => {
        if (editingOffice && formData.name && formData.location) {
            setOffices(offices.map(o =>
                o.id === editingOffice.id
                    ? { ...o, name: formData.name, location: formData.location, description: formData.description }
                    : o
            ));
            setFormData({ name: '', location: '', description: '' });
            setEditingOffice(null);
            setIsEditDialogOpen(false);
        }
    };

    const handleDeleteOffice = (id: number) => {
        setOffices(offices.filter(o => o.id !== id));
    };

    const handleToggleStatus = (id: number) => {
        setOffices(offices.map(o =>
            o.id === id ? { ...o, status: o.status === 'active' ? 'inactive' : 'active' } : o
        ));
    };

    const stats = {
        total: offices.length,
        active: offices.filter(o => o.status === 'active').length,
        inactive: offices.filter(o => o.status === 'inactive').length,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Office Management" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                {/* Stats Section */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Total Offices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Office List Section */}
                <Card className="flex flex-1 flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Offices</CardTitle>
                            <CardDescription>Manage your organization's offices</CardDescription>
                        </div>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>Add Office</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Office</DialogTitle>
                                    <DialogDescription>
                                        Fill in the details to create a new office
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Office Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., Main Office"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="e.g., Downtown, City Center"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Input
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Optional description"
                                        />
                                    </div>
                                    <Button onClick={handleAddOffice} className="w-full">
                                        Create Office
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                        <div className="grid gap-4">
                            {offices.map((office) => (
                                <Card key={office.id} className="overflow-hidden">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-lg">{office.name}</CardTitle>
                                                    <Badge variant={office.status === 'active' ? 'default' : 'secondary'}>
                                                        {office.status}
                                                    </Badge>
                                                </div>
                                                <CardDescription className="mt-1">{office.location}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    {office.description && (
                                        <CardContent className="pb-3">
                                            <p className="text-sm text-muted-foreground">{office.description}</p>
                                        </CardContent>
                                    )}
                                    <CardContent>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditOffice(office)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleToggleStatus(office.id)}
                                            >
                                                {office.status === 'active' ? 'Deactivate' : 'Activate'}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteOffice(office.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Office</DialogTitle>
                            <DialogDescription>
                                Update the office details
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Office Name</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Main Office"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-location">Location</Label>
                                <Input
                                    id="edit-location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g., Downtown, City Center"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Input
                                    id="edit-description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Optional description"
                                />
                            </div>
                            <Button onClick={handleUpdateOffice} className="w-full">
                                Update Office
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
