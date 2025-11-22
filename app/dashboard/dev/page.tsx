import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DevPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Área de Desarrollo</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Mis Tareas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Lista de tareas asignadas al desarrollador actual.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Revisiones de Código</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>PRs pendientes de revisión.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
