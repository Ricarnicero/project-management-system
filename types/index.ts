export type Area = 'dev' | 'qa' | 'support' | 'admin'

export interface UserProfile {
    id: string
    email: string
    full_name: string
    role: Area
    avatar_url?: string
    phone?: string
    alias?: string
}

export interface Client {
    id: string
    name: string
    email?: string
    phone?: string
    created_at: string
}

export interface Project {
    id: string
    client_id: string
    name: string
    description: string
    status: 'active' | 'completed' | 'on_hold' | 'archived'
    start_date: string
    end_date?: string
    created_at: string
}

export interface Requirement {
    id: string
    client_id?: string
    project_id?: string
    title: string
    description: string
    status: 'pending' | 'in_progress' | 'completed' | 'blocked'
    assigned_to?: string // User ID
    area: Area
    priority: 'low' | 'medium' | 'high' | 'critical'
    created_at: string
    dev_start_date?: string
    dev_end_date?: string
    internal_delivery_date?: string
    testing_start_date?: string
    testing_end_date?: string
    client_delivery_date?: string
}

export interface Documentation {
    id: string
    project_id: string
    title: string
    content: string
    type: 'technical' | 'functional' | 'user_manual' | 'other'
    created_at: string
}

export interface Alert {
    id: string
    project_id: string
    message: string
    type: 'info' | 'warning' | 'error' | 'success'
    created_at: string
}

export interface RequirementDocument {
    id: string
    requirement_id: string
    file_name: string
    file_url: string
    file_type: string | null
    file_size: number | null
    uploaded_by: string | null
    created_at: string
}

export interface AuditLog {
    id: string
    requirement_id: string
    user_id: string
    field_name: string
    old_value: string | null
    new_value: string | null
    changed_at: string
}
