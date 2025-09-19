export interface Student {
    id: string;
    dateBirth?: Date;
    dni: number;
    phone?: string;
    address?: string;
}

export type ModalType = "create" | "edit" | "delete";