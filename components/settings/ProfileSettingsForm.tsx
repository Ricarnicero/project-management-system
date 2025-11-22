"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Loader2, Upload, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ProfileSettingsForm() {
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [profile, setProfile] = useState({
        full_name: "",
        alias: "",
        email: "",
        phone: "",
        avatar_url: "",
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

            if (error) throw error

            if (data) {
                setProfile({
                    full_name: data.full_name || "",
                    alias: data.alias || "",
                    email: data.email || user.email || "",
                    phone: data.phone || "",
                    avatar_url: data.avatar_url || "",
                })
            }
        } catch (error) {
            console.error("Error fetching profile:", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user found")

            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: profile.full_name,
                    alias: profile.alias,
                    phone: profile.phone,
                    avatar_url: profile.avatar_url,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user.id)

            if (error) throw error

            alert("Perfil actualizado correctamente")
        } catch (error) {
            console.error("Error updating profile:", error)
            alert("Error al actualizar el perfil")
        } finally {
            setLoading(false)
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!e.target.files || e.target.files.length === 0) {
                return
            }

            const file = e.target.files[0]
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user found")

            const fileExt = file.name.split(".").pop()
            const fileName = `${user.id}-${Math.random()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath)

            setProfile({ ...profile, avatar_url: publicUrl })
        } catch (error) {
            console.error("Error uploading avatar:", error)
            alert("Error al subir la imagen")
        } finally {
            setUploading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuración de Perfil</CardTitle>
                <CardDescription>
                    Actualiza tu información personal
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback>
                                <User className="h-12 w-12" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <Label htmlFor="avatar" className="cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={uploading}
                                        onClick={() => document.getElementById("avatar")?.click()}
                                    >
                                        {uploading ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Upload className="mr-2 h-4 w-4" />
                                        )}
                                        Subir Foto
                                    </Button>
                                </div>
                            </Label>
                            <Input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                JPG, PNG o GIF. Máximo 2MB.
                            </p>
                        </div>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Nombre Completo</Label>
                        <Input
                            id="full_name"
                            value={profile.full_name}
                            onChange={(e) =>
                                setProfile({ ...profile, full_name: e.target.value })
                            }
                            placeholder="Juan Pérez"
                        />
                    </div>

                    {/* Alias */}
                    <div className="space-y-2">
                        <Label htmlFor="alias">Alias / Usuario</Label>
                        <Input
                            id="alias"
                            value={profile.alias}
                            onChange={(e) =>
                                setProfile({ ...profile, alias: e.target.value })
                            }
                            placeholder="juanp"
                        />
                    </div>

                    {/* Email (read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            value={profile.email}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                            El email no se puede modificar
                        </p>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={profile.phone}
                            onChange={(e) =>
                                setProfile({ ...profile, phone: e.target.value })
                            }
                            placeholder="+52 123 456 7890"
                        />
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
