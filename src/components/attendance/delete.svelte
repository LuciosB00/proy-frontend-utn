<script lang="ts">
  import { http } from "@src/core/http";
  import type { Attendance } from "@src/interfaces/attendance.interface";

  export let openModalDelete: boolean;
  export let closeModal: (name: "delete") => void;
  export let getAllAttendances: () => Promise<void>;
  export let attendance: Attendance | undefined;

  const handleDelete = async () => {
    if (!attendance?.id) return;
    try {
      await http.delete(`${import.meta.env.PUBLIC_BACKEND_API}/attendance/${attendance.id}`);
      await getAllAttendances();
      closeModal("delete");
    } catch (e) {
      console.error("Error al eliminar asistencia:", e);
    }
  };
</script>

{#if openModalDelete}
  <div class="modal-backdrop" onclick={() => closeModal("delete")}></div>
  <div class="modal">
    <div class="modal-header">
      <h3>Eliminar asistencia</h3>
    </div>
    <div class="modal-body">
      {#if attendance}
        <p>
          ¿Estás seguro de eliminar esta asistencia?
        </p>
        <div class="details">
          <div><strong>Estudiante:</strong> {attendance.student?.user?.fullName ?? attendance.studentId}</div>
          <div><strong>Carrera:</strong> {attendance.course?.career?.name ?? "-"}</div>
          <div><strong>Materia:</strong> {attendance.course?.name ?? attendance.courseId}</div>
          <div><strong>Fecha:</strong> {attendance.attendanceDate ? new Date(attendance.attendanceDate).toLocaleDateString() : "(sin fecha)"}</div>
          <div><strong>Estado:</strong> {attendance.status ?? "-"}</div>
        </div>
        <p class="warning">Esta acción no se puede deshacer.</p>
      {:else}
        <p>No hay asistencia seleccionada.</p>
      {/if}
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick={() => closeModal("delete")}>Cancelar</button>
      <button class="btn btn-danger" disabled={!attendance} onclick={handleDelete}>Eliminar</button>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); }
  .modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 16px; border-radius: 8px; width: min(520px, 92vw); box-shadow: 0 6px 24px rgba(0,0,0,0.2); }
  .modal-header { margin-bottom: 8px; }
  .modal-body { display: flex; flex-direction: column; gap: 8px; }
  .details { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #f7f7f7; padding: 8px; border-radius: 6px; }
  .warning { color: #b00020; font-weight: 600; }
  .modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
  .btn { padding: 6px 10px; border-radius: 6px; }
  .btn-secondary { background: #6c757d; color: #fff; }
  .btn-danger { background: #dc3545; color: #fff; }
</style>