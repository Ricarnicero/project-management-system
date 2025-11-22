import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                <p className="text-muted-foreground">
                    Administra tu perfil y preferencias
                </p>
            </div>
            <ProfileSettingsForm />
        </div>
    )
}
