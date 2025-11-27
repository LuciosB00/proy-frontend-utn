<script lang="ts">
    import { http } from "@src/core/http";
    import { onMount } from "svelte";
    import { jwtDecode } from "jwt-decode";
    import type {
        Attendance,
        AttendanceStatus,
    } from "@src/interfaces/attendance.interface";
    import type { Career } from "@src/interfaces/career.interface";
    import type { Course } from "@src/interfaces/course.interface";
    import type { Student } from "@src/interfaces/student.interface";
    import type { Matriculation } from "@src/interfaces/matriculation.interface";
    import type { Teacher } from "@src/interfaces/teacher.interface";

    // Datos base
    let attendances = $state<Attendance[]>([]);
    let careers = $state<Career[]>([]);
    let courses = $state<Course[]>([]);
    let students = $state<Student[]>([]);
    let matriculations = $state<Matriculation[]>([]);

    // Contexto del profesor logueado
    let teacher = $state<Teacher | null>(null);
    let teacherCourses = $derived<Course[]>(teacher?.courses ?? []);

    // Acordeón de carreras
    let expandedCareerIds = $state<Set<string>>(new Set());
    // Acordeón de cursos
    let expandedCourseIds = $state<Set<string>>(new Set());
    // Fecha seleccionada por fila estudiante-curso (YYYY-MM-DD)
    let selectedDatesByKey = $state<Record<string, string>>({});

    const getCookie = (name: string): string => {
        const match = document.cookie.match(
            new RegExp("(^| )" + name + "=([^;]+)"),
        );
        return match ? match[2] : "";
    };

    const getAllAttendances = async () => {
        attendances = await http.get(
            `${import.meta.env.PUBLIC_BACKEND_API}/attendance`,
        );
    };
    const getAllCareers = async () => {
        careers = await http.get(
            `${import.meta.env.PUBLIC_BACKEND_API}/career`,
        );
    };
    const getAllCourses = async () => {
        courses = await http.get(
            `${import.meta.env.PUBLIC_BACKEND_API}/course`,
        );
    };
    const getAllStudents = async () => {
        students = await http.get(
            `${import.meta.env.PUBLIC_BACKEND_API}/student`,
        );
    };
    const getAllMatriculations = async () => {
        try {
            matriculations = await http.get(
                `${import.meta.env.PUBLIC_BACKEND_API}/matriculation`,
            );
        } catch (e) {
            matriculations = [];
        }
    };

    const loadTeacher = async () => {
        try {
            const token = getCookie("token");
            if (!token) return;
            const decoded = jwtDecode<{ id: string; role: string }>(token);
            const userId = decoded.id;
            const list = await http.get<Teacher[]>(
                `${import.meta.env.PUBLIC_BACKEND_API}/teacher`,
            );
            teacher = list.find((t) => t.user?.id === userId) ?? null;
        } catch (e) {
            console.error("No se pudo obtener el profesor logueado", e);
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
        await loadTeacher();
    });

    // Índices
    const courseById = $derived<Record<string, Course>>(
        Object.fromEntries(courses.map((c) => [c.id, c])),
    );
    const studentById = $derived<Record<string, Student>>(
        Object.fromEntries(students.map((s) => [s.id, s])),
    );

    // Cursos del profesor por carrera
    const teacherCoursesByCareer = $derived<Record<string, Course[]>>(
        teacherCourses.reduce(
            (grouped, c) => {
                const careerId = c.career?.id ?? "";
                if (!careerId) return grouped;
                (grouped[careerId] ??= []).push(c);
                return grouped;
            },
            {} as Record<string, Course[]>,
        ),
    );

    const careersForTeacher = $derived<Career[]>(
        careers.filter((c) =>
            Object.keys(teacherCoursesByCareer).includes(c.id),
        ),
    );

    // Estudiantes por curso (vía matriculaciones)
    const studentsByCourse = $derived<Record<string, Student[]>>(
        matriculations.reduce(
            (grouped, m) => {
                const s = studentById[m.studentId];
                if (!s) return grouped;
                const arr = grouped[m.courseId] ?? (grouped[m.courseId] = []);
                if (!arr.some((st) => st.id === s.id)) arr.push(s);
                return grouped;
            },
            {} as Record<string, Student[]>,
        ),
    );

    // Último estado conocido por estudiante-curso
    const latestAttendanceByKey = $derived<Record<string, Attendance>>(
        attendances.reduce(
            (map, a) => {
                const key = `${a.studentId}|${a.courseId}`;
                const prev = map[key];
                const curTime = a.attendanceDate
                    ? new Date(a.attendanceDate).getTime()
                    : 0;
                const prevTime = prev?.attendanceDate
                    ? new Date(prev.attendanceDate).getTime()
                    : -1;
                if (!prev || curTime >= prevTime) map[key] = a;
                return map;
            },
            {} as Record<string, Attendance>,
        ),
    );

    const statusClass = (s?: AttendanceStatus) => {
        if (s === "PRESENT") return "status status-present";
        if (s === "LATE") return "status status-late";
        if (s === "ABSENT") return "status status-absent";
        return "status";
    };

    const toggleCareer = (id: string) => {
        if (expandedCareerIds.has(id)) {
            expandedCareerIds.delete(id);
        } else {
            expandedCareerIds.add(id);
        }
        // fuerza reactividad del Set
        expandedCareerIds = new Set(expandedCareerIds);
    };

    const toggleCourse = (id: string) => {
        if (expandedCourseIds.has(id)) {
            expandedCourseIds.delete(id);
        } else {
            expandedCourseIds.add(id);
        }
        expandedCourseIds = new Set(expandedCourseIds);
    };

    const keyFor = (studentId: string, courseId: string) => `${studentId}|${courseId}`;

    const toDateInputValue = (d?: Date) => {
        if (!d) return "";
        try {
            const dt = new Date(d);
            return dt.toISOString().substring(0, 10);
        } catch {
            return "";
        }
    };

    const todayDateString = () => new Date().toISOString().substring(0, 10);

    const getRowDateValue = (studentId: string, courseId: string): string => {
        const key = keyFor(studentId, courseId);
        const latest = findLatestAttendance(studentId, courseId);
        return (
            selectedDatesByKey[key] ??
            (latest?.attendanceDate ? toDateInputValue(latest.attendanceDate) : todayDateString())
        );
    };

    const onRowDateChange = async (studentId: string, courseId: string, dateStr: string) => {
        const key = keyFor(studentId, courseId);
        selectedDatesByKey[key] = dateStr;
        const existing = findLatestAttendance(studentId, courseId);
        if (existing) {
            try {
                await http.patch(
                    `${import.meta.env.PUBLIC_BACKEND_API}/attendance/${existing.id}`,
                    { attendanceDate: new Date(dateStr) },
                );
                await getAllAttendances();
            } catch (e) {
                console.error("Error al actualizar fecha", e);
            }
        }
    };

    const findLatestAttendance = (
        studentId: string,
        courseId: string,
    ): Attendance | null => {
        const key = `${studentId}|${courseId}`;
        return latestAttendanceByKey[key] ?? null;
    };

    const assignStatus = async (
        studentId: string,
        courseId: string,
        attendanceState: AttendanceStatus,
    ) => {
        try {
            const existing = findLatestAttendance(studentId, courseId);
            const key = keyFor(studentId, courseId);
            const dateStr = selectedDatesByKey[key] ?? todayDateString();
            if (existing) {
                const body: any = { attendanceState, attendanceDate: new Date(dateStr) };
                await http.patch(
                    `${import.meta.env.PUBLIC_BACKEND_API}/attendance/${existing.id}`,
                    body,
                );
            } else {
                await http.post(
                    `${import.meta.env.PUBLIC_BACKEND_API}/attendance`,
                    {
                        studentId,
                        courseId,
                        attendanceState,
                        attendanceDate: new Date(dateStr),
                    },
                );
            }
            await getAllAttendances();
        } catch (e) {
            console.error("Error al asignar estado", e);
        }
    };
