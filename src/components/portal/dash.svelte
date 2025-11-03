<script lang="ts">
    import { onMount } from "svelte";
    import { jwtDecode } from "jwt-decode";
    import { http } from "@src/core/http";
    import type { Student } from "@src/interfaces/student.interface";
    import type { Matriculation } from "@src/interfaces/matriculation.interface";
    import type { Attendance } from "@src/interfaces/attendance.interface";
    import type { Course } from "@src/interfaces/course.interface";
    import type { Career } from "@src/interfaces/career.interface";

    let loading = $state(true);
    let error = $state<string | null>(null);

    let student = $state<Student | undefined>(undefined);
    let matriculations = $state<Matriculation[]>([]);
    let attendances = $state<Attendance[]>([]);
    let courses = $state<Course[]>([]);
    let careers = $state<Career[]>([]);

    const getCookie = (name: string): string => {
        const match = document.cookie.match(
            new RegExp("(^| )" + name + "=([^;]+)"),
        );
        return match ? match[2] : "";
    };

    const loadPortal = async () => {
        try {
            const token = getCookie("token");
            if (!token) throw new Error("No se encontró token");
            const decoded = jwtDecode<{ id: string; role: string }>(token);
            const userId = decoded.id;

            // Intentar obtener el estudiante directamente, sino fallback a listado
            try {
                student = await http.get<Student>(
                    `${import.meta.env.PUBLIC_BACKEND_API}/student/${userId}`,
                );
            } catch {
                const list = await http.get<Student[]>(
                    `${import.meta.env.PUBLIC_BACKEND_API}/student`,
                );
                student = list.find((s) => s.user?.id === userId);
            }

            // Cargar datos relacionados
            courses = await http.get<Course[]>(
                `${import.meta.env.PUBLIC_BACKEND_API}/course`,
            );
            careers = await http.get<Career[]>(
                `${import.meta.env.PUBLIC_BACKEND_API}/career`,
            );
            try {
                const allMatriculations = await http.get<Matriculation[]>(
                    `${import.meta.env.PUBLIC_BACKEND_API}/matriculation`,
                );
                matriculations = student
                    ? allMatriculations.filter(
                          (m) => m.studentId === student!.id,
                      )
                    : [];
            } catch {
                matriculations = [];
            }
            try {
                const allAttendances = await http.get<Attendance[]>(
                    `${import.meta.env.PUBLIC_BACKEND_API}/attendance`,
                );
                attendances = student
                    ? allAttendances.filter((a) => a.studentId === student!.id)
                    : [];
            } catch {
                attendances = [];
            }
        } catch (e: any) {
            error = e?.message ?? "Error al cargar el portal";
        } finally {
            loading = false;
        }
    };

    onMount(loadPortal);

    const courseById = $derived<Record<string, Course>>(() =>
        Object.fromEntries(courses.map((c) => [c.id, c]))
    );

    const presentCount = $derived(
        () => attendances.filter((a) => a.status === "PRESENT").length,
    );
    const lateCount = $derived(
        () => attendances.filter((a) => a.status === "LATE").length,
    );
    const absentCount = $derived(
        () => attendances.filter((a) => a.status === "ABSENT").length,
    );
</script>

