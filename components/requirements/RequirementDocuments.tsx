"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { RequirementDocument } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, Download, Trash2, FileText } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface RequirementDocumentsProps {
    requirementId: string
}

export function RequirementDocuments({ requirementId }: RequirementDocumentsProps) {
    const [documents, setDocuments] = useState<RequirementDocument[]>([])
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDocuments()
    }, [requirementId])

    const fetchDocuments = async () => {
        try {
            const { data, error } = await supabase
                .from("requirement_documents")
                .select("*")
                .eq("requirement_id", requirementId)
                .order("created_at", { ascending: false })

            if (error) throw error
            setDocuments(data || [])
        } catch (error) {
            console.error("Error fetching documents:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!e.target.files || e.target.files.length === 0) {
                return
            }

            const file = e.target.files[0]
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user found")

            const fileExt = file.name.split(".").pop()
            const fileName = `${requirementId}/${Date.now()}-${file.name}`

            const { error: uploadError } = await supabase.storage
                .from("requirement-documents")
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from("requirement-documents")
                .getPublicUrl(fileName)

            const { error: dbError } = await supabase
                .from("requirement_documents")
                .insert([
                    {
                        requirement_id: requirementId,
                        file_name: file.name,
                        file_url: publicUrl,
                        file_type: file.type,
                        file_size: file.size,
                        uploaded_by: user.id,
                    },
                ])

            if (dbError) throw dbError

            fetchDocuments()
            e.target.value = ""
        } catch (error) {
            console.error("Error uploading file:", error)
            alert("Error al subir el archivo")
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (doc: RequirementDocument) => {
        if (!confirm(`¿Eliminar ${doc.file_name}?`)) return

        try {
            // Extract file path from URL
            const urlParts = doc.file_url.split("/requirement-documents/")
            const filePath = urlParts[1]

            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from("requirement-documents")
                .remove([filePath])

            if (storageError) throw storageError

            // Delete from database
            const { error: dbError } = await supabase
                .from("requirement_documents")
                .delete()
                .eq("id", doc.id)

            if (dbError) throw dbError

            fetchDocuments()
        } catch (error) {
            console.error("Error deleting document:", error)
            alert("Error al eliminar el documento")
        }
    }

    const formatFileSize = (bytes: number | null): string => {
        if (!bytes) return "N/A"
        const kb = bytes / 1024
        if (kb < 1024) return `${kb.toFixed(1)} KB`
        return `${(kb / 1024).toFixed(1)} MB`
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex flex-col md:flex-row items-center justify-between gap-4">
                    Documentación
                    <div className="w-full md:w-auto">
                        <Input
                            id={`file-upload-${requirementId}`}
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        <Button
                            size="sm"
                            className="w-full md:w-auto"
                            onClick={() => document.getElementById(`file-upload-${requirementId}`)?.click()}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="mr-2 h-4 w-4" />
                            )}
                            Subir Archivo
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No hay documentos adjuntos
                    </p>
                ) : (
                    <div className="space-y-2">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">{doc.file_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(doc.file_size)} • {format(new Date(doc.created_at), "PPp", { locale: es })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => window.open(doc.file_url, "_blank")}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDelete(doc)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
