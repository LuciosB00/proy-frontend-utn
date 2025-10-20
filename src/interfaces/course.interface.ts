export interface Course {
    id: string;
    name: string;
    year: number;
    fourMonth: "FIRST" | "SECOND" | "THIRD" | "FOURTH";
    career: {
        id: string;
        name: string;
    };
}

export type ModalType = "create" | "edit" | "delete";
