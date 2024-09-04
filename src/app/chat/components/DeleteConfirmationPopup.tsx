import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type DeleteConfirmationPopupProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    promptTitle: string;
};

export function DeleteConfirmationPopup({ isOpen, onClose, onConfirm, promptTitle }: DeleteConfirmationPopupProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                    Are you sure you want to delete the prompt &ldquo;{promptTitle}&rdquo;? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}