import type { RegistrationState } from "./matriculation.interface";
import type { User } from "./user.interface";

export interface Student {
    registrationState: RegistrationState;
    id: string; 
    dni: number;
    phone: string;
    dateBirth: string;
    address: string;
    user: User;
}

export type ModalType = "create" | "edit" | "delete";