<section class="min-h-[70vh] py-10">
    {#if loading}
        <div class="grid place-items-center py-20 text-slate-600">
            Cargando portal…
        </div>
    {:else if error}
        <div class="grid place-items-center py-20 text-red-600">{error}</div>
    {:else if !student}
        <div class="grid place-items-center py-20 text-slate-600">
            No se encontró información del estudiante.
        </div>
    {:else}
        <div class="max-w-6xl mx-auto px-4 space-y-8">
            <!-- Encabezado -->
            <div class="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1
                        class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100"
                    >
                        Bienvenido, {student.user.fullName}
                    </h1>
                    <p class="text-slate-600 dark:text-slate-400">
                        Portal del estudiante
                    </p>
                </div>
            </div>

            <!-- Tarjeta de perfil -->
            <div
                class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm"
            >
                <h2 class="text-lg font-semibold mb-4">Tu perfil</h2>
                <div class="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <div class="text-slate-500">Nombre</div>
                        <div class="text-slate-800 dark:text-slate-200">
                            {student.user.fullName}
                        </div>
                    </div>
                    <div>
                        <div class="text-slate-500">Email</div>
                        <div class="text-slate-800 dark:text-slate-200">
                            {student.user.email}
                        </div>
                    </div>
                    <div>
                        <div class="text-slate-500">DNI</div>
                        <div class="text-slate-800 dark:text-slate-200">
                            {student.dni}
                        </div>
                    </div>
                    <div>
                        <div class="text-slate-500">Teléfono</div>
                        <div class="text-slate-800 dark:text-slate-200">
                            {student.phone ?? "-"}
                        </div>
                    </div>
                    <div>
                        <div class="text-slate-500">Fecha de nacimiento</div>
                        <div class="text-slate-800 dark:text-slate-200">
                            {student.dateBirth ?? "-"}
                        </div>
                    </div>
                    <div>
                        <div class="text-slate-500">Dirección</div>
                        <div class="text-slate-800 dark:text-slate-200">
                            {student.address ?? "-"}
                        </div>
                    </div>
                    <div class="sm:col-span-2">
                        <div class="text-slate-500">Estado de registro</div>
                        <div
                            class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                            class:!bg-green-100={student.registrationState ===
                                "APPROVED"}
                            class:!text-green-700={student.registrationState ===
                                "APPROVED"}
                            class:!bg-yellow-100={student.registrationState ===
                                "PENDING"}
                            class:!text-yellow-700={student.registrationState ===
                                "PENDING"}
                            class:!bg-red-100={student.registrationState ===
                                "REJECTED"}
                            class:!text-red-700={student.registrationState ===
                                "REJECTED"}
                        >
                            {student.registrationState ?? "-"}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resumen de asistencias -->
            <div class="grid sm:grid-cols-3 gap-4">
                <div class="rounded-lg bg-green-50 text-green-800 p-4">
                    <div class="text-sm">Presentes</div>
                    <div class="text-2xl font-semibold">{presentCount}</div>
                </div>
                <div class="rounded-lg bg-yellow-50 text-yellow-800 p-4">
                    <div class="text-sm">Llegó tarde</div>
                    <div class="text-2xl font-semibold">{lateCount}</div>
                </div>
                <div class="rounded-lg bg-red-50 text-red-800 p-4">
                    <div class="text-sm">Ausentes</div>
                    <div class="text-2xl font-semibold">{absentCount}</div>
                </div>
            </div>

            <!-- Materias inscriptas -->
            <div
                class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm"
            >
                <h2 class="text-lg font-semibold mb-4">Tus materias</h2>
                {#if matriculations.length === 0}
                    <div class="text-slate-600">
                        Aún no tienes inscripciones.
                    </div>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead>
                                <tr class="text-left text-slate-500">
                                    <th class="py-2 pr-4">Carrera</th>
                                    <th class="py-2 pr-4">Materia</th>
                                    <th class="py-2 pr-4">Estado matrícula</th>
                                    <th class="py-2 pr-4">Estado curso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each matriculations as m}
                                    <tr class="border-t border-slate-100">
                                        <td class="py-2 pr-4"
                                            >{courseById[m.courseId]?.career
                                                ?.name ?? "-"}</td
                                        >
                                        <td class="py-2 pr-4"
                                            >{courseById[m.courseId]?.name ??
                                                m.courseId}</td
                                        >
                                        <td class="py-2 pr-4"
                                            >{m.registrationState}</td
                                        >
                                        <td class="py-2 pr-4"
                                            >{m.courseState}</td
                                        >
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</section>
