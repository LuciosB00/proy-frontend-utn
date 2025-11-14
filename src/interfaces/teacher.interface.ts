import type { User } from "./user.interface";
import type { Course } from "./course.interface";

export interface Teacher {
    id: string;
    dni: number;
    registrationState: string;
    phone: null;
    dateBirth: null;
    address: null;
    user: User;
    courses?: Course[];
}
export type ModalType = "create" | "edit" | "delete";