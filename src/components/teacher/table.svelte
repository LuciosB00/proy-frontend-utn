<script lang="ts">
    import { onMount } from "svelte";
    import Create from "./create.svelte";
    import Delete from "./delete.svelte";
    import Edit from "./edit.svelte";
    import { http } from "@src/core/http";
    import type { ModalType, Teacher } from "@src/interfaces/teacher.interface";

    let headers = ["DNI", "Fecha de Nacimiento", "Teléfono", "Dirección", "Acciones"];
    let teachers = $state<Teacher[]>([]);
    let teacher = $state<Teacher>();

    onMount(async () => {
        await getAllTeachers();
    });

    const getAllTeachers = async () => {
        teachers = await http.get(`${import.meta.env.PUBLIC_BACKEND_API}/teacher`);
    };

    let openModalCreate = $state(false);
    let openModalEdit = $state(false);
    let openModalDelete = $state(false);

    const openModal = (name: ModalType) => {
        switch (name) {
            case "create":
                openModalCreate = true;
                break;
            case "edit":
                openModalEdit = true;
                break;
            case "delete":
                openModalDelete = true;
                break;
            default:
                break;
        }
    };

    const closeModal = (name: ModalType) => {
        switch (name) {
            case "create":
                openModalCreate = false;
                break;
            case "edit":
                openModalEdit = false;
                break;
            case "delete":
                openModalDelete = false;
                break;
            default:
                break;
        }
    };
</script>

<Create {getAllTeachers} {openModalCreate} {closeModal} />
<Edit {getAllTeachers} {openModalEdit} {closeModal} {teacher} />
<Delete {getAllTeachers} {openModalDelete} {closeModal} {teacher} />

<div class="mb-4">
    <button
        onclick={() => openModal("create")}
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
    >
        Crear Profesor
    </button>
</div>

<div class="overflow-x-auto">
    <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
            <tr>
                {#each headers as header}
                    <th
                        class="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                        {header}
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
            {#each teachers as item}
                <tr class="hover:bg-gray-50">
                    <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                        >{item.dni}</td
                    >
                    <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                        >{item.dateBirth ? new Date(item.dateBirth).toLocaleDateString() : '-'}</td
                    >
                    <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                        >{item.phone || '-'}</td
                    >
                    <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                        >{item.address || '-'}</td
                    >
                    <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 flex gap-4"
                    >
                        <button
                            class="hover:text-blue-500 hover:underline cursor-pointer"
                            onclick={() => {
                                teacher = item;
                                openModal("edit");
                            }}
                        >
                            EDITAR
                        </button>

                        <button
                            class="hover:text-red-500 hover:underline cursor-pointer"
                            onclick={() => {
                                teacher = item;
                                openModal("delete");
                            }}
                        >
                            ELIMINAR
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>