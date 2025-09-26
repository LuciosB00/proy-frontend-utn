<script lang="ts">
    import { http } from "@src/core/http";
    import type { ModalType, User } from "@src/interfaces/user.interface";

    interface Props {
        openModalEdit: boolean;
        closeModal: (modal: ModalType) => void;
        getAllUsers: () => Promise<void>;
        user: User | undefined;
    }

    const { openModalEdit, closeModal, getAllUsers, user }: Props = $props();

    let loading = $state(false);
    let error = $state(null);

    const handleSubmit = async (event: SubmitEvent) => {
        try {
            event.preventDefault();
            loading = true;
            error = null;
            const formData = new FormData(event.target as HTMLFormElement);
            const data = Object.fromEntries(formData);
            await http.patch(
                `${import.meta.env.PUBLIC_BACKEND_API}/user/${user?.id}`,
                data,
            );
            await getAllUsers();
            closeModal("edit");
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    };
</script>

{#if openModalEdit}
    <div class="modal-backdrop">
        <div class="modal-content">
            <div class="modal-header">
                <h2>EDITAR EL USUARIO</h2>
                <button class="close-btn" aria-label="cerrar boton"> </button>
            </div>

            {#if error}
                <div class="text-center text-accent">{error}</div>
            {/if}

            <form onsubmit={handleSubmit} class="space-y-4">
                <div class="form-group">
                    <label for="fullName">Nombre Completo:</label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={user?.fullName}
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="email">Correo electrónico:</label>
                    <input
                        type="email"
                        id="email"
                        value={user?.email}
                        name="email"
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="password">Actualizar contraseña:</label>
                    <input type="password" id="password" name="password" />
                </div>

                <div class="modal-footer">
                    <button type="submit" class="btn btn-success"
                        >Aceptar</button
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

    .btn-success {
        background: #28a745;
        color: white;
    }

    .btn-danger {
        background: #dc3545;
        color: white;
    }
</style>
