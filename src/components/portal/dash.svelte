<script lang="ts">
    import { onMount } from "svelte";
    import { jwtDecode } from "jwt-decode";
    import { http } from "@src/core/http";
    import type { Student } from "@src/interfaces/student.interface";
    import { RegistrationState, type Matriculation } from "@src/interfaces/matriculation.interface";
    import type { Attendance } from "@src/interfaces/attendance.interface";
    import type { Course } from "@src/interfaces/course.interface";
    import type { Career } from "@src/interfaces/career.interface";
    import { Role, type User } from "@src/interfaces/user.interface";

    let loading = $state(true);
    let error = $state<string | null>(null);

    let student = $state<Student>({
        id: "",
        dni: 0,
        phone: "",
        dateBirth: "",
        address: "",
        registrationState: RegistrationState.Pending,
        user: {
            id: "",
            email: "",
            fullName: "",
            password: "",
            role: Role.Student,
        },
    });
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

            // Obtener la lista de estudiantes y buscar por userId
            const list = await http.get<Student[]>(
                `${import.meta.env.PUBLIC_BACKEND_API}/student`,
            );
            const foundStudent = list.find((s) => s.user?.id === userId);
            
            if (!foundStudent) {
                throw new Error("No se encontró información del estudiante");
            }
            
            student = foundStudent;

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

    const courseById = $derived(
        Object.fromEntries(courses.map((c) => [c.id, c])) as Record<string, Course>
    );

    const presentCount = $derived(
        attendances.filter((a) => a.status === "PRESENT").length
    );
    const lateCount = $derived(
        attendances.filter((a) => a.status === "LATE").length
    );
    const absentCount = $derived(
        attendances.filter((a) => a.status === "ABSENT").length
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
        <div class="grid place-items-center py-20 text-slate-900">
            No se encontró información del estudiante.
        </div>
    {:else}
        <div class="max-w-6xl mx-auto px-4 space-y-8">
            <!-- Encabezado -->
            <div class="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1
                        class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-900"
                    >
                        Bienvenido, {student.user.fullName}
                    </h1>
                    <p class="text-slate-600 dark:text-slate-700">
                        Portal del estudiante
                    </p>
                </div>
            </div>

            <!-- Tarjeta de perfil -->
            <div
                class="rounded-xl border border-slate-300 dark:border-slate-600 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 shadow-md hover:shadow-lg transition-all duration-300"
            >
                <h2 class="text-lg font-bold mb-4 text-blue-700 dark:text-blue-400">Tu perfil</h2>
                <div class="grid sm:grid-cols-2 gap-4 text-sm">
                    <div class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200">
                        <div class="text-blue-500 font-medium">Nombre</div>
                        <div class="text-slate-800 dark:text-slate-200 font-semibold">
                            {student.user.fullName}
                        </div>
                    </div>
                    <div class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200">
                        <div class="text-blue-500 font-medium">Email</div>
                        <div class="text-slate-800 dark:text-slate-200 font-semibold">
                            {student.user.email}
                        </div>
                    </div>
                    <div class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200">
                        <div class="text-blue-500 font-medium">DNI</div>
                        <div class="text-slate-800 dark:text-slate-200 font-semibold">
                            {student.dni}
                        </div>
                    </div>
                    <div class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200">
                        <div class="text-blue-500 font-medium">Teléfono</div>
                        <div class="text-slate-800 dark:text-slate-200 font-semibold">
                            {student.phone ?? "-"}
                        </div>
                    </div>
                    <div class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200">
                        <div class="text-blue-500 font-medium">Fecha de nacimiento</div>
                        <div class="text-slate-800 dark:text-slate-200 font-semibold">
                            {student.dateBirth ?? "-"}
                        </div>
                    </div>
                    <div class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200">
                        <div class="text-blue-500 font-medium">Dirección</div>
                        <div class="text-slate-800 dark:text-slate-200 font-semibold">
                            {student.address ?? "-"}
                        </div>
                    </div>
                    <div class="sm:col-span-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200">
                        <div class="text-blue-500 font-medium">Estado de registro</div>
                        <div
                            class="inline-flex items-center rounded-md px-3 py-1 text-xs font-bold shadow-sm"
                            class:!bg-gradient-to-r={student.registrationState === "APPROVED"}
                            class:!from-green-200={student.registrationState === "APPROVED"}
                            class:!to-green-300={student.registrationState === "APPROVED"}
                            class:!text-green-800={student.registrationState === "APPROVED"}
                            class:!border={student.registrationState === "APPROVED"}
                            class:!border-green-400={student.registrationState === "APPROVED"}
                            
                            class:!from-amber-200={student.registrationState === "PENDING"}
                            class:!to-amber-200={student.registrationState === "PENDING"}
                            class:!text-amber-200={student.registrationState === "PENDING"}
                            class:!border-amber-200={student.registrationState === "PENDING"}
                            
                            class:!from-red-200={student.registrationState === "REJECTED"}
                            class:!to-red-300={student.registrationState === "REJECTED"}
                            class:!text-red-800={student.registrationState === "REJECTED"}
                            class:!border-red-400={student.registrationState === "REJECTED"}
                        >
                            {student.registrationState ?? "-"}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resumen de asistencias -->
            <div class="grid sm:grid-cols-3 gap-4">
                <div class="rounded-lg bg-gradient-to-br from-green-100 to-green-200 text-green-800 p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-green-300">
                    <div class="text-sm font-medium text-green-700">Presentes</div>
                    <div class="text-3xl font-bold text-green-900">{presentCount}</div>
                </div>
                <div class="rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-amber-300">
                    <div class="text-sm font-medium text-amber-700">Llegó tarde</div>
                    <div class="text-3xl font-bold text-amber-900">{lateCount}</div>
                </div>
                <div class="rounded-lg bg-gradient-to-br from-red-100 to-red-200 text-red-800 p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-red-300">
                    <div class="text-sm font-medium text-red-700">Ausentes</div>
                    <div class="text-3xl font-bold text-red-900">{absentCount}</div>
                </div>
            </div>

            <!-- Materias inscriptas -->
            <div
                class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm"
            >
                <h2 class="text-white font-bold mb-4">Tus materias</h2>
                {#if matriculations.length === 0}
                    <div class="text-white">
                        Aún no tienes inscripciones.
                    </div>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead>
                                <tr class="text-left text-white">
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
