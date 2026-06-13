import Link from "next/link";
import { getFeaturedProperties } from "@/lib/public-properties";
import { FeaturedPropertyCard } from "@/components/featured-property-card";

export async function FeaturedProperties() {
  const properties = await getFeaturedProperties();

  if (properties.length === 0) return null;

  return (
    <section
      id="imoveis"
      aria-label="Imóveis em destaque"
      className="bg-background px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-3 font-inter text-xs uppercase tracking-[0.3em] text-amber-600/80 dark:text-amber-400/70">
              Portfólio Exclusivo
            </p>
            <h2 className="font-cormorant text-4xl font-light text-foreground sm:text-5xl">
              Imóveis em destaque
            </h2>
          </div>
          <Link
            href="/imoveis"
            className="hidden font-inter text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-amber-600 dark:hover:text-amber-400 sm:block"
          >
            Ver todos →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <FeaturedPropertyCard key={p.id} p={p} />
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/imoveis"
            className="font-inter text-xs uppercase tracking-widest text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400"
          >
            Ver todos os imóveis →
          </Link>
        </div>
      </div>
    </section>
  );
}
