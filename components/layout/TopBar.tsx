"use client"

import { useState, useEffect } from "react"
import { Bell, LogOut, User, Settings, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { SidebarContent } from "@/components/layout/Sidebar"

interface Notification {
    id: string
    title: string
    message: string
    link: string | null
    read: boolean
    created_at: string
}

export function TopBar() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [userEmail, setUserEmail] = useState<string | null>(null)

    useEffect(() => {
        fetchUser()
        fetchNotifications()

        // Set up real-time subscription for notifications
        const channel = supabase
            .channel('notifications')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                () => {
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUserEmail(user?.email || null)
    }

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10)

        if (error) {
            console.error("Error fetching notifications:", error)
            return
        }

        setNotifications(data || [])
        setUnreadCount(data?.filter(n => !n.read).length || 0)
    }

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from("notifications")
            .update({ read: true })
            .eq("id", id)

        if (error) {
            console.error("Error marking notification as read:", error)
            return
        }

        fetchNotifications()
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <div className="border-b bg-background px-6 py-3 flex items-center justify-between gap-4">
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                >
                                    {unreadCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Notificaciones</h4>
                            {notifications.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    No hay notificaciones
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${!notification.read ? "bg-muted/20" : ""
                                                }`}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <p className="font-medium text-sm">{notification.title}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {new Date(notification.created_at).toLocaleString("es-ES")}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <User className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                            {userEmail || "Usuario"}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                            <Settings className="mr-2 h-4 w-4" />
                            Configuración
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Cerrar Sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
