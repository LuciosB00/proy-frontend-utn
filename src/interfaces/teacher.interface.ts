import type { User } from "./user.interface";

export interface Teacher {
    id: string;
    dni: number;
    registrationState: string;
    phone: null;
    dateBirth: null;
    address: null;
    user: User;
}
export type ModalType = "create" | "edit" | "delete";