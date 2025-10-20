<script lang="ts">
    import { http } from "@src/core/http";
    import { onMount } from "svelte";
    import type { ModalType, Course } from "@src/interfaces/course.interface";

    interface Props {
        openModalEdit: boolean;
        closeModal: (modal: ModalType) => void;
        getAllCourses: () => Promise<void>;
        course: Course | undefined;
    }

    const { openModalEdit, closeModal, getAllCourses, course }: Props =
        $props();

    let name = $state(course?.name ?? "");
    let year = $state<number>(course?.year ?? 1);
    let fourMonth = $state<"FIRST" | "SECOND" | "THIRD" | "FOURTH">(
        course?.fourMonth ?? "FIRST",
    );
    let careerId = $state<string>(course?.career?.id ?? "");
    let careers = $state<Array<{ id: string; name: string }>>([]);

    let loading = $state(false);
    let error = $state<string | null>(null);

    $effect(() => {
        if (course) {
            name = course.name ?? "";
            year = course.year ?? 1;
            fourMonth = course.fourMonth ?? "FIRST";
            careerId = course.career?.id ?? "";
        }
    });
    name = course?.name ?? "";
    year = course?.year ?? 1;
    fourMonth = course?.fourMonth ?? "FIRST";
    careerId = course?.career?.id ?? "";

    onMount(async () => {
        try {
            careers = await http.get(
                `${import.meta.env.PUBLIC_BACKEND_API}/career`,
            );
        } catch (err) {
            console.error("Error al cargar carreras:", err);
        }
    });

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault();
        try {
            loading = true;
            error = null;

            if (!name || !careerId || !fourMonth) {
                error = "Todos los campos son obligatorios";
                return;
            }
            if (Number(year) < 1 || Number(year) > 3) {
                error = "El año debe estar entre 1 y 3.";
                return;
            }

            const body = {
                name: name.trim(),
                year: Number(year),
                careerId,
                fourMonth,
            };

            await http.patch(
                `${import.meta.env.PUBLIC_BACKEND_API}/course/${course?.id}`,
                body,
            );
            await getAllCourses();
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
                <h2>EDITAR CURSO</h2>
                <button
                    class="close-btn"
                    aria-label="cerrar boton"
                    onclick={() => closeModal("edit")}>✕</button
                >
            </div>

            {#if error}
                <div class="text-center text-accent">{error}</div>
            {/if}

            <form onsubmit={handleSubmit} class="space-y-4">
                <div class="form-group">
                    <label for="name">Nombre:</label>
                    <input type="text" id="name" bind:value={name} required />
                </div>

                <div class="form-group">
                    <label for="year">Año:</label>
                    <input
                        type="number"
                        id="year"
                        bind:value={year}
                        min="1"
                        max="3"
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="career">Carrera:</label>
                    <select id="career" bind:value={careerId} required>
                        <option value="">Seleccionar carrera</option>
                        {#each careers as c}
                            <option value={c.id}>{c.name}</option>
                        {/each}
                    </select>
                </div>

                <div class="form-group">
                    <label for="fourMonth">Cuatrimestre:</label>
                    <select id="fourMonth" bind:value={fourMonth} required>
                        <option value="FIRST">1° Cuatrimestre</option>
                        <option value="SECOND">2° Cuatrimestre</option>
                        <option value="THIRD">3° Cuatrimestre</option>
                        <option value="FOURTH">4° Cuatrimestre</option>
                    </select>
                </div>

                <div class="modal-footer">
                    <button
                        type="submit"
                        class="btn btn-success"
                        disabled={loading}>Aceptar</button
                    >
                    <button
                        onclick={() => closeModal("edit")}
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

    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .btn-success {
        background: #28a745;
        color: white;
    }

    .btn-danger {
        background: #dc3545;
        color: white;
    }
</style>
