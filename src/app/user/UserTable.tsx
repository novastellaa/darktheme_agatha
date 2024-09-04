import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card"
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from "@/components/ui/table"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2, PlusCircle, AlertCircle, CheckCircle2 } from "lucide-react"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils"; // Pastikan Anda memiliki fungsi cn untuk menggabungkan kelas


interface UserTableProps {
    users: Array<{ id: React.Key | null | undefined; firstName: string; lastName: string; email: string; createdAt: string | number | Date; updatedAt: string | number | Date }>;
    onUpdate: (id: string, data: any) => void;
    onDelete: (id: string) => void;
    onAdd: (data: any) => void;
}

const userSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const UserTable: React.FC<UserTableProps> = ({ users, onUpdate, onDelete, onAdd }) => {
    const [editUser, setEditUser] = useState<any>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const { toast } = useToast();
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");


    const { register: registerAdd, handleSubmit: handleSubmitAdd, formState: { errors: errorsAdd }, reset: resetAdd } = useForm({
        resolver: zodResolver(userSchema),
    });

    const { register: registerEdit, handleSubmit: handleSubmitEdit, formState: { errors: errorsEdit }, reset: resetEdit } = useForm({
        resolver: zodResolver(userSchema.omit({ password: true })),
    });

    const handleAddUser = handleSubmitAdd(async (data) => {
        try {
            await onAdd(data);
            resetAdd();
            setSuccessMessage('User added successfully');
            setTimeout(() => {
                setIsAddDialogOpen(false);
                setSuccessMessage("");
            }, 500);
        } catch (error) {
            setErrorMessage('Failed to add user. Please try again.');
            setTimeout(() => {
                setErrorMessage("");
            }, 500);
        }
    });

    const handleEditUser = handleSubmitEdit(async (data) => {
        try {
            await onUpdate(editUser.id, data);
            setEditUser(null);
            setSuccessMessage('User updated successfully');
            setTimeout(() => {
                setIsEditDialogOpen(false);
                setSuccessMessage("");
            }, 500);
        } catch (error) {
            setErrorMessage('Failed to update user. Please try again.');
            setTimeout(() => {
                setErrorMessage("");
            }, 500);
        }
    });

    useEffect(() => {
        if (alertInfo) {
            toast({
                title: alertInfo.type === 'success' ? 'Success' : 'Error',
                description: alertInfo.message,
                duration: 2000,
            });
        }
    }, [alertInfo, toast]);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="mb-2">User List</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Registered users in the selected time frame.
                        </CardDescription>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(true)} className="bg-[#5726D1]">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New User</DialogTitle>
                                <DialogDescription>Enter the details of the new user here.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddUser}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="firstName" className="text-right">First Name</Label>
                                        <Input
                                            id="firstName"
                                            {...registerAdd("firstName")}
                                            className="col-span-3"
                                        />
                                    </div>
                                    {errorsAdd.firstName && <p className="text-red-500">{errorsAdd.firstName?.message as string}</p>}

                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="lastName" className="text-right">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            {...registerAdd("lastName")}
                                            className="col-span-3"
                                        />
                                    </div>
                                    {errorsAdd.lastName && <p className="text-red-500">{errorsAdd.lastName?.message as string}</p>}
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="email" className="text-right">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            {...registerAdd("email")}
                                            className="col-span-3"
                                        />
                                    </div>
                                    {errorsAdd.email && <p className="text-red-500">{errorsAdd.email?.message as string}</p>}
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="password" className="text-right">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            {...registerAdd("password")}
                                            className="col-span-3"
                                        />
                                    </div>
                                    {errorsAdd.password && <p className="text-red-500">{errorsAdd.password?.message as string}</p>}
                                </div>
                                <DialogFooter>
                                    <Button className="bg-[#5726D1]" type="submit">Add User</Button>
                                </DialogFooter>
                            </form>
                            {successMessage && (
                                <Alert className="mb-4 bg-green-100 border-green-400 text-green-700">
                                    <AlertDescription>{successMessage}</AlertDescription>
                                </Alert>
                            )}
                            {errorMessage && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertDescription>{errorMessage}</AlertDescription>
                                </Alert>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>

            <CardContent>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>First Name</TableHead>
                            <TableHead>Last Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Updated At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.firstName}</TableCell>
                                <TableCell>{user.lastName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                                <TableCell>{new Date(user.updatedAt).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="icon" onClick={() => {
                                                setEditUser(user);
                                                setIsEditDialogOpen(true);
                                            }}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Edit User</DialogTitle>
                                                <DialogDescription>Make changes to the user here.</DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleEditUser}>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="editFirstName" className="text-right">First Name</Label>
                                                        <Input
                                                            id="editFirstName"
                                                            {...registerEdit("firstName")}
                                                            defaultValue={editUser?.firstName}
                                                            className="col-span-3"
                                                        />
                                                    </div>
                                                    {errorsEdit.firstName && <p className="text-red-500">{errorsEdit.firstName?.message as string}</p>}
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="editLastName" className="text-right">Last Name</Label>
                                                        <Input
                                                            id="editLastName"
                                                            {...registerEdit("lastName")}
                                                            defaultValue={editUser?.lastName}
                                                            className="col-span-3"
                                                        />
                                                    </div>
                                                    {errorsEdit.lastName && <p className="text-red-500">{errorsEdit.lastName?.message as string}</p>}
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="editEmail" className="text-right">Email</Label>
                                                        <Input
                                                            id="editEmail"
                                                            {...registerEdit("email")}
                                                            defaultValue={editUser?.email}
                                                            className="col-span-3"
                                                        />
                                                    </div>
                                                    {errorsEdit.email && <p className="text-red-500">{errorsEdit.email?.message as string}</p>}
                                                </div>
                                                <DialogFooter>
                                                    <Button type="submit">Save changes</Button>
                                                </DialogFooter>
                                            </form>

                                            {successMessage && (
                                                <Alert className="mb-4 bg-green-100 border-green-400 text-green-700">
                                                    <AlertDescription>{successMessage}</AlertDescription>
                                                </Alert>
                                            )}
                                            {errorMessage && (
                                                <Alert variant="destructive" className="mb-4">
                                                    <AlertDescription>{errorMessage}</AlertDescription>
                                                </Alert>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="icon" className="ml-2">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the users account and remove their data from our servers.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => onDelete(user.id as string)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};