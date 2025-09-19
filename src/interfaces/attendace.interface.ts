export interface Attendance {
    id: string;
    studentId: string;
    courseId: string;   
    attenddanceDate: Date;
}

export type ModalType = "create" | "edit" | "delete";