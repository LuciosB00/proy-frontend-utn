<script lang="ts">
    import Create from "./create.svelte";
    import Edit from "./edit.svelte";
    import Delete from "./delete.svelte";
    import { http } from "@src/core/http";
    import { onMount } from "svelte";
    import type { Attendance, AttendanceStatus, ModalType } from "@src/interfaces/attendance.interface";
    import type { Career } from "@src/interfaces/career.interface";
    import type { Course } from "@src/interfaces/course.interface";
    import type { Student } from "@src/interfaces/student.interface";
    import type { Matriculation } from "@src/interfaces/matriculation.interface";

    let headers = ["Estudiante", "Carrera", "Fecha", "Estado", "Acciones"];

    let attendances = $state<Attendance[]>([]);
    let attendance = $state<Attendance | undefined>(undefined);

    let careers = $state<Career[]>([]);
    let courses = $state<Course[]>([]);
    let students = $state<Student[]>([]);
    let matriculations = $state<Matriculation[]>([]);

    let selectedCareerId = $state<string>("");
    let selectedCourseId = $state<string>("");
    let searchName = $state<string>("");

    const getAllAttendances = async () => {
        attendances = await http.get(`${import.meta.env.PUBLIC_BACKEND_API}/attendance`);
    };
    const getAllCareers = async () => {
        careers = await http.get(`${import.meta.env.PUBLIC_BACKEND_API}/career`);
    };
    const getAllCourses = async () => {
        courses = await http.get(`${import.meta.env.PUBLIC_BACKEND_API}/course`);
    };
    const getAllStudents = async () => {
        students = await http.get(`${import.meta.env.PUBLIC_BACKEND_API}/student`);
    };
    const getAllMatriculations = async () => {
        try {
            matriculations = await http.get(`${import.meta.env.PUBLIC_BACKEND_API}/matriculation`);
        } catch (e) {
            // si no existe endpoint, la UI seguirá funcionando sin filtrar estudiantes por carrera
            matriculations = [];
        }
    };

    onMount(async () => {
        await Promise.all([
            getAllAttendances(),
            getAllCareers(),
            getAllCourses(),
            getAllStudents(),
            getAllMatriculations(),
        ]);
    });

    const courseById = $derived<Record<string, Course>>(() => Object.fromEntries(courses.map(c => [c.id, c])));
    const studentById = $derived<Record<string, Student>>(() => Object.fromEntries(students.map(s => [s.id, s])));

    const filteredCourses = $derived(() => selectedCareerId ? courses.filter(c => c.career?.id === selectedCareerId) : courses);

    const filteredAttendances = $derived(() => {
        const q = searchName.trim().toLowerCase();
        return attendances.filter(a => {
            const cObj = a.course ?? courseById[a.courseId];
            const careerId = cObj?.career?.id;
            if (selectedCareerId && careerId !== selectedCareerId) return false;
            const courseId = a.course?.id ?? a.courseId;
            if (selectedCourseId && courseId !== selectedCourseId) return false;
            const sObj = a.student ?? studentById[a.studentId];
            const name = (sObj?.user?.fullName ?? "").toLowerCase();
            if (q && !name.includes(q)) return false;
            return true;
        });
    });

    const toDateInputValue = (d?: Date) => {
        if (!d) return "";
        try {
            const dt = new Date(d);
            return dt.toISOString().substring(0, 10);
        } catch {
            return "";
        }
    };

    const updateAttendanceStatus = async (a: Attendance, status: AttendanceStatus) => {
        try {
            const body: any = { status };
            if (!a.attendanceDate) {
                body.attendanceDate = new Date().toISOString();
            }
            await http.patch(`${import.meta.env.PUBLIC_BACKEND_API}/attendance/${a.id}`, body);
            await getAllAttendances();
        } catch (e) {
            console.error("Error al actualizar estado:", e);
        }
    };

    const updateAttendanceDate = async (a: Attendance, dateStr: string) => {
        try {
            const body: any = { attendanceDate: new Date(dateStr).toISOString() };
            await http.patch(`${import.meta.env.PUBLIC_BACKEND_API}/attendance/${a.id}`, body);
            await getAllAttendances();
        } catch (e) {
            console.error("Error al actualizar fecha:", e);
        }
    };

    let openModalCreate = $state(false);
    let openModalEdit = $state(false);
    let openModalDelete = $state(false);

    const openModal = (name: ModalType) => {
        if (name === "create") openModalCreate = true;
        if (name === "edit") openModalEdit = true;
        if (name === "delete") openModalDelete = true;
    };

    const closeModal = (name: ModalType) => {
        if (name === "create") openModalCreate = false;
        if (name === "edit") openModalEdit = false;
        if (name === "delete") openModalDelete = false;
    };

    const statusClass = (s?: AttendanceStatus) => {
        if (s === "PRESENT") return "status status-present";
        if (s === "LATE") return "status status-late";
        if (s === "ABSENT") return "status status-absent";
        return "status";
    };
