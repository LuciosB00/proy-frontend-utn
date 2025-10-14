<script lang="ts">
    import { http } from "@src/core/http";
    import type { ModalType } from "@src/interfaces/course.interface";

    interface Props {
        openModalCreate: boolean;
        closeModal: (modal: ModalType) => void;
        getAllCourses: () => Promise<void>;
    }

    const { openModalCreate, closeModal, getAllCourses }: Props = $props();

    let loading = $state(false);
    let error = $state(null);

    const handleSubmit = async (event: SubmitEvent) => {
        try {
            event.preventDefault();
            loading = true;
            error = null;
            const formData = new FormData(event.target as HTMLFormElement);
            const data = Object.fromEntries(formData);
            await http.post(
                `${import.meta.env.PUBLIC_BACKEND_API}/course`,
                {
                    ...data,
                },
            );
            await getAllCourses();
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
                <h2>CREAR CURSO</h2>
                <button class="close-btn" aria-label="cerrar boton"> </button>
            </div>

            {#if error}
                <div class="text-center text-accent">{error}</div>
            {/if}

            <form onsubmit={handleSubmit} class="space-y-4">
                <div class="form-group">
                    <label for="name">Nombre:</label>
                    <input type="text" id="name" name="name" />
                </div>

                <div class="form-group">
                    <label for="year">Año:</label>
                    <input type="number" id="year" name="year" />
                </div>

                <div class="modal-footer">
                    <button type="submit" class="btn btn-success"
                        >Aceptar</button
                    >
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
