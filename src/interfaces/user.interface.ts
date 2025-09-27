export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  password?: string;
}

export enum Role {
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
}

export type ModalType = "create" | "edit" | "delete";

export interface AuthResponse extends User {
  token: string;
}
