import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const post = await db.blogPost.findUnique({ where: { slug } });

  if (!post || !post.published) {
    return { title: "Post Not Found" };
  }

  const plainText = post.content.replace(/\s+/g, " ").trim();
  const description = `${plainText.slice(0, 155)}${plainText.length > 155 ? "…" : ""}`;

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await db.blogPost.findUnique({ where: { slug } });

  if (!post || !post.published) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: "Rutchilyn Llagoso",
    },
    publisher: {
      "@type": "Organization",
      name: "Realtor Rutch",
    },
    mainEntityOfPage: `https://realtor-rutch.com/blog/${post.slug}`,
  };

  return (
    <div className="pt-20 min-h-screen bg-[#faf9f6] text-[#1A1A1A]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Cover */}
      {post.coverImage && (
        <div className="relative h-[420px] overflow-hidden bg-[#E2D9C8]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          href="/blog"
          className="text-xs tracking-widest uppercase text-[#8B7355] hover:text-[#1A1A1A] transition"
        >
          ← Back to Blog
        </Link>

        <p className="text-xs tracking-widest uppercase text-[#C9A96E] mt-6 mb-3">
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : ""}
        </p>
        <h1 className="text-4xl font-bold mb-10 text-[#1A1A1A]">
          {post.title}
        </h1>

        <div className="text-[#8B7355] leading-relaxed space-y-4">
          {post.content
            .split("\n")
            .map((line, i) =>
              line.trim() ? <p key={i}>{line.trim()}</p> : null,
            )}
        </div>

        {/* CTA */}
        <div className="mt-16 pt-10 border-t border-[#E2D9C8] text-center">
          <p className="text-[#8B7355] mb-6">
            Have questions about buying or selling in Cebu?
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#1A1A1A] text-[#faf9f6] px-8 py-4 text-sm tracking-wider uppercase font-semibold hover:bg-[#C9A96E] transition"
          >
            Contact Me
          </Link>
        </div>
      </div>
    </div>
  );
}
