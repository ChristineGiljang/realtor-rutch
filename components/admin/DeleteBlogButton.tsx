"use client";

interface Props {
  postId: string;
}

export default function DeleteBlogButton({ postId }: Props) {
  const handleDelete = async () => {
    if (!confirm("Delete this post? This cannot be undone.")) return;

    await fetch(`/api/blog/${postId}`, { method: "DELETE" });
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
