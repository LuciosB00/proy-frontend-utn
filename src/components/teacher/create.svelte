<script lang="ts">
    import { http } from "@src/core/http";
    import type { ModalType } from "@src/interfaces/teacher.interface";
    import { Role } from "@src/interfaces/user.interface";
    import type { Course } from "@src/interfaces/course.interface";
    import { onMount } from "svelte";

    interface Props {
        openModalCreate: boolean;
        closeModal: (modal: ModalType) => void;
        getAllTeachers: () => Promise<void>;
    }

    const { openModalCreate, closeModal, getAllTeachers }: Props = $props();

    let loading = $state(false);
    let error = $state(null);
    let courses = $state<Course[]>([]);
    let selectedCourseIds = $state<string[]>([]);

    onMount(async () => {
        try {
            courses = await http.get(`${import.meta.env.PUBLIC_BACKEND_API}/course`);
        } catch (e) {
            console.error(e);
        }
    });

    const handleSubmit = async (event: SubmitEvent) => {
        try {
            event.preventDefault();
            loading = true;
            error = null;
            const formData = new FormData(event.target as HTMLFormElement);
            const data = Object.fromEntries(formData);
            const password = data["dni"].toString().trim();
            await http.post(
                `${import.meta.env.PUBLIC_BACKEND_API}/auth/register`,
                {
                    ...data,
                    role: Role.TEACHER,
                    password,
                }
            );
            // Asignar cursos luego del registro buscando por DNI
            try {
                const list = await http.get(`${import.meta.env.PUBLIC_BACKEND_API}/teacher`);
                const created = list.find((t: any) => t.dni?.toString() === data["dni"].toString());
                if (created?.id && selectedCourseIds.length > 0) {
                    await http.patch(`${import.meta.env.PUBLIC_BACKEND_API}/teacher/${created.id}`, { courseIds: selectedCourseIds });
                }
            } catch (e) {
                console.warn('No se pudieron asignar cursos post-registro:', e);
            }
            await getAllTeachers();
            closeModal("create");
        } catch (e: any) {
            console.error(e);
            error = e.message;
        } finally {
            loading = false;
        }
    };
</script>

{#if openModalCreate}
    <div class="modal-backdrop">
        <div class="modal-content">
            <div class="modal-header">
                <h2>CREAR PROFESOR</h2>
                <button class="close-btn" aria-label="cerrar boton"> </button>
            </div>

            {#if error}
                <div class="text-center text-accent">{error}</div>
            {/if}

            <form onsubmit={handleSubmit} class="space-y-4">
                <div class="form-group">
                    <label for="fullName">Nombre Completo:</label>
                    <input type="text" id="fullName" name="fullName"/>
                </div>

                <div class="form-group">
                    <label>Materias a cargo:</label>
                    <div class="chips">
                        {#each courses as c}
                            <button
                                type="button"
                                class={`chip ${selectedCourseIds.includes(c.id) ? 'chip-selected' : ''}`}
                                onclick={() => {
                                    if (selectedCourseIds.includes(c.id)) {
                                        selectedCourseIds = selectedCourseIds.filter(id => id !== c.id);
                                    } else {
                                        selectedCourseIds = [...selectedCourseIds, c.id];
                                    }
                                }}
                            >{c.name}</button>
                        {/each}
                    </div>
                </div>

                <div class="form-group">
                    <label for="dni">DNI:</label>
                    <input type="number" id="dni" name="dni" min="10000000" max="99999999" required />
                </div>

                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required />
                </div>

                <div class="modal-footer">
                    <button type="submit" class="btn btn-success">Aceptar</button>
                    <button
                        onclick={() => closeModal("create")}
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

    .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .chip {
        border: 1px solid #ccc;
        border-radius: 16px;
        padding: 6px 10px;
        background: #f7f7f7;
        color: #333;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
    }

    .chip:hover { background: #eee; }

    .chip-selected {
        background: #2563eb;
        border-color: #2563eb;
        color: white;
    }

    .modal-footer {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
</style>