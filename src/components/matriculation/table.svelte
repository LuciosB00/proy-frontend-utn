<script lang="ts">
    import Create from "./create.svelte";
    import Edit from "./edit.svelte";
    import Delete from "./delete.svelte";
    import { http } from "@src/core/http";
    import { onMount } from "svelte";
    import type {
        ModalType,
        Matriculation,
    } from "@src/interfaces/matriculation.interface";
    import type { Career } from "@src/interfaces/career.interface";
    import type { Course } from "@src/interfaces/course.interface";
    import type { Student } from "@src/interfaces/student.interface";

    let headers = [
        "Estudiante",
        "Carrera",
        "Materia",
        "Fecha de inscripción",
        "Estado de la matrícula",
        "Estado del curso",
        "Acciones",
    ];

    let matriculations = $state<Matriculation[]>([]);
    let matriculation = $state<Matriculation | undefined>(undefined);

    let careers = $state<Career[]>([]);
    let courses = $state<Course[]>([]);
    let students = $state<Student[]>([]);

    let selectedCareerId = $state<string>("");
    let selectedCourseId = $state<string>("");
    let searchName = $state<string>("");

    const getAllMatriculations = async () => {
        matriculations = await http.get(
            `${import.meta.env.PUBLIC_BACKEND_API}/matriculation`,
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

    onMount(async () => {
        await Promise.all([
            getAllMatriculations(),
            getAllCareers(),
            getAllCourses(),
            getAllStudents(),
        ]);
    });

    const courseById = $derived<Record<string, Course>>(() =>
        Object.fromEntries(courses.map((c) => [c.id, c]))
    );
    const studentById = $derived<Record<string, Student>>(() =>
        Object.fromEntries(students.map((s) => [s.id, s])),
    );

    const filteredCourses = $derived(() =>
        selectedCareerId
            ? courses.filter((c) => c.career?.id === selectedCareerId)
            : courses,
    );

    const filteredMatriculations = $derived(() => {
        const q = searchName.trim().toLowerCase();
        return matriculations.filter((m) => {
            const cObj = courseById[m.courseId];
            const careerId = cObj?.career?.id;
            if (selectedCareerId && careerId !== selectedCareerId) return false;
            const courseId = m.courseId;
            if (selectedCourseId && courseId !== selectedCourseId) return false;
            const sObj = studentById[m.studentId];
            const name = (sObj?.user?.fullName ?? "").toLowerCase();
            if (q && !name.includes(q)) return false;
            return true;
        });
    });

    let openModalCreate = $state(false);
    let openModalEdit = $state(false);
    let openModalDelete = $state(false);

    const openModal = (name: ModalType) => {
        switch (name) {
            case "create":
                openModalCreate = true;
                break;
            case "edit":
                openModalEdit = true;
                break;
            case "delete":
                openModalDelete = true;
                break;
        }
    };

    const closeModal = (name: ModalType) => {
        switch (name) {
            case "create":
                openModalCreate = false;
                break;
            case "edit":
                openModalEdit = false;
                break;
            case "delete":
                openModalDelete = false;
                break;
        }
    };
</script>

<Create {openModalCreate} {closeModal} {getAllMatriculations} />
<Edit {openModalEdit} {closeModal} {getAllMatriculations} {matriculation} />
<Delete {openModalDelete} {closeModal} {getAllMatriculations} {matriculation} />

<div class="toolbar">
    <div class="filters">
        <div class="filter">
            <label for="career-select">Carrera</label>
            <select bind:value={selectedCareerId}>
                <option value="">Todas</option>
                {#each careers as c}
                    <option value={c.id}>{c.name}</option>
                {/each}
            </select>
        </div>
        <div class="filter">
            <label for="course-select">Materia</label>
            <select bind:value={selectedCourseId}>
                <option value="">Todas</option>
                {#each filteredCourses() as c}
                    <option value={c.id}>{c.name}</option>
                {/each}
            </select>
        </div>
        <div class="filter">
            <label for="student-search">Buscar estudiante</label>
            <input
                type="text"
                placeholder="Nombre..."
                bind:value={searchName}
            />
        </div>
    </div>
    <button class="btn btn-primary" onclick={() => openModal("create")}
        >Crear matriculación</button
    >
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
        {#each filteredMatriculations() as m}
            <tr>
                <td
                    >{studentById[m.studentId]?.user?.fullName ??
                        studentById[m.studentId]?.user?.fullName ??
                        m.studentId}</td
                >
                <td
                    >{courseById[m.courseId]?.career?.name ??
                        courseById[m.courseId]?.career?.name ??
                        "-"}</td
                >
                <td>{courseById[m.courseId]?.name ?? "-"}</td>
                <td
                    >{m.registrationDate
                        ? new Date(m.registrationDate).toLocaleDateString()
                        : "(sin fecha)"}</td
                >
                <td class="actions">
                    <button
                        class="btn btn-warning"
                        onclick={() => {
                            matriculation = m;
                            openModal("edit");
                        }}>EDITAR</button
                    >
                    <button
                        class="btn btn-danger"
                        onclick={() => {
                            matriculation = m;
                            openModal("delete");
                        }}>ELIMINAR</button
                    >
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<style>
    .table {
        width: 100%;
        border-collapse: collapse;
    }
    .table th,
    .table td {
        border: 1px solid #ddd;
        padding: 8px;
    }
    .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }
    .filters {
        display: flex;
        gap: 12px;
    }
    .filter {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .btn {
        padding: 6px 10px;
        border-radius: 6px;
    }
    .btn-primary {
        background: #007bff;
        color: #fff;
    }
    .btn-warning {
        background: #ffc107;
        color: #000;
    }
    .btn-danger {
        background: #dc3545;
        color: #fff;
    }
    .actions {
        display: flex;
        gap: 8px;
    }
</style>
