export interface Qualification {
    id: string;
    studentId: string;
    courseId: string;
    qualificationStateId: string;
    qualificationDate: Date;
}

export type ModalType = "create" | "edit" | "delete";