<script lang="ts">
    import { http } from "@src/core/http";
    import type { ModalType, Course } from "@src/interfaces/course.interface";

    interface Props {
        openModalDelete: boolean;
        closeModal: (modal: ModalType) => void;
        getAllCourses: () => Promise<void>;
        course: Course | undefined;
    }

    const { openModalDelete, closeModal, getAllCourses, course }: Props = $props();

    let loading = $state(false);
    let error = $state(null);

    const handleDelete = async () => {
        try {
            loading = true;
            error = null;
            await http.delete(
                `${import.meta.env.PUBLIC_BACKEND_API}/course/${course?.id}`
            );
            await getAllCourses();
            closeModal("delete");
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    };
</script>

{#if openModalDelete}
    <div class="modal-backdrop">
        <div class="modal-content">
            <div class="modal-header">
                <h2>ELIMINAR CURSO</h2>
                <button class="close-btn" aria-label="cerrar boton" onclick={() => closeModal("delete")}>
                    ✕
                </button>
            </div>

            {#if error}
                <div class="text-center text-accent">{error}</div>
            {/if}

            <div class="modal-body">
                <p>¿Está seguro que desea eliminar este curso?</p>
                <p class="font-semibold">ID: {course?.id}</p>
            </div>

            <div class="modal-footer">
                <button
                    onclick={handleDelete}
                    class="btn btn-danger"
                    disabled={loading}
                >
                    {loading ? 'Eliminando...' : 'Eliminar'}
                </button>
                <button
                    onclick={() => closeModal("delete")}
                    type="button"
                    class="btn btn-secondary"
                    disabled={loading}
                >
                    Cancelar
                </button>
            </div>
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

    .modal-body {
        margin-bottom: 20px;
    }

    .modal-footer {
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

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-danger {
        background: #dc3545;
        color: white;
    }

    .btn-secondary {
        background: #6c757d;
        color: white;
    }
</style>