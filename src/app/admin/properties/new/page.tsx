import type { Metadata } from "next";
import Link from "next/link";
import { getHighlights, getAmenities, getProximities } from "@/actions/catalog";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { getPropertyCategories } from "@/actions/property-categories";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Cadastrar Imóvel" };

export default async function NewPropertyPage() {
  const [highlights, amenities, proximities, categories, session] = await Promise.all([
    getHighlights(),
    getAmenities(),
    getProximities(),
    getPropertyCategories(),
    getSession(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <nav className="mb-8 flex items-center gap-2 font-inter text-xs text-muted-foreground">
        <Link href="/admin/properties" className="hover:text-foreground">
          Imóveis
        </Link>
        <span>/</span>
        <span className="text-foreground">Cadastrar</span>
      </nav>

      <div className="mb-8">
        <h1 className="font-cormorant text-2xl font-light text-foreground">
          Cadastrar Imóvel
        </h1>
        <p className="mt-1 font-inter text-xs text-muted-foreground">
          Preencha todas as seções. Os campos de SEO impactam diretamente o ranqueamento.
        </p>
      </div>

      <PropertyForm highlights={highlights} amenities={amenities} proximities={proximities} categories={categories} isAdmin={session?.role === "ADMIN"} />
    </div>
  );
}
