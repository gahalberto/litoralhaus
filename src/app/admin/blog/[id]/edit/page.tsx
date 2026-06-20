import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminPostById } from "@/actions/blog";
import { PostForm } from "@/components/admin/PostForm";

export const metadata: Metadata = { title: "Editar Artigo" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getAdminPostById(id);
  if (!post) notFound();

  const initialData = {
    id:           post.id,
    title:        post.title,
    slug:         post.slug,
    excerpt:      post.excerpt,
    content:      post.content,
    coverImage:   post.coverImage ?? "",
    published:    post.published,
    publishedAt:  post.publishedAt
      ? new Date(post.publishedAt).toISOString().slice(0, 16)
      : "",
    authorName:   post.authorName,
    region:       post.region ?? null,
    city:         post.city ?? "",
    neighborhood: post.neighborhood ?? "",
    tagsRaw:      post.tags.join(", "),
    seoTitle:     post.seoTitle ?? "",
    seoDescription: post.seoDescription ?? "",
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <nav className="mb-8 flex items-center gap-2 font-inter text-xs text-muted-foreground">
        <Link href="/admin/blog" className="hover:text-foreground">Blog</Link>
        <span>/</span>
        <span className="max-w-48 truncate text-foreground">{post.title}</span>
        <span>/</span>
        <span className="text-foreground">Editar</span>
      </nav>

      <div className="mb-8">
        <h1 className="font-cormorant text-2xl font-light text-foreground">Editar artigo</h1>
        <p className="mt-1 font-inter text-xs text-muted-foreground">{post.title}</p>
      </div>

      <PostForm initialData={initialData} />
    </div>
  );
}
