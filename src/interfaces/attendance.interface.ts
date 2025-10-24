import type { Student } from "./student.interface";
import type { Course } from "./course.interface";
export interface Attendance {
    id: string;
    studentId: string;
    courseId: string;
    attendanceDate?: Date;
    status?: AttendanceStatus;

    course?: Course;
    student?: Student;
}

export type ModalType = "create" | "edit" | "delete";
export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT";