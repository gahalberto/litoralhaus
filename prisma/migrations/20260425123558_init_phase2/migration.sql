-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NOVO', 'EM_CONTATO', 'QUALIFICADO', 'VISITA_AGENDADA', 'PROPOSTA', 'FECHADO_GANHO', 'FECHADO_PERDIDO');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('LANDING_PAGE', 'WHATSAPP', 'INSTAGRAM', 'GOOGLE_ADS', 'REFERRAL', 'DIRECT');

-- CreateEnum
CREATE TYPE "BudgetRange" AS ENUM ('UP_TO_500K', 'RANGE_500K_1M', 'RANGE_1M_2M', 'RANGE_2M_5M', 'ABOVE_5M');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'HOUSE', 'PENTHOUSE', 'LAND', 'COMMERCIAL', 'CONDO');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'AVAILABLE', 'RESERVED', 'SOLD', 'OFF_MARKET');

-- CreateEnum
CREATE TYPE "InteractionChannel" AS ENUM ('WHATSAPP', 'EMAIL', 'PHONE', 'VISIT', 'VIDEO_CALL', 'NOTE');

-- CreateEnum
CREATE TYPE "InteractionDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('GUARUJA', 'SANTOS', 'SAO_VICENTE', 'PRAIA_GRANDE', 'BERTIOGA', 'UBATUBA', 'CARAGUATATUBA', 'SAO_SEBASTIAO', 'ILHABELA');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NOVO',
    "source" "LeadSource" NOT NULL DEFAULT 'LANDING_PAGE',
    "budgetRange" "BudgetRange" NOT NULL,
    "regions" "Region"[],
    "propertyTypes" "PropertyType"[],
    "notes" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "referrerUrl" TEXT,
    "assignedTo" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "PropertyStatus" NOT NULL DEFAULT 'DRAFT',
    "type" "PropertyType" NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "region" "Region" NOT NULL,
    "city" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "suites" INTEGER,
    "parkingSpots" INTEGER,
    "areaTotal" DECIMAL(10,2),
    "areaUsable" DECIMAL(10,2),
    "priceAsk" DECIMAL(15,2),
    "priceRent" DECIMAL(15,2),
    "condoFee" DECIMAL(10,2),
    "iptu" DECIMAL(10,2),
    "coverImage" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "highlights" TEXT[],
    "amenities" TEXT[],

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyImage" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leadId" TEXT NOT NULL,
    "channel" "InteractionChannel" NOT NULL,
    "direction" "InteractionDirection" NOT NULL DEFAULT 'OUTBOUND',
    "summary" TEXT NOT NULL,
    "nextStep" TEXT,
    "nextStepAt" TIMESTAMP(3),
    "performedBy" TEXT NOT NULL,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyInterest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leadId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "PropertyInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_budgetRange_idx" ON "Lead"("budgetRange");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");

-- CreateIndex
CREATE INDEX "Property_region_status_idx" ON "Property"("region", "status");

-- CreateIndex
CREATE INDEX "Property_type_status_idx" ON "Property"("type", "status");

-- CreateIndex
CREATE INDEX "Property_priceAsk_idx" ON "Property"("priceAsk");

-- CreateIndex
CREATE INDEX "Property_featured_idx" ON "Property"("featured");

-- CreateIndex
CREATE INDEX "PropertyImage_propertyId_idx" ON "PropertyImage"("propertyId");

-- CreateIndex
CREATE INDEX "Interaction_leadId_idx" ON "Interaction"("leadId");

-- CreateIndex
CREATE INDEX "Interaction_createdAt_idx" ON "Interaction"("createdAt");

-- CreateIndex
CREATE INDEX "PropertyInterest_leadId_idx" ON "PropertyInterest"("leadId");

-- CreateIndex
CREATE INDEX "PropertyInterest_propertyId_idx" ON "PropertyInterest"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyInterest_leadId_propertyId_key" ON "PropertyInterest"("leadId", "propertyId");

-- AddForeignKey
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyInterest" ADD CONSTRAINT "PropertyInterest_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyInterest" ADD CONSTRAINT "PropertyInterest_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
