export interface Teacher {
    id: string;
    dateBirth?: Date;
    dni: string;
    phone?: string;
    address?: string;
}

export type ModalType = "create" | "edit" | "delete";