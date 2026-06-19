import type { Metadata } from "next";
import { getPropertyCategories } from "@/actions/property-categories";
import { PropertyTypesManager } from "@/components/admin/PropertyTypesManager";

export const metadata: Metadata = { title: "Tipos de Imóvel" };
export const revalidate = 0;

export default async function PropertyTypesPage() {
  const categories = await getPropertyCategories();

  return (
    <div className="mx-auto max-w-2xl px-8 py-8 space-y-8">
      <div>
        <h1 className="font-cormorant text-3xl font-light text-foreground">Tipos de Imóvel</h1>
        <p className="mt-1 font-inter text-xs text-muted-foreground">
          Cadastre e gerencie os tipos disponíveis no formulário de imóveis.
        </p>
      </div>

      <PropertyTypesManager initialCategories={categories} />
    </div>
  );
}
