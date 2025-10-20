<script lang="ts">
    import { http } from "@src/core/http";
    import type { ModalType } from "@src/interfaces/career.interface";

    export let getAllCareers: () => Promise<void>;
    export let openModalCreate: boolean;
    export let closeModal: (name: ModalType) => void;

    let name = "";
    let description = "";
    let title = "";
    let loading = false;
    let error = "";

    const handleSubmit = async () => {
        try {
            loading = true;
            error = "";

            if (!name || !description || !title) {
                error = "Todos los campos son obligatorios";
                loading = false;
                return;
            }

            await http.post(`${import.meta.env.PUBLIC_BACKEND_API}/career`, {
                name,
                description,
                title
            });

            name = "";
            description = "";
            title = "";
            loading = false;
            closeModal("create");
            await getAllCareers();
        } catch (err) {
            loading = false;
            error = "Error al crear la carrera";
            console.error(err);
        }
    };

    const handleClose = () => {
        name = "";
        description = "";
        title = "";
        error = "";
        closeModal("create");
    };
</script>

{#if openModalCreate}
    <div
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50"
    >
        <div
            class="relative mx-auto p-8 w-full max-w-md bg-white rounded-md shadow-lg"
        >
            <div class="text-center">
                <h3 class="text-2xl font-bold text-gray-900 mb-6">
                    Crear Nueva Carrera
                </h3>

                {#if error}
                    <div
                        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                    >
                        {error}
                    </div>
                {/if}

                <form on:submit|preventDefault={handleSubmit} class="space-y-4">
                    <div class="text-left">
                        <label
                            for="name"
                            class="block text-sm font-medium text-gray-700"
                            >Nombre</label
                        >
                        <input
                            type="text"
                            id="name"
                            bind:value={name}
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ingrese el nombre de la carrera"
                        />
                    </div>

                    <div class="text-left">
                        <label
                            for="description"
                            class="block text-sm font-medium text-gray-700"
                            >Descripción</label
                        >
                        <textarea
                            id="description"
                            bind:value={description}
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ingrese la descripción de la carrera"
                            rows="3"
                        ></textarea>
                    </div>

                    <div class="text-left">
                        <label
                            for="title"
                            class="block text-sm font-medium text-gray-700"
                            >Título</label
                        >
                        <input
                            type="text"
                            id="title"
                            bind:value={title}
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ingrese el título que otorga la carrera"
                        />
                    </div>

                    <div class="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            on:click={handleClose}
                            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            {#if loading}
                                <span>Guardando...</span>
                            {:else}
                                <span>Guardar</span>
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
{/if}