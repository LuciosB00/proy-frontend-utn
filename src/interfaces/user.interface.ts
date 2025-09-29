export interface User {
<<<<<<< HEAD
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

=======
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
>>>>>>> 33bbc416f22ab57ec19f138b0645532d678da07b
