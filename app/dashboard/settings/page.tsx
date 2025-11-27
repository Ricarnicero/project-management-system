import { StatusManager } from "@/components/settings/StatusManager"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
                <p className="text-muted-foreground">
                    Configura las opciones generales del sistema.
                </p>
            </div>
            <div className="grid gap-6">
                <StatusManager />
            </div>
        </div>
    )
}