</script>

<Create {openModalCreate} {closeModal} {getAllAttendances} />
<Edit {openModalEdit} {closeModal} {getAllAttendances} {attendance} />
<Delete {openModalDelete} {closeModal} {getAllAttendances} {attendance} />

<div class="toolbar">
    <div class="filters">
        <div class="filter">
            <label>Carrera</label>
            <select bind:value={selectedCareerId}>
                <option value="">Todas</option>
                {#each careers as c}
                    <option value={c.id}>{c.name}</option>
                {/each}
            </select>
        </div>
        <div class="filter">
            <label>Materia</label>
            <select bind:value={selectedCourseId}>
                <option value="">Todas</option>
                {#each filteredCourses as c}
                    <option value={c.id}>{c.name}</option>
                {/each}
            </select>
        </div>
        <div class="filter">
            <label>Buscar estudiante</label>
            <input type="text" placeholder="Nombre..." bind:value={searchName} />
        </div>
    </div>
    <button class="btn btn-primary" onclick={() => openModal("create")}>Crear asistencia</button>
</div>

<table class="table">
    <thead>
        <tr>
            {#each headers as h}
                <th>{h}</th>
            {/each}
        </tr>
    </thead>
    <tbody>
        {#each filteredAttendances as a}
            <tr>
                <td>{a.student?.user?.fullName ?? studentById[a.studentId]?.user?.fullName ?? a.studentId}</td>
                <td>{a.course?.career?.name ?? courseById[a.courseId]?.career?.name ?? "-"}</td>
                <td>
                    <input type="date" value={toDateInputValue(a.attendanceDate)} onchange={(e: Event) => updateAttendanceDate(a, (e.target as HTMLInputElement).value)} />
                </td>
                <td>
                    <select class={statusClass(a.status)} bind:value={a.status} onchange={(e: Event) => updateAttendanceStatus(a, (e.target as HTMLSelectElement).value as AttendanceStatus)}>
                        <option value="PRESENT">Presente</option>
                        <option value="LATE">Tarde</option>
                        <option value="ABSENT">Ausente</option>
                    </select>
                </td>
                <td class="actions">
                    <button class="btn btn-warning" onclick={() => { attendance = a; openModal("edit"); }}>EDITAR</button>
                    <button class="btn btn-danger" onclick={() => { attendance = a; openModal("delete"); }}>ELIMINAR</button>
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<style>
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border: 1px solid #ddd; padding: 8px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.filters { display: flex; gap: 12px; }
.filter { display: flex; flex-direction: column; gap: 4px; }
.btn { padding: 6px 10px; border-radius: 6px; }
.btn-primary { background: #007bff; color: #fff; }
.btn-warning { background: #ffc107; color: #000; }
.btn-danger { background: #dc3545; color: #fff; }
.actions { display: flex; gap: 8px; }
.status-present { background: #28a745; color: #fff; }
.status-late { background: #ffc107; color: #000; }
.status-absent { background: #dc3545; color: #fff; }
</style>