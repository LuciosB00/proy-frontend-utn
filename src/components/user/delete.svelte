<script lang="ts">
    import { http } from "@src/core/http";
    const { openModalDelete, closeModal, getAllUsers, user } = $props();

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault();
        
        await http.delete(`${import.meta.env.PUBLIC_BACKEND_API}/user/${user.id}`);

        closeModal("delete");
        await getAllUsers();
    };
</script>

{#if openModalDelete}
    <div class="modal-backdrop">
        <div class="modal-content">
            <h2>ELIMINAR EL USUARIO</h2>
            <p>¿Estás seguro de que deseas eliminar este usuario?</p>

            <form onsubmit={handleSubmit} class="space-y-4">
                <button type="submit" class="btn btn-success">Aceptar</button>
                <button
                    onclick={() => closeModal("delete")}
                    type="button"
                    class="btn btn-danger">Cancelar</button
                >
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

    .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
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

    .btn-primary {
        background: #007bff;
        color: white;
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
