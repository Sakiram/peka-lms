export interface User {
    id: string,
    org_id: string,
    email: string,
    password: string,
    first_name?: string,
    last_name?: string,
    username?: string,
    role: "ADMIN" | "HR" | "EMPLOYEE" | "MANAGER",
    manager_id?: string,
    profileUrl?: string,
    contactNo?: number,
    status: "ACTIVE" | "INACTIVE",
    created_at?: string,
    created_by?: string
}