<script lang="ts">
    import { http } from "@src/core/http";
    import type { Matriculation } from "@src/interfaces/matriculation.interface";

    export let openModalDelete: boolean;
    export let closeModal: (name: "delete") => void;
    export let getAllMatriculations: () => Promise<void>;
    export let matriculation: Matriculation | undefined;

    const handleDelete = async () => {
        if (!matriculation?.id) return;
        try {
            await http.delete(
                `${import.meta.env.PUBLIC_BACKEND_API}/matriculation/${matriculation.id}`,
            );
            await getAllMatriculations();
            closeModal("delete");
        } catch (e) {
            console.error("Error al eliminar matriculación:", e);
        }
    };
</script>

{#if openModalDelete}
    <div
        class="modal-backdrop"
        role="button"
        tabindex="0"
        onclick={() => closeModal("delete")}
        onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") closeModal("delete");
        }}
        aria-label="Cerrar modal"
    ></div>
    <div class="modal">
        <div class="modal-header">
            <h3>Eliminar matriculación</h3>
        </div>
        <div class="modal-body">
            {#if matriculation}
                <p>¿Estás seguro de eliminar esta matriculación?</p>
                <div class="details">
                    <div>
                        <strong>Estudiante:</strong>
                        {matriculation.studentId}
                    </div>
                    <div>
                        <strong>Materia:</strong>
                        {matriculation.courseId}
                    </div>
                    <div>
                        <strong>Carrera:</strong>
                        {matriculation.courseId ?? "-"}
                    </div>
                    <div>
                        <strong>Fecha:</strong>
                        {matriculation.registrationDate
                            ? new Date(
                                  matriculation.registrationDate,
                              ).toLocaleDateString()
                            : "(sin fecha)"}
                    </div>
                </div>
                <p class="warning">Esta acción no se puede deshacer.</p>
            {:else}
                <p>No hay elemento seleccionado.</p>
            {/if}
        </div>
        <div class="modal-footer">
            <button
                class="btn btn-secondary"
                onclick={() => closeModal("delete")}>Cancelar</button
            >
            <button
                class="btn btn-danger"
                disabled={!matriculation}
                onclick={handleDelete}>Eliminar</button
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
        width: min(520px, 92vw);
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
    }
    .modal-header {
        margin-bottom: 8px;
    }
    .modal-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        background: #f7f7f7;
        padding: 8px;
        border-radius: 6px;
    }
    .warning {
        color: #b00020;
        font-weight: 600;
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
    .btn-danger {
        background: #dc3545;
        color: #fff;
    }
</style>
