export interface Matriculation {
    id: string;
    studentId: string;
    courseId: string;
    registrationDate: Date;
    registrationState: RegistrationState;
    courseState: CourseState;
}

export enum RegistrationState {
    Approved = "APPROVED",
    Rejected = "REJECTED",
    Pending = "PENDING",
}

export enum CourseState {
    Promoted = "PROMOTED",
    Regular = "REGULAR",
    Free = "FREE",
}


export type ModalType = "create" | "edit" | "delete";