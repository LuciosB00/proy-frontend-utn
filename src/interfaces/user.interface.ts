export interface User {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    password?: string;
}

export enum Role {
    Admin = "ADMIN",
    Student = "STUDENT",
    Teacher = "TEACHER"
}

export type ModalType = "create" | "edit" | "delete";

export interface AuthResponse extends User {
    token: string;
}

