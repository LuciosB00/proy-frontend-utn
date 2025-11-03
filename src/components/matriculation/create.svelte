<script lang="ts">
    import { http } from "@src/core/http";
    import type {
        ModalType,
        Matriculation,
    } from "@src/interfaces/matriculation.interface";
    import type { Career } from "@src/interfaces/career.interface";
    import type { Course } from "@src/interfaces/course.interface";
    import type { Student } from "@src/interfaces/student.interface";

    interface Props {
        openModalCreate: boolean;
        closeModal: (modal: ModalType) => void;
        getAllMatriculations: () => Promise<void>;
    }

    const { openModalCreate, closeModal, getAllMatriculations }: Props =
        $props();

    let careers = $state<Career[]>([]);
    let courses = $state<Course[]>([]);
    let students = $state<Student[]>([]);

    let selectedCareerId = $state<string>("");
    let selectedCourseId = $state<string>("");
    let selectedStudentId = $state<string>("");
    let registrationDate = $state<string>("");

    const loadData = async () => {
        careers = await http.get(
            `${import.meta.env.PUBLIC_BACKEND_API}/career`,
        );
        courses = await http.get(
            `${import.meta.env.PUBLIC_BACKEND_API}/course`,
        );
        students = await http.get(
            `${import.meta.env.PUBLIC_BACKEND_API}/student`,
        );
    };

    const filteredCourses = $derived(() =>
        selectedCareerId
            ? courses.filter((c) => c.career?.id === selectedCareerId)
            : courses,
    );
    const filteredStudents = $derived(() => {
        if (!selectedCourseId) return students;
        // si no hay relación directa, devolvemos todos; el backend validará
        return students;
    });

    const handleSubmit = async () => {
        if (!selectedStudentId || !selectedCourseId) return;
        const body: any = {
            studentId: selectedStudentId,
            courseId: selectedCourseId,
        };
        if (registrationDate)
            body.registrationDate = new Date(registrationDate).toISOString();
        try {
            await http.post(
                `${import.meta.env.PUBLIC_BACKEND_API}/matriculation`,
                body,
            );
            await getAllMatriculations();
            closeModal("create");
            // reset
            selectedCareerId = "";
            selectedCourseId = "";
            selectedStudentId = "";
            registrationDate = "";
        } catch (e) {
            console.error("Error al crear matriculación:", e);
        }
    };

    $effect(() => {
        if (openModalCreate) loadData();
    });
</script>

{#if openModalCreate}
    <button
        type="button"
        class="modal-backdrop"
        aria-label="Cerrar modal"
        onclick={() => closeModal("create")}
        onkeydown={(e) => e.key === "Enter" && closeModal("create")}
    ></button>
    <div class="modal">
        <div class="modal-header"><h3>Nueva matriculación</h3></div>
        <div class="modal-body">
            <div class="field">
                <label for="career-select">Carrera</label>
                <select bind:value={selectedCareerId}>
                    <option value="">Seleccione carrera</option>
                    {#each careers as c}
                        <option value={c.id}>{c.name}</option>
                    {/each}
                </select>
            </div>
            <div class="field">
                <label for="course-select">Materia</label>
                <select bind:value={selectedCourseId}>
                    <option value="">Seleccione materia</option>
                    {#each filteredCourses() as c}
                        <option value={c.id}>{c.name}</option>
                    {/each}
                </select>
            </div>
            <div class="field">
                <label for="student-select">Estudiante</label>
                <select bind:value={selectedStudentId}>
                    <option value="">Seleccione estudiante</option>
                    {#each filteredStudents() as s}
                        <option value={s.id}>{s.user?.fullName}</option>
                    {/each}
                </select>
            </div>
            <div class="field">
                <label for="registration-date">Fecha de inscripción (opcional)</label>
                <input id="registration-date" type="date" bind:value={registrationDate} />
                <input type="date" bind:value={registrationDate} />
            </div>
        </div>
        <div class="modal-footer">
            <button
                class="btn btn-secondary"
                onclick={() => closeModal("create")}>Cancelar</button
            >
            <button
                class="btn btn-primary"
                disabled={!selectedStudentId || !selectedCourseId}
                onclick={handleSubmit}>Crear</button
            >
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
    }
    .modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        padding: 16px;
        border-radius: 8px;
        width: min(560px, 92vw);
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
    }
    .modal-header {
        margin-bottom: 8px;
    }
    .modal-body {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }
    .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 12px;
    }
    .btn {
        padding: 6px 10px;
        border-radius: 6px;
    }
    .btn-secondary {
        background: #6c757d;
        color: #fff;
    }
    .btn-primary {
        background: #007bff;
        color: #fff;
    }
</style>
