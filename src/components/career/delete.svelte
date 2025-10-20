<script lang="ts">
    import { http } from "@src/core/http";
    import type { ModalType, Career } from "@src/interfaces/career.interface";

    export let getAllCareers: () => Promise<void>;
    export let openModalDelete: boolean;
    export let closeModal: (name: ModalType) => void;
    export let career: Career;

    let loading = false;
    let error = "";

    const handleDelete = async () => {
        try {
            loading = true;
            error = "";

            await http.delete(
                `${import.meta.env.PUBLIC_BACKEND_API}/career/${career.id}`
            );

            loading = false;
            closeModal("delete");
            await getAllCareers();
        } catch (err) {
            loading = false;
            error = "Error al eliminar la carrera";
            console.error(err);
        }
    };

    const handleClose = () => {
        error = "";
        closeModal("delete");
    };
</script>

{#if openModalDelete}
    <div
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50"
    >
        <div
            class="relative mx-auto p-8 w-full max-w-md bg-white rounded-md shadow-lg"
        >
            <div class="text-center">
                <h3 class="text-2xl font-bold text-gray-900 mb-6">
                    Eliminar Carrera
                </h3>

                {#if error}
                    <div
                        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                    >
                        {error}
                    </div>
                {/if}

                <p class="mb-6 text-gray-700">
                    ¿Está seguro que desea eliminar la carrera <span class="font-bold">{career?.name}</span>?
                    Esta acción no se puede deshacer.
                </p>

                <div class="flex justify-end space-x-3 mt-6">
                    <button
                        type="button"
                        on:click={handleClose}
                        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        on:click={handleDelete}
                        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        disabled={loading}
                    >
                        {#if loading}
                            <span>Eliminando...</span>
                        {:else}
                            <span>Eliminar</span>
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}