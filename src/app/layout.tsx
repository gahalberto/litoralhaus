import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider }  from "@/components/theme-provider";
import { Toaster }        from "@/components/ui/sonner";
import { AgentJsonLd }    from "@/components/json-ld";
import { WhatsAppFab }    from "@/components/WhatsAppFab";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = "https://litoralhaus.com.br";

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Litoral Haus | Imóveis no Litoral de São Paulo",
    template: "%s | Litoral Haus",
  },
  description:
    "Curadoria de imóveis de médio e alto padrão no Guarujá, Santos e litoral paulista. Inteligência de mercado e atendimento personalizado para compradores, famílias e investidores.",
  keywords: [
    "imóveis no Guarujá",
    "imóveis médio padrão litoral SP",
    "imóveis alto padrão litoral SP",
    "investimento imobiliário litoral SP",
    "Litoral Haus",
    "apartamento frente mar Guarujá",
    "casas Santos SP",
    "imóveis litoral São Paulo",
    "comprar apartamento Guarujá",
    "imobiliária Guarujá",
    "imóveis Guarujá médio padrão",
    "apartamento litoral São Paulo",
  ],
  authors: [{ name: "Litoral Haus", url: BASE_URL }],
  creator: "Litoral Haus",
  publisher: "Litoral Haus",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: BASE_URL,
    siteName: "Litoral Haus",
    title: "Litoral Haus | Imóveis no Litoral de São Paulo",
    description:
      "Curadoria de imóveis de médio e alto padrão no Guarujá, Santos e litoral paulista. Inteligência de mercado para compradores e investidores.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Litoral Haus — Imóveis no Litoral Paulista",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Litoral Haus | Imóveis no Litoral de São Paulo",
    description:
      "Curadoria de imóveis de médio e alto padrão no Guarujá, Santos e litoral paulista.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "pt-BR": BASE_URL,
    },
  },
  category: "real estate",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Litoral Haus",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/imoveis?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(cormorant.variable, inter.variable, geist.variable, "h-full antialiased")}
    >
      <head>
        <AgentJsonLd />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-H041826Q7M"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-H041826Q7M');
        `}
      </Script>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
          <WhatsAppFab />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
