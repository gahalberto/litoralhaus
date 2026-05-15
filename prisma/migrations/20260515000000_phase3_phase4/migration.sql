-- ============================================================
-- Phase 3 & 4: Property, Users, Catalog
-- Applied after: 20260425123558_init_phase2
-- ============================================================

-- ── 1. UserRole enum + User table ────────────────────────────

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CORRETOR');

CREATE TABLE "User" (
    "id"        TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name"      TEXT         NOT NULL,
    "email"     TEXT         NOT NULL,
    "password"  TEXT         NOT NULL,
    "role"      "UserRole"   NOT NULL DEFAULT 'CORRETOR',
    "active"    BOOLEAN      NOT NULL DEFAULT true,
    "avatar"    TEXT,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key"  ON "User"("email");
CREATE INDEX        "User_role_idx"   ON "User"("role");
CREATE INDEX        "User_active_idx" ON "User"("active");

-- ── 2. Lead: rename assignedTo → assignedUserId + FK ─────────

ALTER TABLE "Lead" RENAME COLUMN "assignedTo" TO "assignedUserId";

CREATE INDEX "Lead_assignedUserId_idx" ON "Lead"("assignedUserId");

ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedUserId_fkey"
    FOREIGN KEY ("assignedUserId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ── 3. PropertyStatus enum: EN → PT-BR ───────────────────────
-- PostgreSQL não suporta remover valores de enum diretamente.
-- Cria novo tipo, migra coluna, troca o tipo.

CREATE TYPE "PropertyStatus_new" AS ENUM ('DISPONIVEL', 'RESERVADO', 'VENDIDO');

-- DROP DEFAULT antes de mudar o tipo (evita erro de cast automático)
ALTER TABLE "Property" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Property"
    ALTER COLUMN "status" TYPE "PropertyStatus_new"
    USING (
        CASE "status"::text
            WHEN 'AVAILABLE' THEN 'DISPONIVEL'::"PropertyStatus_new"
            WHEN 'RESERVED'  THEN 'RESERVADO'::"PropertyStatus_new"
            WHEN 'SOLD'      THEN 'VENDIDO'::"PropertyStatus_new"
            ELSE                  'DISPONIVEL'::"PropertyStatus_new"
        END
    );

ALTER TABLE "Property" ALTER COLUMN "status" SET DEFAULT 'DISPONIVEL'::"PropertyStatus_new";

DROP TYPE "PropertyStatus";
ALTER TYPE "PropertyStatus_new" RENAME TO "PropertyStatus";

-- ── 4. Property: remover colunas antigas ─────────────────────

ALTER TABLE "Property" DROP COLUMN IF EXISTS "coverImage";
ALTER TABLE "Property" DROP COLUMN "highlights";
ALTER TABLE "Property" DROP COLUMN "amenities";

-- ── 5. Property: renomear meta → seo ─────────────────────────

ALTER TABLE "Property" RENAME COLUMN "metaTitle"       TO "seoTitle";
ALTER TABLE "Property" RENAME COLUMN "metaDescription" TO "seoDescription";

-- ── 6. Property: adicionar novas colunas ─────────────────────

ALTER TABLE "Property" ADD COLUMN "isIsca"  BOOLEAN  NOT NULL DEFAULT false;
ALTER TABLE "Property" ADD COLUMN "cep"     TEXT;
ALTER TABLE "Property" ADD COLUMN "images"  TEXT[]   NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE INDEX "Property_isIsca_idx" ON "Property"("isIsca");

-- ── 7. Remover PropertyImage (substituído por images TEXT[]) ──

DROP TABLE IF EXISTS "PropertyImage";

-- ── 8. Catálogo de Destaques ──────────────────────────────────

CREATE TABLE "Highlight" (
    "id"        TEXT         NOT NULL,
    "label"     TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Highlight_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Highlight_label_key" ON "Highlight"("label");

CREATE TABLE "PropertyHighlight" (
    "propertyId"  TEXT NOT NULL,
    "highlightId" TEXT NOT NULL,
    CONSTRAINT "PropertyHighlight_pkey" PRIMARY KEY ("propertyId", "highlightId")
);

CREATE INDEX "PropertyHighlight_propertyId_idx" ON "PropertyHighlight"("propertyId");

ALTER TABLE "PropertyHighlight" ADD CONSTRAINT "PropertyHighlight_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PropertyHighlight" ADD CONSTRAINT "PropertyHighlight_highlightId_fkey"
    FOREIGN KEY ("highlightId") REFERENCES "Highlight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── 9. Catálogo de Comodidades ────────────────────────────────

CREATE TABLE "Amenity" (
    "id"        TEXT         NOT NULL,
    "label"     TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Amenity_label_key" ON "Amenity"("label");

CREATE TABLE "PropertyAmenity" (
    "propertyId" TEXT NOT NULL,
    "amenityId"  TEXT NOT NULL,
    CONSTRAINT "PropertyAmenity_pkey" PRIMARY KEY ("propertyId", "amenityId")
);

CREATE INDEX "PropertyAmenity_propertyId_idx" ON "PropertyAmenity"("propertyId");

ALTER TABLE "PropertyAmenity" ADD CONSTRAINT "PropertyAmenity_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PropertyAmenity" ADD CONSTRAINT "PropertyAmenity_amenityId_fkey"
    FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
