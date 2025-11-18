<script lang="ts">
    // dejar las materias seleccionadas que el profesor tiene a cargo al seleccionar asignar curso
    import { http } from "@src/core/http";
    import type { ModalType, Teacher } from "@src/interfaces/teacher.interface";
    import { Role } from "@src/interfaces/user.interface";
    import FilterableSelect from "@src/components/filterableSelect.svelte";
    import { containsServerDirective } from "astro/runtime/server/render/server-islands.js";

    interface SelectOption {
        value: string;
        label: string;
        disabled?: boolean;
    }

    interface Props {
        teacher: Teacher;
        openModalAssignCourse: (value?: boolean) => boolean;
        courses: SelectOption[];
        getAllTeachers: () => Promise<void>;
    }

    const { openModalAssignCourse, teacher, courses, getAllTeachers }: Props = $props();

    let loading = $state(false);
    let error = $state(null);
    let allCoursesSelected = $state<SelectOption[]>([]);

    let selectedCourse = $state("");

    const UUID_REGEX =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

    // dejar las materias seleccionadas que el profesor tiene a cargo al seleccionar asignar curso
    $effect(() => {
        allCoursesSelected = teacher?.courses
            ? teacher.courses.map((c) => ({ value: c.id, label: c.name }))
            : [];
    });

    const handleSubmit = async (event: SubmitEvent) => {
        try {
            event.preventDefault();
            loading = true;
            error = null;

            const teacherId = teacher?.id;
            const courseIds = allCoursesSelected.map((c) => String(c.value));

            if (!teacherId || !UUID_REGEX.test(teacherId)) {
                throw new Error("teacherId inválido: debe ser un UUID.");
            }

            if (!Array.isArray(courseIds)) {
                throw new Error("courseIds debe ser un arreglo.");
            }
            const invalidCourseId = courseIds.find((id) => !UUID_REGEX.test(id));
            if (invalidCourseId) {
                throw new Error("Cada valor en courseIds debe ser un UUID.");
            }

            const payload = {
                teacherId,
                courseIds,
            };

            await http.post(
                `${import.meta.env.PUBLIC_BACKEND_API}/teacher/assign-course`,
                payload,
            );

            // Refrescar la tabla y cerrar el modal al completar
            await getAllTeachers();
            openModalAssignCourse(false);
            allCoursesSelected = [];
            selectedCourse = "";
        } catch (e: any) {
            console.error(e);
            error = e.message;
        } finally {
            loading = false;
        }
    };

    const handleCoursesChange = (value: string | number | null) => {
        if (!value) {
            return;
        }

        let existingCourse = allCoursesSelected.some(
            (course) => course.value === value,
        );
        if (existingCourse) {
            return;
        }

        let courseObj = courses.find((course) => course.value === value);

        allCoursesSelected = [...allCoursesSelected, courseObj];

        selectedCourse = "";
    };

    const removeCourse = (courseID: string) => {
        allCoursesSelected = allCoursesSelected.filter(
            (course) => course.value !== courseID,
        );
    };
</script>

{#if openModalAssignCourse()}
    <div class="modal-backdrop">
        <div class="modal-content">
            <div class="modal-header">
                <h2>ASIGNAR MATERIAS</h2>
                <button class="close-btn" aria-label="cerrar boton" onclick={() => openModalAssignCourse(false)}> </button>
            </div>

            {#if error}
                <div class="text-center text-accent">{error}</div>
            {/if}

            <form onsubmit={handleSubmit} class="space-y-4">
                <div class="form-group">
                    <label for="fullName">Profesor/a:</label>
                    <input
                        type="text"
                        id="fullName"
                        value={teacher?.user?.fullName}
                        disabled
                    />
                </div>

                <div class="form-group">
                    <label for="courses-chips">Asignar cursos:</label>
                    <FilterableSelect
                        bind:value={selectedCourse}
                        options={courses}
                        onValueChange={handleCoursesChange}
                    />
                </div>

                <div class="flex gap-1 flex-wrap justify-center w-full h-12">
                    {#each allCoursesSelected as course}
                        <div
                            class="p-1 border border-gray-300 rounded-md text-black font-bold flex gap-2"
                        >
                            <span
                                class="p-1 border border-gray-300 rounded-md text-black font-bold"
                            >
                                {course.label}
                            </span>
                        </div>

                        <div
                            role="button"
                            tabindex="0"
                            class="p-1 border border-gray-300 rounded-md text-black font-bold cursor-pointer"
                            onkeydown={(e) =>
                                (e.key === "Enter" || e.key === " ") &&
                                removeCourse(course.value)}
                            onclick={() => removeCourse(course.value)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="w-4 h-4"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                    {/each}
                </div>

                <div class="modal-footer">
                    <button
                        type="submit"
                        class="btn btn-success"
                        disabled={loading}>Aceptar</button
                    >
                    <button
                        onclick={() => openModalAssignCourse(false)}
                        type="button"
                        class="btn btn-danger">Cancelar</button
                    >
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        padding: 20px;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .form-group {
        margin-bottom: 15px;
    }

    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
    }

    .form-group input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .modal-footer {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
</style>
