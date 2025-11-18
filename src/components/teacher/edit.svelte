<script lang="ts">
    import { http } from "@src/core/http";
    import type { ModalType, Teacher } from "@src/interfaces/teacher.interface";
    import type { Course } from "@src/interfaces/course.interface";
    import { onMount } from "svelte";

    interface Props {
        openModalEdit: boolean;
        closeModal: (modal: ModalType) => void;
        getAllTeachers: () => Promise<void>;
        teacher: Teacher | undefined;
    }

    const { openModalEdit, closeModal, getAllTeachers, teacher }: Props = $props();

    let loading = $state(false);
    let error = $state(null);
    let courses = $state<Course[]>([]);
    let selectedCourseIds = $state<string[]>([]);

    $effect(() => {
        selectedCourseIds = (teacher?.courses || []).map(c => c.id);
    });

    const handleSubmit = async (event: SubmitEvent) => {
        try {
            event.preventDefault();
            loading = true;
            error = null;
            const formData = new FormData(event.target as HTMLFormElement);
            const data = Object.fromEntries(formData);

            const body: any = {};
            if (data["dni"] !== undefined) {
                const dniStr = String((data["dni"] as string) ?? "").trim();
                if (!/^\d{8}$/.test(dniStr)) {
                    error =
                        "dni must be longer than or equal to 8 and shorter than or equal to 8 characters";
                    loading = false;
                    return;
                }
                body.dni = Number(dniStr);
            }
            if (data["dateBirth"]) {
                const v = (data["dateBirth"] as string).trim();
                if (v) body.dateBirth = new Date(v);
            }
            if (data["phone"] !== undefined) {
                const phoneStr = String((data["phone"] as string) ?? "").trim();
                if (phoneStr && phoneStr.length < 10) {
                    error = "phone must be longer than or equal to 10 characters";
                    loading = false;
                    return;
                }
                body.phone = phoneStr || null;
            }
            if (data["address"] !== undefined) {
                const addr = String(data["address"] as string).trim();
                if (addr && addr.length < 10) {
                    throw new Error(
                        "address must be longer than or equal to 10 characters",
                    );
                }
                body.address = addr || null;
            }

            await http.patch(
                `${import.meta.env.PUBLIC_BACKEND_API}/teacher/${teacher?.id}`,
                body,
            );
            await getAllTeachers();
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
                <h2>EDITAR PROFESOR</h2>
                <button class="close-btn" aria-label="cerrar boton"> </button>
            </div>

            {#if error}
                <div class="text-center text-accent">{error}</div>
            {/if}

            <form onsubmit={handleSubmit} class="space-y-4">
                <div class="form-group">
                    <label for="dni">DNI:</label>
                    <input 
                        type="number" 
                        id="dni" 
                        name="dni" 
                        min="10000000"
                        max="99999999"
                        step="1"
                        value={teacher?.dni} 
                        required 
                    />
                </div>

                <div class="form-group">
                    <label for="courses-chips">Materias a cargo:</label>
                    <div class="chips">
                        {#each courses as c}
                            <button
                                type="button"
                                class={`chip ${selectedCourseIds.includes(c.id) ? 'chip-selected' : ''}`}
                                onclick={() => {
                                    if (selectedCourseIds.includes(c.id)) {
                                        selectedCourseIds = selectedCourseIds.filter(id => id !== c.id);
                                    } else {
                                        selectedCourseIds = [...selectedCourseIds, c.id];
                                    }
                                }}
                            >{c.name}</button>
                        {/each}
                    </div>
                </div>

                <div class="form-group">
                    <label for="dateBirth">Fecha de Nacimiento:</label>
                    <input 
                        type="date" 
                        id="dateBirth" 
                        name="dateBirth" 
                        value={teacher?.dateBirth ? new Date(teacher.dateBirth).toISOString().split('T')[0] : ''} 
                    />
                </div>

                <div class="form-group">
                    <label for="phone">Teléfono:</label>
                    <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        minlength="10"
                        value={teacher?.phone} 
                    />
                </div>

                <div class="form-group">
                    <label for="address">Dirección:</label>
                    <input 
                        type="text" 
                        id="address" 
                        name="address" 
                        value={teacher?.address} 
                    />
                </div>

                <div class="modal-footer">
                    <button type="submit" class="btn btn-success">Aceptar</button>
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
        font-weight: 500;
    }

    .form-group input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .chip {
        border: 1px solid #ccc;
        border-radius: 16px;
        padding: 6px 10px;
        background: #f7f7f7;
        color: #333;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
    }

    .chip:hover { background: #eee; }

    .chip-selected {
        background: #2563eb;
        border-color: #2563eb;
        color: white;
    }

    .modal-footer {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
</style>