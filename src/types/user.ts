import { UUID } from "crypto";

export interface User {
    id: UUID,
    org_id: UUID,
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    username: string,
    role: "ADMIN" | "HR" | "EMPLOYEE" | "MANAGER",
    manager_id: UUID,
    profileUrl: string,
    contactNo: number,
    status: "ACTIVE" | "INACTIVE",
}