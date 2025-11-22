"use client"

import { useEffect, useState } from "react"
import { ProjectList } from "@/components/projects/ProjectList"
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog"
import { supabase } from "@/lib/supabase"
import { Project } from "@/types"
import { Loader2 } from "lucide-react"

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    const fetchProjects = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching projects:', error)
            } else {
                setProjects(data || [])
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
                <CreateProjectDialog onProjectCreated={fetchProjects} />
            </div>
            {loading ? (
                <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : (
                <ProjectList projects={projects} />
            )}
        </div>
    )
}
