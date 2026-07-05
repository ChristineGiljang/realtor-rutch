import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import EditPropertyForm from "@/components/admin/EditPropertyForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;

  const property = await db.property.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
    },
  });

  if (!property) notFound();

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-3">
            Admin
          </p>
          <h1 className="text-4xl font-bold">Edit Listing</h1>
          <p className="text-[#8B7355] mt-2">{property.title}</p>
        </div>
        <EditPropertyForm property={property} />
      </div>
    </div>
  );
}
