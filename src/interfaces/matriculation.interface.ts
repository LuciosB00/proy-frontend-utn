export interface Matriculation {
    id: string;
    studentId: string;
    courseId: string;
    registrationDate: Date;
}

export type ModalType = "create" | "edit" | "delete";