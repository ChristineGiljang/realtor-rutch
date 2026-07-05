"use client";

interface Props {
  propertyId: string;
}

export default function DeleteButton({ propertyId }: Props) {
  const handleDelete = async () => {
    if (!confirm("Delete this property? This cannot be undone.")) return;

    await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });
    window.location.reload();
  };

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-red-400 hover:text-red-600 transition underline"
    >
      Delete
    </button>
  );
}
