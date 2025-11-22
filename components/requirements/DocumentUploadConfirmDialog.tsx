"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DocumentUploadConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    requirementTitle: string
}

export function DocumentUploadConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    requirementTitle
}: DocumentUploadConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Requerimiento creado exitosamente</AlertDialogTitle>
                    <AlertDialogDescription>
                        El requerimiento "{requirementTitle}" ha sido creado.
                        <br /><br />
                        ¿Deseas añadir documentos ahora?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>No, más tarde</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        Sí, añadir documentos
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
