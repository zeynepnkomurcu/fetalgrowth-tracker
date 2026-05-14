export default function DeletePatientModal({
  visible,
  onClose,
  onConfirm,
}) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/40 flex items-center justify-center">
<div className="relative z-[100000] bg-white rounded-2xl p-6 w-[400px] shadow-xl">

        <h2 className="text-xl font-semibold mb-2">
          Delete Patient?
        </h2>

        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete this patient?
        </p>

        <div className="flex justify-end gap-3">

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </button>

        </div>
      </div>
    </div>
  );
}