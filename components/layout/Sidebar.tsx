"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Code2,
    Bug,
    LifeBuoy,
    Settings,
    FolderKanban,
    LogOut,
    Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

const sidebarItems = [
    {
        title: "Tablero",
        href: "/dashboard",
        icon: LayoutDashboard,
        variant: "default",
    },
    {
        title: "Clientes",
        href: "/dashboard/clients",
        icon: Users,
        variant: "ghost",
    },
    {
        title: "Desarrollo",
        href: "/dashboard/dev",
        icon: Code2,
        variant: "ghost",
    },
    {
        title: "QA",
        href: "/dashboard/qa",
        icon: Bug,
        variant: "ghost",
    },
    {
        title: "Soporte",
        href: "/dashboard/support",
        icon: LifeBuoy,
        variant: "ghost",
    },
    {
        title: "Administración",
        href: "/dashboard/admin",
        icon: FolderKanban,
        variant: "ghost",
    },
]

export function SidebarContent() {
    const pathname = usePathname()

    return (
        <div className="pb-12 w-full h-full bg-background flex flex-col">
            <div className="space-y-4 py-4 flex-grow">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Gestión de Requerimientos
                    </h2>
                    <div className="space-y-1">
                        {sidebarItems.map((item) => (
                            <Button
                                key={item.href}
                                variant={pathname === item.href ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
                                    pathname === item.href && "bg-secondary"
                                )}
                                asChild
                            >
                                <Link href={item.href}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Configuración
                    </h2>
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            Ajustes
                        </Button>
                    </div>
                </div>
            </div>
            <div className="mt-auto p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                    onClick={async () => {
                        await supabase.auth.signOut()
                        window.location.href = "/login"
                    }}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    )
}

export function Sidebar() {
    return (
        <div className="hidden md:flex w-64 border-r min-h-screen bg-background flex-col">
            <SidebarContent />
        </div>
    )
}
