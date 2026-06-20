import type { Metadata } from "next";
import Link from "next/link";
import { PostForm } from "@/components/admin/PostForm";

export const metadata: Metadata = { title: "Novo Artigo" };

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <nav className="mb-8 flex items-center gap-2 font-inter text-xs text-muted-foreground">
        <Link href="/admin/blog" className="hover:text-foreground">Blog</Link>
        <span>/</span>
        <span className="text-foreground">Novo artigo</span>
      </nav>

      <div className="mb-8">
        <h1 className="font-cormorant text-2xl font-light text-foreground">Novo artigo</h1>
        <p className="mt-1 font-inter text-xs text-muted-foreground">
          Preencha título, conteúdo HTML, localização e SEO. Salve como rascunho e publique quando estiver pronto.
        </p>
      </div>

      <PostForm />
    </div>
  );
}
