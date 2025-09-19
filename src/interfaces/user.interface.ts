export interface User {
    id: string;
    fullName: string;
    email: string;
    password: string;
}

export type ModalType = "create" | "edit" | "delete";