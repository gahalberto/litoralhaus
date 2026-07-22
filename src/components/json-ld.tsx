/**
 * Componentes JSON-LD reutilizáveis para Schema Markup estruturado.
 * Uso: renderize dentro do <head> via layout ou diretamente no JSX da página.
 */

const BASE = "https://litoralhaus.com.br";
const PHONE = "+55-13-95542-2935";

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export interface ArticleSchemaProps {
  slug:        string;
  title:       string;
  excerpt:     string;
  coverImage:  string | null;
  authorName:  string;
  publishedAt: Date | null;
  updatedAt:   Date;
}

export interface FaqItem {
  question: string;
  answer:   string;
}

export interface ItemListEntry {
  name:     string;
  url:      string;
  image?:   string;
  position: number;
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface AgentSchemaProps {
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
  suites?:      number | null;
  parkingSpots?: number | null;
  areaTotal:    string | null;
  areaUsable?:  string | null;
  images:       string[];
  amenities?:   string[];
  highlights?:  string[];
  updatedAt?:   string; // ISO date string
}

// ─── Mapa tipo → @type Schema.org ────────────────────────────────────────────

const SCHEMA_TYPE: Record<string, string> = {
  APARTMENT: "Apartment",
  HOUSE:     "House",
  PENTHOUSE: "Apartment",
  LAND:      "LotOrLand",
  COMMERCIAL:"CommercialBuilding",
  CONDO:     "Residence",
};

// ─── RealEstateAgent (Home) ───────────────────────────────────────────────────

export function AgentJsonLd(_props: AgentSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type":    ["RealEstateAgent", "LocalBusiness"],
        "@id":      `${BASE}/#agent`,
        name:        "Litoral Haus",
        url:         BASE,
        logo: {
          "@type": "ImageObject",
          url:      `${BASE}/logo.png`,
          width:    500,
          height:   500,
        },
        image:       `${BASE}/og-image.jpg`,
        description:
          "Curadoria de imóveis de médio e alto padrão no litoral de São Paulo — Guarujá, Santos, Bertioga e região.",
        telephone:   PHONE,
        email:       "contato@litoralhaus.com.br",
        address: {
          "@type":           "PostalAddress",
          addressLocality:   "Guarujá",
          addressRegion:     "SP",
          addressCountry:    "BR",
          postalCode:        "11410-000",
        },
        geo: {
          "@type":    "GeoCoordinates",
          latitude:   -23.9935,
          longitude:  -46.2564,
        },
        areaServed: [
          { "@type": "City", name: "Guarujá",          "@id": "https://www.wikidata.org/wiki/Q1011643" },
          { "@type": "City", name: "Santos",           "@id": "https://www.wikidata.org/wiki/Q192660"  },
          { "@type": "City", name: "Bertioga",         "@id": "https://www.wikidata.org/wiki/Q928613"  },
          { "@type": "City", name: "São Vicente"       },
          { "@type": "City", name: "Praia Grande"      },
          { "@type": "City", name: "Ilhabela"          },
          { "@type": "City", name: "Ubatuba"           },
          { "@type": "City", name: "São Sebastião"     },
          { "@type": "City", name: "Caraguatatuba"     },
        ],
        knowsAbout: [
          "Imóveis de médio padrão litoral SP",
          "Imóveis de alto padrão litoral SP",
          "Apartamentos frente mar Guarujá",
          "Casas litoral paulista",
          "Investimento imobiliário litoral SP",
          "Coberturas Guarujá",
          "Imóveis Santos SP",
        ],
        sameAs: [
          "https://www.instagram.com/litoralhaus",
        ],
        priceRange:  "$$-$$$",
        openingHoursSpecification: [
          {
            "@type":     "OpeningHoursSpecification",
            dayOfWeek:   ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens:       "09:00",
            closes:      "18:00",
          },
          {
            "@type":     "OpeningHoursSpecification",
            dayOfWeek:   ["Saturday"],
            opens:       "09:00",
            closes:      "13:00",
          },
        ],
        contactPoint: {
          "@type":          "ContactPoint",
          telephone:        PHONE,
          contactType:      "sales",
          availableLanguage: "Portuguese",
          contactOption:    "TollFree",
        },
      },
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

