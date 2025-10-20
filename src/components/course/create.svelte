<script lang="ts">
    import { http } from "@src/core/http";
    import { onMount } from "svelte";
    import type { ModalType } from "@src/interfaces/course.interface";

    interface Props {
        openModalCreate: boolean;
        closeModal: (modal: ModalType) => void;
        getAllCourses: () => Promise<void>;
    }

    const { openModalCreate, closeModal, getAllCourses }: Props = $props();

    let loading = $state(false);
    let error = $state<string | null>(null);

    // Campos del formulario
    let name = "";
    let year = 1;
    let careerId = "";
    let fourMonth = "FIRST";

    // Carreras disponibles
    let careers = $state([]);

    onMount(async () => {
        try {
            careers = await http.get(`${import.meta.env.PUBLIC_BACKEND_API}/career`);
        } catch (err) {
            console.error("Error al cargar carreras:", err);
        }
    });

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault();
        loading = true;
        error = null;

        try {
            if (!careerId) {
                throw new Error("Seleccioná una carrera.");
            }

            const body = {
                name: name.trim(),
                year: Number(year),
                careerId,
                fourMonth, // 👈 coincide con el nombre en Prisma
            };

            console.log("Datos enviados:", body);

            await http.post(`${import.meta.env.PUBLIC_BACKEND_API}/course`, body);
            await getAllCourses();
            closeModal("create");

            // Limpieza del formulario
            name = "";
            year = 1;
            careerId = "";
            fourMonth = "FIRST";
        } catch (e: any) {
            console.error(e);
            error = e.message || "Error al crear el curso.";
        } finally {
            loading = false;
        }
    };
</script>

{#if openModalCreate}
    <div class="modal-backdrop">
        <div class="modal-content">
            <div class="modal-header">
                <h2>CREAR CURSO</h2>
                <button
                    class="close-btn"
                    aria-label="cerrar boton"
                    onclick={() => closeModal("create")}
                >
                    ✕
                </button>
            </div>

            {#if error}
                <div class="text-center text-red-500 mb-2">{error}</div>
            {/if}

            <form onsubmit={handleSubmit} class="space-y-4">
                <div class="form-group">
                    <label for="name">Nombre:</label>
                    <input
                        type="text"
                        id="name"
                        bind:value={name}
                        required
                    />
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
                    <select
                        id="career"
                        bind:value={careerId}
                        required
                    >
                        <option value="">Seleccionar carrera</option>
                        {#each careers as career}
                            <option value={career.id}>{career.name}</option>
                        {/each}
                    </select>
                </div>

                <div class="form-group">
                    <label for="fourMonth">Cuatrimestre:</label>
                    <select id="fourMonth" bind:value={fourMonth}>
                        <option value="FIRST">Primero</option>
                        <option value="SECOND">Segundo</option>
                        <option value="THIRD">Tercero</option>
                        <option value="FOURTH">Cuarto</option>
                    </select>
                </div>

                <div class="modal-footer">
                    <button
                        type="submit"
                        class="btn btn-success"
                        disabled={loading}
                    >
                        {loading ? "Creando..." : "Aceptar"}
                    </button>
                    <button
                        onclick={() => closeModal("create")}
                        type="button"
                        class="btn btn-danger"
                    >
                        Cancelar
                    </button>
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

    .form-group input,
    .form-group select {
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

    .text-red-500 {
        color: #dc3545;
    }
</style>
