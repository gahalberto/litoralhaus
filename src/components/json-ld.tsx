/**
 * Componentes JSON-LD reutilizáveis para Schema Markup estruturado.
 * Uso: renderize dentro do <head> via layout ou diretamente no JSX da página.
 */

const BASE = "https://litoralhaus.com.br";

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface AgentSchemaProps {
  /** Usado no layout.tsx da home para o schema RealEstateAgent */
  variant?: "default";
}

interface PropertySchemaProps {
  slug:         string;
  title:        string;
  description:  string | null;
  type:         string;       // "APARTMENT" | "HOUSE" | ...
  city:         string;
  neighborhood: string;
  region:       string;
  priceAsk:     string | null;
  priceRent:    string | null;
  bedrooms:     number | null;
  bathrooms:    number | null;
  areaTotal:    string | null;
  images:       string[];
}

// ─── Mapa tipo → @type Schema.org ────────────────────────────────────────────

const SCHEMA_TYPE: Record<string, string> = {
  APARTMENT: "Apartment",
  HOUSE:     "House",
  PENTHOUSE: "Apartment",   // cobertura = apartamento de luxo
  LAND:      "LandmarksOrHistoricalBuildings",
  COMMERCIAL:"CommercialBuilding",
  CONDO:     "Residence",
};

// ─── RealEstateAgent (Home) ───────────────────────────────────────────────────

export function AgentJsonLd(_props: AgentSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type":    "RealEstateAgent",
    "@id":      `${BASE}/#agent`,
    name:        "Litoral Haus",
    url:         BASE,
    logo:        `${BASE}/logo.png`,
    image:       `${BASE}/og-image.jpg`,
    description:
      "Curadoria de imóveis de médio e alto padrão no litoral de São Paulo — Guarujá, Santos, Bertioga e região.",
    telephone:   "+55-13-00000000",
    address: {
      "@type":           "PostalAddress",
      addressLocality:   "Guarujá",
      addressRegion:     "SP",
      addressCountry:    "BR",
      postalCode:        "11410-000",
    },
    areaServed: [
      { "@type": "City", name: "Guarujá",  "@id": "https://www.wikidata.org/wiki/Q1011643" },
      { "@type": "City", name: "Santos",   "@id": "https://www.wikidata.org/wiki/Q192660"  },
      { "@type": "City", name: "Bertioga", "@id": "https://www.wikidata.org/wiki/Q928613"  },
      { "@type": "City", name: "São Vicente" },
    ],
    knowsAbout: [
      "Imóveis de médio padrão litoral SP",
      "Imóveis de alto padrão litoral SP",
      "Apartamentos frente mar Guarujá",
      "Casas litoral paulista",
      "Investimento imobiliário litoral SP",
    ],
    sameAs: [
      "https://www.instagram.com/litoralhaus",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── RealEstateListing (Página do Imóvel) ─────────────────────────────────────

export function PropertyJsonLd(p: PropertySchemaProps) {
  const url        = `${BASE}/imoveis/${p.slug}`;
  const schemaType = SCHEMA_TYPE[p.type] ?? "Residence";
  const price      = p.priceAsk ?? p.priceRent;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type":    schemaType,
    "@id":      url,
    name:        p.title,
    description: p.description ?? `${schemaType} disponível ${p.neighborhood}, ${p.city} — Litoral Haus`,
    url,
    image:       p.images.slice(0, 5),   // Google aceita até 5
    numberOfRooms: p.bedrooms ?? undefined,
    numberOfBathroomsTotal: p.bathrooms ?? undefined,
    floorSize: p.areaTotal
      ? { "@type": "QuantitativeValue", value: Number(p.areaTotal), unitCode: "MTK" }
      : undefined,
    address: {
      "@type":              "PostalAddress",
      streetAddress:        p.neighborhood,
      addressLocality:      p.city,
      addressRegion:        "SP",
      addressCountry:       "BR",
    },
    // Offer (preço)
    ...(price && {
      offers: {
        "@type":         "Offer",
        price:           Number(price),
        priceCurrency:   "BRL",
        availability:    "https://schema.org/InStock",
        seller: {
          "@type": "RealEstateAgent",
          name:    "Litoral Haus",
          url:     BASE,
        },
      },
    }),
    // BreadcrumbList embutido
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home",    item: BASE },
        { "@type": "ListItem", position: 2, name: "Imóveis", item: `${BASE}/imoveis` },
        { "@type": "ListItem", position: 3, name: p.title,   item: url },
      ],
    },
  };

  // Remove undefined
  const clean = JSON.parse(JSON.stringify(schema));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(clean) }}
    />
  );
}