  const amenityFeature = [
    ...(p.amenities ?? []).map((label) => ({
      "@type": "LocationFeatureSpecification",
      name:    label,
      value:   true,
    })),
    ...(p.highlights ?? []).map((label) => ({
      "@type": "LocationFeatureSpecification",
      name:    label,
      value:   true,
    })),
  ];

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type":    schemaType,
    "@id":      url,
    name:        p.title,
    description: p.description ?? `${schemaType} disponível ${p.neighborhood}, ${p.city} — Litoral Haus`,
    url,
    image:       p.images.slice(0, 5),
    numberOfRooms:          p.bedrooms ?? undefined,
    numberOfBathroomsTotal: p.bathrooms ?? undefined,
    numberOfBedrooms:       p.bedrooms ?? undefined,
    ...(p.suites != null && { numberOfFullBathrooms: p.suites }),
    ...(p.parkingSpots != null && { numberOfParkingSpaces: p.parkingSpots }),
    floorSize: p.areaTotal
      ? { "@type": "QuantitativeValue", value: Number(p.areaTotal), unitCode: "MTK" }
      : undefined,
    ...(p.areaUsable && {
      floorSizeUsable: {
        "@type": "QuantitativeValue",
        value:   Number(p.areaUsable),
        unitCode: "MTK",
      },
    }),
    ...(amenityFeature.length > 0 && { amenityFeature }),
    address: {
      "@type":           "PostalAddress",
      streetAddress:     p.neighborhood,
      addressLocality:   p.city,
      addressRegion:     "SP",
      addressCountry:    "BR",
    },
    ...(p.updatedAt && { dateModified: p.updatedAt }),
    ...(price && {
      offers: {
        "@type":       "Offer",
        price:         Number(price),
        priceCurrency: "BRL",
        availability:  "https://schema.org/InStock",
        url,
        seller: {
          "@type": "RealEstateAgent",
          "@id":   `${BASE}/#agent`,
          name:    "Litoral Haus",
          url:     BASE,
        },
      },
    }),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home",    item: BASE },
        { "@type": "ListItem", position: 2, name: "Imóveis", item: `${BASE}/imoveis` },
        { "@type": "ListItem", position: 3, name: p.title,   item: url },
      ],
    },
  };

  const clean = JSON.parse(JSON.stringify(schema));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(clean) }}
    />
  );
}

// ─── FAQ (Página do Imóvel / Landing pages) ───────────────────────────────────

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type":    "FAQPage",
    mainEntity: items.map((item) => ({
      "@type":          "Question",
      name:             item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text:    item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── ItemList (Páginas de listagem) ──────────────────────────────────────────

export function ItemListJsonLd({
  name,
  url,
  description,
  items,
}: {
  name:         string;
  url:          string;
  description?: string;
  items:        ItemListEntry[];
}) {
  if (items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type":    "CollectionPage",
    name,
    url,
    ...(description && { description }),
    mainEntity: {
      "@type":           "ItemList",
      name,
      numberOfItems:     items.length,
      itemListElement:   items.map((item) => ({
        "@type":    "ListItem",
        position:   item.position,
        name:       item.name,
        url:        item.url,
        ...(item.image && {
          image: {
            "@type": "ImageObject",
            url:     item.image,
          },
        }),
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── BreadcrumbList (genérico) ────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string;
  url:  string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type":  "ListItem",
      position: i + 1,
      name:     item.name,
      item:     item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Place (Página de Bairro/Cidade) ──────────────────────────────────────────

interface PlaceSchemaProps {
  name:         string;
  addressLocality: string;
  url:          string;
  description?: string;
  latitude?:    number | null;
  longitude?:   number | null;
}

export function PlaceJsonLd(p: PlaceSchemaProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type":    "Place",
    name:        p.name,
    url:         p.url,
    ...(p.description && { description: p.description }),
    address: {
      "@type":         "PostalAddress",
      addressLocality: p.addressLocality,
      addressRegion:   "SP",
      addressCountry:  "BR",
    },
    ...(p.latitude != null && p.longitude != null && {
      geo: {
        "@type":    "GeoCoordinates",
        latitude:   p.latitude,
        longitude:  p.longitude,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Article (Blog) ───────────────────────────────────────────────────────────

export function ArticleJsonLd(p: ArticleSchemaProps) {
  const url = `${BASE}/blog/${p.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type":    "Article",
    "@id":      url,
    headline:   p.title,
    description: p.excerpt,
    url,
    ...(p.coverImage && { image: [p.coverImage] }),
    datePublished:  p.publishedAt?.toISOString() ?? new Date().toISOString(),
    dateModified:   p.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name:    p.authorName,
      url:     BASE,
    },
    publisher: {
      "@type": "Organization",
      name:    "Litoral Haus",
      url:     BASE,
      logo: {
        "@type": "ImageObject",
        url:     `${BASE}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id":   url,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home",  item: BASE },
        { "@type": "ListItem", position: 2, name: "Blog",  item: `${BASE}/blog` },
        { "@type": "ListItem", position: 3, name: p.title, item: url },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