</script>

{#if !teacher}
    <div class="info">
        No se pudo identificar al profesor o no tiene cursos asignados.
    </div>
{/if}

{#if teacher}
    <div class="accordion">
        {#each careersForTeacher as career}
            <div class="career-item">
                <button
                    type="button"
                    class="career-header"
                    aria-expanded={expandedCareerIds.has(career.id)}
                    onclick={() => toggleCareer(career.id)}
                >
                    <span class="career-title">{career.name}</span>
                    <span class="badge"
                        >{teacherCoursesByCareer[career.id]?.length ?? 0} cursos</span
                    >
                    <span class="toggle"
                        >{expandedCareerIds.has(career.id) ? "▼" : "▶"}</span
                    >
                </button>
                {#if expandedCareerIds.has(career.id)}
                    <div class="career-content">
                        {#each teacherCoursesByCareer[career.id] as course}
                            <div class="course-block">
                                <button
                                    type="button"
                                    class="course-title"
                                    aria-expanded={expandedCourseIds.has(course.id)}
                                    onclick={() => toggleCourse(course.id)}
                                >
                                    {course.name}
                                    <span class="badge"
                                        >{studentsByCourse[course.id]?.length ?? 0}
                                        alumnos</span
                                    >
                                    <span class="toggle"
                                        >{expandedCourseIds.has(course.id)
                                            ? "▼"
                                            : "▶"}</span
                                    >
                                </button>
                                {#if expandedCourseIds.has(course.id)}
                                    {#if studentsByCourse[course.id]?.length}
                                        <table class="table">
                                            <thead>
                                                <tr>
                                                    <th>Estudiante</th>
                                                    <th>Estado</th>
                                                    <th>Fecha</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {#each studentsByCourse[course.id] as st (st.id)}
                                                    <tr>
                                                        <td>{st.user?.fullName ?? st.id}</td>
                                                        <td>
                                                            <select
                                                                class={statusClass(
                                                                    findLatestAttendance(st.id, course.id)?.attendanceState,
                                                                )}
                                                                value={findLatestAttendance(st.id, course.id)?.attendanceState ?? ""}
                                                                onchange={(e: Event) =>
                                                                    assignStatus(
                                                                        st.id,
                                                                        course.id,
                                                                        (e.target as HTMLSelectElement).value as AttendanceStatus,
                                                                    )
                                                                }
                                                            >
                                                                <option value="">Seleccionar...</option>
                                                                <option value="PRESENT">Presente</option>
                                                                <option value="LATE">Tarde</option>
                                                                <option value="ABSENT">Ausente</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="date"
                                                                value={getRowDateValue(st.id, course.id)}
                                                                onchange={(e: Event) =>
                                                                    onRowDateChange(
                                                                        st.id,
                                                                        course.id,
                                                                        (e.target as HTMLInputElement).value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                {/each}
                                            </tbody>
                                        </table>
                                    {:else}
                                        <div class="empty">No hay estudiantes matriculados en esta materia.</div>
                                    {/if}
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
    </div>
{/if}

<style>
    .accordion {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .career-item {
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
    }
    .career-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        background: #f7f7f7;
        cursor: pointer;
    }
    .career-title {
        font-weight: 600;
    }
    .badge {
        background: #eee;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 12px;
    }
    .career-content {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    .course-block {
        border: 1px dashed #ddd;
        border-radius: 6px;
        padding: 8px;
    }
    .course-title {
        font-weight: 500;
        margin-bottom: 8px;
    }
    .table {
        width: 100%;
        border-collapse: collapse;
    }
    .table th,
    .table td {
        border: 1px solid #ddd;
        padding: 8px;
    }
    .empty {
        color: #777;
        font-size: 14px;
    }
    .status-present {
        background: #28a745;
        color: #fff;
    }
    .status-late {
        background: #ffc107;
        color: #000;
    }
    .status-absent {
        background: #dc3545;
        color: #fff;
    }
    .info {
        margin: 12px 0;
        color: #555;
    }
</style>
