"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { useAdminData } from "@/lib/admin/admin-data-context";
import { ProductForm } from "@/components/admin/product-form";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const { products } = useAdminData();
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 className="font-display text-2xl italic text-ink">Edit product</h1>
      <div className="mt-6 max-w-2xl">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
