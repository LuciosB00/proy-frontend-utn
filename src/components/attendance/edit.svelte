<script lang="ts">
    import { http } from "@src/core/http";
    import { onMount } from "svelte";
    import type { ModalType, Attendance } from "@src/interfaces/attendance.interface";
    import type { Student } from "@src/interfaces/student.interface";
    import type { Course } from "@src/interfaces/course.interface";
    import type { Career } from "@src/interfaces/career.interface";
    import type { Matriculation } from "@src/interfaces/matriculation.interface";

    interface Props {
        openModalEdit: boolean;
        closeModal: (name: ModalType) => void;
        getAllAttendances: () => Promise<void>;
        attendance: Attendance | undefined;
    }

    const { openModalEdit, closeModal, getAllAttendances, attendance }: Props = $props();

    let students = $state<Student[]>([]);
    let courses = $state<Course[]>([]);
    let careers = $state<Career[]>([]);
    let matriculations = $state<Matriculation[]>([]);

    let selectedCareerId = $state<string>("");

    let studentId = $state<string>("");
    let courseId = $state<string>("");
    let status = $state<"PRESENT" | "LATE" | "ABSENT">("ABSENT");
    let attendanceDate = $state<string>("");

    let loading = $state(false);
    let error = $state<string | null>(null);

    $effect(() => {
        if (attendance) {
            studentId = attendance.student?.id ?? attendance.studentId ?? "";
            courseId = attendance.course?.id ?? attendance.courseId ?? "";
            status = (attendance.status as any) ?? "ABSENT";
            try {
                if (attendance.attendanceDate) {
                    const dt = new Date(attendance.attendanceDate);
                    attendanceDate = dt.toISOString().substring(0, 10);
                } else {
                    attendanceDate = "";
                }
            } catch {
                attendanceDate = "";
            }
            selectedCareerId = attendance.course?.career?.id ?? "";
        } else {
            studentId = "";
            courseId = "";
            status = "ABSENT";
            attendanceDate = "";
            selectedCareerId = "";
        }
    });

    onMount(async () => {
        try {
            students = await http.get(`${import.meta.env.PUBLIC_BACKEND_API}/student`);
            courses = await http.get(`${import.meta.env.PUBLIC_BACKEND_API}/course`);
            careers = await http.get(`${import.meta.env.PUBLIC_BACKEND_API}/career`);
            try { matriculations = await http.get(`${import.meta.env.PUBLIC_BACKEND_API}/matriculation`); } catch { matriculations = []; }
        } catch (err) {
            console.error("Error al cargar datos:", err);
        }
    });

    const filteredCourses = $derived(() => selectedCareerId ? courses.filter(c => c.career?.id === selectedCareerId) : courses);

    const filteredStudents = $derived(() => {
        if (!selectedCareerId) return students;
        const courseIds = new Set(filteredCourses.map(c => c.id));
        const studentIds = new Set(matriculations.filter(m => courseIds.has(m.courseId)).map(m => m.studentId));
        return students.filter(s => studentIds.has(s.id));
    });

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault();
        try {
            loading = true;
            error = null;
            if (!attendance?.id || !studentId || !courseId || !status) {
                error = "Todos los campos son obligatorios";
                return;
            }
            const body: any = { studentId, courseId, status };
            if (attendanceDate) body.attendanceDate = new Date(attendanceDate).toISOString();
            await http.patch(`${import.meta.env.PUBLIC_BACKEND_API}/attendance/${attendance.id}`, body);
            await getAllAttendances();
            closeModal("edit");
        } catch (e: any) {
            error = e.response?.data?.message || e.message;
        } finally {
            loading = false;
        }
    };
</script>

{#if openModalEdit}
    <div class="modal-backdrop">
        <div class="modal-content">
            <div class="modal-header">
                <h2>EDITAR ASISTENCIA</h2>
                <button class="close-btn" aria-label="cerrar" onclick={() => closeModal("edit")}>✕</button>
            </div>

            {#if error}
                <div class="text-center text-accent">{error}</div>
            {/if}

            <form onsubmit={handleSubmit} class="space-y-4">
                <div class="form-group">
                    <label for="career">Carrera:</label>
                    <select id="career" bind:value={selectedCareerId}>
                        <option value="">Todas</option>
                        {#each careers as c}
                            <option value={c.id}>{c.name}</option>
                        {/each}
                    </select>
                </div>
                <div class="form-group">
                    <label for="course">Materia:</label>
                    <select id="course" bind:value={courseId} required>
                        <option value="">Seleccionar materia</option>
                        {#each filteredCourses as c}
                            <option value={c.id}>{c.name}</option>
                        {/each}
                    </select>
                </div>
                <div class="form-group">
                    <label for="student">Estudiante:</label>
                    <select id="student" bind:value={studentId} required>
                        <option value="">Seleccionar estudiante</option>
                        {#each filteredStudents as s}
                            <option value={s.id}>{s.user?.fullName ?? s.id}</option>
                        {/each}
                    </select>
                </div>
                <div class="form-group">
                    <label for="status">Estado:</label>
                    <select id="status" bind:value={status}>
                        <option value="PRESENT">Presente</option>
                        <option value="LATE">Tarde</option>
                        <option value="ABSENT">Ausente</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="date">Fecha (opcional):</label>
                    <input type="date" id="date" bind:value={attendanceDate} />
                </div>

                <div class="modal-footer">
                    <button type="submit" class="btn btn-success" disabled={loading}>Aceptar</button>
                    <button type="button" class="btn btn-danger" onclick={() => closeModal("edit")}>Cancelar</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 50; }
    .modal-content { background: white; border-radius: 8px; width: 100%; max-width: 520px; padding: 16px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; }
    .close-btn { background: transparent; border: none; font-size: 20px; cursor: pointer; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .btn { padding: 8px 12px; border-radius: 6px; }
    .btn-success { background: #28a745; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .modal-footer { display: flex; gap: 10px; justify-content: flex-end; }
</style>